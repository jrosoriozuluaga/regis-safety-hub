-- Migration 013: ARL approval columns for risk matrices
-- DRAFT — requires manual review before applying

ALTER TABLE matrices_riesgo ADD COLUMN IF NOT EXISTS archivo_aprobado_url TEXT;
ALTER TABLE matrices_riesgo ADD COLUMN IF NOT EXISTS aprobada_por_arl BOOLEAN DEFAULT false;
ALTER TABLE matrices_riesgo ADD COLUMN IF NOT EXISTS fecha_aprobacion_arl TIMESTAMPTZ;
