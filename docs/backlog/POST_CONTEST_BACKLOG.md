# Backlog Post-Concurso — Regis SG-SST

> Mejoras identificadas pero diferidas mas alla de la fecha limite del concurso (30 de mayo de 2026).
> Premio del concurso: $2,200 USD por construir una plataforma SG-SST para Regis Colombia.
> Estado actual: 7/8 criterios del concurso cumplidos, en produccion con 3 empresas.

---

## Resumen

| # | Item | Impacto | Esfuerzo |
|---|------|---------|----------|
| 1 | Migracion de n8n a pg_cron de Supabase | Medio | ~8h |
| 2 | Logica de cumplimiento a Postgres functions/triggers | Medio | ~6h |
| 3 | RLS granular por rol | **Alto** | ~12h |
| 4 | Webhooks de Resend para tracking de email | Bajo | ~4h |
| 5 | OCR especializado para PDFs escaneados | Medio | ~8h |
| 6 | Logs estructurados con observabilidad | Medio | ~6h |
| 7 | Backups automaticos configurados en Supabase | Bajo | ~2h |
| 8 | Tests automatizados (Vitest + Playwright) | **Alto** | ~20h |
| 9 | Migracion a Outlook + OneDrive | Medio | ~6h |
| 10 | Magic link auth | Bajo | ~3h |
| | **Total estimado** | | **~75h** |

---

## 1. Migracion de n8n a pg_cron de Supabase

**Por que se posterga:** n8n esta funcionando perfectamente (0% de tasa de fallo en los 4 workflows de PILA). Migrar a pg_cron durante el concurso introduce riesgo innecesario sin ganancia visible para los jueces.

**Impacto:** Medio — elimina la dependencia del servidor self-hosted de n8n (`n8n.john-osorio.lat`), reduce costos de infraestructura y simplifica la arquitectura a un solo proveedor (Supabase).

**Esfuerzo estimado:** ~8 horas

**Dependencias:**
- Supabase Pro plan (necesario para pg_cron)
- Reescribir la logica de los 4 workflows como funciones SQL o Edge Functions con cron triggers
- Migrar el envio de emails de los nodos de Gmail/n8n a Edge Functions con Resend (parcialmente hecho)

**Notas tecnicas:**
- Los 4 workflows a migrar: `pila-solicitud-mensual`, `pila-reminder-webhook`, `pila-seguimiento-automatico`, `pila-recepcion-archivo`
- `pg_cron` se habilita con `create extension pg_cron;` en Supabase
- El workflow mas complejo es `pila-recepcion-archivo` (email trigger + match empresa + upload a storage + update DB) — este requiere un approach diferente ya que pg_cron no puede recibir emails
- Alternativa: mantener n8n solo para `pila-recepcion-archivo` y migrar los otros 3 a pg_cron

---

## 2. Logica de cumplimiento a Postgres functions/triggers

**Por que se posterga:** El calculo en frontend (`Compliance.tsx` lineas 128-148) funciona correctamente y es mas facil de iterar durante el desarrollo del concurso. Moverlo a la base de datos requiere testing cuidadoso para asegurar paridad.

**Impacto:** Medio — garantiza consistencia del scoring de cumplimiento de Resolucion 0312/2019 independientemente del cliente que consulte. Habilita reportes directos desde la DB sin pasar por el frontend.

**Esfuerzo estimado:** ~6 horas

**Dependencias:**
- Definir la formula de scoring como funcion SQL
- Tabla `estandares_0312` debe estar completa y validada para capitulos 1 y 2
- Tests de paridad entre el calculo actual en frontend y la nueva funcion SQL

**Notas tecnicas:**
- Crear funcion `calcular_cumplimiento(empresa_id UUID, anio INT)` que retorne el puntaje PHVA
- Trigger en `items_cumplimiento` que recalcule automaticamente al cambiar un item
- Considerar vista materializada `cumplimiento_resumen` para dashboards rapidos
- El calculo actual pondera por ciclo PHVA: Planear (25%), Hacer (60%), Verificar (5%), Actuar (10%)

---

## 3. RLS granular por rol

**Por que se posterga:** El entorno del concurso es efectivamente single-tenant (3 empresas de prueba, un solo admin). Implementar RLS granular requiere testing exhaustivo con multiples roles y es riesgoso hacerlo a ultimo momento. Un error en RLS podria bloquear toda la aplicacion.

**Impacto:** **Alto** — critico para produccion con multiples empresas. Sin esto, cualquier usuario autenticado puede ver datos de todas las empresas. Es el item de seguridad mas importante del backlog.

**Esfuerzo estimado:** ~12 horas

**Dependencias:**
- Definir roles en Supabase Auth metadata: `admin`, `consultor`, `cliente`
- Tabla de asignacion consultor-empresa (actualmente no existe)
- Testing con usuarios de cada rol

