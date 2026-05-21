# Runbook de Incidentes — Regis SG-SST

> Procedimientos operativos para cuando algo falla en produccion.
> Ultima actualizacion: Mayo 2026

---

## Arquitectura de referencia rapida

| Componente | Ubicacion | Tier / Limite |
|---|---|---|
| Frontend (React SPA) | Vercel — regis-safety-hub.vercel.app | Free / Pro |
| Supabase (DB + Auth + Storage + Edge Functions) | Proyecto `nrtjizkeopxhpmjxxnjk`, us-east-1 | Free: 500 MB DB, 1 GB storage, 500 K invocaciones Edge/mes |
| n8n (workflows PILA) | Self-hosted en n8n.john-osorio.lat | Docker en servidor propio |
| Anthropic Claude API | api.anthropic.com | Pay-per-use |
| OpenAI Whisper API | api.openai.com | Pay-per-use |
| Resend (email) | resend.com | Free: 100 emails/dia |
| Twilio WhatsApp | api.twilio.com | Sandbox (requiere opt-in cada 72 h) |

---

## Contactos de escalamiento

| Rol | Canal |
|---|---|
| Desarrollador principal | WhatsApp del equipo + email |
| Soporte Supabase | support.supabase.com (o dashboard) |
| Estado Anthropic API | status.anthropic.com |
| Estado Resend | resend.com/status |
| Estado Twilio | status.twilio.com |

---

## Incidente 1 — Anthropic API caida o lenta

### Edge Functions afectadas

- `process-exam-pdf` (extraccion de examenes medicos con Claude)
- `transcribe-audio` (analisis de vulnerabilidad con Claude, post-Whisper)
- `generate-acta` (generacion de actas de comite con Claude)

### Deteccion

- Los consultores reportan que la extraccion de examenes tarda mas de 30 segundos o devuelve datos incompletos.
- En Supabase Dashboard, ir a **Edge Functions → Logs** y filtrar por las tres funciones. Buscar codigos HTTP `500`, `503`, `429` o `timeout` en las llamadas salientes a `api.anthropic.com`.
- Verificar el estado oficial en `status.anthropic.com`.

### Diagnostico

1. Abrir Supabase Dashboard → Edge Functions → seleccionar la funcion afectada → Logs.
2. Buscar en los logs el cuerpo de respuesta de Anthropic. Codigos comunes:
   - `429` — Rate limit excedido. Esperar o reducir concurrencia.
   - `500` / `503` — Caida del servicio de Anthropic.
   - `timeout` — Latencia extrema (>60 s).
3. Verificar que el secret `ANTHROPIC_API_KEY` siga vigente:
   ```bash
   supabase secrets list
   ```
4. Si solo una funcion falla, revisar si el prompt o el payload cambio recientemente.

### Mitigacion inmediata

- **Las tres funciones ya tienen fallback implementado:**
  - `process-exam-pdf`: Devuelve extraccion basada en plantillas (template-based) sin IA.
  - `transcribe-audio`: Usa keyword matching para el analisis de vulnerabilidad en vez de Claude.
  - `generate-acta`: Genera un acta con formato simple de texto plano.
- El fallback se activa automaticamente cuando Claude no responde.
- **Workaround manual:** El consultor realiza la extraccion/revision manualmente desde la UI y completa los campos a mano.
- Informar a los consultores que la IA esta temporalmente degradada y que deben revisar los resultados con mayor atencion.

### Solucion definitiva

- Esperar la restauracion del servicio de Anthropic (monitorear `status.anthropic.com`).
- Una vez restaurado, re-procesar los items que fallaron:
  - Examenes medicos: Volver a subir el PDF o usar el boton de re-procesar.
  - Actas: Regenerar desde el modulo de Comites.
  - Planes de emergencia: Re-ejecutar el analisis de audio.
- Si los rate limits son frecuentes, considerar:
  - Implementar cola de procesamiento con reintentos exponenciales.
  - Cachear resultados de extraccion para PDFs ya procesados.
  - Evaluar un modelo alternativo como fallback secundario.

### Comunicacion

- **Al equipo:** "La API de Anthropic presenta intermitencia. Las funciones de IA estan operando en modo fallback. Los resultados requieren revision manual adicional."
- **Al cliente (si pregunta):** "Nuestro asistente de IA esta en mantenimiento temporal. Su documento fue procesado y los datos estan disponibles, pero le pedimos verificar la informacion extraida."

