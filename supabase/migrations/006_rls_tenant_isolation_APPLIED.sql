-- DRAFT — NO APLICAR AUTOMATICAMENTE. Revisar y aplicar manualmente.
-- Usar Supabase Dashboard → SQL Editor. Ejecutar en bloques.
-- Ver docs/HOWTO_APLICAR_RLS_MIGRATION.md para instrucciones paso a paso.
--
-- ==========================================================================
-- Migration 006 (DRAFT): Tenant-scoped RLS for all application tables
-- ==========================================================================
--
-- WHAT THIS DOES:
--   1. Creates helper functions in auth schema for tenant resolution
--   2. Drops ALL existing permissive policies (auth_full_access, Allow all, etc.)
--   3. Creates tenant-scoped policies on every table with empresa_id
--   4. Creates JOIN-based policies for child tables without direct empresa_id
--   5. Handles special cases: usuarios, configuracion_sistema, templates, logs
--   6. Adds limited anon policies for the public UploadPila flow
--
-- WHY:
--   Current RLS policies are auth.role()='authenticated' or USING(true),
--   meaning ANY authenticated user can see ALL data from ALL companies.
--   This violates multi-tenancy, Ley 1581/2012 (Habeas Data), and is the
--   #1 risk in the Risk Register (R01, severity 20/25).
--
-- PREREQUISITES:
--   - The `usuarios` table must exist with: auth_user_id, rol, empresa_id
--   - Current roles in usuarios.rol: 'admin', 'consultor', 'cliente'
--   - Admin has empresa_id = NULL (Regis staff, sees everything)
--   - Consultor has empresa_id = NULL (Regis staff, sees everything)
--   - Cliente has empresa_id = UUID (sees only their company)
--
-- DEPENDS ON:
--   - Migration 005 (bucket security) should be applied first but is NOT
--     required. They are independent — 005 covers storage.objects, this
--     covers application tables.
--
-- CRITICAL NOTES:
--   - Edge Functions use service_role key → bypass RLS entirely → NOT affected
--   - The public UploadPila page (/upload-pila?t=token) uses the Supabase
--     anon key WITHOUT authentication. This migration adds limited anon
--     policies for pila_records and logs_actividad to support this flow.
--     ⚠️  SECURITY CONCERN: The upload token is validated client-side only.
--     TODO: Migrate UploadPila to an Edge Function for proper server-side
--     token validation. See SECURITY NOTE at the end of this file.
--
-- ==========================================================================


-- =========================================================================
-- BLOCK 1: Helper functions
-- =========================================================================

-- Returns the empresa_id for the currently authenticated user.
-- Returns NULL for admin/consultor (they have no empresa_id).
-- Used in RLS policies to filter by tenant.
CREATE OR REPLACE FUNCTION public.current_empresa_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT empresa_id FROM public.usuarios
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.current_empresa_id() IS
  'Returns empresa_id for current auth user. NULL for admin/consultor (Regis staff).';


-- Returns TRUE if the current user is a Regis admin (rol=admin, empresa_id=NULL).
-- Used for DELETE policies and admin-only tables.
CREATE OR REPLACE FUNCTION public.is_regis_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND rol = 'admin'
      AND empresa_id IS NULL
  );
$$;

COMMENT ON FUNCTION public.is_regis_admin() IS
  'TRUE if current user is Regis admin (rol=admin, no empresa_id). For admin-only operations.';


-- Returns TRUE if the current user is Regis staff (admin OR consultor).
-- Both roles see all companies. Clients only see their own.
-- ⚠️  This function is NOT in the user's original spec but is REQUIRED.
--     Without it, consultores (rol=consultor, empresa_id=NULL) would be
--     blocked from ALL data because:
--       - is_regis_admin() returns FALSE for consultores
--       - current_empresa_id() returns NULL, which never matches any row
--     This would completely break the app for consultores.
CREATE OR REPLACE FUNCTION public.is_regis_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE auth_user_id = auth.uid()
      AND rol IN ('admin', 'consultor')
  );