**Notas tecnicas:**
- Politicas a implementar:
  - `admin`: acceso total a todas las tablas
  - `consultor`: acceso solo a empresas asignadas (`consultor_asignaciones` tabla nueva)
  - `cliente`: acceso solo a su empresa (`auth.jwt() ->> 'empresa_id' = empresa_id`)
- RLS actual: `auth.role() = 'authenticated'` en la mayoria de tablas
- Actualizar `useAuth()` en `AuthContext.tsx` para incluir el rol del JWT
- Crear migration con todas las politicas nuevas y probar con `supabase db reset`
- Considerar usar `app_metadata` de Supabase Auth para almacenar `role` y `empresa_id`

---

## 4. Webhooks de Resend para tracking de email

**Por que se posterga:** El envio de emails fire-and-forget funciona para el concurso. El tracking de delivery/bounce/open es una mejora de usabilidad que no afecta la funcionalidad core ni los criterios de evaluacion.

**Impacto:** Bajo — mejora la visibilidad del flujo de PILA (saber si el email llego, si lo abrieron, si reboto). Util para debugging y reportes de seguimiento.

**Esfuerzo estimado:** ~4 horas

**Dependencias:**
- Cuenta de Resend con webhooks habilitados
- Endpoint publico para recibir webhooks (Edge Function o n8n)
- Tabla en DB para almacenar eventos de email

**Notas tecnicas:**
- Resend soporta webhooks para: `email.sent`, `email.delivered`, `email.bounced`, `email.opened`, `email.clicked`
- Crear Edge Function `resend-webhook` que reciba los eventos y actualice `pila_records.email_status`
- Agregar columnas a `pila_records`: `email_delivered_at`, `email_opened_at`, `email_bounced`
- En la UI de PILA, mostrar iconos de estado junto a cada registro (enviado/entregado/abierto/rebotado)

---

## 5. OCR especializado para PDFs escaneados

**Por que se posterga:** Claude Vision funciona excelentemente para PDFs digitales (que son la mayoria de los que maneja Regis). Los PDFs escaneados de baja calidad son un caso borde que no afecta la demo del concurso.

**Impacto:** Medio — mejora la robustez del procesamiento de examenes medicos y PILA para empresas que escanean documentos con camaras de celular o scanners antiguos.

**Esfuerzo estimado:** ~8 horas

**Dependencias:**
- Evaluar calidad de PDFs reales de las 90+ empresas de Regis
- Seleccionar proveedor: Tesseract (open source, gratis) vs Amazon Textract (mejor calidad, costo por pagina)
- Edge Function `process-exam-pdf` debe soportar preprocesamiento

**Notas tecnicas:**
- Pipeline propuesto: PDF → preprocesamiento (deskew, contrast) → OCR (Tesseract/Textract) → texto → Claude para extraccion estructurada
- Tesseract se puede correr en Edge Functions via WASM (`tesseract.js`)
- Amazon Textract tiene mejor precision pero agrega costo (~$1.50 por 1000 paginas)
- Agregar campo `ocr_confidence` a `examenes_medicos` para tracking de calidad
- Fallback: si OCR falla, mantener el flujo actual con Claude Vision directamente

---

## 6. Logs estructurados con observabilidad

**Por que se posterga:** El logging actual (console.error en Edge Functions + `logs_actividad` en DB) es suficiente para el concurso y para debugging basico. La observabilidad avanzada es una mejora operacional, no funcional.

**Impacto:** Medio — critico cuando se escale a 90+ empresas. Sin logs estructurados, diagnosticar problemas en produccion sera dificil y lento.

**Esfuerzo estimado:** ~6 horas

**Dependencias:**
- Seleccionar plataforma: Sentry (errores) + LogFlare (logs) o Supabase Logs (integrado)
- Definir esquema de logs (niveles, contexto, correlation IDs)

**Notas tecnicas:**
- Implementar logger util en Edge Functions con formato JSON: `{ level, message, empresa_id, function_name, duration_ms, error }`
- Agregar `correlation_id` a cada request para trazar flujos completos (ej: solicitud PILA → email → upload → validacion)
- Sentry para Edge Functions: `@sentry/deno` (soporte experimental)
- LogFlare tiene integracion nativa con Supabase
- Considerar dashboard de salud operacional: emails enviados/fallidos, PDFs procesados, tiempos de respuesta

---

## 7. Backups automaticos configurados en Supabase

**Por que se posterga:** Supabase Pro incluye backups diarios automaticos. La configuracion avanzada (point-in-time recovery, schedules personalizados) no es necesaria para el concurso con solo 3 empresas de prueba.

**Impacto:** Bajo para el concurso. Medio para produccion — necesario antes de onboardear las 90+ empresas de Regis.

**Esfuerzo estimado:** ~2 horas

