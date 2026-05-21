# PLAN DE 10 DÍAS — Regis SG-SST

**Inicio:** martes 20 de mayo de 2026 (Día 1 real)  
**Entrega:** sábado 31 de mayo de 2026 (video) — buffer 30 mayo  
**Grabación video:** viernes 30 de mayo  
**Horas disponibles estimadas:** ~8h/día × 8 días de trabajo = 64h  

---

## 📌 CHANGELOG

### 2026-05-21 — Sesión Día 2 (en progreso)

**🔴 HITO MAYOR: Seguridad cerrada al 100%**
- **Migración 006 aplicada:** 22 tablas con tenant isolation RLS (94 policies)
  - Admin ve 40 trabajadores / 16 docs, Cliente ve 13 / 4 → aislamiento verificado
  - 3 helpers: `current_empresa_id()`, `is_regis_admin()`, `is_regis_staff()`
  - Commit `e7e42f4`
- **Migración 005 aplicada:** Bucket `documentos` privado + signed URLs
  - Frontend actualizado: `getPublicUrl` → `createSignedUrl` en 3 archivos
  - 8 políticas storage.objects (admin/consultor/cliente/anon)
  - Commit `59bd0e3`
- **Backup pre-RLS:** `backup_pre_rls_20260521_0958.sql` (43KB)

**Trabajo overnight (Claude Code, 27 tareas):**
- 29 documentos generados en `docs/`
- SOP/Manual completado (`docs/SOP_MANUAL_REGIS_SGSST.docx`) → Tarea 7.1 CERRADA
- Seed data DRAFT listo (`supabase/seed_data_DRAFT.sql`)
- Demo script DRAFT, video shot list, pitch deck content
- Análisis: UX review, performance audit, a11y audit, database review
- Diseños: onboarding wizard empresa/consultor
- Compliance: Habeas Data, Resolución 0312 checklist

**Tareas adelantadas de otros días:**
- ✅ 3.6 RLS Fase 1 (6 tablas) → SUPERADA por 006 (22 tablas completas)
- ✅ 5.1 RLS Fase 2 (tablas restantes) → ya cubierta por 006
- ✅ 5.2 logs_actividad append-only → cubierta por 006 (logs_delete solo admin)
- ✅ 5.8 Filtro empresa_id Calendar/CompanyReport → cubierto por RLS server-side
- ✅ 7.1 SOP/Manual → generado overnight

**Tareas nuevas identificadas:**
- 🆕 Resetear password admin@saborcriollo.com (para demo multi-tenant)
- 🆕 Limpiar documentos con URLs públicas rotas post-migración 005
- 🆕 Preparar vista cliente para demo (login Sabor Criollo, mostrar aislamiento)
- 🆕 Fix NotFound.tsx en español (detectado por UX review overnight)
- 🆕 Fix Calendar.tsx font 9px→14px (detectado por UX review overnight)
- 🆕 Fix meta tags Vercel "Lovable App" → "Regis Safety Hub"
- 🆕 Fix comillas generate-acta (cosmético)

**Horas ahorradas por adelanto:** ~12h (RLS Fase 1+2 + SOP + varios análisis)

### 2026-05-20 — Sesión Día 1
- **Día 1 cerrado al 100%** (11/11 tareas)
- **5 bugs arreglados** (ver docs/SESSION_LOG_2026-05-20.md)
- **~20h descubiertas como ya hechas** en archivos unstaged commiteados
- **5 tareas nuevas** agregadas a Días 3, 4 y 6
- **6 de 8 criterios del brief** funcionales

Ver detalle completo en: [docs/SESSION_LOG_2026-05-20.md](docs/SESSION_LOG_2026-05-20.md)

### Tareas marcadas como ✅ COMPLETADAS (ya no hacer):
- 1.1 a 1.11 (Día 1 completo)
- 2.1, 2.2, 2.3, 2.6, 2.8 (Día 2 parcial — de sesión Día 1)
- 2.4, 2.5 (Día 2 — sesión Día 2: bucket privado + signed URLs)
- 3.6 (RLS Fase 1 — superada por migración 006 completa)
- 4.1 R1 Documents (descubierta como hecha)
- 4.4 R4 Branded exports (descubierta como hecha via exportHeader.ts)
- 5.1 (RLS Fase 2 — cubierta por migración 006)
- 5.2 (logs append-only — cubierta por migración 006)
- 5.3 Logging audit (descubierta como hecha en 6 módulos)
- 5.8 (Filtro empresa_id — cubierto por RLS server-side)
- 7.1 (SOP/Manual — generado overnight)
- 7.1 Bonus Equipment Inventory (descubierta como hecha)

