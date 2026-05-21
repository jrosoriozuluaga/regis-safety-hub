# Reporte Batch F — Observabilidad + Costos + Privacidad + Bonus

**Fecha:** 2026-05-21
**Build:** exitoso (`npm run build`)

---

## Tareas completadas

| # | Tarea | Commit | Estado |
|---|-------|--------|--------|
| T60 | Dashboard observabilidad (P8) | `4005632` | Completado |
| T61 | Fallback modelos baratos (P3) | `7ab25e6` | Completado |
| T62 | Logging costos API (P3) | `450d80e` | Completado |
| T63 | Aviso privacidad Ley 1581 (P5) | `f9a75e4` | Completado |
| T64 | Bonus bitacora + resumen semanal | `9e69fdb` | Completado |

---

## Detalle por tarea

### T60 — Dashboard de Observabilidad (P8)

Nueva pagina `/observabilidad` (admin-only) con 5 secciones:
- **Actividad reciente:** acciones 24h y 30d, breakdown por modulo con barras CSS
- **Estado PILA y documentos:** badges por estado (pendiente, cargada, validado, etc.)
- **Menor cumplimiento:** top 3 empresas con menor % de cumplimiento 0312
- **Costo estimado IA:** desglose por modulo con costo unitario y total del mes
- **Ultimas 10 acciones:** tabla compacta con usuario, modulo, descripcion, fecha

Archivos: `src/pages/Observability.tsx`, `src/App.tsx`, `src/components/layout/AppSidebar.tsx`

### T61 — Fallback modelos baratos (P3)

Invierte la cascade en las 3 Edge Functions: Haiku primero (~70% mas barato), escala a Sonnet solo si calidad insuficiente:
- **process-exam-pdf:** escala si `confianza_extraccion` es baja o media
- **generate-acta:** escala si acta generada < 500 caracteres
- **transcribe-audio:** escala si analisis no tiene amenazas identificadas

Agrega a todas las respuestas: `modelo_usado`, `costo_estimado_usd`, `tiempo_procesamiento_ms`

### T62 — Logging costos API

- **Migration 011 (DRAFT):** tabla `api_cost_log` con funcion, modelo, costo, tiempo, empresa_id
- Cada Edge Function inserta un registro despues de cada llamada a API paga
- Dashboard de observabilidad lee `api_cost_log` si existe, fallback a estimacion desde `logs_actividad`

### T63 — Aviso de privacidad Ley 1581

Agrega aviso de tratamiento de datos personales en UploadPila.tsx conforme a la Ley 1581 de 2012. Texto informativo no bloqueante con icono de candado.

### T64 — Bonus: bitacora + resumen semanal

2 nuevas Edge Functions funcionales:
- **generate-bitacora:** informe mensual por empresa con Claude Haiku + email via Resend
- **weekly-summary:** resumen semanal con stats de PILA/docs/examenes/equipos pendientes

Ambas ya llamadas desde AdminDashboard. Documentacion en `docs/operations/BONUS_FEATURES.md`.

---

## Migrations DRAFT generadas

| Archivo | Descripcion | Dependencias |
|---------|-------------|--------------|
| `010_pg_cron_sync_periods_DRAFT.sql` | pg_cron sync PILA (Batch D) | 009 + pg_cron |
| `011_api_cost_log_DRAFT.sql` | Tabla costos API | Ninguna |

---

## Pilares del brief cubiertos en este batch

| Pilar | Estado | Evidencia |
|-------|--------|-----------|
| P3 — Eficiencia costos IA | ✅ | Haiku-first fallback + cost logging + dashboard |
| P5 — Privacidad | ✅ | Aviso Ley 1581 en pagina publica |
| P8 — Observabilidad | ✅ | Dashboard completo con 5 secciones |
| Bonus B — Bitacora | ✅ | Edge Function funcional |
| Bonus D — Resumen semanal | ✅ | Edge Function funcional |
