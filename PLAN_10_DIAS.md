# PLAN DE 10 DÍAS — Regis SG-SST

**Inicio:** miércoles 21 de mayo de 2026  
**Entrega:** sábado 31 de mayo de 2026 (video) — buffer 30 mayo  
**Grabación video:** viernes 30 de mayo  
**Horas disponibles estimadas:** ~8h/día × 8 días de trabajo = 64h  

---

## 📌 CHANGELOG

### 2026-05-20 — Sesión Día 1
- **Día 1 cerrado al 100%** (11/11 tareas)
- **5 bugs arreglados** (ver docs/SESSION_LOG_2026-05-20.md)
- **~20h descubiertas como ya hechas** en archivos unstaged commiteados
- **5 tareas nuevas** agregadas a Días 3, 4 y 6
- **6 de 8 criterios del brief** funcionales

Ver detalle completo en: [docs/SESSION_LOG_2026-05-20.md](docs/SESSION_LOG_2026-05-20.md)

### Tareas marcadas como ✅ COMPLETADAS (ya no hacer):
- 1.1 a 1.11 (Día 1 completo)
- 2.1, 2.2, 2.3, 2.6, 2.8 (Día 2 parcial)
- 4.1 R1 Documents (descubierta como hecha)
- 4.4 R4 Branded exports (descubierta como hecha via exportHeader.ts)
- 5.3 Logging audit (descubierta como hecha en 6 módulos)
- 7.1 Bonus Equipment Inventory (descubierta como hecha)

### Tareas marcadas como ⏭ DESCARTADAS:
- "Fix localhost bug en WhatsApp" — era falsa alarma, código correcto
- "Reconstruir Edge Functions stubs" — código real existe y funciona

### Tareas marcadas como 🆕 NUEVAS:
- **Día 3:** Validación que archivo PILA sea PILA (1.5h)
- **Día 3:** UX extracción vacía no asumir "apto" (30 min)
- **Día 3:** Botón "Ver examen cargado" (30 min)
- **Día 4 (con R3):** Logo Regis en páginas públicas (30 min)
- **Día 6:** Meta tags Vercel og:title etc. (10 min)

---

## Priorización

| Prioridad | Qué cubre | Horas est. |
|-----------|-----------|------------|
| P#1 | Bugs del happy path del video + seguridad crítica (bucket público, RLS) | 14h |
| P#2 | 4 recomendaciones de última milla | 9h |
| P#3 | Gaps de los 8 criterios ❌ o 🟡 | 18h |
| P#4 | Reglas duras del Q&A faltantes | 4h |
| P#5 | Pilares P5, P6, P7, P10 débiles | 8h |
| P#6 | SOP/Manual (criterio #8) | 4h |
| P#7 | 1-2 bonus si sobra tiempo | 3h |
| **Total** | | **60h** |

---

## DÍA 1 — Miércoles 21 mayo: Verificación y bugs críticos

**Objetivo:** Confirmar qué funciona, qué está roto. Cero desarrollo nuevo.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 1.1 | Verificar que el sitio está desplegado y accesible | — | URL abre, login funciona, 3 empresas visibles | P1 (C7) | 0.5h | No hay demo |
| 1.2 | Invocar `process-exam-pdf` con 1 PDF real | MedicalExams.tsx | Edge Function retorna datos extraídos | P1 (C2) | 1h | Criterio 2 falla |
| 1.3 | Invocar `generate-acta` con datos de prueba | Committees.tsx | Edge Function retorna acta generada | P1 (C4) | 1h | Criterio 4 falla |
| 1.4 | Probar flujo completo PILA: sync → reminder → upload | Pila.tsx, UploadPila.tsx | Email llega, link funciona, archivo se sube, estado cambia | P1 (C1) | 1h | Criterio 1 falla |
| 1.5 | Probar transcribe-audio con audio 3+ min | EmergencyPlans.tsx | Transcripción + análisis JSON retornado | P1 (C5) | 0.5h | Criterio 5 falla |
| 1.6 | Probar Documents.tsx: subir → validar → aprobar | Documents.tsx | **Esperar que falle** en validar (DB constraint). Confirmar bug. | P1 (R1) | 0.5h | — |
| 1.7 | ~~Verificar RLS~~ **YA VERIFICADO:** `auth_full_access` USING(true) en todas las tablas. Planificar reemplazo. | — | — | P5 | 0h | — |
| 1.8 | Verificar n8n workflows activos | n8n.john-osorio.lat | Al menos `pila-reminder-webhook` responde | P2 | 0.5h | — |
| 1.9 | Verificar .env no está en GitHub público | GitHub repo | `.env` no visible en repo remoto | P5 | 0.5h | — |
| 1.10 | Recuperar código fuente de process-exam-pdf y generate-acta | supabase/functions/ | Los 2 archivos index.ts tienen código completo | P2 | 1h | No se pueden modificar |
| 1.11 | Dump schema completo de producción al repo | supabase/migrations/004_schema_dump.sql | Archivo SQL con CREATE TABLE + ALTER TABLE + policies tal cual está en producción | P2 | 1h | Schema no reproducible |

