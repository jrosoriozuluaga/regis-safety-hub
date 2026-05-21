# Reporte Batch B — 2026-05-21

## T41: Matrices de riesgo editables inline (CRÍTICO — Criterio C3)

### Resultado: COMPLETADO

**Archivos modificados:**

| Archivo | Cambio |
|---------|--------|
| `src/pages/RiskMatrices.tsx` | Reescritura completa (~400 líneas) con edición inline |
| `src/services/index.ts` | +3 funciones: `updateRiesgo`, `insertRiesgo`, `deleteRiesgo` |

**Funcionalidades añadidas:**
- Edición inline por fila con botón lápiz (hover)
- Dropdowns GTC 45: ND (0/2/6/10), NE (1/2/3/4), NC (10/25/60/100)
- Cálculo automático: NP = ND × NE, NR = NP × NC
- Interpretación automática: I (≥600), II (150-599), III (40-149), IV (<40)
- Aceptabilidad automática: No Aceptable / Aceptable con Control / Mejorable / Aceptable
- Badge con colores por nivel de riesgo (rojo/naranja/amarillo/verde)
- Botón "Agregar riesgo" con fila editable al inicio de la tabla
- Eliminación de riesgo con confirmación
- Campos editables: proceso, peligro, descripción_riesgo, fuente, efectos, controles_existentes, ND, NE, NC, medidas_intervencion

**Commit:** `45959ee` — `feat(c3): matrices riesgo editables inline + agregar riesgo — Criterio 3 cerrado`

---

## T42: PILA validations + Medical Exam UX

### Resultado: COMPLETADO (3/3)

| # | Fix | Archivo | Detalle |
|---|-----|---------|---------|
| 1 | PILA upload validation | UploadPila.tsx | Validación tipo archivo (.pdf/.xlsx/.xls/.zip) + límite 25MB |
| 2 | Extraction warning | MedicalExams.tsx | Warning cuando IA no identifica datos del trabajador (concepto puede ser "Apto" por defecto) |
| 3 | Ver PDF button | MedicalExams.tsx | Botón "Ver PDF" por fila cuando `archivo_url` existe, abre en nueva pestaña |

**Nota sobre Fix 2:** El Edge Function `process-exam-pdf` tiene `let concepto = "apto"` como default (línea 184). No se puede modificar (regla de seguridad). El fix es en frontend: se muestra warning toast de 8 segundos cuando la extracción no pudo identificar nombre ni cédula del trabajador.

**Commit:** `1f29c6b` — `fix(ux): PILA upload validation + medical exam extraction warning + Ver PDF`

---

## T43: Documentación (6 documentos)

### Resultado: COMPLETADO (6/6)

| # | Tarea | Archivo | Descripción |
|---|-------|---------|-------------|
| T32 | Demo script final | `docs/DEMO_SCRIPT_FINAL.md` | Script narrado actualizado (25 min) con todas las features recientes |
| T33 | Executive summary | `docs/EXECUTIVE_SUMMARY.md` | One-pager para jurado: diferenciadores, stack, escala, seguridad |
| T34 | README profesional | `README.md` | Reescritura completa con arquitectura, quick start, módulos, AI |
| T35 | Hardcoded strings audit | `docs/HARDCODED_STRINGS_AUDIT.md` | 33 strings encontrados: 6 alto, 14 medio, 13 bajo riesgo |
| T36 | Submission guide | `docs/SUBMISSION_GUIDE.md` | Guía paso a paso para envío del concurso |
| T37 | Compliance summary | `docs/COMPLIANCE_EXECUTIVE_SUMMARY.md` | Mapeo Resolución 0312/2019 por estándar y módulo |

**Commit:** `4787c02` — `docs: Batch B documentation — 6 docs (T32-T37)`

---

## Build final

```
npm run build → exitoso en 2.02s
0 errores, 0 warnings (excepto chunk size warning esperado para xlsx)
```

---

## Resumen

| Tarea | Estado | Commit | Prioridad |
|-------|--------|--------|-----------|
| T41: Matrices editables (C3) | ✅ COMPLETADO | `45959ee` | CRÍTICO |
| T42: PILA + Medical UX | ✅ COMPLETADO | `1f29c6b` | Alta |
| T43: Documentación (6 docs) | ✅ COMPLETADO | `4787c02` | Media |

**Batch B: 3/3 tareas completadas, 3 commits atómicos, build limpio.**
