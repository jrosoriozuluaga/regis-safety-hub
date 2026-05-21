-- Migration 012: RLS policies for digital attendance (public page)
-- DRAFT — requires manual review before applying
-- Allows anonymous users to read committee members and manage attendance
-- via token-secured public page (same pattern as upload-pila)

-- Allow anon to read active committee members (needed to display the list)
CREATE POLICY "anon_integrantes_read" ON public.integrantes_comite
  FOR SELECT TO anon
  USING (activo = true);

-- Allow anon to insert attendance records
CREATE POLICY "anon_asistencia_insert" ON public.asistencia_comite
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anon to update attendance records (re-confirmation)
CREATE POLICY "anon_asistencia_update" ON public.asistencia_comite
  FOR UPDATE TO anon
  USING (true);

-- Allow anon to read attendance (to show who already confirmed)
CREATE POLICY "anon_asistencia_read" ON public.asistencia_comite
  FOR SELECT TO anon
  USING (true);

-- Allow anon to read basic acta info (for validation)
CREATE POLICY "anon_actas_read_basic" ON public.actas_comite
  FOR SELECT TO anon
  USING (true);