**Total día 1: ~8h**

---

## DÍA 2 — Jueves 22 mayo: Bugs críticos + seguridad Storage

**Objetivo:** Arreglar todo lo que rompe el demo + cerrar la brecha más grave (bucket público).

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 2.1 | **FIX:** Agregar estados `validado`, `aprobado` al CHECK de `documentos` | Nueva migration SQL | `UPDATE documentos SET estado='validado'` no da error | P1 (R1) | 1h | Demo R1 roto |
| 2.2 | **FIX:** Agregar `validado_por`, `aprobado_por`, `fecha_validacion`, `fecha_aprobacion` a `pila_records` si no existen | Migration SQL | Validate/approve PILA funciona en Pila.tsx | P1 (C1) | 1h | Demo M1 parcial |
| 2.3 | **FIX:** Queries de `actas_comite` que usan `.eq("empresa_id", ...)` | Compliance.tsx:84, Calendar.tsx, CompanyReport.tsx | Queries retornan datos correctos via JOIN a comites | P1 (C6) | 2h | Dashboard roto |
| 2.4 | **🔴 SEGURIDAD:** Cambiar bucket `documentos` a PRIVADO | Supabase Dashboard | Bucket marcado como private. URLs directas dejan de funcionar. | P5 | 0.5h | Docs médicos expuestos públicamente |
| 2.5 | **🔴 SEGURIDAD:** Refactorizar todo acceso a documentos para usar signed URLs | services/index.ts, Documents.tsx, Pila.tsx, MedicalExams.tsx, CompanyReport.tsx, EquipmentInventory.tsx | Todos los `archivo_url` se generan con `supabase.storage.from('documentos').createSignedUrl(path, 86400)` (24h expiry) | P5 | 2h | App rota después de hacer bucket privado |
| 2.6 | **SEGURIDAD:** Storage policies — limitar MIME types y tamaño | Supabase Dashboard o migration SQL | Solo PDF/imagen/audio aceptados. PDF ≤10MB, imagen ≤5MB, audio ≤25MB | P5 | 0.5h | — |
| 2.7 | Remover credenciales test visibles de Login.tsx | Login.tsx | No hay hint box con user/password en pantalla | P5 | 0.5h | Mala impresión en demo |
| 2.8 | Agregar `contenido_generado`, `hay_quorum` a `actas_comite` si no existen en DB | Migration SQL | Committees.tsx funciona sin error | P1 (C4) | 0.5h | — |

**Total día 2: ~8h**

---

## DÍA 3 — Viernes 23 mayo: Criterios 2, 3, 4 + RLS tenant-scoped