### Tareas marcadas como ⏭ DESCARTADAS:
- "Fix localhost bug en WhatsApp" — era falsa alarma, código correcto
- "Reconstruir Edge Functions stubs" — código real existe y funciona

---

## Estado de 8 Criterios del Brief (actualizado Día 2)

| # | Criterio | Estado | Evidencia |
|---|----------|--------|-----------|
| C1 | Automatización PILA | ✅ | End-to-end con WhatsApp real |
| C2 | Extracción IA exámenes | ✅ | 6/6 campos extraídos |
| C3 | Matriz riesgo CIIU | ⚠️ | Funcional, NO editable aún (Día 3) |
| C4 | Actas comité con quórum | ✅ | Validado con export PDF |
| C5 | Plan emergencias desde audio | ✅ | Transcripción + análisis |
| C6 | Dashboard cumplimiento | ✅ | Datos reales, 48% promedio |
| C7 | Producción 1+ empresa | ✅ | 3 empresas activas |
| C8 | SOP/Manual | ✅ | Generado overnight |

**7 de 8 criterios funcionales. Solo C3 (matrices editables) pendiente.**

---

## Priorización

| Prioridad | Qué cubre | Horas est. | Estado |
|-----------|-----------|------------|--------|
| P#1 | Bugs del happy path del video + seguridad crítica | 14h | ~80% cerrado |
| P#2 | 4 recomendaciones de última milla | 9h | 25% (R1, R4 hechas) |
| P#3 | Gaps de los 8 criterios ❌ o 🟡 | 18h | ~70% (solo C3 pendiente) |
| P#4 | Reglas duras del Q&A faltantes | 4h | 0% |
| P#5 | Pilares P5, P6, P7, P10 débiles | 8h | ~60% (RLS cerrado) |
| P#6 | SOP/Manual (criterio #8) | 4h | ✅ 100% |
| P#7 | 1-2 bonus si sobra tiempo | 3h | 0% |

---

## DÍA 1 — Martes 20 mayo: Verificación y bugs críticos ✅ COMPLETO

**Objetivo:** Confirmar qué funciona, qué está roto. Cero desarrollo nuevo.
**Estado: 11/11 tareas completadas.** Ver docs/SESSION_LOG_2026-05-20.md

---

## DÍA 2 — Miércoles 21 mayo: Seguridad + Quick wins + Performance

**Objetivo:** Cerrar seguridad al 100% + quick wins visibles + performance.

### Bloque 1A — RLS Migration ✅ COMPLETADO
| # | Tarea | Estado | Notas |
|---|-------|--------|-------|
| 2.4 | Bucket `documentos` → privado (migración 005) | ✅ | Commit `59bd0e3` |
| 2.5 | Signed URLs en frontend (3 archivos) | ✅ | Documents.tsx, UploadPila.tsx, services/index.ts |
| 2.NEW | Migración 006: RLS tenant isolation 22 tablas | ✅ | 94 policies, commit `e7e42f4` |
| 2.NEW | Backup pre-RLS | ✅ | 43KB dump |

### Bloque 2 — Quick wins (en progreso)
| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 2.7 | Remover test credentials Login.tsx | 15min | ⬜ |
| 2.NEW | Reset password admin@saborcriollo.com | 10min | ⬜ |
| 2.NEW | Fix NotFound.tsx → español | 10min | ⬜ |
| 2.NEW | Fix Calendar.tsx 9px → 14px | 15min | ⬜ |
| 2.NEW | Fix meta tags "Lovable App" → "Regis Safety Hub" | 10min | ⬜ |
| 2.NEW | Fix comillas generate-acta | 15min | ⬜ |
| 2.NEW | Limpiar documentos con URLs rotas | 5min | ⬜ |

