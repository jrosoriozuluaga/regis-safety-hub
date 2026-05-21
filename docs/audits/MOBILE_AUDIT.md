# Auditoria de Diseno Responsivo — Regis SG-SST

**Fecha:** 2026-05-21  
**Breakpoints evaluados:** 375px (iPhone SE), 768px (iPad), 1024px (laptop)  
**Breakpoints Tailwind del proyecto:** sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1400px (container)

---

## Resumen Ejecutivo

La plataforma tiene una base responsiva razonable gracias al uso de shadcn/ui y el componente `SidebarProvider` que ya maneja mobile con un Sheet (drawer). Sin embargo, hay **problemas criticos** en tablas de datos, formularios y paginas publicas que afectan la experiencia en dispositivos moviles. Se identificaron **28 hallazgos** distribuidos en 12 paginas/componentes.

| Prioridad | Cantidad | Descripcion |
|-----------|----------|-------------|
| P1 (critico) | 8 | Bloquean el uso en movil — contenido cortado, tablas ilegibles |
| P2 (importante) | 12 | Degradan la experiencia — scroll horizontal, botones pequenos |
| P3 (menor) | 8 | Mejoras de pulido visual |

---

## Infraestructura General

### Lo que ya funciona bien

- **Sidebar:** Usa `useIsMobile()` + `Sheet` para mostrar sidebar como drawer en movil. El `SidebarTrigger` esta en el header. CORRECTO.
- **AppLayout:** `main` usa `p-6 lg:p-8` — buen padding adaptativo.
- **PageHeader:** Usa `flex-col sm:flex-row` para apilar titulo y acciones en movil. CORRECTO.
- **Login:** Usa `lg:grid-cols-2` para split-screen, muestra logo alternativo con `lg:hidden`. CORRECTO.
- **AppHeader:** Oculta nombre de usuario con `hidden md:flex`. Oculta toggle admin/cliente con `hidden sm:flex`. CORRECTO.

### Problemas Globales

| # | Problema | Correccion Tailwind | Prioridad |
|---|---------|---------------------|-----------|
| G1 | `main` padding de `p-6` es excesivo en 375px. Reduce area util a ~327px | Cambiar a `p-3 sm:p-6 lg:p-8` en `AppLayout.tsx` | P2 |
| G2 | Menu dropdown de alertas tiene `w-96` (384px) — se desborda en iPhone SE (375px) | Cambiar a `w-[calc(100vw-2rem)] sm:w-96` | P1 |

---

## Hallazgos por Pagina

### 1. UploadPila.tsx (Pagina publica — MAXIMA PRIORIDAD)

**Contexto:** Los clientes abren esta pagina desde WhatsApp en su celular. Es la pagina mas critica para movil.

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| UP1 | Padding general adecuado | `p-4` y `max-w-md` estan bien para movil | — | OK |
| UP2 | Area de drop-zone puede ser pequena en movil | El componente `FileDropzone` necesita min-height y touch targets grandes | Agregar `min-h-[120px]` al FileDropzone y asegurar que el boton de seleccion tenga al menos `h-11 w-full` | P2 |
| UP3 | Icono de `Shield` a 32px (h-8 w-8) es adecuado | — | — | OK |

**Veredicto:** Esta pagina esta relativamente bien disenada para movil. Solo necesita ajustes menores en el FileDropzone.

---

### 2. Pila.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| PI1 | Tabla sin scroll horizontal | La tabla tiene 7 columnas (Empresa, Periodo, Estado, Fecha carga, Intentos, Archivo, Acciones). En 375px se desborda o se corta | Envolver `<Table>` en `<div className="overflow-x-auto">` | P1 |
| PI2 | Botones de accion demasiado pequenos | Los botones Email/WhatsApp/Validar/Aprobar usan `size="sm"` con texto. En movil son dificiles de tocar | Cambiar a iconos-only en movil: `<span className="hidden sm:inline">Email</span>` y asegurar `min-w-[44px] min-h-[44px]` | P2 |
| PI3 | KPI grid `sm:grid-cols-2 lg:grid-cols-5` | Con 5 tarjetas, en 375px se apilan correctamente (1 col). En 768px muestra 2 cols. CORRECTO | — | OK |
| PI4 | Indicador de config se desborda | `flex items-center gap-4` con multiples `<span>` se desborda horizontalmente en 375px | Cambiar a `flex flex-wrap items-center gap-2 sm:gap-4` | P2 |
| PI5 | Header actions (Sincronizar + Cargar PILA) | Los 2 botones en `flex gap-2` pueden desbordarse en 375px | Agregar `flex-wrap` al contenedor de actions en PageHeader | P2 |

---

