# Reporte Bugfix Batch 2 — 2026-05-21

## Resumen

8 bugs corregidos en 8 commits atomicos + 1 hallazgo del audit automatico.
Build exitoso tras cada commit.

## Bugs Corregidos

| # | Bug | Commit | Archivos |
|---|-----|--------|----------|
| BUG-14 | exportHeader crash con params undefined | `7022070` | lib/exportHeader.ts |
| BUG-13 | Cumplimiento imprimir about:blank | `fcf6253` | pages/Compliance.tsx |
| BUG-12 | Dashboard barras flotantes + colores iguales | `5f07771` | components/dashboard/AdminDashboard.tsx |
| BUG-18 | PILA sync "0 periodos creados" confuso | `74eb5c7` | pages/Pila.tsx |
| BUG-15 | PILA validar/aprobar sin contexto en toast | `74eb5c7` | pages/Pila.tsx |
| BUG-16 | Copy "Reunion presencial" → "Grabacion de reunion" | `50bd144` | pages/Committees.tsx |
| BUG-17 | Normatividad editable en Configuracion | `98f7c0b` | pages/Settings.tsx |
| T-REVIEW | Null guards en MedicalExams | `99db84e` | pages/MedicalExams.tsx |

## Detalle Tecnico

### BUG-14: exportHeader defensive
- **Problema:** `generateDocCode()` llamaba `.toUpperCase()` en `module` que podia ser undefined
- **Fix:** Envuelve con `String(module || "DOC")`. Tambien `empresaNombre` y `empresaNit` tienen fallback a string vacio

### BUG-13: Cumplimiento imprimir
- **Problema:** Llamada a `getExportHeaderHTML()` usaba propiedades incorrectas: `logoSrc`, `module`, `nit` en vez de `title`, `moduleCode`, `empresaNit`
- **Fix:** Corregidos nombres de propiedades. Agregado `<style>` tag faltante para `getExportStyles()`

### BUG-12: Dashboard barras + colores
- **Problema:** Barras usaban `marginTop` para posicionar, causando que floten. Colores eran condicionales (verde/amarillo/rojo por score), no por empresa
- **Fix:** `position: absolute; bottom: 0` para que crezcan desde abajo. Colores indexados por empresa: azul, verde, naranja, violeta, rojo, cyan

### BUG-18 + BUG-15: PILA sync y estado
- **Problema:** Mensaje "0 periodos creados, X vencidos" confunde. Toasts de validar/aprobar no indican cual periodo
- **Fix:** 3 mensajes contextuales segun resultado de sync. Toasts incluyen periodo: "Planilla 2026-03 aprobada"

### BUG-16: Copy comites
- **Problema:** Tab decia "Reunion presencial (audio)" — excluye reuniones virtuales grabadas
- **Fix:** Cambiado a "Grabacion de reunion"

### BUG-17: Normatividad readonly
- **Problema:** Campo `resolucion_vigente` era editable — no deberia serlo
- **Fix:** Set READONLY_KEYS, input disabled + readOnly, mensaje explicativo, boton de guardar oculto

## T-REVIEW: Audit Automatico

### Analisis ejecutados:
1. **Null/undefined sin verificacion:** 30 resultados revisados — 2 bugs reales (MedicalExams), resto tiene guards
2. **console.log:** 0 encontrados (limpio)
3. **Strings en ingles:** 0 visibles al usuario (todos los mensajes en espanol)
4. **Hardcoded URLs:** 0 (solo xmlns SVG — falso positivo)
5. **TODO/FIXME:** 15 en ConsultantOnboardingWizard (wizard stub, no user-facing)
6. **console.error:** 12 en catch blocks — intencionales, no bugs
7. **Unused imports:** 0 (tsc limpio)

### Hallazgos corregidos:
- `ex.tipo_examen.replace()` y `ex.concepto_aptitud.replace()` en MedicalExams.tsx sin null guard → agregado fallback

### Sin accion requerida:
- `a.nivel_riesgo_global.toUpperCase()` en EmergencyPlans — ya tiene guard `if (a?.nivel_riesgo_global)`
- TODOs en wizard stubs — no visibles en demo
- console.error en catch blocks — utiles para debug

## Build Final

```
✓ built in 2.01s — 0 errores TypeScript, 0 errores Vite
```
