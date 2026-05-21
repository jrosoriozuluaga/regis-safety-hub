-- Migration 010: Automatic PILA period sync via pg_cron
-- Status: DRAFT — do NOT apply with supabase db push
-- Prerequisite: pg_cron extension must be enabled (Supabase Dashboard → Extensions)

-- Enable pg_cron if not already
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function: sync_pila_periods()
-- Creates missing PILA records for the current month + marks overdue records.
-- Mirrors the logic from pilaService.syncPeriods() in the frontend.
CREATE OR REPLACE FUNCTION public.sync_pila_periods()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dia_solicitud INT := 16;
  v_periodo TEXT;
  v_deadline DATE;
  v_created INT := 0;
  v_overdue INT := 0;
  r RECORD;
BEGIN
  -- Read configurable day from configuracion_sistema
  SELECT valor::int INTO v_dia_solicitud
  FROM configuracion_sistema
  WHERE clave = 'pila_dia_solicitud'
  LIMIT 1;

  -- Default to 16 if not found
  v_dia_solicitud := COALESCE(v_dia_solicitud, 16);

  -- Current period: YYYY-MM
  v_periodo := TO_CHAR(NOW(), 'YYYY-MM');

  -- Deadline: day of NEXT month (periodo month + 1, at dia_solicitud)
  v_deadline := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::date
                + (v_dia_solicitud - 1) * INTERVAL '1 day';

  -- For each active empresa, ensure a record exists for the current period
  FOR r IN
    SELECT id FROM empresas_cliente WHERE activo = true
  LOOP
    -- Insert if not exists
    INSERT INTO pila_records (empresa_id, periodo, estado, fecha_solicitud)
    VALUES (
      r.id,
      v_periodo,
      CASE WHEN NOW()::date > v_deadline THEN 'vencida' ELSE 'pendiente' END,
      NOW()
    )
    ON CONFLICT (empresa_id, periodo) DO NOTHING;

    IF FOUND AND NOW()::date > v_deadline THEN
      v_overdue := v_overdue + 1;
    ELSIF FOUND THEN
      v_created := v_created + 1;
    END IF;
  END LOOP;

  -- Mark existing pendiente records as vencida if past deadline
  IF NOW()::date > v_deadline THEN
    UPDATE pila_records
    SET estado = 'vencida'
    WHERE estado = 'pendiente'
      AND periodo = v_periodo;

    GET DIAGNOSTICS v_overdue = ROW_COUNT;
  END IF;

  -- Log the sync activity
  INSERT INTO logs_actividad (tipo, modulo, descripcion, metadata)
  VALUES (
    'sincronizacion',
    'pila',
    FORMAT('pg_cron sync: %s creados, %s vencidos (periodo %s)', v_created, v_overdue, v_periodo),
    jsonb_build_object('created', v_created, 'overdue', v_overdue, 'periodo', v_periodo, 'canal', 'pg_cron')
  );
END;
$$;

-- Schedule: run daily at 7:00 AM UTC (2:00 AM Colombia time)
-- This ensures new records are created on the 1st of each month
-- and overdue marks are applied daily after the deadline.
SELECT cron.schedule(
  'sync-pila-periods',
  '0 7 * * *',    -- daily at 07:00 UTC
  'SELECT public.sync_pila_periods()'
);

-- Note: This migration assumes the UNIQUE constraint from migration 009 is applied.
-- The ON CONFLICT clause relies on: UNIQUE (empresa_id, periodo) on pila_records.
--
-- To verify the cron job after applying:
--   SELECT * FROM cron.job WHERE jobname = 'sync-pila-periods';
--
-- To check execution history:
--   SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-pila-periods') ORDER BY start_time DESC LIMIT 10;
