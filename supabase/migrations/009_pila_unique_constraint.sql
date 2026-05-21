-- Migration 009: Add UNIQUE constraint on pila_records (empresa_id, periodo)
-- Status: DRAFT — do NOT apply with supabase db push
-- Note: Before applying, verify no duplicates exist:
--   SELECT empresa_id, periodo, COUNT(*) FROM pila_records GROUP BY empresa_id, periodo HAVING COUNT(*) > 1;

-- Remove duplicates if any exist (keep the most recent)
DELETE FROM pila_records a
USING pila_records b
WHERE a.empresa_id = b.empresa_id
  AND a.periodo = b.periodo
  AND a.created_at < b.created_at;

-- Add unique constraint
ALTER TABLE pila_records
  ADD CONSTRAINT pila_records_empresa_periodo_uq UNIQUE (empresa_id, periodo);
