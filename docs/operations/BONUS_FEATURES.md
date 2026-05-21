# Bonus Features — Bitacora Mensual + Resumen Semanal

## generate-bitacora (Edge Function)

**Descripcion:** Genera un informe mensual automatico de actividades SG-SST por empresa.

**Invocacion:**
```json
POST /functions/v1/generate-bitacora
{
  "empresa_id": "uuid (opcional — si se omite genera para todas)",
  "mes": "2026-05 (opcional — default: mes anterior)",
  "enviar_email": true
}
```

**Que hace:**
1. Query a `logs_actividad` del mes seleccionado, agrupado por empresa y modulo
2. Genera resumen ejecutivo con Claude Haiku (barato)
3. Opcionalmente envia por email via Resend al `contacto_pila_email` de la empresa
4. Registra la generacion en `logs_actividad` modulo="bitacora"

**Automatizacion:** Invocar con cron (pg_cron o n8n) el dia 1 de cada mes.

**Estado:** Funcional, no conectado a cron aun.

---

## weekly-summary (Edge Function)

**Descripcion:** Genera un resumen semanal de estado operativo para consultores.

**Invocacion:**
```json
POST /functions/v1/weekly-summary
{
  "enviar_email": true,
  "email_destino": "consultor@regiscolombia.com"
}
```

**Que hace:**
1. Recopila stats de todas las empresas activas:
   - PILA pendientes y vencidas
   - Documentos por validar y aprobar
   - Examenes medicos pendientes de revision
   - Equipos proximos a vencer (30 dias)
   - Actividad de la semana
2. Genera resumen en markdown con alertas priorizadas
3. Incluye detalle por empresa (solo las que tienen pendientes)
4. Opcionalmente envia por email via Resend

**Automatizacion:** Invocar con cron cada lunes a las 7:00 AM.

**Estado:** Funcional, no conectado a cron aun.

---

## Como conectar a cron

### Opcion 1: pg_cron (Supabase)
```sql
-- Bitacora mensual: dia 1 de cada mes a las 8:00 UTC
SELECT cron.schedule('generate-bitacora', '0 8 1 * *',
  $$SELECT net.http_post(
    'https://nrtjizkeopxhpmjxxnjk.supabase.co/functions/v1/generate-bitacora',
    '{"enviar_email": true}'::jsonb,
    '{"Content-Type": "application/json", "Authorization": "Bearer <service_role_key>"}'::jsonb
  )$$
);

-- Resumen semanal: lunes a las 7:00 UTC
SELECT cron.schedule('weekly-summary', '0 7 * * 1',
  $$SELECT net.http_post(
    'https://nrtjizkeopxhpmjxxnjk.supabase.co/functions/v1/weekly-summary',
    '{"enviar_email": true, "email_destino": "john@regiscolombia.com"}'::jsonb,
    '{"Content-Type": "application/json", "Authorization": "Bearer <service_role_key>"}'::jsonb
  )$$
);
```

### Opcion 2: n8n
Crear workflows con nodo HTTP Request + cron trigger apuntando a las URLs de Supabase Functions.

---

## Frontend

Ambas funciones ya estan integradas en el AdminDashboard (`src/components/dashboard/AdminDashboard.tsx`) con botones de invocacion manual.