---

## Incidente 2 — Twilio sandbox vencido / WhatsApp no entrega

### Deteccion

- Los contactos PILA de las empresas reportan que no reciben mensajes de WhatsApp.
- En Supabase Dashboard → Edge Functions → Logs de `send-whatsapp-reminder`: buscar errores de Twilio como `21608` (sandbox not joined) o `63007` (channel not found).
- Los registros en `pila_records` muestran `recordatorios_enviados` incrementando pero el contacto no recibe nada.

### Diagnostico

1. Verificar el estado del sandbox de Twilio:
   - Ir a console.twilio.com → Messaging → Try it Out → WhatsApp Sandbox.
   - Confirmar que el sandbox esta activo.
2. El sandbox de Twilio requiere que cada destinatario envie el mensaje de opt-in (ej: "join <palabra-clave>") **cada 72 horas**. Si no lo han hecho, los mensajes se rechazan silenciosamente.
3. Verificar que los secrets de Twilio esten configurados:
   ```bash
   supabase secrets list | grep TWILIO
   ```
   Deben existir: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.
4. Revisar el saldo de la cuenta Twilio en console.twilio.com → Billing.

### Mitigacion inmediata

- **La plataforma ya tiene fallback implementado:** Cuando WhatsApp falla, los recordatorios PILA se envian solo por email (via Resend o n8n).
- **Links wa.me:** La UI ya genera enlaces `wa.me` que el consultor puede usar para enviar mensajes manualmente desde su propio WhatsApp.
- El consultor puede hacer clic en el boton de WhatsApp en la interfaz PILA para abrir wa.me con el mensaje pre-armado.

### Solucion definitiva

- **Corto plazo:** Pedir a cada contacto PILA que re-envie el mensaje de opt-in al sandbox de Twilio. Documentar este paso en la capacitacion a clientes.
- **Mediano plazo:** Migrar a un numero de WhatsApp de produccion en Twilio:
  1. Solicitar aprobacion de WhatsApp Business API en Twilio.
  2. Registrar un numero dedicado para Regis.
  3. Crear plantillas de mensaje aprobadas por WhatsApp (HSM templates).
  4. Actualizar el secret `TWILIO_WHATSAPP_FROM` con el nuevo numero.
  5. Con numero de produccion, no se requiere opt-in cada 72 h.

### Comunicacion

- **Al equipo:** "WhatsApp esta temporalmente inactivo. Los recordatorios PILA se estan enviando solo por email. Usar los links wa.me para envios manuales urgentes."
- **Al cliente:** No requiere comunicacion especial; el cliente sigue recibiendo recordatorios por email.

---

## Incidente 3 — Resend cae / emails no se entregan

### Deteccion

- Los contactos PILA no reciben correos de recordatorio.
- En Supabase Dashboard → Edge Functions → Logs de `send-pila-reminder`: buscar errores HTTP de la API de Resend.
- Revisar el dashboard de Resend (resend.com → Logs) para ver emails rechazados, bounces o errores.
- Si se alcanza el limite diario (100 emails/dia en free tier), Resend devuelve `429`.

### Diagnostico

1. Verificar estado de Resend en `resend.com/status`.
2. Revisar logs de la Edge Function `send-pila-reminder`:
   - Errores `401` — API key invalida o expirada.
   - Errores `429` — Rate limit alcanzado.
   - Errores `422` — Dominio no verificado o email malformado.
3. Verificar el secret:
   ```bash
   supabase secrets list | grep RESEND
   ```
4. En el dashboard de Resend, revisar:
   - Dominio verificado y activo.
   - Cantidad de emails enviados hoy vs. limite.
   - Tasa de bounce y spam complaints.

### Mitigacion inmediata

- **n8n como sender alternativo:** Los workflows de n8n tambien envian emails (actualmente via Gmail, en migracion a Outlook). Si la Edge Function de Resend falla, los workflows de n8n seguiran operando como canal independiente.
- **Envio manual:** El consultor puede enviar correos manualmente desde Outlook copiando el contenido de la plantilla del modulo de Email Templates.
- Si el problema es rate limit, espaciar los envios o priorizar las empresas con plazos mas proximos.

### Solucion definitiva

