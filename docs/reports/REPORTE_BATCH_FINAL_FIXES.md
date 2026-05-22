# Reporte Batch Final — Fixes y Features

**Fecha:** 2026-05-22  
**Scope:** Items F1-F8 del batch final de correcciones

---

## Resumen

| Item | Descripcion | Estado | Commit |
|------|-------------|--------|--------|
| F1 | CIIU secundario en empresas + matrices combinadas | Completado | `418a1c5` |
| F2 | Vista detalle trabajador con examenes y documentos | Completado | `7e8f49a` |
| F3 | Links asistencia individuales por integrante | Completado | `2f3eaaa` |
| F4 | DRY BulkImportDialog (refactor) | Diferido | — |
| F5 | Responsive layout en Dashboard, PILA, Comites | Completado | `c55f8b4` |
| F6 | Consultor-empresa asignacion (migration draft) | Completado | `c92f747` |
| F7 | Calendario completo con leyenda de colores | Completado | `db6bc54` |
| F8 | Email anti-spam (text/plain + List-Unsubscribe) | Completado | `46333cf` |

**7 de 8 items completados. F4 diferido por ser refactor interno sin impacto en UX.**

---

## Detalle por Item

### F1: CIIU Secundario + Matrices Combinadas
- Agregado campo `ciiu_codigo_secundario` al formulario de empresas
- Matrices de riesgo ahora consultan ambos CIIUs y deduplican peligros
- Label combinado: "CIIU XXXX + YYYY"

### F2: Vista Detalle Trabajador
- Nueva pagina `/trabajadores/:id` con card de info + tabs
- Tabs: Examenes Medicos (filtrados por cedula), Historial de actividad
- Nombres clickeables en tabla de trabajadores

### F3: Links Asistencia Individuales
- Cada integrante recibe un enlace personalizado con nombre/ID en token
- Pagina publica muestra vista simplificada para link individual
- Link general sigue mostrando lista completa
- Migration DRAFT: `017_asistencia_individual_tokens_DRAFT.sql`

### F4: DRY BulkImportDialog (Diferido)
- Refactor de componente compartido entre Companies, Workers, Equipment
- Diferido por ser mejora interna de codigo sin impacto en funcionalidad
- Patron actual funciona correctamente en las tres paginas

### F5: Responsive Layout
- Dashboard: `grid-cols-2 sm:grid-cols-4` para stats PILA
- PILA: `overflow-x-auto` en tablas
- Comites: `flex-col sm:flex-row` en filas de actas
- Cumplimiento: `grid-cols-2 lg:grid-cols-4` en KPIs

### F6: Consultor-Empresa Asignacion
- Migration DRAFT: `018_consultor_empresas_DRAFT.sql`
- Tabla many-to-many con roles principal/apoyo
- RLS policies para lectura autenticada y gestion admin
- UI ya existia parcialmente (campo consultor_id en empresas)

### F7: Calendario Completo con Leyenda
- Agregados eventos de inventario_equipos (vencimientos)
- Leyenda de colores para 5 modulos: PILA, Examenes, Comites, Emergencia, Equipos
- Icono y color unico por modulo

### F8: Email Anti-Spam
- `text` (plain text alternative) agregado a send-pila-reminder
- `List-Unsubscribe` header agregado a todas las Edge Functions email
- Functions actualizadas: generate-bitacora, weekly-summary (in-repo)
- send-pila-reminder actualizado fuera del repo (deploy manual requerido)

---

## Migrations DRAFT Pendientes de Aplicar

| Archivo | Descripcion |
|---------|-------------|
| `017_asistencia_individual_tokens_DRAFT.sql` | Columnas token + confirmado_at en asistencia_comite + RLS |
| `018_consultor_empresas_DRAFT.sql` | Tabla consultor_empresas many-to-many + indices + RLS |

**Aplicar con:** SQL Editor en Supabase Dashboard o `supabase db push`

---

## Edge Functions que Requieren Re-deploy

| Function | Cambio | JWT |
|----------|--------|-----|
| `send-pila-reminder` | text/plain + List-Unsubscribe | no-jwt |
| `generate-bitacora` | text/plain + List-Unsubscribe | no-jwt |
| `weekly-summary` | text/plain + List-Unsubscribe | no-jwt |
| `transcribe-audio` | Prompt UNGRD mejorado (commit anterior) | jwt |

```bash
supabase functions deploy send-pila-reminder --no-verify-jwt
supabase functions deploy generate-bitacora --no-verify-jwt
supabase functions deploy weekly-summary --no-verify-jwt
supabase functions deploy transcribe-audio
```