$$;

COMMENT ON FUNCTION public.is_regis_staff() IS
  'TRUE if current user is admin or consultor. Both see all companies.';


-- =========================================================================
-- BLOCK 2: Drop ALL existing permissive policies
-- =========================================================================
-- This removes every existing policy. If any policy name doesn't exist,
-- DROP POLICY IF EXISTS silently continues.

-- Tables with "auth_full_access"
DROP POLICY IF EXISTS "auth_full_access" ON public.actas_comite;
DROP POLICY IF EXISTS "auth_full_access" ON public.amenazas_vulnerabilidad;
DROP POLICY IF EXISTS "auth_full_access" ON public.asistencia_comite;
DROP POLICY IF EXISTS "auth_full_access" ON public.comites;
DROP POLICY IF EXISTS "auth_full_access" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "auth_full_access" ON public.cumplimiento_empresa;
DROP POLICY IF EXISTS "auth_full_access" ON public.documentos;
DROP POLICY IF EXISTS "auth_full_access" ON public.empresas_cliente;
DROP POLICY IF EXISTS "auth_full_access" ON public.examenes_medicos;
DROP POLICY IF EXISTS "auth_full_access" ON public.integrantes_comite;
DROP POLICY IF EXISTS "auth_full_access" ON public.inventario_equipos;
DROP POLICY IF EXISTS "auth_full_access" ON public.logs_actividad;
DROP POLICY IF EXISTS "auth_full_access" ON public.matrices_riesgo;
DROP POLICY IF EXISTS "auth_full_access" ON public.planes_emergencia;
DROP POLICY IF EXISTS "auth_full_access" ON public.puntos_acta;
DROP POLICY IF EXISTS "auth_full_access" ON public.recomendaciones_medicas;
DROP POLICY IF EXISTS "auth_full_access" ON public.riesgos_matriz;
DROP POLICY IF EXISTS "auth_full_access" ON public.templates_documento;
DROP POLICY IF EXISTS "auth_full_access" ON public.trabajadores;
DROP POLICY IF EXISTS "auth_full_access" ON public.usuarios;

-- Tables with non-standard policy names
DROP POLICY IF EXISTS "Allow all access" ON public.items_cumplimiento;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.pila_records;

-- NOTE: We do NOT drop "public_read" on reference tables (ciiu_codigos,
-- categorias_peligro_gtc45, ciiu_riesgos_tipicos, estandares_0312).
-- Those are correct and should remain as-is.


-- =========================================================================
-- BLOCK 3: Tenant-scoped policies — Tables with direct empresa_id
-- =========================================================================
-- Pattern:
--   SELECT/INSERT/UPDATE: public.is_regis_staff() OR empresa_id = public.current_empresa_id()
--   DELETE: public.is_regis_admin() only (clients don't delete)


-- -------------------------------------------------------------------------
-- 3.1 empresas_cliente
-- -------------------------------------------------------------------------
-- Special: "id" IS the empresa identifier (not a column called empresa_id)

CREATE POLICY "tenant_select" ON public.empresas_cliente
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.empresas_cliente
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
  );
-- Clients cannot create companies

CREATE POLICY "tenant_update" ON public.empresas_cliente
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.empresas_cliente
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.2 trabajadores
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.trabajadores
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.trabajadores
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.trabajadores
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.trabajadores
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.3 examenes_medicos
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.examenes_medicos
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.examenes_medicos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.examenes_medicos
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.examenes_medicos
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.4 documentos
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.documentos
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.documentos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.documentos
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.documentos
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.5 pila_records
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.pila_records
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.pila_records
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.pila_records
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.pila_records
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());

