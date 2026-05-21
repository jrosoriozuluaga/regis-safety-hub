-- ==========================================================================
-- ROLLBACK for Migration 006: Tenant-scoped RLS
-- ==========================================================================
--
-- This script REVERTS all changes from 006_rls_tenant_isolation_DRAFT.sql
-- back to the original state (auth_full_access / USING(true) policies).
--
-- Run this in Supabase Dashboard → SQL Editor if anything breaks after
-- applying migration 006.
--
-- ==========================================================================


-- =========================================================================
-- 1. Drop all tenant-scoped policies
-- =========================================================================

-- Block 3: Tables with direct empresa_id
DROP POLICY IF EXISTS "tenant_select" ON public.empresas_cliente;
DROP POLICY IF EXISTS "tenant_insert" ON public.empresas_cliente;
DROP POLICY IF EXISTS "tenant_update" ON public.empresas_cliente;
DROP POLICY IF EXISTS "tenant_delete" ON public.empresas_cliente;

DROP POLICY IF EXISTS "tenant_select" ON public.trabajadores;
DROP POLICY IF EXISTS "tenant_insert" ON public.trabajadores;
DROP POLICY IF EXISTS "tenant_update" ON public.trabajadores;
DROP POLICY IF EXISTS "tenant_delete" ON public.trabajadores;

DROP POLICY IF EXISTS "tenant_select" ON public.examenes_medicos;
DROP POLICY IF EXISTS "tenant_insert" ON public.examenes_medicos;
DROP POLICY IF EXISTS "tenant_update" ON public.examenes_medicos;
DROP POLICY IF EXISTS "tenant_delete" ON public.examenes_medicos;

DROP POLICY IF EXISTS "tenant_select" ON public.documentos;
DROP POLICY IF EXISTS "tenant_insert" ON public.documentos;
DROP POLICY IF EXISTS "tenant_update" ON public.documentos;
DROP POLICY IF EXISTS "tenant_delete" ON public.documentos;

DROP POLICY IF EXISTS "tenant_select" ON public.pila_records;
DROP POLICY IF EXISTS "tenant_insert" ON public.pila_records;
DROP POLICY IF EXISTS "tenant_update" ON public.pila_records;
DROP POLICY IF EXISTS "tenant_delete" ON public.pila_records;
DROP POLICY IF EXISTS "anon_pila_select" ON public.pila_records;
DROP POLICY IF EXISTS "anon_pila_insert" ON public.pila_records;
DROP POLICY IF EXISTS "anon_pila_update" ON public.pila_records;

DROP POLICY IF EXISTS "tenant_select" ON public.matrices_riesgo;
DROP POLICY IF EXISTS "tenant_insert" ON public.matrices_riesgo;
DROP POLICY IF EXISTS "tenant_update" ON public.matrices_riesgo;
DROP POLICY IF EXISTS "tenant_delete" ON public.matrices_riesgo;

DROP POLICY IF EXISTS "tenant_select" ON public.comites;
DROP POLICY IF EXISTS "tenant_insert" ON public.comites;
DROP POLICY IF EXISTS "tenant_update" ON public.comites;
DROP POLICY IF EXISTS "tenant_delete" ON public.comites;

DROP POLICY IF EXISTS "tenant_select" ON public.planes_emergencia;
DROP POLICY IF EXISTS "tenant_insert" ON public.planes_emergencia;
DROP POLICY IF EXISTS "tenant_update" ON public.planes_emergencia;
DROP POLICY IF EXISTS "tenant_delete" ON public.planes_emergencia;

DROP POLICY IF EXISTS "tenant_select" ON public.inventario_equipos;
DROP POLICY IF EXISTS "tenant_insert" ON public.inventario_equipos;
DROP POLICY IF EXISTS "tenant_update" ON public.inventario_equipos;
DROP POLICY IF EXISTS "tenant_delete" ON public.inventario_equipos;

DROP POLICY IF EXISTS "tenant_select" ON public.cumplimiento_empresa;
DROP POLICY IF EXISTS "tenant_insert" ON public.cumplimiento_empresa;
DROP POLICY IF EXISTS "tenant_update" ON public.cumplimiento_empresa;
DROP POLICY IF EXISTS "tenant_delete" ON public.cumplimiento_empresa;

-- Block 4: Tables via JOIN
DROP POLICY IF EXISTS "tenant_select" ON public.riesgos_matriz;
DROP POLICY IF EXISTS "tenant_insert" ON public.riesgos_matriz;
DROP POLICY IF EXISTS "tenant_update" ON public.riesgos_matriz;
DROP POLICY IF EXISTS "tenant_delete" ON public.riesgos_matriz;

DROP POLICY IF EXISTS "tenant_select" ON public.actas_comite;
DROP POLICY IF EXISTS "tenant_insert" ON public.actas_comite;
DROP POLICY IF EXISTS "tenant_update" ON public.actas_comite;
DROP POLICY IF EXISTS "tenant_delete" ON public.actas_comite;

