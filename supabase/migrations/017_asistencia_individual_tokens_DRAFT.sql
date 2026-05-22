-- DRAFT — Tokens individuales para asistencia digital a comités
-- Requiere: aplicar manualmente con supabase db push o SQL Editor

ALTER TABLE asistencia_comite ADD COLUMN IF NOT EXISTS token TEXT UNIQUE;
ALTER TABLE asistencia_comite ADD COLUMN IF NOT EXISTS confirmado_at TIMESTAMPTZ;

-- Index para lookup rápido por token
CREATE INDEX IF NOT EXISTS idx_asistencia_comite_token ON asistencia_comite(token) WHERE token IS NOT NULL;

-- Políticas RLS para acceso anónimo por token (página pública)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'anon_confirm_by_token' AND tablename = 'asistencia_comite'
  ) THEN
    CREATE POLICY anon_confirm_by_token ON asistencia_comite
      FOR UPDATE USING (token IS NOT NULL)
      WITH CHECK (token IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'anon_read_by_token' AND tablename = 'asistencia_comite'
  ) THEN
    CREATE POLICY anon_read_by_token ON asistencia_comite
      FOR SELECT USING (token IS NOT NULL);
  END IF;
END $$;
