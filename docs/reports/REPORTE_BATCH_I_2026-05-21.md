# Reporte Batch I — Toggle fix + UX sistémico

**Fecha:** 2026-05-21
**Build:** exitoso (`npm run build`)

---

## Tareas completadas

| # | Tarea | Commit | Estado |
|---|-------|--------|--------|
| T74 | Toggle Admin/Cliente funcional | `f9cbd28` | Completado |
| T75 | Paginación cliente 7 tablas | `9b4b919` | Completado |
| T76 | Skeleton loading states | `fc6dc27` | Completado |
| T77 | Tooltips icon-only buttons | `c47dadf` | Completado |
| T78 | EmptyState reutilizable | `bfb2beb` | Completado |

---

## Detalle por tarea

### T74 — Toggle Admin / Cliente

- **AppSidebar:** Ahora consume `useViewMode()` — oculta sección "Administración" cuando mode="client"
- **AppHeader:** Toggle solo visible para admin/consultor
- **Badge preview:** "Vista previa cliente" (amarillo) aparece cuando admin está en modo cliente
- **Dashboard:** Ya respondía al toggle (AdminDashboard vs ClientDashboard)

### T75 — Paginación cliente en 7 tablas

**Nuevos componentes:**
- `TablePagination` — UI con navegación, ellipsis, contador "X–Y de Z"
- `usePagination(items, pageSize)` — hook reutilizable con reset automático

**Aplicado a:**
| Página | Variable | Items/página |
|--------|----------|--------------|
| PILA | `records` | 10 |
| Empresas | `filtered` | 10 |
| Trabajadores | `filtered` | 10 |
| Usuarios | `filtered` | 10 |
| Actividad | `filtered` | 15 |
| Documentos | `documentos` | 10 |
| Inventario Equipos | `equipos` | 10 |

### T76 — Skeleton loading states

**Nuevos componentes:**
- `KpiCardSkeleton` — tarjeta KPI animada
- `KpiRowSkeleton` — fila de N KPIs skeleton
- `TableSkeleton` — tabla con N columnas × M filas skeleton
- `PageSkeleton` — composición: header + KPIs + tabla

**Aplicado a:**
- `AdminDashboard` — PageSkeleton mientras carga datos (Promise.all)
- `Documents` — TableSkeleton reemplaza spinner genérico

### T77 — Tooltips shadcn en botones icon-only

- Reemplaza `title` nativo por `<Tooltip>` de shadcn/Radix
- Tooltips en español: "Editar", "Desactivar/Reactivar", "Eliminar", "Ver / Descargar"
- **Páginas:** Empresas, Trabajadores, Documentos, Inventario Equipos

### T78 — EmptyState reutilizable

**Nuevo componente:** `EmptyState`
- Props: `icon`, `title`, `description?`, `actionLabel?`, `onAction?`
- Diseño: icono circular + texto + botón de acción opcional

**Aplicado a:**
| Página | Mensaje |
|--------|---------|
| PILA | "Sin registros PILA" |
| Documentos | "Sin documentos" |
| Inventario Equipos | "Sin equipos registrados" + botón "Agregar equipo" |
| Matrices de Riesgo | "Sin matrices de riesgo" |

---

## Componentes nuevos creados

| Componente | Ruta | Descripción |
|------------|------|-------------|
| `TablePagination` | `src/components/common/TablePagination.tsx` | Paginación + hook |
| `KpiCardSkeleton` | `src/components/common/Skeletons.tsx` | Skeleton KPI |
| `TableSkeleton` | `src/components/common/Skeletons.tsx` | Skeleton tabla |
| `PageSkeleton` | `src/components/common/Skeletons.tsx` | Skeleton página completa |
| `EmptyState` | `src/components/common/EmptyState.tsx` | Estado vacío reutilizable |

---

## Resumen UX

| Mejora | Antes | Después |
|--------|-------|---------|
| Toggle vista | Solo cambiaba Dashboard | Sidebar + Dashboard + badge |
| Tablas largas | Scroll infinito | Paginación con "X de Y" |
| Carga inicial | Pantalla en blanco / spinner | Skeleton animado |
| Botones icono | Tooltip nativo (lento) | Tooltip shadcn (inmediato) |
| Sin datos | Texto plano | Icono + descripción + CTA |