-- ANON policies for public UploadPila flow
-- ⚠️  SECURITY NOTE: These allow unauthenticated access to pila_records.
-- The upload token is validated CLIENT-SIDE only (base64 decode in React).
-- An attacker who knows an empresa_id could query/modify PILA data.
-- TODO: Replace with Edge Function that validates token server-side.
CREATE POLICY "anon_pila_select" ON public.pila_records
  FOR SELECT TO anon
  USING (true);
-- Needed: UploadPila checks if a record exists for empresa_id + periodo

CREATE POLICY "anon_pila_insert" ON public.pila_records
  FOR INSERT TO anon
  WITH CHECK (true);
-- Needed: UploadPila creates pila_record if none exists

CREATE POLICY "anon_pila_update" ON public.pila_records
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
-- Needed: UploadPila updates existing record with archivo_url


-- -------------------------------------------------------------------------
-- 3.6 matrices_riesgo
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.matrices_riesgo
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.matrices_riesgo
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.matrices_riesgo
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.matrices_riesgo
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.7 comites
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.comites
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.comites
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.comites
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.comites
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.8 planes_emergencia
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.planes_emergencia
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.planes_emergencia
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.planes_emergencia
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.planes_emergencia
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.9 inventario_equipos
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.inventario_equipos
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.inventario_equipos
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.inventario_equipos
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.inventario_equipos
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 3.10 cumplimiento_empresa
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.cumplimiento_empresa
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_insert" ON public.cumplimiento_empresa
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_update" ON public.cumplimiento_empresa
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  )
  WITH CHECK (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "tenant_delete" ON public.cumplimiento_empresa
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- =========================================================================
-- BLOCK 4: Tenant-scoped policies — Tables via JOIN (no direct empresa_id)
-- =========================================================================
-- These tables don't have empresa_id directly. They inherit it through
-- a FK to a parent table that does have empresa_id.


-- -------------------------------------------------------------------------
-- 4.1 riesgos_matriz → via matrices_riesgo.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.riesgos_matriz
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.matrices_riesgo mr
      WHERE mr.id = riesgos_matriz.matriz_id
        AND mr.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.riesgos_matriz
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.matrices_riesgo mr
      WHERE mr.id = matriz_id
        AND mr.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.riesgos_matriz
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.matrices_riesgo mr
      WHERE mr.id = riesgos_matriz.matriz_id
        AND mr.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.matrices_riesgo mr
      WHERE mr.id = matriz_id
        AND mr.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.riesgos_matriz
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.2 actas_comite → via comites.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.actas_comite
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = actas_comite.comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.actas_comite
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.actas_comite
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = actas_comite.comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.actas_comite
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.3 integrantes_comite → via comites.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.integrantes_comite
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = integrantes_comite.comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.integrantes_comite
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.integrantes_comite
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = integrantes_comite.comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.comites c
      WHERE c.id = comite_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.integrantes_comite
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.4 puntos_acta → via actas_comite → comites.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.puntos_acta
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = puntos_acta.acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.puntos_acta
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.puntos_acta
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = puntos_acta.acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.puntos_acta
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.5 asistencia_comite → via actas_comite → comites.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.asistencia_comite
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = asistencia_comite.acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.asistencia_comite
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.asistencia_comite
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = asistencia_comite.acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.actas_comite ac
      JOIN public.comites c ON c.id = ac.comite_id
      WHERE ac.id = acta_id
        AND c.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.asistencia_comite
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.6 amenazas_vulnerabilidad → via planes_emergencia.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.amenazas_vulnerabilidad
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.planes_emergencia pe
      WHERE pe.id = amenazas_vulnerabilidad.plan_id
        AND pe.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.amenazas_vulnerabilidad
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.planes_emergencia pe
      WHERE pe.id = plan_id
        AND pe.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.amenazas_vulnerabilidad
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.planes_emergencia pe
      WHERE pe.id = amenazas_vulnerabilidad.plan_id
        AND pe.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.planes_emergencia pe
      WHERE pe.id = plan_id
        AND pe.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.amenazas_vulnerabilidad
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.7 recomendaciones_medicas → via examenes_medicos.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.recomendaciones_medicas
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.examenes_medicos em
      WHERE em.id = recomendaciones_medicas.examen_id
        AND em.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.recomendaciones_medicas
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.examenes_medicos em
      WHERE em.id = examen_id
        AND em.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.recomendaciones_medicas
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.examenes_medicos em
      WHERE em.id = recomendaciones_medicas.examen_id
        AND em.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.examenes_medicos em
      WHERE em.id = examen_id
        AND em.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.recomendaciones_medicas
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 4.8 items_cumplimiento → via cumplimiento_empresa.empresa_id
-- -------------------------------------------------------------------------

CREATE POLICY "tenant_select" ON public.items_cumplimiento
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.cumplimiento_empresa ce
      WHERE ce.id = items_cumplimiento.cumplimiento_id
        AND ce.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_insert" ON public.items_cumplimiento
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.cumplimiento_empresa ce
      WHERE ce.id = cumplimiento_id
        AND ce.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_update" ON public.items_cumplimiento
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.cumplimiento_empresa ce
      WHERE ce.id = items_cumplimiento.cumplimiento_id
        AND ce.empresa_id = public.current_empresa_id()
    )
  )
  WITH CHECK (
    public.is_regis_staff()
    OR EXISTS (
      SELECT 1 FROM public.cumplimiento_empresa ce
      WHERE ce.id = cumplimiento_id
        AND ce.empresa_id = public.current_empresa_id()
    )
  );