**Objetivo:** Cerrar los 3 criterios que están 🟡 + primera fase de RLS real.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 3.1 | Hacer matrices de riesgo EDITABLES (inline edit de filas) | RiskMatrices.tsx | El usuario puede modificar ND, NE, NC, controles, y guardar | P1 (C3) | 3h | Criterio 3 parcial |
| 3.2 | Agregar botón "Agregar riesgo" a matriz existente | RiskMatrices.tsx, matricesService | Se puede insertar un riesgo custom | P1 (C3) | 1.5h | — |
| 3.3 | **Verificar `process-exam-pdf` con 5 PDFs distintos** — 13 deployments sugieren inestabilidad. Crear PDFs de prueba variados (ingreso, periódico, egreso, distintos formatos) | datos-prueba/ | 5 PDFs procesados exitosamente sin error | P1 (C2) | 2h | Criterio 2 no demostrable |
| 3.4 | Si process-exam-pdf falla: recuperar código del deploy + reconstruir con pdf-parse + Claude Vision fallback | supabase/functions/process-exam-pdf/ | Edge Function extrae datos de PDF digital Y escaneado | P3 | 3h (solo si falla) | — |
| 3.5 | Verificar generate-acta con 2 empresas distintas | Committees.tsx | Actas generadas para Construandes y DevCo | P1 (C4) | 1h | Criterio 4 parcial |
| 3.6 | **🔴 RLS FASE 1:** Reemplazar `auth_full_access` por políticas tenant-scoped en 6 tablas críticas | Migration SQL | documentos, examenes_medicos, pila_records, planes_emergencia, trabajadores, inventario_equipos: admin/consultor ve todo, cliente solo su empresa_id | P5, P4 | 3h | Multi-tenancy rota |

**Total día 3: ~10.5h (hasta 13.5h si 3.4 necesario) — día largo, ajustar según resultado de 3.3**

---

## DÍA 4 — Sábado 24 mayo: Recomendaciones última milla + criterio 1

**Objetivo:** Cerrar las 4 recomendaciones + PILA sin intervención.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 4.1 | **R2:** Leer `email_remitente` de configuracion_sistema en Edge Functions en vez de hardcode | send-pila-reminder, generate-bitacora, weekly-summary | `from` en emails lee de DB | P7 | 2h | R2 no cumple |
| 4.2 | **R3:** Agregar campo `logo_url` a `empresas_cliente` + upload de logo en Companies.tsx | migration SQL, Companies.tsx | Admin puede subir logo de empresa cliente | P1 (R3) | 2h | R3 parcial |
| 4.3 | **R3:** Pasar logo de empresa a getExportHeaderHTML() en todas las páginas que exportan | exportHeader.ts, RiskMatrices, Committees, EmergencyPlans, Compliance, CompanyReport | Logo de la empresa cliente aparece en encabezado de documentos | P1 (R3) | 1.5h | R3 no visible |
| 4.4 | **R1:** Documentos generales suman al dashboard de cumplimiento | Compliance.tsx, Documents.tsx | Docs aprobados aparecen como evidencia en evaluación 0312 | P1 (R1) | 2h | R1 incompleta |

**Total día 4: ~7.5h**

---

## DÍA 5 — Domingo 25 mayo: Pilares P5 fase 2, P6, P7

**Objetivo:** Completar seguridad + trazabilidad + configurabilidad.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 5.1 | **P5 RLS FASE 2:** Políticas `USING(auth.uid() IS NOT NULL)` en tablas restantes (comites, actas, matrices, cumplimiento, logs, config, templates, etc.) | Migration SQL | Todas las tablas tienen política que al menos requiere login. Tablas de referencia (estandares, ciiu) abiertas a lectura. | P5 | 2h | RLS incompleta |
| 5.2 | **P5:** Hacer logs_actividad append-only (policy que bloquea DELETE/UPDATE para no-admin) | Migration SQL | `DELETE FROM logs_actividad` falla para rol no-admin | P6 | 0.5h | Log manipulable |
| 5.3 | **P6:** Agregar log a validate/approve de Pila, Documents | Pila.tsx, Documents.tsx, services/index.ts | Toda acción de validación/aprobación queda en logs_actividad | P6 | 1h | Trazabilidad parcial |
| 5.4 | **FIX:** Insertar `asistencia_comite` records al generar acta | Committees.tsx | Asistencia persiste en DB con acta_id | P6 | 1h | Trazabilidad incompleta |
| 5.5 | **FIX:** Mover validate/approve inline de Pila.tsx a pilaService | services/index.ts, Pila.tsx | No hay supabase.from() directo en Pila.tsx para validate/approve | P2 | 1h | Inconsistencia |
| 5.6 | **P7:** Hacer threshold de equipos configurable desde Settings | EquipmentInventory.tsx, configuracion_sistema | `equipos_dias_aviso_vencimiento` leído de DB, no hardcoded | P7 | 1h | P7 parcial |
| 5.7 | Role guard en Settings, EmailTemplates, ActivityLog | Settings.tsx, EmailTemplates.tsx, ActivityLog.tsx | Cliente no puede acceder a estas páginas | P5 | 1h | Brecha de seguridad |
| 5.8 | Filtro por empresa_id en Calendar y CompanyReport para rol cliente | Calendar.tsx, CompanyReport.tsx | Cliente solo ve su propia empresa | P5 | 1h | Cliente ve datos ajenos |

