# Los 10 pilares para ganar el concurso Regis Colombia

Esta es la rúbrica adicional al brief. Cada decisión de arquitectura,
código o producto se evalúa contra estos pilares. Si una decisión
empeora un pilar sin mejorar otro significativamente, no se toma.

## P1 — Cumplimiento literal del brief
Los 8 criterios oficiales + las 4 recomendaciones de última milla + las
reglas duras del Q&A. Si el brief lo pide, está. Si no lo pide, no se
inventa. Ver CRITERIOS_EVALUACION.md.

## P2 — Arquitectura de bajo o cero mantenimiento
La plataforma debe operar 90 días sin que un dev toque nada.
- Reintentos con backoff exponencial en toda integración externa.
- Fallos no rompen en silencio: se registran y notifican al admin.
- Procesos batch disparados por cron de Supabase, nunca manualmente.
- Errores recurrentes con mensaje accionable, no stack trace.

## P3 — Costo operativo bajo y predecible
Toda automatización con fallback escalonado: local barato → API media
→ API premium. Solo escalar si la confianza/calidad no pasa umbral.
- OCR: Tesseract o PaddleOCR como primera línea, API solo si baja
  confianza o PDF escaneado borroso.
- Extracción IA: modelo barato primero (Haiku, gpt-4o-mini); escalar
  a Sonnet/GPT-4 solo si la validación falla.
- Transcripción: Whisper local antes que Whisper API si el audio es
  corto.
- Email: Resend free tier antes que SendGrid.
- Cada llamada paga loguea costo estimado.

## P4 — Escalabilidad para 90+ empresas y nuevos módulos
- Multi-tenancy real con RLS de Supabase, no aislamiento por convención.
- Modelo de datos soporta múltiples comités por empresa (Q&A) aunque
  hoy solo haya uno.
- Agregar un módulo nuevo no requiere tocar el motor de cumplimiento.
- Plantillas de documentos son data, no código.
- Cron jobs y workers escalan horizontalmente.

## P5 — Privacidad y cumplimiento legal (Ley 1581 / Habeas Data)
- RLS estricto: un cliente nunca ve documentos de otro.
- Storage privado, URLs firmadas con expiración corta.
- Cifrado en reposo verificado (Supabase lo da por default).
- Política de retención documentada por tipo de documento.
- Log de accesos a documentos sensibles.
- Aviso de privacidad visible en el onboarding del cliente.

## P6 — Trazabilidad y audit log
- Quién subió cada documento y cuándo.
- Quién validó y con qué decisión.
- Cambios en integrantes de comité con fecha efectiva.
- Historial mensual de porcentajes de cumplimiento por empresa.
- Reenvíos de recordatorios.
Log append-only o inmutable.

## P7 — Configurabilidad sin tocar código
Todo lo que cambia con el tiempo o por cliente vive en BD y es
editable desde admin UI:
- Remitente y firma de correos (segundo brief).
- Plantillas de correo y WhatsApp por tipo de evento.
- Número de recordatorios antes de escalar.
- Integrantes de comités por empresa.
- Plazos y umbrales del dashboard.
- Puntajes por estándar (motor de cumplimiento configurable).

## P8 — Observabilidad operativa para Regis
Vista admin que responde en 30s "¿la plataforma está sana?":
- Correos enviados / fallados últimas 24h y 30 días.
- OCRs procesados / fallados.
- Duplicados detectados.
- Clientes con menor % o más días sin actividad.
- Costo estimado de APIs externas mes a la fecha.
- Estado de cron jobs (última ejecución, próxima ejecución).

## P9 — Onboarding de cliente autoservicio
Métrica objetivo: desde "Regis registra cliente" hasta "el cliente
sube su primer documento" en menos de 10 minutos.
- Wizard de creación de empresa cliente.
- Selección o detección automática de 7 vs 21 estándares según
  trabajadores y nivel de riesgo.
- Estructura de carpetas Drive/SharePoint creada automáticamente
  con la convención de la Resolución 0312.
- Magic link al contacto de la empresa cliente.
- Primera tarea sugerida visible inmediatamente.

## P10 — Idempotencia y resiliencia
Todo flujo crítico es idempotente:
- Mismo documento por dos canales (correo + WhatsApp) se procesa una
  vez (hash + match semántico por trabajador + período).
- Webhooks que disparan dos veces no duplican efectos.
- Re-upload del mismo PILA no suma puntos doble.
- Reintento de envío de correo no envía dos cuando finalmente funciona.
- Idempotency-key en endpoints de creación de documentos.

## Uso
- Cada PR significativo debe declarar a qué pilar(es) sirve.
- Si un cambio empeora un pilar para mejorar otro, justificar.
- Claude Code consulta este archivo antes de cualquier decisión de
  arquitectura.
