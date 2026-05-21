-- Migration 011: API cost logging table
-- Status: DRAFT — do NOT apply with supabase db push

CREATE TABLE IF NOT EXISTS api_cost_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funcion TEXT NOT NULL,
  modelo TEXT,
  costo_estimado_usd NUMERIC(10,6),
  tiempo_ms INTEGER,
  tokens_input INTEGER,
  tokens_output INTEGER,
  empresa_id UUID REFERENCES empresas_cliente(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_cost_log ENABLE ROW LEVEL SECURITY;

-- Only admin can view cost logs
CREATE POLICY "admin_read_api_costs" ON api_cost_log
  FOR SELECT TO authenticated
  USING (public.is_regis_admin());

-- Service role (Edge Functions) can insert
CREATE POLICY "service_insert_api_costs" ON api_cost_log
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Index for dashboard queries
CREATE INDEX idx_api_cost_log_created ON api_cost_log (created_at DESC);
CREATE INDEX idx_api_cost_log_funcion ON api_cost_log (funcion);