- Si Resend presenta caidas frecuentes, evaluar un proveedor alternativo (SendGrid, Amazon SES).
- Migrar a Resend plan de pago si el limite de 100 emails/dia es insuficiente.
- Completar la migracion de n8n a Outlook como sender principal, dejando Resend como fallback.
- Implementar cola de reintentos para emails fallidos con backoff exponencial.

### Comunicacion

- **Al equipo:** "Los correos via Resend estan fallando. Usar n8n o Outlook directo para envios urgentes de PILA."
- **Al cliente:** "Le informamos que re-enviaremos su recordatorio de PILA por un canal alternativo. Disculpe la demora."

---

## Incidente 4 — Supabase: rate limit / base de datos llena / proyecto pausado

### Deteccion

- La aplicacion muestra errores de conexion o respuestas lentas en todas las paginas.
- Errores `429` (rate limit) o `503` (servicio no disponible) en la consola del navegador.
- Si el proyecto esta en free tier y no ha tenido actividad en 7 dias, Supabase lo pausa automaticamente.
- Dashboard de Supabase → Settings → Usage muestra el consumo actual.

### Diagnostico

1. **Verificar si el proyecto esta pausado:**
   - Ir a supabase.com/dashboard → proyecto `nrtjizkeopxhpmjxxnjk`.
   - Si aparece banner de "Project paused", ese es el problema.
2. **Verificar uso de DB:**
   - Dashboard → Settings → Usage → Database size.
   - Free tier: 500 MB. Alerta si supera 400 MB.
3. **Verificar uso de storage:**
   - Dashboard → Storage → revisar tamanio del bucket `documentos`.
   - Free tier: 1 GB.
4. **Verificar invocaciones Edge Functions:**
   - Dashboard → Edge Functions → vista general.
   - Free tier: 500,000 invocaciones/mes.
5. Consultas utiles para diagnosticar tamanio de tablas (ejecutar en SQL Editor):
   ```sql
   SELECT schemaname, tablename,
          pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
   ```

### Mitigacion inmediata

- **Si el proyecto esta pausado:** Ir a Dashboard → hacer clic en "Restore project". Toma aproximadamente 5 minutos.
- **Si la DB esta llena:**
  - Identificar tablas grandes con la consulta anterior.
  - Limpiar `logs_actividad` antiguos (>6 meses):
    ```sql
    DELETE FROM logs_actividad WHERE created_at < NOW() - INTERVAL '6 months';
    ```
  - Mover archivos grandes de Storage a un servicio externo si es necesario.
- **Si hay rate limit:** Reducir la frecuencia de consultas desde el frontend; verificar que no haya polling excesivo.

### Solucion definitiva

- **Upgrade a Supabase Pro** cuando se cumplan cualquiera de estas condiciones:
  - Mas de 400 MB de DB usados.
  - Mas de 90 empresas activas.
  - Mas de 400K invocaciones Edge Functions/mes.
  - Se necesita evitar el auto-pause por inactividad.
- Implementar politica de retencion de logs (archivar logs antiguos, borrar despues de 12 meses).
- Configurar alertas de uso en el dashboard de Supabase.
- Realizar backups periodicos:
  ```bash
  supabase db dump -f backup_$(date +%Y%m%d).sql --project-ref nrtjizkeopxhpmjxxnjk
  ```

### Comunicacion

- **Al equipo:** "Supabase esta [pausado/en rate limit/cerca del limite de almacenamiento]. [Se esta restaurando / Se necesita upgrade]. Tiempo estimado de restauracion: 5-10 min."
- **Al cliente (si hay downtime):** "Estamos realizando mantenimiento en la plataforma. El servicio se restaurara en los proximos minutos."

---

## Incidente 5 — n8n.john-osorio.lat caido

### Deteccion

- Los workflows PILA dejan de ejecutarse:
  - No se envian solicitudes mensuales el dia 16.
  - No se envian recordatorios diarios automaticos.
  - Los archivos PILA enviados por email no se procesan.
- Ir a `n8n.john-osorio.lat` — si la pagina no carga, el servidor esta caido.
- Si carga pero los workflows no se ejecutan, revisar que esten activos (toggle verde).
- Verificar en Supabase si hay `pila_records` sin actualizar cuando deberian tener actividad.

### Diagnostico

1. Intentar acceder a `n8n.john-osorio.lat` desde el navegador.
2. Si no responde, conectarse al servidor por SSH:
   ```bash
   ssh usuario@servidor-n8n
   docker ps | grep n8n
   docker logs n8n --tail 50
   ```
