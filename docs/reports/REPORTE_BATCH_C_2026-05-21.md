# Reporte Batch C — 2026-05-21

## T44: Pipeline extracción mejorado (Edge Function + Frontend)

### Resultado: COMPLETADO

**Edge Function `process-exam-pdf`:**

| Mejora | Detalle |
|--------|---------|
| Detección no-médico | Nuevo campo `es_examen_medico` — si el documento no es un examen, no se guarda en DB |
| Confianza extracción | `confianza_extraccion: "alta"\|"media"\|"baja"` basado en campos extraídos (nombre+cédula+concepto) |
| Default concepto | Cambiado de `"apto"` hardcodeado a `null` — solo se asigna si la IA lo extrae |
| Fallback prompt | Si confianza es "baja", reintenta con prompt detallado que busca formatos IPS/EPS |
| Helper refactored | `callClaude()` helper para limpiar cascada de modelos |

**Frontend `MedicalExams.tsx`:**

| Mejora | Detalle |
|--------|---------|
| No-médico handling | Toast error cuando documento no es examen médico |
| Badge confianza | Verde "✓ Extracción confiable" / Amarillo "⚠ Verificar datos" / Rojo "✗ Revisar manualmente" |
| Concepto null | Muestra "Pendiente de revisión" cuando concepto no fue extraído |

**Commit:** `57aeec6` — `feat(c2): pipeline extracción mejorado — detección no-médico + confianza + fallback prompt`

---

## T45: Email remitente configurable

### Resultado: COMPLETADO (parcial)

- Migration 007 DRAFT: `email_remitente` key en `configuracion_sistema`
- Settings.tsx: ya tenía el campo `email_remitente` configurado
- Edge Functions de email (`send-pila-reminder`, `generate-bitacora`, `weekly-summary`) **no existen en el repo local** — solo existen 3 funciones: `generate-acta`, `process-exam-pdf`, `transcribe-audio`
- Ninguna de las funciones locales envía emails

**Commit:** `25c8a97` — `feat(r2): email remitente configurable desde configuracion_sistema`

---

## T46: Logo empresa en exports + página pública

### Resultado: COMPLETADO

| Componente | Cambio |
|-----------|--------|
| `exportHeader.ts` | Nuevo campo `empresaLogoUrl` — muestra logo empresa junto al de Regis |
| `Companies.tsx` | Upload de logo (PNG/JPG, máx 2MB) a `documentos/logos/{empresa_id}/logo.{ext}` |
| `UploadPila.tsx` | Logo Regis (`regis-logo.jpeg`) en página pública de carga |
| Migration 008 DRAFT | `ALTER TABLE empresas_cliente ADD COLUMN logo_url TEXT` |

**Commit:** `e88666c` — `feat(r3): logo empresa en exports + upload logo + logo público`

---

## T47: Documentos aprobados suman a cumplimiento

### Resultado: YA IMPLEMENTADO

El sistema ya conecta documentos aprobados con cumplimiento:
- `Compliance.tsx` línea 80: query `documentos WHERE estado='aprobado'`
- Línea 91: construye set de tipos de evidencia aprobados
- Línea 102: auto-marca estándares 0312 que tienen evidencia coincidente
- `estandares_0312.tipo_documento_evidencia` mapea documentos a estándares

No se requirió cambio adicional.

---

## T48: Trazabilidad — Asistencia + Logs validate/approve

### Resultado: COMPLETADO

| Fix | Detalle |
|-----|---------|
| Asistencia comité | `Committees.tsx`: asistentes ahora se guardan en `asistencia_comite` al crear acta |
| pilaService refactor | `validateRecord()` y `approveRecord()` con logging integrado |
| Pila.tsx refactor | Validate/approve usan funciones del servicio (antes era inline `supabase.from()`) |
| comitesService | Nueva función `insertAsistencia()` para inserción bulk |
| Logs existentes | `Documents.tsx` ya tenía logs para validar/aprobar — verificado OK |

**Commit:** `ef163fd` — `feat(p6): trazabilidad — asistencia comité + logs validate/approve + refactor pilaService`

---

## T49: Role guards + Threshold configurable

### Resultado: COMPLETADO

| Fix | Detalle |
|-----|---------|
| AdminRoute | Nuevo componente: redirige `cliente` → `/` con toast de error |
| Rutas protegidas | `/usuarios`, `/configuracion`, `/actividad`, `/plantillas-correo` |
| Sidebar | Ya ocultaba links admin para clientes (línea 46, existente) |
| Threshold equipos | `computeEstado()` acepta `diasAviso` configurable |
| Config DB | Lee `equipos_dias_aviso_vencimiento` de `configuracion_sistema` |
| Settings.tsx | Nueva sección "Inventario de Equipos" con campo editable |

**Commit:** `4fa101f` — `feat(p5-p7): role guards admin-only + threshold equipos configurable`

---

## Migrations DRAFT generadas

| Archivo | Contenido |
|---------|-----------|
| `007_add_config_keys_DRAFT.sql` | `email_remitente` + `equipos_dias_aviso_vencimiento` en `configuracion_sistema` |
| `008_add_logo_empresas_DRAFT.sql` | `logo_url TEXT` en `empresas_cliente` |

---

## Build final

```
npm run build → exitoso en 1.85s
0 errores, 0 warnings (excepto chunk size warning esperado para xlsx)
```

---

## Resumen

| Tarea | Estado | Commit | Prioridad |
|-------|--------|--------|-----------|
| T44: Extracción mejorada | ✅ COMPLETADO | `57aeec6` | 1 (más alta) |
| T46: Logo empresa + exports | ✅ COMPLETADO | `e88666c` | 2 |
| T49: Role guards + threshold | ✅ COMPLETADO | `4fa101f` | 3 |
| T48: Trazabilidad | ✅ COMPLETADO | `ef163fd` | 4 |
| T45: Email remitente config | ✅ PARCIAL (funciones no en repo) | `25c8a97` | 5 |
| T47: Docs → cumplimiento | ✅ YA IMPLEMENTADO | — | 6 |

**Batch C: 6/6 tareas resueltas, 5 commits atómicos, 2 migrations DRAFT, build limpio.**