### 3. Dashboard.tsx / AdminDashboard.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| DA1 | Tabla "Empresas clientes" sin scroll horizontal | 6 columnas sin `overflow-x-auto`. Se desborda en 375px y 768px | Envolver en `<div className="overflow-x-auto">` | P1 |
| DA2 | Grafico de barras de cumplimiento | `flex items-end gap-6` con `flex-1 max-w-[140px]` — en 375px las barras se comprimen demasiado con gap-6 | Cambiar a `gap-3 sm:gap-6` y `max-w-[80px] sm:max-w-[140px]`. Considerar scroll horizontal en <3 empresas | P2 |
| DA3 | Grid PILA `grid-cols-4` en estado PILA | 4 columnas fijas sin breakpoint — en 375px los numeros y labels se comprimen | Cambiar a `grid-cols-2 sm:grid-cols-4` | P2 |
| DA4 | Onboarding grid `sm:grid-cols-2 lg:grid-cols-3` | Correcto. Se apila en 375px | — | OK |
| DA5 | Acciones rapidas (Bitacora + Resumen) | `flex flex-wrap gap-3` es correcto, pero los botones y el `<pre>` con reports pueden desbordarse | Agregar `overflow-x-auto` al `<pre>` y `w-full` a los contenedores internos | P3 |

---

### 4. Dashboard.tsx / ClientDashboard.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| DC1 | CircularProgress `size={220}` | 220px de diametro + padding consume casi todo el ancho en 375px (375-48px padding = 327px disponibles). Queda poco margen | Cambiar a `size={180}` en movil o usar clase responsive: pasar size como prop con `useIsMobile()` o CSS `max-w-[180px] sm:max-w-[220px]` | P2 |
| DC2 | PILA status `flex items-center gap-6` | Badges + Progress en una fila — en 375px los badges se desbordan | Cambiar a `flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6` y `flex-wrap` en badges | P1 |

---

### 5. MedicalExams.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| ME1 | Tabla con `overflow-x-auto` | Ya tiene `<div className="overflow-x-auto">`. CORRECTO | — | OK |
| ME2 | Header de tabla con badges y buscador en linea | `flex items-center justify-between flex-wrap gap-3` — el `Input w-48` mas badges pueden desbordarse en 375px | Cambiar buscador a `w-full sm:w-48` y apilar badges: `flex flex-wrap gap-1 sm:gap-2` | P2 |
| ME3 | Grid layout `lg:grid-cols-3` | En 375px se apila (1 col). CORRECTO | — | OK |

---

### 6. Documents.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| DO1 | Tabla sin scroll horizontal | 6 columnas (Empresa, Tipo, Nombre, Estado, Fecha, Acciones) sin `overflow-x-auto` | Envolver `<Table>` en `<div className="overflow-x-auto">` | P1 |
| DO2 | KPI grid `grid-cols-1 md:grid-cols-4` | Correcto — 1 col en movil, 4 en tablet+ | — | OK |
| DO3 | Filtros con ancho fijo | `SelectTrigger className="w-[260px]"` y `w-[220px]` — en 375px estos no caben lado a lado | Cambiar a `w-full sm:w-[260px]` y `w-full sm:w-[220px]`. Cambiar contenedor de filtros a `flex flex-col sm:flex-row gap-3 sm:gap-4` | P1 |
| DO4 | Botones de accion en tabla (Validar, Aprobar, Ver, Eliminar) | `flex justify-end gap-1` con multiples botones puede desbordarse en celdas estrechas | Considerar `DropdownMenu` para acciones en movil, o `flex-wrap` | P3 |

---

### 7. EquipmentInventory.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| EI1 | Tabla con `overflow-x-auto` | Ya tiene. CORRECTO | — | OK |
| EI2 | KPI grid `sm:grid-cols-2 lg:grid-cols-4` | Correcto — 1 col en 375px | — | OK |
| EI3 | Formulario en Dialog usa `sm:grid-cols-2` | Los campos se apilan en movil. CORRECTO | — | OK |
| EI4 | Dialog `max-w-2xl max-h-[90vh] overflow-y-auto` | Buena configuracion para movil | — | OK |
| EI5 | Tabla tiene 8 columnas para admin | Incluso con scroll horizontal, 8 columnas es mucho. La primera columna (Empresa) deberia ser sticky | Agregar `sticky left-0 bg-card z-10` a la primera `<TableHead>` y `<TableCell>` de Empresa | P3 |

---

