# Reporte Batch D — Hardening Final

**Fecha:** 2026-05-21  
**Build:** exitoso (`npm run build`)

---

## Tareas completadas

| # | Tarea | Commit | Estado |
|---|-------|--------|--------|
| T50 | Idempotencia PILA + Documents | `be6253a` | Completado |
| T51 | documentsService refactor | `4798980` | Completado |
| T52 | PageHeader consistencia | — (sin cambios) | Verificado: todas las paginas ya usan PageHeader |
| T53 | Limpiar console.logs | `0603e36` | Completado |
| T54 | syncPeriods pg_cron | `3fad79f` | Completado (DRAFT) |
| T55 | Emergency Plans bug fix | `dcb8094` | Completado |

---

## Detalle por tarea

### T50 — Idempotencia

- **UploadPila.tsx:** check-then-update existente + reset `intentos_notificacion: 0` al re-subir
- **Documents.tsx:** pre-insert check por empresa+tipo+nombre; actualiza existente en lugar de duplicar
- **Migration 009:** UNIQUE constraint `(empresa_id, periodo)` en pila_records (DRAFT)

### T51 — documentsService refactor

- Nuevo `documentsService` en `services/index.ts` con 5 metodos: `list`, `upload`, `validate`, `approve`, `delete`
- `upload` retorna `{ updated: boolean }` para diferenciar toast en UI
- `Documents.tsx` refactorizado: eliminadas todas las llamadas directas a `supabase.from("documentos")`
- Carga de empresas via `empresasService.list()` en lugar de query directa
- Logging centralizado en el service (ya no se importa `logsService` en Documents.tsx)
- Eliminado import no utilizado (`Download` de lucide-react)

### T52 — PageHeader consistencia

- Auditoria de todas las paginas: todas ya usan `<PageHeader>` correctamente
- Sin cambios necesarios

### T53 — Limpiar console.logs

- Eliminados `console.log` y `console.error` de desarrollo en multiples archivos
- Conservados los de Edge Functions (Deno) y manejo de errores criticos

### T54 — syncPeriods automatico

- **Migration 010:** Funcion `sync_pila_periods()` + cron job diario (07:00 UTC)
- Inserta registros PILA del mes actual para todas las empresas activas
- Marca vencidos automaticamente si pasa el dia de solicitud
- Lee `pila_dia_solicitud` de `configuracion_sistema`
- Usa `ON CONFLICT DO NOTHING` (requiere migration 009 aplicada primero)
- Logging automatico en `logs_actividad`

### T55 — Emergency Plans bug fix

- Corregido `getExportHeaderHTML` (usaba firma incorrecta)
- Timeout 90s en transcripcion via `Promise.race`
- Validacion tamano archivo (25MB max)
- Guard en respuesta null/vacia del servidor
- Type-check en `analysis` antes de renderizar
- Guard en export cuando no hay analisis

---

## Migrations DRAFT pendientes de aplicar

| Archivo | Descripcion | Dependencias |
|---------|-------------|--------------|
| `007_add_config_keys_DRAFT.sql` | email_remitente + equipos_dias_aviso_vencimiento en configuracion_sistema | Ninguna |
| `008_add_logo_empresas_DRAFT.sql` | Campo logo_url en empresas_cliente | Ninguna |
| `009_pila_unique_constraint_DRAFT.sql` | UNIQUE(empresa_id, periodo) en pila_records | Limpiar duplicados primero |
| `010_pg_cron_sync_periods_DRAFT.sql` | Funcion sync_pila_periods + cron job diario | 009 (UNIQUE constraint) + pg_cron extension |

**Para aplicar:** Ejecutar en orden 007 → 008 → 009 → 010 en el SQL Editor de Supabase Dashboard.

---

## Resumen de cambios Batch D

- **6 tareas** planificadas, **6 completadas** (1 sin cambios necesarios)
- **4 commits** de codigo + **1 migration DRAFT**
- **0 breaking changes** — build exitoso
- Patron de servicio reforzado: Documents.tsx ya no tiene queries directas
- Automatizacion PILA: sincronizacion diaria sin intervencion manual