CREATE POLICY "tenant_delete" ON public.items_cumplimiento
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- =========================================================================
-- BLOCK 5: Special cases
-- =========================================================================


-- -------------------------------------------------------------------------
-- 5.1 usuarios — special: self + same company + staff sees all
-- -------------------------------------------------------------------------

CREATE POLICY "usuarios_select" ON public.usuarios
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR auth_user_id = auth.uid()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "usuarios_insert" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_regis_admin()
  );
-- Only admin creates user accounts

CREATE POLICY "usuarios_update" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (
    public.is_regis_admin()
    OR auth_user_id = auth.uid()
  )
  WITH CHECK (
    public.is_regis_admin()
    OR auth_user_id = auth.uid()
  );
-- Users can update their own profile, admin can update anyone

CREATE POLICY "usuarios_delete" ON public.usuarios
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 5.2 configuracion_sistema — admin-only (global Regis config)
-- -------------------------------------------------------------------------

CREATE POLICY "config_select" ON public.configuracion_sistema
  FOR SELECT TO authenticated
  USING (public.is_regis_staff());
-- Consultores need to read config (e.g., PILA reminder settings)

CREATE POLICY "config_modify" ON public.configuracion_sistema
  FOR ALL TO authenticated
  USING (public.is_regis_admin())
  WITH CHECK (public.is_regis_admin());
-- Only admin modifies system configuration


-- -------------------------------------------------------------------------
-- 5.3 templates_documento — staff-only (email/document templates)
-- -------------------------------------------------------------------------

CREATE POLICY "templates_select" ON public.templates_documento
  FOR SELECT TO authenticated
  USING (public.is_regis_staff());

CREATE POLICY "templates_modify" ON public.templates_documento
  FOR INSERT TO authenticated
  WITH CHECK (public.is_regis_admin());

CREATE POLICY "templates_update" ON public.templates_documento
  FOR UPDATE TO authenticated
  USING (public.is_regis_admin())
  WITH CHECK (public.is_regis_admin());

CREATE POLICY "templates_delete" ON public.templates_documento
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());


-- -------------------------------------------------------------------------
-- 5.4 logs_actividad — authenticated can insert + read own company
-- -------------------------------------------------------------------------
-- logs_actividad has empresa_id (nullable) and usuario_id (nullable)
-- Staff sees all, clients see their company's logs

CREATE POLICY "logs_select" ON public.logs_actividad
  FOR SELECT TO authenticated
  USING (
    public.is_regis_staff()
    OR empresa_id = public.current_empresa_id()
  );

