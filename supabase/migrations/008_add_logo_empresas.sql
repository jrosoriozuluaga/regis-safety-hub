-- Migration 008: Add logo_url to empresas_cliente
-- Status: DRAFT — do NOT apply with supabase db push

ALTER TABLE empresas_cliente ADD COLUMN IF NOT EXISTS logo_url TEXT;
COMMENT ON COLUMN empresas_cliente.logo_url IS 'URL del logo de la empresa (storage signed URL o external URL)';
