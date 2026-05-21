# Planificación de Capacidad — Regis SG-SST

> Documento técnico para escalar la plataforma de 3 a 90+ empresas cliente.

**Fecha:** Mayo 2026  
**Versión:** 1.0

---

## 1. Resumen Ejecutivo

La plataforma actualmente opera con 3 empresas y ~30 trabajadores. El objetivo es escalar a 90+ empresas con un promedio de 25 trabajadores cada una (~2,250 trabajadores). Este documento analiza cada componente de infraestructura, proyecta volúmenes, identifica cuellos de botella y establece un plan de upgrades con costos estimados.

---

## 2. Proyecciones de Volumen a 90 Empresas

| Concepto | Cálculo | Volumen Mensual | Volumen Anual |
|----------|---------|-----------------|---------------|
| Trabajadores | 90 × 25 | — | 2,250 (activos) |
| Registros PILA | 90 × 12 | 90 | 1,080 |
| Exámenes médicos | ~2,250/año (ingreso + periódico + egreso) | ~188 | 2,250 |
| Actas de comité | 90 × 2 comités × 12 meses | 180 | 2,160 |
| Documentos generales | ~30 tipos × 90 empresas | — | 2,700 (base) |
| Equipos inventariados | ~10 por empresa × 90 | — | 900 (base) |
| Matrices de riesgo | 1 por empresa | — | 90 (actualizadas/año) |
| Planes de emergencia | 1 por empresa | — | 90 |
| Entradas de log | ~50/día × 365 | ~1,500 | 18,250 |
| Ítems de cumplimiento | 21 estándares × 90 empresas | — | 1,890 (base) |

---

## 3. Análisis por Componente

### A) Supabase — Base de Datos (PostgreSQL)

#### Estimación de filas por tabla

| Tabla | Filas estimadas (90 empresas, año 1) | Tamaño prom. fila | Subtotal |
|-------|---------------------------------------|-------------------|----------|
| `empresas_cliente` | 90 | 2 KB | 180 KB |
| `trabajadores` | 2,250 | 1 KB | 2.25 MB |
| `pila_records` | 1,080 | 500 B | 540 KB |
| `examenes_medicos` | 2,250 | 1 KB | 2.25 MB |
| `recomendaciones_medicas` | 6,750 (~3 por examen) | 500 B | 3.4 MB |
| `matrices_riesgo` | 90 | 1 KB | 90 KB |
| `riesgos_matriz` | 4,500 (~50 riesgos por matriz) | 2 KB | 9 MB |
| `comites` | 270 (90 × 3 tipos) | 500 B | 135 KB |
| `integrantes_comite` | 1,080 (~4 por comité) | 300 B | 324 KB |
| `actas_comite` | 2,160 | 5 KB (incluye contenido AI) | 10.8 MB |
| `planes_emergencia` | 90 | 10 KB (análisis AI) | 900 KB |
| `cumplimiento_empresas` | 90 | 1 KB | 90 KB |
| `items_cumplimiento` | 1,890 | 500 B | 945 KB |
| `estandares_0312` | 60 (referencia estática) | 500 B | 30 KB |
| `configuracion_sistema` | ~50 | 200 B | 10 KB |
| `logs_actividad` | 18,250 | 500 B | 9.1 MB |
| `templates_documento` | ~20 | 2 KB | 40 KB |
| `inventario_equipos` | 900 | 500 B | 450 KB |
| **Total estimado** | **~41,570 filas** | | **~40 MB** |

#### Crecimiento anual acumulado

| Año | Filas nuevas/año | DB acumulado | Tier necesario |
|-----|-----------------|--------------|----------------|
| 1 | ~41,500 | ~40 MB | Free (500 MB) |
| 2 | +25,000 (datos recurrentes) | ~75 MB | Free |
| 3 | +25,000 | ~110 MB | Free |
| 5 | — | ~180 MB | Free |

**Conclusión:** La base de datos cabe en el tier gratuito (500 MB) por al menos 5 años, incluso con 90 empresas. El tamaño está dominado por `logs_actividad`, `actas_comite` y `riesgos_matriz`.

#### Rendimiento y conexiones

- **Connection pooling:** Supabase usa PgBouncer. El tier gratuito permite 50 conexiones directas, suficiente para la carga esperada (~10-20 usuarios concurrentes).
- **Índices necesarios:** Verificar que existan índices en:
  - `pila_records(empresa_id, periodo)`
  - `examenes_medicos(empresa_id, fecha_examen)`
  - `logs_actividad(created_at, empresa_id)`
  - `items_cumplimiento(empresa_id, estandar_id)`
  - `trabajadores(empresa_id)`