**Total día 5: ~8.5h**

---

## DÍA 6 — Lunes 26 mayo: Criterio 1 completo + P10

**Objetivo:** PILA totalmente automático. Idempotencia básica.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 6.1 | Automatizar syncPeriods via pg_cron o n8n (no manual) | n8n workflow o pg_cron SQL | PILA se sincroniza automáticamente el día 1 de cada mes | P2, P1 (C1) | 2h | "Sin intervención manual" no se cumple |
| 6.2 | **P10:** ON CONFLICT en upload PILA (re-upload no duplica) | services/index.ts (pilaService.uploadFile), UploadPila.tsx | Subir mismo PILA 2 veces = 1 registro | P10 | 1.5h | Duplicados posibles |
| 6.3 | **P10:** ON CONFLICT en upload documentos | Documents.tsx o nuevo documentsService | Subir mismo doc 2 veces = 1 registro | P10 | 1h | Duplicados |
| 6.4 | Mover Documents.tsx queries a documentsService | services/index.ts, Documents.tsx | No hay supabase.from() directo en Documents.tsx | P2 | 2h | Inconsistencia arquitectónica |
| 6.5 | Agregar PageHeader a páginas que lo faltan | Documents, ActivityLog, EmailTemplates, Settings, CompanyReport | Todas las páginas usan `<PageHeader>` | P1 | 1h | Inconsistencia visual |

**Total día 6: ~7.5h**

---

## DÍA 7 — Martes 27 mayo: SOP + datos demo + usuario cliente + backups

**Objetivo:** Criterio 8 cerrado. Datos demo coherentes. Multi-tenant demostrable.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 7.1 | **Criterio 8:** Escribir SOP/manual de operación (markdown o PDF) | docs/SOP.md o similar | Documento de 5+ páginas que cubre: login, crear empresa, cada módulo, flujo de validación, configuración | P1 (C8) | 4h | Criterio 8 falla |
| 7.2 | Sembrar datos demo coherentes para el video | Seed SQL o script | 3 empresas con: trabajadores, PILA de 6 meses, exámenes, matrices, comités con integrantes, planes, cumplimiento, documentos, inventario equipos | P1 (C7) | 2.5h | Demo con datos vacíos |
| 7.3 | **Crear usuario cliente demo** en Supabase Auth + tabla usuarios | Supabase Dashboard + seed SQL | Usuario `cliente@construandes.com` con rol=cliente, empresa_id=Construandes. Login funciona y muestra solo datos de Construandes. | P5, P1 (C6) | 1h | Vista cliente no demostrable con usuario real |
| 7.4 | **Habilitar backups** en Supabase Dashboard | Supabase Dashboard | Point-in-time recovery o daily backups activados | P2 | 0.5h | Riesgo continuidad |
| 7.5 | Limpiar console.logs | Pila.tsx, UploadPila.tsx, Calendar.tsx | No hay console.log/error en producción | P2 | 0.5h | Visible en demo |

**Total día 7: ~8.5h**

---

## DÍA 8 — Miércoles 28 mayo: Bonus + observabilidad

**Objetivo:** 1-2 bonus que ya están casi listos. Observabilidad básica.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 8.1 | **Bonus B/D:** Configurar cron (n8n o pg_cron) para bitácora mensual y resumen semanal | n8n workflows o pg_cron SQL | Bitácora se genera automáticamente último día del mes. Resumen semanal L y V. | P2 | 2h | Solo manual |
| 8.2 | **P8:** Vista de observabilidad en AdminDashboard | AdminDashboard.tsx | Tarjeta con: emails enviados/fallidos (últimas 24h), últimas 5 acciones de logs, Edge Functions invocadas | P8 | 3h | P8 parcial |
| 8.3 | Dry-run completo del demo script | — | Todos los módulos funcionan en la secuencia del video | P1 | 2h | Sorpresas el día de grabación |