**Dependencias:**
- Plan Pro de Supabase (ya activo)
- Definir RPO (Recovery Point Objective) con Regis

**Notas tecnicas:**
- Habilitar PITR (Point-in-Time Recovery) en Supabase dashboard → Settings → Database
- Configurar retencion de backups segun politica de Regis (7 dias minimo recomendado)
- Documentar procedimiento de restore
- Considerar backup adicional de Storage (`documentos` bucket) a un bucket S3/R2 externo
- Script de verificacion semanal: `pg_dump` de prueba para confirmar integridad

---

## 8. Tests automatizados (Vitest + Playwright)

**Por que se posterga:** Escribir tests para un producto en desarrollo activo durante un concurso con deadline es contraproducente. El tiempo se invierte mejor en funcionalidad visible para los jueces. Sin embargo, es el segundo item mas critico para produccion.

**Impacto:** **Alto** — sin tests, cada deploy es un riesgo. Critico antes de escalar a 90+ empresas. Afecta confiabilidad, velocidad de desarrollo y confianza en refactors.

**Esfuerzo estimado:** ~20 horas

**Dependencias:**
- Instalar Vitest (ya compatible con Vite) y Playwright
- Configurar entorno de test con Supabase local (`supabase start`)
- Datos de prueba reproducibles (seeds)

**Notas tecnicas:**
- **Unit tests (Vitest):** servicios en `services/index.ts`, utilidades en `lib/`, logica de cumplimiento
- **Integration tests (Vitest + Supabase local):** Edge Functions, flujo PILA completo, procesamiento de PDFs
- **E2E tests (Playwright):** login, dashboard, flujo PILA (crear periodo → enviar solicitud → upload publico → validar → aprobar), procesamiento de examen medico
- Prioridad de tests por riesgo:
  1. `syncPeriods()` — logica compleja de generacion de periodos
  2. `process-exam-pdf` — extraccion AI con multiples formatos
  3. Flujo de upload publico — token validation + file storage
  4. Calculo de cumplimiento 0312
- CI/CD: configurar GitHub Actions con `supabase start` para tests de integracion

---

## 9. Migracion a Outlook + OneDrive

**Por que se posterga:** Los workflows de n8n actualmente usan nodos de Gmail y Google Drive que funcionan correctamente. La migracion a Microsoft 365 requiere configurar OAuth con Azure AD y reconfigurar los 4 workflows. Es trabajo de integracion que no agrega funcionalidad nueva.

**Impacto:** Medio — Regis usa Microsoft 365 como su suite principal. La integracion actual con Gmail funciona pero no es la cuenta corporativa de Regis.

**Esfuerzo estimado:** ~6 horas

**Dependencias:**
- Credenciales de Azure AD con permisos de Outlook y OneDrive
- Acceso admin al tenant de Microsoft 365 de Regis
- Configurar app registration en Azure Portal

**Notas tecnicas:**
- n8n tiene nodos nativos para Microsoft Outlook y OneDrive
- Workflows a migrar:
  1. `pila-solicitud-mensual`: Gmail Send → Microsoft Outlook Send
  2. `pila-reminder-webhook`: Gmail Send → Microsoft Outlook Send
  3. `pila-seguimiento-automatico`: Gmail Send → Microsoft Outlook Send
  4. `pila-recepcion-archivo`: Gmail Trigger → Microsoft Outlook Trigger, Google Drive Upload → OneDrive Upload
- El workflow 4 es el mas complejo: necesita configurar el trigger de email entrante en Outlook + upload a OneDrive/SharePoint
- Edge Functions (Resend, Twilio) no se afectan — ya son proveedor-neutral
- Considerar mantener Gmail como fallback durante la transicion

---

## 10. Magic link auth

**Por que se posterga:** El sistema de auth actual (email/password) funciona bien. El upload publico de PILA ya usa tokens sin autenticacion (`/upload-pila?t=<base64>`), que es el caso de uso principal donde magic links serian utiles.

**Impacto:** Bajo — mejora UX para contactos de empresas que necesitan acceder a la plataforma ocasionalmente, pero el flujo de upload publico ya resuelve el caso mas comun.

**Esfuerzo estimado:** ~3 horas

**Dependencias:**
- Configurar proveedor de email en Supabase Auth (ya configurado con Resend)
- Personalizar template del magic link email con branding de Regis

**Notas tecnicas:**
- Supabase Auth soporta magic links nativamente: `supabase.auth.signInWithOtp({ email })`
- Actualizar `AuthContext.tsx` para manejar el callback de magic link
- Personalizar email template en Supabase Dashboard → Authentication → Email Templates
- Considerar magic link solo para rol `cliente`, mantener password para `admin` y `consultor`
- Configurar expiracion del magic link (default 1h, ajustar segun necesidad)