### 8. Workers.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| WO1 | Tabla con `overflow-x-auto` | Ya tiene. CORRECTO | — | OK |
| WO2 | Header de tabla con busqueda + botones en linea | `flex items-center justify-between flex-wrap gap-4` — correcto gracias a `flex-wrap` | — | OK |
| WO3 | Buscador `w-56` (224px) fijo | En 375px ocupa demasiado espacio junto a los botones | Cambiar a `w-full sm:w-56` | P2 |
| WO4 | Dialog de trabajador individual usa `grid-cols-2` fijo | Sin breakpoint responsive — los 2 campos se comprimen en 375px | Cambiar a `grid-cols-1 sm:grid-cols-2` | P1 |
| WO5 | Dialog de carga masiva `max-w-4xl` | Muy ancho para movil, pero `max-h-[90vh] overflow-y-auto` ayuda. La tabla de preview puede desbordarse | Agregar `overflow-x-auto` al contenedor de la tabla de preview (ya tiene `overflow-x-auto` en linea 682). CORRECTO | OK |

---

### 9. Committees.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| CO1 | Grid layout `lg:grid-cols-3` | Se apila en movil. CORRECTO | — | OK |
| CO2 | Grid de campos `sm:grid-cols-2` y `sm:grid-cols-3` | Se apila correctamente en 375px. CORRECTO | — | OK |
| CO3 | Historial de actas: `flex items-center justify-between` | Cada acta tiene multiples badges + botones (Firmar, Archivar, Ver, estado). En 375px se desbordan | Cambiar a `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2` | P1 |
| CO4 | Boton "Sin quorum" + texto de advertencia en linea | `flex items-center gap-3` — el texto largo puede desbordarse | Agregar `flex-wrap` | P3 |

---

### 10. RiskMatrices.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| RM1 | Tabla con `overflow-x-auto` | Ya tiene. CORRECTO | — | OK |
| RM2 | Grid layout `lg:grid-cols-3` | Se apila en movil. CORRECTO | — | OK |
| RM3 | Tabla tiene 9 columnas | Incluso con scroll horizontal, es dificil de usar en 375px. Algunas columnas numericas (ND, NE, NP, NC, NR) se podrian ocultar en movil | Agregar `hidden md:table-cell` a columnas NP y NC (calculables a partir de ND, NE, NR) | P3 |
| RM4 | Columna "Controles" truncada `max-w-[200px] truncate` | En movil esto funciona, pero 200px es relativo al ancho de tabla con scroll. Aceptable | — | OK |

---

### 11. Login.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| LO1 | Layout `lg:grid-cols-2` con panel izquierdo `hidden lg:flex` | Correcto — solo muestra formulario en movil | — | OK |
| LO2 | Formulario `p-6 sm:p-12` | Correcto — reduce padding en movil | — | OK |
| LO3 | Boton submit `w-full size="lg"` | Buen touch target (h-11 = 44px). CORRECTO | — | OK |

**Veredicto:** Login esta bien optimizado para movil.

---

### 12. AppSidebar.tsx / AppHeader.tsx

| # | Problema | Detalle | Correccion | Prioridad |
|---|---------|---------|------------|-----------|
| AS1 | Sidebar usa `collapsible="icon"` | En desktop colapsa a iconos, en movil usa Sheet drawer. CORRECTO | — | OK |
| AH1 | Header `sticky top-0 z-30 h-16` | Correcto para movil — siempre visible | — | OK |
| AH2 | Dropdown de usuario muestra nombre con `hidden md:flex` | Correcto — solo avatar en movil | — | OK |

---

## Resumen de Correcciones por Prioridad

### P1 — Critico (resolver antes del video)

| Archivo | Hallazgo | Accion |
|---------|----------|--------|
| `AppHeader.tsx` | G2: Dropdown alertas 384px en pantalla 375px | `w-[calc(100vw-2rem)] sm:w-96` |
| `Pila.tsx` | PI1: Tabla sin scroll horizontal | Envolver `<Table>` en `<div className="overflow-x-auto">` |
| `AdminDashboard.tsx` | DA1: Tabla empresas sin scroll horizontal | Envolver `<Table>` en `<div className="overflow-x-auto">` |
| `ClientDashboard.tsx` | DC2: Badges PILA desbordan en 375px | `flex flex-col sm:flex-row` + `flex-wrap` |
| `Documents.tsx` | DO1: Tabla sin scroll horizontal | Envolver `<Table>` en `<div className="overflow-x-auto">` |
| `Documents.tsx` | DO3: Filtros con ancho fijo | `w-full sm:w-[260px]` + `flex-col sm:flex-row` |
| `Committees.tsx` | CO3: Historial actas desborda en movil | `flex-col sm:flex-row` + `gap-2` |
| `Workers.tsx` | WO4: Dialog formulario `grid-cols-2` sin breakpoint | `grid-cols-1 sm:grid-cols-2` |

### P2 — Importante