- **Consultas lentas potenciales:**
  - Dashboard de cumplimiento que agrega puntuaciones de 21+ estándares × 90 empresas → considerar vista materializada o caché en frontend.
  - Bitácora mensual que consulta múltiples tablas por empresa → ya resuelta con Edge Function.

---

### B) Supabase — Storage

#### Volúmenes de almacenamiento

| Tipo de archivo | Cantidad/año | Tamaño promedio | Total/año |
|-----------------|-------------|-----------------|-----------|
| PDFs PILA | 1,080 | 500 KB | 540 MB |
| PDFs exámenes médicos | 2,250 | 2 MB | 4.5 GB |
| Documentos generales | 2,700 | 1 MB | 2.7 GB |
| Audios emergencia | 90 | 5 MB | 450 MB |
| Actas exportadas | 2,160 | 200 KB | 432 MB |
| **Total año 1** | | | **~8.6 GB** |

#### Proyección acumulada

| Periodo | Storage acumulado | Tier necesario |
|---------|-------------------|----------------|
| Mes 1 | ~720 MB | Free (1 GB) — al límite |
| Mes 2 | ~1.4 GB | **Pro requerido** |
| Año 1 | ~8.6 GB | Pro (100 GB incluidos) |
| Año 2 | ~17 GB | Pro |
| Año 5 | ~43 GB | Pro |

**Conclusión:** Storage es el primer cuello de botella. Se agota el tier gratuito (1 GB) en el segundo mes con 90 empresas. Upgrade a Pro obligatorio desde el día 1 de operación a escala.

**Optimizaciones posibles:**
- Comprimir PDFs al momento de upload (reducción ~30-40%).
- Política de retención: mover documentos > 2 años a almacenamiento frío (S3 Glacier o similar).
- Limitar resolución de escaneos subidos por clientes.

---

### C) Supabase — Edge Functions

| Función | Invocaciones/mes | Invocaciones/año |
|---------|-----------------|------------------|
| `send-pila-reminder` | 270 (90 × 3 recordatorios avg) | 3,240 |
| `send-whatsapp-reminder` | 270 | 3,240 |
| `generate-bitacora` | 90 | 1,080 |
| `weekly-summary` | 12 (3 consultores × 4 semanas) | 144 |
| `process-exam-pdf` | 188 | 2,250 |
| `transcribe-audio` | 8 (~90/año ÷ 12) | 90 |
| `generate-acta` | 180 | 2,160 |
| **Total** | **~1,018** | **~12,204** |

**Conclusión:** 1,018 invocaciones/mes vs 500,000 del tier gratuito. Uso al **0.2%** de la capacidad. Las Edge Functions no serán un cuello de botella en ningún escenario previsible.

**Nota:** El tiempo de ejecución por invocación sí importa. Las funciones que llaman a Claude API (`process-exam-pdf`, `generate-acta`, `transcribe-audio`) pueden tardar 10-30 segundos. El tier gratuito tiene límite de 2M segundos de wall-clock time/mes. Con ~400 invocaciones largas × 20s promedio = 8,000 segundos/mes — sin riesgo.

---

### D) Anthropic Claude API

#### Consumo de tokens estimado

| Función | Llamadas/mes | Input tokens/llamada | Output tokens/llamada | Input total/mes | Output total/mes |
|---------|-------------|---------------------|----------------------|-----------------|------------------|
| `process-exam-pdf` | 188 | 4,000 | 2,000 | 752,000 | 376,000 |
| `generate-acta` | 180 | 3,000 | 2,000 | 540,000 | 360,000 |
| `transcribe-audio` (análisis) | 8 | 8,000 | 4,000 | 64,000 | 32,000 |
| **Total mensual** | **376** | | | **1,356,000** | **768,000** |

#### Costo mensual estimado (Claude Sonnet 4)

| Tipo | Tokens/mes | Precio/1M tokens | Costo/mes |
|------|-----------|-------------------|-----------|
| Input | 1.36M | $3.00 | $4.08 |
| Output | 0.77M | $15.00 | $11.55 |
| **Total** | | | **$15.63/mes** |

**Costo anual:** ~$188

**Optimizaciones:**
- **Batch API:** Para `process-exam-pdf` cuando se procesan múltiples exámenes (reducción ~50% en costo).
- **Prompt caching:** Reutilizar prefijos de sistema entre llamadas del mismo tipo (reducción ~80% en tokens de sistema cacheados).
- **Modelo Haiku:** Para tareas simples como extracción de datos de exámenes médicos (reducción ~90% en costo), reservando Sonnet para actas y análisis de vulnerabilidad.

