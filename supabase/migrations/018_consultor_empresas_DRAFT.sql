-- DRAFT — Tabla many-to-many para asignación consultor ↔ empresas
-- Requiere: aplicar manualmente con supabase db push o SQL Editor

CREATE TABLE IF NOT EXISTS consultor_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas_cliente(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'principal' CHECK (rol IN ('principal', 'apoyo')),
  asignado_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (consultor_id, empresa_id)
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_consultor_empresas_consultor ON consultor_empresas(consultor_id) WHERE activo = true;
CREATE INDEX IF NOT EXISTS idx_consultor_empresas_empresa ON consultor_empresas(empresa_id) WHERE activo = true;

-- RLS
ALTER TABLE consultor_empresas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'auth_read_consultor_empresas' AND tablename = 'consultor_empresas'
  ) THEN
    CREATE POLICY auth_read_consultor_empresas ON consultor_empresas
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'admin_manage_consultor_empresas' AND tablename = 'consultor_empresas'
  ) THEN
    CREATE POLICY admin_manage_consultor_empresas ON consultor_empresas
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol IN ('admin')
        )
      );
  END IF;
END $$;
