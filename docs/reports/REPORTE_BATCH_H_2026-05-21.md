# Reporte Batch H — Diferenciadores finales

**Fecha:** 2026-05-21
**Build:** exitoso (`npm run build`)

---

## Tareas completadas

| # | Tarea | Commit | Estado |
|---|-------|--------|--------|
| T69 | Fireflies + Whisper → acta automática (Bonus E) | `c45f20f` | Completado |
| T70 | Escalación PILA → RRHH | `4bc6c50` | Completado |
| T71 | Matriz aprobada ARL | `486c7bd` | Completado |
| T72 | Tipo reunión "Seguimiento" | `a2394e9` | Completado |
| T73 | Favicon + strings español | `24b36a5` | Completado |

---

## Detalle por tarea

### T69 — Acta desde reunión: Fireflies (virtual) + Whisper (presencial) ⭐

**Nueva Edge Function:** `fetch-fireflies-transcripts`
- Action "list": lista reuniones recientes vía Fireflies GraphQL API
- Action "get": transcripción completa con speaker diarization (hablantes identificados)
- Error claro si FIREFLIES_API_KEY no está configurado

**generate-acta actualizado:**
- Nuevo parámetro opcional `transcripcion`
- Prompt diferenciado: atribuye intervenciones a hablantes, genera acta formal
- Soporte para reuniones de seguimiento (sin quórum formal)
- Mantiene patrón Haiku-first fallback (P3)

**Committees.tsx — UI con tabs:**
- Tab "Crear acta manual": flujo original intacto
- Tab "Desde reunión":
  - Fireflies: conectar → seleccionar reunión → preview con hablantes → generar acta
  - Audio: subir grabación → transcribir con Whisper → textarea editable → generar acta

### T70 — Escalación PILA → líder RRHH

- Cuando `intentos > maxRecordatorios`: envío va a `email_contacto` (RRHH) en vez de `email_contacto_pila`
- Payload incluye `cargo_contacto` para personalizar email de escalación
- Badges mejorados: amarillo (1 recordatorio), naranja (2), rojo "Escalado RRHH" (>max)
- Toast diferenciado muestra cargo del líder RRHH

### T71 — Subir matriz aprobada por ARL

- Sección "Aprobación ARL" en detalle de matriz de riesgos
- Upload PDF/Excel a Storage → update `matrices_riesgo` con URL, flag, fecha
- Badge verde "ARL" en lista de matrices cuando aprobada
- Link "Ver documento" para archivo aprobado
- Type `MatrizRiesgo` actualizado con 3 campos nuevos

### T72 — Tipo reunión "Seguimiento"

- Nueva opción en selector: Ordinaria / Extraordinaria / Seguimiento
- Seguimiento no requiere validación de quórum
- Panel asistencia muestra "sin quórum requerido" en azul
- Badge "Seguimiento" en historial de actas
- Prompt de generate-acta incluye "Estado de compromisos anteriores"

### T73 — Favicon + strings español

- Settings: "Error" → "Error al guardar"
- Favicon personalizado ya existente (256x256)
- index.html ya en español con meta tags correctos (Batch G)
- Revisión completa: no hay strings en inglés visibles al usuario

---

## Edge Functions nuevas

| Función | Descripción | Auth |
|---------|-------------|------|
| `fetch-fireflies-transcripts` | Importar transcripciones de Fireflies.ai | no-jwt |

## Edge Functions modificadas

| Función | Cambio |
|---------|--------|
| `generate-acta` | Parámetro `transcripcion` opcional + prompt diferenciado |

## Migrations DRAFT generadas

| Archivo | Descripción |
|---------|-------------|
| `010_pg_cron_sync_periods_DRAFT.sql` | pg_cron sync PILA (Batch D) |
| `011_api_cost_log_DRAFT.sql` | Tabla costos API (Batch F) |
| `012_asistencia_digital_policies_DRAFT.sql` | RLS anon para asistencia comité (Batch G) |
| `013_matriz_arl_aprobacion_DRAFT.sql` | Columnas ARL en matrices_riesgo (Batch H) |

---

## Pilares/Bonus cubiertos en este batch

| Pilar/Bonus | Estado | Evidencia |
|-------------|--------|-----------|
| Bonus E — Transcripción reuniones | ✅ | Fireflies (diarización) + Whisper (audio) → acta |
| C1 — Escalación PILA | ✅ | Envío a RRHH después de max recordatorios |
| C3 — Matriz ARL | ✅ | Upload aprobación ARL + evidencia compliance |
| C4 — Seguimiento | ✅ | Tipo reunión sin quórum + prompt adaptado |
| UX — Polish | ✅ | Strings español, favicon |