---

### E) OpenAI Whisper

| Métrica | Valor |
|---------|-------|
| Archivos de audio/año | 90 |
| Duración promedio | 5 minutos |
| Total minutos/año | 450 |
| Precio | $0.006/minuto |
| **Costo anual** | **$2.70** |

**Conclusión:** Costo negligible. No requiere optimización.

---

### F) Twilio WhatsApp

| Métrica | Valor |
|---------|-------|
| Mensajes/mes | 270 |
| Tipo | Utility templates (recordatorios) |
| Precio por mensaje (utilidad, Colombia) | ~$0.0088 USD |
| **Costo mensual** | **~$2.38** |
| **Costo anual** | **~$28.50** |

**Consideraciones de escala:**
- **Sandbox → WhatsApp Business API:** El sandbox de Twilio solo permite enviar a números pre-registrados. Para 90 empresas se necesita la WhatsApp Business API con número verificado.
- Costo de activación de número WhatsApp Business: $0/mes (incluido en Twilio).
- Aprobación de templates: 1-3 días hábiles. Preparar templates antes del escalado.
- Rate limit: 1,000 mensajes/segundo con Business API — no será problema.

---

### G) Resend (Email)

| Métrica | Valor |
|---------|-------|
| Emails/mes (estimado) | ~500 |
| Distribución | 270 recordatorios PILA + 90 bitácoras + 90 reportes + 50 notificaciones |
| Free tier | 100 emails/día (3,000/mes) |
| **Costo mensual** | **$0 (free tier suficiente)** |

**Acciones necesarias para escala:**
- Configurar dominio personalizado (e.g., `notificaciones.regiscolombia.com`) para mejorar deliverability.
- Configurar registros SPF, DKIM y DMARC.
- Sin dominio personalizado, los emails irán a spam con 90+ empresas.

---

### H) Vercel (Frontend)

| Métrica | Valor | Límite Free |
|---------|-------|-------------|
| Bandwidth estimado | ~5 GB/mes (SPA + assets) | 100 GB/mes |
| Builds/mes | ~20 (deploys) | 6,000 min/mes |
| Tiempo de build | ~2 min | — |
| **Costo mensual** | **$0** | — |

**Conclusión:** Vercel free tier es ampliamente suficiente para una SPA con ~50 usuarios concurrentes. No se prevé necesidad de upgrade.

---

### I) n8n (Self-hosted)

| Métrica | Valor |
|---------|-------|
| Workflows activos | 4 |
| Ejecuciones/mes | ~180 |
| Servidor actual | VPS (especificaciones del host) |

**Riesgos a escala:**
- **Disponibilidad:** Servidor único sin redundancia. Si cae el VPS, se detienen los recordatorios PILA y el seguimiento automático.
- **Mitigación:** Configurar health checks + alertas (UptimeRobot o similar). Backups automáticos del workflow JSON.
- **Procesamiento:** 180 ejecuciones/mes es trivial para n8n. El cuello de botella es la latencia de APIs externas (Outlook, OneDrive), no n8n.
- **Migración pendiente:** Gmail/Google Drive → Microsoft 365/Outlook/OneDrive. Completar antes de escalar.

---

## 4. Resumen de Costos

### Costo mensual proyectado a 90 empresas

| Componente | Tier actual | Tier necesario | Costo mensual |
|------------|-------------|----------------|---------------|
| Supabase DB | Free | Free | $0 |
| Supabase Storage | Free | **Pro** | $25* |
| Supabase Edge Functions | Free | Free | $0 |
| Supabase Auth | Free | Free (50K MAU) | $0 |
| Anthropic Claude API | Pay-as-you-go | Pay-as-you-go | $15.63 |
| OpenAI Whisper | Pay-as-you-go | Pay-as-you-go | $0.23 |
| Twilio WhatsApp | Pay-as-you-go | Pay-as-you-go | $2.38 |
| Resend | Free | Free | $0 |
| Vercel | Free | Free | $0 |
| n8n | Self-hosted | Self-hosted | $0** |
| Dominio personalizado (Resend) | — | Requerido | ~$1.50 |
| **Total mensual** | | | **~$44.74** |
| **Total anual** | | | **~$537** |

*\* Supabase Pro a $25/mes incluye 8 GB DB + 100 GB Storage + 250K MAU + soporte por email. Es el único upgrade obligatorio.*

*\*\* El costo del VPS para n8n se asume existente e independiente de este proyecto.*

### Costo por empresa