| Archivo | Hallazgo | Accion |
|---------|----------|--------|
| `AppLayout.tsx` | G1: Padding excesivo en 375px | `p-3 sm:p-6 lg:p-8` |
| `UploadPila.tsx` | UP2: FileDropzone touch target | `min-h-[120px]` + boton `h-11 w-full` |
| `Pila.tsx` | PI2: Botones accion pequenos | Iconos-only en movil, `min-h-[44px]` |
| `Pila.tsx` | PI4: Config indicator desborda | `flex-wrap gap-2 sm:gap-4` |
| `Pila.tsx` | PI5: Header actions desbordan | `flex-wrap` en actions |
| `AdminDashboard.tsx` | DA2: Barras cumplimiento comprimidas | `gap-3 sm:gap-6` |
| `AdminDashboard.tsx` | DA3: Grid PILA 4 cols fijo | `grid-cols-2 sm:grid-cols-4` |
| `ClientDashboard.tsx` | DC1: CircularProgress 220px | Reducir a 180px en movil |
| `MedicalExams.tsx` | ME2: Buscador + badges desbordan | `w-full sm:w-48` + `flex-wrap` |
| `Workers.tsx` | WO3: Buscador `w-56` fijo | `w-full sm:w-56` |

### P3 — Menor

| Archivo | Hallazgo | Accion |
|---------|----------|--------|
| `AdminDashboard.tsx` | DA5: Pre con reports desborda | `overflow-x-auto` en `<pre>` |
| `Documents.tsx` | DO4: Botones accion en tabla | `flex-wrap` o DropdownMenu en movil |
| `EquipmentInventory.tsx` | EI5: Sticky primera columna | `sticky left-0 bg-card z-10` |
| `RiskMatrices.tsx` | RM3: 9 columnas, ocultar calculables | `hidden md:table-cell` en NP y NC |
| `Committees.tsx` | CO4: Quorum warning desborda | `flex-wrap` |

---

## Componentes Transversales a Revisar

### FileDropzone

El componente `FileDropzone` es usado en PILA, Medical Exams, Documents y UploadPila. Debe garantizar:
- `min-h-[100px]` para area de toque
- Texto de ayuda (`hint`) con `text-xs` y truncamiento
- Boton interno de seleccion con `h-11 min-w-[44px]` para cumplir lineamientos de touch target iOS/Android

### Dialogs / Modals (shadcn DialogContent)

shadcn/ui DialogContent ya tiene `max-w-lg` por defecto y se adapta al viewport con `mx-4`. Verificar que:
- Formularios dentro de dialogs usen `grid-cols-1 sm:grid-cols-2` (no `grid-cols-2` fijo)
- Archivos afectados: `Workers.tsx` (dialog individual tiene `grid-cols-2` fijo)

### Tablas

Patron recomendado para todas las tablas:
```tsx
<div className="overflow-x-auto">
  <Table className="min-w-[600px]"> {/* o min-w segun columnas */}
    ...
  </Table>
</div>
```

Archivos que necesitan `overflow-x-auto`: `Pila.tsx`, `AdminDashboard.tsx`, `Documents.tsx`.

Archivos que ya lo tienen: `MedicalExams.tsx`, `EquipmentInventory.tsx`, `Workers.tsx`, `RiskMatrices.tsx`.

---

## Matriz de Impacto por Pantalla

| Pagina | 375px (iPhone SE) | 768px (iPad) | 1024px (laptop) |
|--------|-------------------|--------------|-----------------|
| Login | OK | OK | OK |
| UploadPila | OK (ajuste menor) | OK | OK |
| Dashboard Admin | PROBLEMAS (tablas, graficos) | OK (ajuste menor) | OK |
| Dashboard Cliente | PROBLEMA (badges PILA) | OK | OK |
| PILA | PROBLEMAS (tabla, botones) | OK (ajuste menor) | OK |
| Medical Exams | OK (tiene overflow-x-auto) | OK | OK |
| Documents | PROBLEMAS (tabla, filtros) | OK (ajuste menor) | OK |
| Equipment | OK (tiene overflow-x-auto) | OK | OK |
| Workers | PROBLEMA (dialog) | OK | OK |
| Committees | PROBLEMA (historial actas) | OK | OK |
| Risk Matrices | OK (tiene overflow-x-auto) | OK | OK |

---

## Recomendacion de Implementacion

**Orden sugerido para maxima cobertura con minimo esfuerzo:**

1. **5 minutos:** Agregar `overflow-x-auto` a las 3 tablas que lo necesitan (Pila, AdminDashboard, Documents)
2. **5 minutos:** Corregir dropdown de alertas en AppHeader (`w-[calc(100vw-2rem)] sm:w-96`)
3. **5 minutos:** Corregir filtros fijos en Documents (`w-full sm:w-[260px]`)
4. **5 minutos:** Corregir grid-cols-2 sin breakpoint en Workers dialog
5. **10 minutos:** Corregir historial de actas en Committees y badges PILA en ClientDashboard
6. **5 minutos:** Reducir padding global en AppLayout (`p-3 sm:p-6 lg:p-8`)

**Total estimado: ~35 minutos** para resolver todos los P1 y los P2 mas impactantes.