### Bloque 3 — Performance + Setup demo
| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 2.1 | Verificar T2 (CHECK constraint documentos) → fix si existe | 30min | ⬜ |
| 2.3 | Verificar T3 (actas_comite queries) → fix si existe | 30min | ⬜ |
| 2.NEW | Remove recharts si no se usa (~450KB) | 10min | ⬜ |
| 2.NEW | Lazy load xlsx con dynamic import (~900KB) | 20min | ⬜ |
| 2.NEW | Aplicar seed_data_DRAFT.sql | 15min | ⬜ |
| 2.NEW | Test flujo PILA con email real | 15min | ⬜ |

### Bloque 4 — UX polish
| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 2.NEW | Leer UX_REVIEW top 10 | 15min | ⬜ |
| 2.NEW | Aplicar top 5 recomendaciones UX | 40min | ⬜ |
| 2.NEW | Smoke test post-cambios | 15min | ⬜ |

---

## DÍA 3 — Jueves 22 mayo: Criterio 3 (matrices editables) + Criterio 2 hardening

**Objetivo:** Cerrar C3 (último criterio pendiente) + validar C2 con PDFs variados.
**Nota: RLS Fase 1 (tarea 3.6) ya completada en Día 2. ~3h liberadas.**

| # | Tarea | Archivos | Est. | Estado |
|---|-------|----------|------|--------|
| 3.1 | Matrices de riesgo EDITABLES (inline edit) | RiskMatrices.tsx | 3h | ⬜ |
| 3.2 | Botón "Agregar riesgo" a matriz | RiskMatrices.tsx | 1.5h | ⬜ |
| 3.3 | Verificar process-exam-pdf con 5 PDFs distintos | datos-prueba/ | 2h | ⬜ |
| 3.4 | Fix process-exam-pdf si falla (solo si necesario) | Edge Function | 3h | ⬜ condicional |
| 3.5 | Verificar generate-acta con 2 empresas | Committees.tsx | 1h | ⬜ |
| 3.NEW | Validación archivo PILA sea PILA (no cualquier PDF) | UploadPila.tsx | 1.5h | ⬜ |
| 3.NEW | UX: extracción vacía no asumir "apto" | MedicalExams.tsx | 30min | ⬜ |
| 3.NEW | Botón "Ver examen cargado" | MedicalExams.tsx | 30min | ⬜ |

**Total día 3: ~7.5h (sin 3.4) o ~10.5h (con 3.4)**

---

## DÍA 4 — Viernes 23 mayo: Recomendaciones última milla

**Objetivo:** Cerrar las 4 recomendaciones del brief.

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 4.1 | R2: email_remitente de DB en Edge Functions | 2h | ⬜ |
| 4.2 | R3: Campo logo_url + upload logo | 2h | ⬜ |
| 4.3 | R3: Logo en getExportHeaderHTML() | 1.5h | ⬜ |
| 4.4 | R1: Documentos suman a dashboard cumplimiento | 2h | ⬜ |
| 4.NEW | Logo Regis en páginas públicas | 30min | ⬜ |

**Total día 4: ~8h**

---

## DÍA 5 — Sábado 24 mayo: Trazabilidad + Configurabilidad + Role guards

**Objetivo:** P6, P7 + role guards (RLS ya cerrado).
**Nota: 5.1, 5.2, 5.3, 5.8 ya completadas. ~5h liberadas.**

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 5.4 | Insertar asistencia_comite al generar acta | 1h | ⬜ |
| 5.5 | Mover validate/approve de Pila.tsx a pilaService | 1h | ⬜ |
| 5.6 | Threshold equipos configurable desde Settings | 1h | ⬜ |
| 5.7 | Role guard en Settings, EmailTemplates, ActivityLog | 1h | ⬜ |
| 5.NEW | Agregar log a validate/approve Pila, Documents | 1h | ⬜ |

**Total día 5: ~5h (liberadas 3.5h para adelantar)**

---

## DÍA 6 — Domingo 25 mayo: Criterio 1 completo + P10

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 6.1 | syncPeriods automático via pg_cron o n8n | 2h | ⬜ |
| 6.2 | ON CONFLICT en upload PILA | 1.5h | ⬜ |
| 6.3 | ON CONFLICT en upload documentos | 1h | ⬜ |
| 6.4 | Mover Documents.tsx queries a documentsService | 2h | ⬜ |
| 6.5 | PageHeader en páginas faltantes | 1h | ⬜ |

**Total día 6: ~7.5h**

---

## DÍA 7 — Lunes 26 mayo: Datos demo + usuario cliente + backups