**Total día 8: ~7h**

---

## DÍA 9 — Jueves 29 mayo: Ensayo + correcciones finales

**Objetivo:** Ensayo del video completo. Fix de última hora.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 9.1 | Ensayo completo del video siguiendo DEMO_SCRIPT.md | — | Recorrido de 25 min sin errores, con datos coherentes | — | 3h | Video desorganizado |
| 9.2 | Fix bugs encontrados en ensayo | Varios | Cada bug encontrado resuelto o workaround documentado | — | 4h | — |
| 9.3 | Deploy final a producción | — | Build limpio, deploy exitoso, URL accesible | P1 (C7) | 1h | — |

**Total día 9: ~8h**

---

## DÍA 10 — Viernes 30 mayo: GRABAR VIDEO

**Objetivo:** Video final de ≤25 min.

| # | Tarea | Archivos | Criterio hecho | Pilar | Est. | Riesgo si no |
|---|-------|----------|---------------|-------|------|-------------|
| 10.1 | Grabar video siguiendo DEMO_SCRIPT.md | — | Video de ≤25 min grabado | P1 | 3h | — |
| 10.2 | Revisar audio y calidad | — | Audio claro, sin cortes, volumen constante | — | 1h | — |
| 10.3 | Subir video + entrega | — | Entregado antes del deadline | — | 1h | — |

**Total día 10: ~5h**

---

## DÍA 11 — Sábado 31 mayo: BUFFER

Solo si algo sale mal en la grabación. No planificar trabajo nuevo.

---

## Resumen de horas por día

| Día | Fecha | Foco | Horas |
|-----|-------|------|-------|
| 1 | 21 mayo (mié) | Verificación + dump schema | 8h |
| 2 | 22 mayo (jue) | Bugs críticos + bucket privado + signed URLs | 8h |
| 3 | 23 mayo (vie) | Criterios 2, 3, 4 + RLS fase 1 | 10.5h* |
| 4 | 24 mayo (sáb) | Recs última milla + C1 | 7.5h |
| 5 | 25 mayo (dom) | RLS fase 2 + P6 + P7 + role guards | 8.5h |
| 6 | 26 mayo (lun) | C1 completo + P10 | 7.5h |
| 7 | 27 mayo (mar) | SOP + datos demo + usuario cliente + backups | 8.5h |
| 8 | 28 mayo (mié) | Bonus + P8 | 7h |
| 9 | 29 mayo (jue) | Ensayo + fixes | 8h |
| 10 | 30 mayo (vie) | GRABAR VIDEO | 5h |
| 11 | 31 mayo (sáb) | Buffer | 0h |

*\*Día 3 puede bajar a 7.5h si process-exam-pdf funciona bien. Si no, mover RLS fase 1 parcialmente al día 5.*

**Total: ~78.5h (con buffer de 8h incluido)**

---

## Lo que NO se hace en estos 10 días

- ❌ Migración de n8n Gmail → Outlook (Resend ya es neutral)
- ❌ Outbox pattern completo (solo ON CONFLICT)
- ❌ Materialized views (query directo es suficiente para 3 empresas demo)
- ❌ Magic links de onboarding (fuera de scope mínimo)
- ❌ Firma electrónica real (DocuSign/FirmaVirtual)
- ❌ Integración Fireflies para transcripción de videollamadas
- ❌ Whisper local (Whisper API es suficiente)
- ❌ React Query en todas las páginas (solo donde ya está)
- ❌ Test suite (no hay tests y no vale la pena para el concurso)
- ❌ Migrar cálculo de cumplimiento a función Postgres (patrón C1/C2 de EFICIENCIAS). **Razón:** el cálculo frontend (`Compliance.tsx:128-148` via `useMemo`) funciona correctamente — itera `estandares_0312`, suma `peso_porcentual` por ciclo PHVA, y persiste en `cumplimiento_empresa` via `handleSave`. No es hardcoded. No justifica reescribir como función DB en 10 días. Documentar como deuda técnica para escalar a 90+ empresas (recálculo automático por trigger al cambiar evidencias).
- ❌ Crear triggers DB automáticos (cero funciones/triggers verificado en Dashboard). Mantener lógica en código para esta entrega.
- ❌ OCR dedicado (Claude Vision cubre el 100%)
