# Reporte Batch G — Últimos gaps: Asistencia + Compliance + Polish + Bonus C

**Fecha:** 2026-05-21
**Build:** exitoso (`npm run build`)

---

## Tareas completadas

| # | Tarea | Commit | Estado |
|---|-------|--------|--------|
| T65 | Link asistencia digital comité (C4) | `9e9e31e` | Completado |
| T66 | Compliance 7 vs 21 estándares (C6) | `e277ed3` | Completado |
| T67 | Recordatorio firma actas (Bonus C) | `96bc707` | Completado |
| T68 | Polish final video | `b98d5fc` | Completado |

---

## Detalle por tarea

### T65 — Link de asistencia digital para comités (CRITERIO 4 — GAP CRÍTICO)

Nueva página pública `/asistencia-comite?t={token}` para confirmar asistencia sin login:
- **Token base64:** contiene comite_id, acta_id, fecha, empresa, tipo, lugar, hora, expiración
- **UI mobile-friendly:** logo Regis, datos de la reunión, lista de integrantes con botón "Confirmar"
- **UPSERT:** en `asistencia_comite` al confirmar presencia
- **Aviso privacidad Ley 1581** al pie
- **Committees.tsx:** botón "Generar link para última acta" con copia al portapapeles
- **Fix:** `comitesService.listActas` → `comitesService.actas` (método correcto)

Archivos: `src/pages/AsistenciaComite.tsx`, `src/pages/Committees.tsx`, `src/App.tsx`, migration 012

### T66 — Verificar compliance engine 7 vs 21 estándares

El motor YA filtraba por `aplica_cap1`/`aplica_cap2` usando `filteredEstandares`. Mejoras:
- Normalización de `capitulo_0312` (String + strip prefix "capitulo_")
- Fix: clientes sin array `empresas` ahora cargan `capitulo_0312` vía `empresasService.getById`
- Porcentaje se calcula solo sobre estándares del capítulo correcto (no 60)

### T67 — Recordatorio firma y archivo de actas (Bonus C)

- **Badge "Vencida"** rojo si acta sin firma > 7 días desde la reunión
- **Botón "Recordar"** registra recordatorio en `logs_actividad` con días pendiente
- Complementa flujo existente de firmar/archivar

### T68 — Polish final para video

- `index.html`: `lang="es"`, título "Regis Colombia — Plataforma SG-SST"
- Removidas referencias a Lovable (OG images, URLs)
- Removidos comentarios TODO del HTML
- Badges "Error" → "Error en datos" (español) en Workers y Companies
- Favicon: ya existía (256x256 custom)
- Loading states: cubiertos por Suspense + PageLoader en App.tsx

---

## Migrations DRAFT generadas

| Archivo | Descripción | Dependencias |
|---------|-------------|--------------|
| `010_pg_cron_sync_periods_DRAFT.sql` | pg_cron sync PILA (Batch D) | 009 + pg_cron |
| `011_api_cost_log_DRAFT.sql` | Tabla costos API (Batch F) | Ninguna |
| `012_asistencia_digital_policies_DRAFT.sql` | RLS anon para asistencia comité | Ninguna |

---

## Criterios del brief cubiertos en este batch

| Criterio | Estado | Evidencia |
|----------|--------|-----------|
| C4 — Link asistencia digital | ✅ | Página pública + token + botón en Committees |
| C6 — 7 y 21 estándares | ✅ | Filtro por capitulo_0312 verificado y mejorado |
| Bonus C — Recordatorio firma actas | ✅ | Badge vencida + botón recordar + log |
| UX — Polish video | ✅ | Idioma, meta tags, favicon |