CREATE POLICY "logs_insert" ON public.logs_actividad
  FOR INSERT TO authenticated
  WITH CHECK (true);
-- Any authenticated user can write a log entry (audit trail)
-- The empresa_id is set by the application code

CREATE POLICY "logs_update" ON public.logs_actividad
  FOR UPDATE TO authenticated
  USING (false);
-- Logs are immutable — no updates

CREATE POLICY "logs_delete" ON public.logs_actividad
  FOR DELETE TO authenticated
  USING (public.is_regis_admin());
-- Only admin can delete logs (should be rare/never in production)

-- ANON policy for UploadPila log entry
CREATE POLICY "anon_logs_insert" ON public.logs_actividad
  FOR INSERT TO anon
  WITH CHECK (true);
-- UploadPila writes a log entry after successful upload.
-- ⚠️  This allows anonymous log insertion. The log entry content
-- is controlled by the UploadPila React code (not user input).
-- TODO: Move to Edge Function for server-side control.


-- =========================================================================
-- BLOCK 6: Reference tables — NO CHANGES NEEDED
-- =========================================================================
-- The following tables already have correct "public_read" policies:
--   - ciiu_codigos: SELECT USING(true) — public reference data
--   - categorias_peligro_gtc45: SELECT USING(true) — GTC 45 categories
--   - ciiu_riesgos_tipicos: SELECT USING(true) — risk templates per CIIU
--   - estandares_0312: SELECT USING(true) — Resolution 0312 standards
--
-- These are read-only reference data. No write policies needed because
-- they are managed via migrations/seeds, not through the UI.
--
-- NOTE: These tables currently have NO write policies at all for
-- authenticated users. If the admin UI ever needs to edit them,
-- add admin-only INSERT/UPDATE/DELETE policies.


-- =========================================================================
-- BLOCK 7: Add index on usuarios for RLS performance
-- =========================================================================
-- The helper functions query usuarios by auth_user_id on every RLS check.
-- This index is CRITICAL for performance.

CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id
  ON public.usuarios(auth_user_id);

-- Also ensure empresa_id is indexed (used in current_empresa_id lookups)
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa
  ON public.usuarios(empresa_id);


-- =========================================================================
-- SECURITY NOTE: UploadPila Public Flow
-- =========================================================================
--
-- The page /upload-pila?t=<base64_token> allows unauthenticated users
-- to upload PILA documents. It uses the Supabase anon key (no auth session).
--
-- Current behavior (from UploadPila.tsx):
--   1. Decodes base64 token → { empresa_id, periodo, empresa_nombre, exp }
--   2. Token validation is CLIENT-SIDE ONLY (expiry check in JavaScript)
--   3. Queries pila_records with supabase anon client
--   4. Uploads file to storage (documentos bucket, pila/ prefix)
--   5. Updates or inserts pila_records
--   6. Inserts log_actividad entry
--
-- This means:
--   - Without anon policies, the upload flow BREAKS completely
--   - With anon policies (as added above), anyone with the anon key can
--     read/write pila_records — the empresa_id in the token is not verified
--     server-side
--   - The storage policy in 005_DRAFT restricts anon uploads to pila/ prefix
--   - This is a KNOWN security weakness documented in RISK_REGISTER.md
--
-- RECOMMENDED FIX (post-contest):
--   1. Create Edge Function: upload-pila-public
--   2. Move token validation + upload + DB writes to the Edge Function
--   3. Edge Function uses service_role key (bypasses RLS)
--   4. Edge Function validates token server-side (signature, expiry)
--   5. Remove all anon policies from pila_records and logs_actividad
--   6. UploadPila.tsx calls the Edge Function instead of Supabase client
--
-- This is tracked as a follow-up in POST_CONTEST_BACKLOG.md.
--
-- =========================================================================
-- END OF MIGRATION 006 DRAFT
-- =========================================================================