| Métrica | Valor |
|---------|-------|
| Costo total mensual | ~$44.74 |
| Costo por empresa/mes | **~$0.50 USD** |
| Costo por empresa/año | **~$5.97 USD** |

---

## 5. Cronograma de Upgrades

| Hito | Acción requerida | Urgencia |
|------|-------------------|----------|
| **0-10 empresas** | Ninguna. Todo en free tier. | — |
| **10-15 empresas** | Storage se acerca a 1 GB. Preparar upgrade Supabase Pro. | Media |
| **15+ empresas** | **Upgrade a Supabase Pro ($25/mes).** Configurar dominio email Resend. | **Alta** |
| **30+ empresas** | Migrar Twilio sandbox → WhatsApp Business API. Verificar número. | Alta |
| **50+ empresas** | Evaluar prompt caching en Claude API. Crear índices adicionales si hay queries lentos. Considerar vista materializada para dashboard de cumplimiento. | Media |
| **90+ empresas** | Monitorear storage (~8.6 GB/año). Implementar política de retención de documentos. Evaluar redundancia n8n. | Media |
| **200+ empresas** | Evaluar Supabase Team ($599/mo) si se necesita SOC2, SSO o soporte prioritario. Considerar réplicas de lectura. | Baja |

---

## 6. Recomendaciones de Optimización

### 6.1 Optimizaciones inmediatas (antes de escalar)

1. **Verificar índices de base de datos:** Ejecutar `EXPLAIN ANALYZE` en las consultas principales del dashboard y crear índices faltantes.
2. **Configurar dominio de email:** Registrar dominio en Resend con SPF/DKIM/DMARC.
3. **Completar migración n8n:** Gmail/Drive → Outlook/OneDrive antes de onboardear más empresas.
4. **Activar Twilio WhatsApp Business:** Solicitar aprobación de templates y verificación de número.

### 6.2 Optimizaciones a mediano plazo (15-50 empresas)

1. **Prompt caching en Claude API:** Reutilizar prefijos de sistema para reducir costo de tokens de input en ~80%.
2. **Modelo Haiku para extracción:** Usar Haiku en `process-exam-pdf` para extracción estructurada (costo 10x menor que Sonnet).
3. **Compresión de PDFs:** Implementar compresión automática en el upload (sharp o similar para imágenes, pdf-lib para PDFs).
4. **Paginación de logs:** Implementar paginación del lado del servidor para `logs_actividad` en vez de cargar todos los registros.

### 6.3 Optimizaciones a largo plazo (90+ empresas)

1. **Batch API de Anthropic:** Procesar exámenes médicos en lote cuando se reciben múltiples de una misma empresa.
2. **Política de retención:** Mover documentos > 2 años a almacenamiento externo (AWS S3 Glacier: ~$0.004/GB/mes).
3. **Vista materializada:** Crear vista materializada para el dashboard de cumplimiento, refrescada cada hora.
4. **CDN para documentos:** Configurar Supabase Storage con cache headers para documentos frecuentemente consultados.
5. **Monitoreo:** Implementar alertas de uso de storage y costos de API con Supabase Dashboard + webhooks.

---

## 7. Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Storage supera 100 GB (año 3+) | Costo adicional $0.021/GB en Supabase Pro | Baja | Política de retención + compresión |
| Caída del servidor n8n | Recordatorios PILA dejan de enviarse | Media | Health checks + alertas + documentar procedimiento de recovery |
| Cambio de precios Anthropic API | Aumento de costos mensuales | Baja | Modelos más económicos (Haiku), prompt caching, batch API |
| Rate limiting de Twilio | Mensajes WhatsApp no se entregan | Baja | Business API soporta 1,000 msg/s, escalonamiento de envíos |
| Supabase free tier deprecado | Migración forzada a Pro | Baja | Ya se planifica upgrade a Pro para storage |
| Consultas lentas en dashboard | UX degradada para consultores | Media | Índices, vistas materializadas, paginación |

---

## 8. Conclusión

La plataforma Regis SG-SST puede escalar de 3 a 90+ empresas con un costo operativo mensual inferior a $45 USD. El único upgrade obligatorio es Supabase Pro ($25/mes) por limitaciones de storage. Todos los demás servicios operan cómodamente dentro de sus tiers gratuitos o con costos variables mínimos.

El costo por empresa de ~$0.50 USD/mes es altamente competitivo y permite un margen amplio considerando que el servicio de consultoría SG-SST se cobra en el rango de $200,000-$500,000 COP/mes por empresa.

**Acción inmediata:** Upgrade a Supabase Pro antes de superar 15 empresas. Todo lo demás puede implementarse progresivamente.