3. Si n8n esta corriendo pero los workflows fallan:
   - Ir a n8n → Executions → filtrar por workflows PILA.
   - Revisar los errores de cada ejecucion fallida.
   - Causas comunes: credenciales de Gmail/Outlook expiradas, webhook URL cambiada, disco lleno.
4. Verificar los 4 workflows criticos:
   - `pila-solicitud-mensual` — Cron dia 16.
   - `pila-reminder-webhook` — Webhook HTTP POST.
   - `pila-seguimiento-automatico` — Cron diario.
   - `pila-recepcion-archivo` — Trigger por email.

### Mitigacion inmediata

- **Sync manual de PILA:** Desde la plataforma Regis, el modulo PILA permite ejecutar `syncPeriods()` manualmente para generar y actualizar los registros del mes.
- **Recordatorios manuales:** El consultor puede enviar recordatorios desde la interfaz PILA (boton de email y WhatsApp por empresa).
- **Recepcion de archivos:** Si el workflow de recepcion esta caido, los clientes pueden usar la URL publica de carga: `/upload-pila?t=<token_base64>`.

### Solucion definitiva

- Conectarse al servidor y reiniciar n8n:
  ```bash
  ssh usuario@servidor-n8n
  cd /ruta/a/n8n
  docker-compose restart
  ```
- Verificar que todos los workflows estan activos (toggle verde en n8n).
- Revisar y renovar credenciales si expiraron (Gmail → Outlook migration pendiente).
- Implementar monitoreo de uptime para `n8n.john-osorio.lat` (UptimeRobot, BetterUptime o similar).
- Configurar reinicio automatico del contenedor Docker:
  ```yaml
  # En docker-compose.yml
  services:
    n8n:
      restart: unless-stopped
  ```

### Comunicacion

- **Al equipo:** "n8n esta caido. Los workflows PILA estan detenidos. Procediendo a reiniciar el servidor. Mientras tanto, usar las funciones manuales de la plataforma para enviar recordatorios."
- **Al cliente:** No requiere comunicacion inmediata a menos que se pierda un ciclo de solicitud mensual.

---

## Incidente 6 — Falla de deploy en Vercel

### Deteccion

- Un push a la rama principal no actualiza el sitio en `regis-safety-hub.vercel.app`.
- Vercel Dashboard → Deployments muestra el build mas reciente como "Error" o "Failed".
- Los usuarios ven la version anterior del sitio (puede ser correcto o puede haber regresiones).

### Diagnostico

1. Ir a Vercel Dashboard → proyecto regis-safety-hub → Deployments.
2. Hacer clic en el deployment fallido → Build Logs.
3. Causas comunes:
   - **Errores de TypeScript:** Tipos faltantes, imports incorrectos. Buscar `TS` en los logs.
   - **Dependencias faltantes:** `Module not found`. Verificar `package.json`.
   - **Variables de entorno:** Falta alguna env var en Vercel que existe en local.
   - **Memoria/timeout:** Build excede los limites (raro en proyectos React).
4. Intentar reproducir localmente:
   ```bash
   cd /Users/usuario/Desktop/regis-sgsst/regis-safety-hub
   npm run build
   ```

### Mitigacion inmediata

- **Rollback inmediato:** Vercel Dashboard → Deployments → buscar el ultimo deployment exitoso → menu de tres puntos → "Promote to Production". El sitio se restaura en segundos.
- Si el rollback no es viable, corregir el error localmente, hacer commit y push para triggear un nuevo build.

### Solucion definitiva

- Corregir el error en el codigo (TypeScript, dependencias, etc.).
- Ejecutar `npm run build` localmente antes de hacer push para detectar errores antes del deploy.
- Considerar agregar un step de CI que corra `npm run build` y `tsc --noEmit` antes de permitir merge.
- Mantener las env vars de Vercel sincronizadas con las locales:
  ```bash
  vercel env pull .env.local
  ```

### Comunicacion

- **Al equipo:** "El ultimo deploy a produccion fallo. Se hizo rollback al deploy anterior. El sitio esta operativo con la version previa. Investigando la causa."
- **Al cliente:** No requiere comunicacion a menos que el sitio haya estado caido (Vercel mantiene la version anterior activa durante builds fallidos).

---