**Nota: SOP (7.1) ya completado overnight. 4h liberadas.**

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 7.2 | Sembrar datos demo coherentes | 2.5h | ⬜ |
| 7.3 | Crear usuario cliente demo (Construandes) | 1h | ⬜ |
| 7.4 | Habilitar backups Supabase | 0.5h | ⬜ |
| 7.5 | Limpiar console.logs | 0.5h | ⬜ |

**Total día 7: ~4.5h (liberadas 4h para adelantar)**

---

## DÍA 8 — Martes 27 mayo: Bonus + observabilidad + demo prep

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 8.1 | Cron bitácora mensual + resumen semanal | 2h | ⬜ |
| 8.2 | Vista observabilidad AdminDashboard | 3h | ⬜ |
| 8.3 | Dry-run completo demo script | 2h | ⬜ |

**Total día 8: ~7h**

---

## DÍA 9 — Miércoles 28 mayo: Ensayo + correcciones finales

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 9.1 | Ensayo completo video (25 min) | 3h | ⬜ |
| 9.2 | Fix bugs del ensayo | 4h | ⬜ |
| 9.3 | Deploy final producción | 1h | ⬜ |

**Total día 9: ~8h**

---

## DÍA 10 — Jueves 29 mayo: GRABAR VIDEO

| # | Tarea | Est. | Estado |
|---|-------|------|--------|
| 10.1 | Grabar video ≤25 min | 3h | ⬜ |
| 10.2 | Revisar audio y calidad | 1h | ⬜ |
| 10.3 | Subir video + entrega | 1h | ⬜ |

**Total día 10: ~5h**

---

## DÍA 11 — Viernes 30 mayo: BUFFER

Solo si algo sale mal en la grabación.

---

## Resumen de horas por día (actualizado)

| Día | Fecha | Foco | Horas | Estado |
|-----|-------|------|-------|--------|
| 1 | 20 mayo (mar) | Verificación + bugs | 8h | ✅ 100% |
| 2 | 21 mayo (mié) | Seguridad + quick wins + perf | 8h | 🔄 ~40% |
| 3 | 22 mayo (jue) | C3 matrices editables + C2 hardening | 7.5h | ⬜ |
| 4 | 23 mayo (vie) | Recomendaciones última milla | 8h | ⬜ |
| 5 | 24 mayo (sáb) | Trazabilidad + config + role guards | 5h | ⬜ |
| 6 | 25 mayo (dom) | C1 completo + P10 | 7.5h | ⬜ |
| 7 | 26 mayo (lun) | Datos demo + usuario cliente | 4.5h | ⬜ |
| 8 | 27 mayo (mar) | Bonus + P8 + demo prep | 7h | ⬜ |
| 9 | 28 mayo (mié) | Ensayo + fixes | 8h | ⬜ |
| 10 | 29 mayo (jue) | GRABAR VIDEO | 5h | ⬜ |
| 11 | 30 mayo (vie) | Buffer | 0h | — |

**Total estimado: ~69h** (~12h ahorradas vs plan original por trabajo overnight + RLS adelantado)

---

## Tareas para Claude Code (pendientes de enviar)

| # | Tarea | Descripción |
|---|-------|-------------|
| T32 | Demo script optimizado IA | Guion 25 min optimizado para evaluador IA |
| T33 | Executive summary one-pager | Resumen ejecutivo una página |
| T34 | README.md de gala | README profesional para repo público |
| T35 | Hardcoded strings audit | Auditoría de strings hardcodeados |
| T36 | Submission package guide | Guía de entrega del concurso |
| T37 | Compliance executive summary | Resumen ejecutivo cumplimiento |

---

## Lo que NO se hace en estos 10 días

- ❌ Migración de n8n Gmail → Outlook (Resend ya es neutral)
- ❌ Outbox pattern completo (solo ON CONFLICT)
- ❌ Materialized views (query directo suficiente para 3 empresas)
- ❌ Magic links de onboarding (fuera de scope mínimo)
- ❌ Firma electrónica real (DocuSign/FirmaVirtual)
- ❌ Integración Fireflies para transcripción videollamadas
- ❌ Whisper local (Whisper API suficiente)
- ❌ React Query en todas las páginas
- ❌ Test suite (no justifica para concurso)
- ❌ Migrar cálculo cumplimiento a función Postgres
- ❌ Triggers DB automáticos
- ❌ OCR dedicado (Claude Vision cubre 100%)