DROP POLICY IF EXISTS "tenant_select" ON public.integrantes_comite;
DROP POLICY IF EXISTS "tenant_insert" ON public.integrantes_comite;
DROP POLICY IF EXISTS "tenant_update" ON public.integrantes_comite;
DROP POLICY IF EXISTS "tenant_delete" ON public.integrantes_comite;

DROP POLICY IF EXISTS "tenant_select" ON public.puntos_acta;
DROP POLICY IF EXISTS "tenant_insert" ON public.puntos_acta;
DROP POLICY IF EXISTS "tenant_update" ON public.puntos_acta;
DROP POLICY IF EXISTS "tenant_delete" ON public.puntos_acta;

DROP POLICY IF EXISTS "tenant_select" ON public.asistencia_comite;
DROP POLICY IF EXISTS "tenant_insert" ON public.asistencia_comite;
DROP POLICY IF EXISTS "tenant_update" ON public.asistencia_comite;
DROP POLICY IF EXISTS "tenant_delete" ON public.asistencia_comite;

DROP POLICY IF EXISTS "tenant_select" ON public.amenazas_vulnerabilidad;
DROP POLICY IF EXISTS "tenant_insert" ON public.amenazas_vulnerabilidad;
DROP POLICY IF EXISTS "tenant_update" ON public.amenazas_vulnerabilidad;
DROP POLICY IF EXISTS "tenant_delete" ON public.amenazas_vulnerabilidad;

DROP POLICY IF EXISTS "tenant_select" ON public.recomendaciones_medicas;
DROP POLICY IF EXISTS "tenant_insert" ON public.recomendaciones_medicas;
DROP POLICY IF EXISTS "tenant_update" ON public.recomendaciones_medicas;
DROP POLICY IF EXISTS "tenant_delete" ON public.recomendaciones_medicas;

DROP POLICY IF EXISTS "tenant_select" ON public.items_cumplimiento;
DROP POLICY IF EXISTS "tenant_insert" ON public.items_cumplimiento;
DROP POLICY IF EXISTS "tenant_update" ON public.items_cumplimiento;
DROP POLICY IF EXISTS "tenant_delete" ON public.items_cumplimiento;

-- Block 5: Special cases
DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_delete" ON public.usuarios;

DROP POLICY IF EXISTS "config_select" ON public.configuracion_sistema;
DROP POLICY IF EXISTS "config_modify" ON public.configuracion_sistema;

DROP POLICY IF EXISTS "templates_select" ON public.templates_documento;
DROP POLICY IF EXISTS "templates_modify" ON public.templates_documento;
DROP POLICY IF EXISTS "templates_update" ON public.templates_documento;
DROP POLICY IF EXISTS "templates_delete" ON public.templates_documento;

DROP POLICY IF EXISTS "logs_select" ON public.logs_actividad;
DROP POLICY IF EXISTS "logs_insert" ON public.logs_actividad;
DROP POLICY IF EXISTS "logs_update" ON public.logs_actividad;
DROP POLICY IF EXISTS "logs_delete" ON public.logs_actividad;
DROP POLICY IF EXISTS "anon_logs_insert" ON public.logs_actividad;


-- =========================================================================
-- 2. Drop helper functions
-- =========================================================================

DROP FUNCTION IF EXISTS auth.current_empresa_id();
DROP FUNCTION IF EXISTS auth.is_regis_admin();
DROP FUNCTION IF EXISTS auth.is_regis_staff();


-- =========================================================================
-- 3. Drop performance indexes (only those added by 006)
-- =========================================================================

DROP INDEX IF EXISTS public.idx_usuarios_auth_user_id;
-- NOTE: idx_usuarios_empresa may have been needed elsewhere; keep it.
-- DROP INDEX IF EXISTS public.idx_usuarios_empresa;


-- =========================================================================
-- 4. Restore original policies
-- =========================================================================

-- Restore auth_full_access on all tables
CREATE POLICY "auth_full_access" ON public.actas_comite AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.amenazas_vulnerabilidad AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.asistencia_comite AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.comites AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.configuracion_sistema AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.cumplimiento_empresa AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.documentos AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.empresas_cliente AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.examenes_medicos AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.integrantes_comite AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.matrices_riesgo AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.planes_emergencia AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.puntos_acta AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.recomendaciones_medicas AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.riesgos_matriz AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.templates_documento AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.trabajadores AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.usuarios AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));
CREATE POLICY "auth_full_access" ON public.logs_actividad AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));

-- Restore special policies
CREATE POLICY "auth_full_access" ON public.inventario_equipos AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.items_cumplimiento AS PERMISSIVE FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated" ON public.pila_records AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- =========================================================================
-- END OF ROLLBACK
-- =========================================================================