## Incidente 7 — Cliente reporta dato incorrecto (PILA, examen medico, etc.)

### Deteccion

- Un cliente o consultor reporta que un dato extraido por IA es incorrecto:
  - PILA clasificada en periodo equivocado.
  - Examen medico con datos de salud mal extraidos del PDF.
  - Acta de comite con informacion imprecisa.
- Puede detectarse tambien durante la revision periodica del consultor.

### Diagnostico

1. **Identificar el registro afectado:**
   - Obtener `empresa_id`, modulo y fecha del reporte.
2. **Revisar el log de actividad:**
   ```sql
   SELECT * FROM logs_actividad
   WHERE empresa_id = '<empresa_id>'
     AND modulo = '<modulo>'
   ORDER BY created_at DESC
   LIMIT 20;
   ```
3. **Para errores de extraccion de examenes medicos:**
   - Revisar el campo `texto_extraido_raw` en `examenes_medicos` para comparar el texto crudo extraido contra el PDF original.
   - Descargar el PDF desde Storage (`documentos/examenes/{empresa_id}/`) y comparar manualmente.
4. **Para errores de actas:**
   - Revisar el audio original en Storage y comparar con la transcripcion generada.
5. **Para errores de PILA:**
   - Verificar el archivo PDF subido y el periodo asignado.
   - Revisar si `syncPeriods()` genero el periodo correctamente.
6. **Verificar flags de procesamiento:**
   ```sql
   SELECT id, procesado_por_ia, revisado_por_consultor, created_at
   FROM examenes_medicos
   WHERE empresa_id = '<empresa_id>'
   ORDER BY created_at DESC;
   ```

### Mitigacion inmediata

- **Correccion manual:** El consultor corrige el dato directamente desde la interfaz de la plataforma (editar examen, editar acta, reasignar periodo PILA).
- No se requiere intervencion tecnica para la correccion de datos; la UI permite editar todos los campos.
- Marcar el registro como `revisado_por_consultor = true` despues de la correccion.

### Solucion definitiva

- **Mejorar el flujo de revision:**
  - Todos los registros procesados por IA (`procesado_por_ia = true`) deben pasar por revision del consultor (`revisado_por_consultor`).
  - Considerar agregar un indicador visual en la UI para items pendientes de revision.
- **Mejorar los prompts de IA:**
  - Si un tipo de error se repite (ej: siempre extrae mal la fecha del examen), ajustar el prompt en la Edge Function correspondiente.
  - Agregar ejemplos (few-shot) al prompt para casos problematicos.
- **Auditar periodicamente:**
  - Generar reporte mensual de items procesados por IA vs. corregidos manualmente.
  - Usar la tasa de correccion para priorizar mejoras en prompts.

### Comunicacion

- **Al cliente:** "Gracias por reportar la inconsistencia. Ya corregimos el dato en la plataforma. Nuestro sistema de IA es una herramienta de asistencia y todos los datos pasan por revision profesional antes de ser finalizados."
- **Al equipo:** "Se identifico un error de extraccion de IA en [modulo] para [empresa]. Dato corregido. Evaluar si el prompt de la Edge Function [nombre] necesita ajuste."

---

## Checklist de verificacion post-incidente

Despues de resolver cualquier incidente, completar los siguientes pasos:

- [ ] El servicio afectado esta operativo y respondiendo correctamente.
- [ ] Los datos afectados fueron corregidos o reprocesados.
- [ ] Se verifico que no hay otros registros afectados por el mismo problema.
- [ ] Se registro el incidente en `logs_actividad` con tipo `incidente` y descripcion del problema y resolucion.
- [ ] Se comunico la resolucion al equipo.
- [ ] Se comunico al cliente si fue afectado directamente.
- [ ] Se identifico si se necesita una accion preventiva (upgrade, cambio de proveedor, mejora de prompt, monitoreo).

---

## Referencias rapidas

| Recurso | URL |
|---|---|
| Supabase Dashboard | https://supabase.com/dashboard/project/nrtjizkeopxhpmjxxnjk |
| Vercel Dashboard | https://vercel.com (proyecto regis-safety-hub) |
| n8n | https://n8n.john-osorio.lat |
| Twilio Console | https://console.twilio.com |
| Resend Dashboard | https://resend.com |
| Anthropic Status | https://status.anthropic.com |
| OpenAI Status | https://status.openai.com |
