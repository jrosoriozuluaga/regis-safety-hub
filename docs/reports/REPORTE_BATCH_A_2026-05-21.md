# Reporte Batch A — 2026-05-21

## T38: Performance — Recharts removal + xlsx lazy load

### Resultado: COMPLETADO

**Recharts:**
- `recharts` (56 paquetes) eliminado de `package.json`
- Solo se usaba en `src/components/ui/chart.tsx` (wrapper shadcn), nunca importado por ninguna pagina
- `chart.tsx` eliminado del proyecto

**xlsx lazy load:**
- `Workers.tsx`: import estatico convertido a `await import("xlsx")` en 2 funciones (downloadTemplate, reader.onload)
- `Companies.tsx`: import estatico convertido a `await import("xlsx")` en 2 funciones (downloadTemplate, reader.onload)
- xlsx (429KB) ahora solo se carga cuando el usuario interactua con importacion masiva

**Bundle sizes:**

| Chunk | Antes | Despues | Delta |
|-------|-------|---------|-------|
| index (main) | 740.41 KB | 740.43 KB | +0.02 KB (tree-shaking ya excluia recharts) |
| xlsx | 444.95 KB | 429.35 KB (lazy) | -15.6 KB + ya no en critical path |
| node_modules | 533 paquetes | 477 paquetes | -56 paquetes |

**Commit:** `ed070fe` — `perf: remove recharts + lazy load xlsx (bundle optimization)`

---

## T39: Top 5 UX fixes del UX Review

### Resultado: COMPLETADO (5/5)

| # | Fix | Archivo | Detalle |
|---|-----|---------|---------|
| 1 | Tildes en Settings PageHeader | Settings.tsx | "Configuracion" → "Configuración", "Parametros" → "Parámetros" |
| 2 | Migrar toast system | EmailTemplates.tsx | useToast → sonner (consistencia con las otras 21 paginas) |
| 3 | Estandarizar header Calendar | Calendar.tsx | h1 custom → PageHeader con actions (selector empresa) |
| 4 | Estandarizar header CompanyReport | CompanyReport.tsx | h1 custom → PageHeader con actions (selector + boton imprimir) |
| 5 | Tildes en MedicalExams | MedicalExams.tsx | "Examenes" → "Exámenes", "cedula" → "cédula", "busqueda" → "búsqueda" |

**Excluidos (ya aplicados antes):**
- NotFound.tsx ya traducido a espanol
- Calendar.tsx font 9px ya cambiado a text-xs
- Meta tags ya cambiados de Lovable a Regis

**Commit:** `78824c0` — `fix(ux): aplicar top 5 recomendaciones UX review`

---

## T40: Fix T2 (CHECK constraint) + Fix T3 (queries actas_comite)

### T2: CHECK constraint documentos.estado — NO APLICA

El constraint `documentos_estado_check` ya incluye todos los estados necesarios:
`'pendiente', 'solicitado', 'recibido', 'cargado', 'validado', 'aprobado', 'vigente', 'procesado', 'archivado', 'vencido'`

El bug reportado no existe. No se requiere migracion 007.

### T3: Queries actas_comite — CORREGIDO

**Problema:** `actas_comite` no tiene columna `empresa_id` directa. Las queries usaban `.eq("empresa_id", X)` que fallaba silenciosamente (retornaba 0 resultados).

**Archivos corregidos:**

| Archivo | Linea | Antes | Despues |
|---------|-------|-------|---------|
| Compliance.tsx | 84-85 | `.eq("empresa_id", X)` | `.eq("comites.empresa_id", X)` con `comites!inner(tipo, empresa_id)` |
| CompanyReport.tsx | 102 | `.eq("empresa_id", X)` | `.eq("comites.empresa_id", X)` con `comites!inner(empresa_id)` |

**Calendar.tsx:** Ya usa JOIN correcto con select anidado, no requiere cambio.

**Commit:** `630ead1` — `fix(queries): corregir queries actas_comite sin empresa_id directa`

---

## Build final

```
npm run build → exitoso en 1.97s
0 errores, 0 warnings (excepto chunk size warning esperado para xlsx)
```

---

## Resumen

| Tarea | Estado | Commits |
|-------|--------|---------|
| T38: recharts + xlsx | COMPLETADO | ed070fe |
| T39: Top 5 UX | COMPLETADO | 78824c0 |
| T40-T2: CHECK documentos | NO APLICA (bug no existe) | — |
| T40-T3: queries actas_comite | COMPLETADO | 630ead1 |
| Migration 007 DRAFT | NO GENERADA (T2 no aplica) | — |
