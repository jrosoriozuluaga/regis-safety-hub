# Auditoría de Accesibilidad — Regis SG-SST

**Nivel objetivo:** WCAG 2.1 AA  
**Fecha:** 2026-05-21  
**Archivos auditados:** Login, Dashboard, Pila, MedicalExams, UploadPila, Committees, Documents, Workers, AppSidebar, AppLayout, AppHeader, PageHeader, FileDropzone

---

## Resumen ejecutivo

Se identificaron **28 hallazgos** clasificados por severidad:

| Severidad | Cantidad | Descripcion |
|-----------|----------|-------------|
| P1 — Critico | 8 | Bloquea el uso para usuarios con discapacidad |
| P2 — Importante | 12 | Dificulta significativamente la experiencia |
| P3 — Mejora | 8 | Mejoras recomendadas para cumplimiento completo |

---

## 1. Color y contraste (WCAG 1.4.3, 1.4.11)

### H-01: Texto `text-muted-foreground` sobre fondos claros

- **Criterio:** 1.4.3 Contraste minimo (AA requiere 4.5:1 para texto normal, 3:1 para texto grande)
- **Severidad:** P2
- **Ubicacion:** Multiples archivos — casi todas las descripciones usan `text-muted-foreground`
- **Problema:** La clase `text-muted-foreground` de shadcn/ui normalmente produce gris claro (~`hsl(215 20% 65%)`) sobre fondo blanco, lo que puede estar por debajo del ratio 4.5:1 segun el tema configurado.
- **Archivos afectados:** `PageHeader.tsx` (linea 16), `Login.tsx` (linea 87), `UploadPila.tsx` (linea 142), `AppHeader.tsx` (linea 181)

**Actual:**
```tsx
<p className="text-sm text-muted-foreground mt-1">
```

**Recomendado:**
Verificar el ratio de contraste del valor CSS `--muted-foreground` en `globals.css`. Si esta por debajo de 4.5:1, ajustar:
```css
--muted-foreground: 215.4 16.3% 40%; /* ratio >= 4.5:1 sobre blanco */
```

---

### H-02: Badges de estado dependen exclusivamente del color

- **Criterio:** 1.4.1 Uso del color
- **Severidad:** P1
- **Ubicacion:** `Pila.tsx` (lineas 29-35), `MedicalExams.tsx` (lineas 18-23), `Documents.tsx` (lineas 104-110)
- **Problema:** Los badges de estado (pendiente, cargada, validada, aprobada, vencida) usan solo color de fondo para diferenciar estados. Si bien PILA incluye iconos en la tabla, los badges de Documentos y Examenes Medicos no tienen icono acompanante.

**Actual (Documents.tsx):**
```tsx
<Badge variant={badge.variant} className={badge.className}>
  {badge.label}
</Badge>
```

**Recomendado:**
```tsx
<Badge variant={badge.variant} className={badge.className}>
  <StatusIcon className="h-3 w-3 mr-1" aria-hidden="true" />
  {badge.label}
</Badge>
```
Agregar un icono a cada badge de estado para que la informacion no dependa unicamente del color.

---

### H-03: Indicador de severidad en alertas usa solo color de punto

- **Criterio:** 1.4.1 Uso del color
- **Severidad:** P2
- **Ubicacion:** `AppHeader.tsx` (linea 155)
- **Problema:** El indicador de severidad de alertas es un circulo de 6px (`h-1.5 w-1.5 rounded-full`) que cambia de color (rojo/ambar/azul). Es invisible para usuarios daltonianos y casi invisible para baja vision.

**Actual:**
```tsx
<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", SEVERITY_COLOR[alert.severidad])} />
```

**Recomendado:**
```tsx
<span className="sr-only">Severidad: {alert.severidad}</span>
<span className={cn("h-1.5 w-1.5 rounded-full shrink-0", SEVERITY_COLOR[alert.severidad])} aria-hidden="true" />
```

---

### H-04: Texto `text-[10px]` en badges demasiado pequeno

- **Criterio:** 1.4.4 Redimensionamiento del texto
- **Severidad:** P2
- **Ubicacion:** `Pila.tsx` (lineas 275-278), `MedicalExams.tsx` (lineas 219-227), `Committees.tsx` (lineas 350-421), `AppHeader.tsx` (linea 123)
- **Problema:** Multiples badges usan `text-[10px]`, que esta por debajo del minimo recomendado de 12px. Esto dificulta la lectura para usuarios con baja vision.

**Recomendado:** Usar `text-xs` (12px) como minimo en todos los badges.

---

### H-05: Contraste del WhatsApp verde `text-[#25D366]` sobre fondo blanco

- **Criterio:** 1.4.3 Contraste minimo
- **Severidad:** P2
- **Ubicacion:** `Pila.tsx` (linea 429)
- **Problema:** El color `#25D366` (verde WhatsApp) sobre fondo blanco tiene un ratio de contraste de aproximadamente 2.09:1 — muy por debajo del minimo 4.5:1.

**Actual:**
```tsx
className="gap-1.5 text-xs text-[#25D366] hover:text-[#128C7E] hover:bg-green-50"
```

**Recomendado:**
```tsx
className="gap-1.5 text-xs text-green-700 hover:text-green-800 hover:bg-green-50"
```

---

## 2. Navegacion por teclado (WCAG 2.1.1, 2.1.2)

### H-06: Botones de vista Admin/Cliente sin indicador de rol

- **Criterio:** 2.1.1 Teclado
- **Severidad:** P2
- **Ubicacion:** `AppHeader.tsx` (lineas 88-102)
- **Problema:** El toggle Admin/Cliente usa `<button>` nativo pero no tiene `role="tablist"` ni `aria-pressed`/`aria-selected` para indicar el estado actual.

**Actual:**
```tsx
<button
  key={m}
  onClick={() => setMode(m)}
  className={cn("px-3 py-1.5 ...", mode === m ? "bg-primary ..." : "...")}
>
```

**Recomendado:**
```tsx
<div role="tablist" aria-label="Modo de vista">
  <button
    role="tab"
    aria-selected={mode === m}
    onClick={() => setMode(m)}
    className={cn("px-3 py-1.5 ...", mode === m ? "bg-primary ..." : "...")}
  >
```

---

### H-07: Zona de drop de archivos (bulk upload) con `div` no alcanzable por teclado

- **Criterio:** 2.1.1 Teclado
- **Severidad:** P1
- **Ubicacion:** `Workers.tsx` (lineas 646-658)
- **Problema:** La zona de carga masiva usa un `<div>` con `onClick` pero sin `role="button"`, `tabIndex`, ni manejo de `onKeyDown`. No se puede activar con teclado.

**Actual:**
```tsx
<div
  className="border-2 border-dashed ..."
  onDragOver={...}
  onDrop={handleDrop}
  onClick={() => fileInputRef.current?.click()}
>
```

**Recomendado:**
```tsx
<div
  role="button"
  tabIndex={0}
  aria-label="Zona de carga de archivos. Arrastra un archivo o presiona Enter para seleccionar"
  className="border-2 border-dashed ... focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  onDragOver={...}
  onDrop={handleDrop}
  onClick={() => fileInputRef.current?.click()}
  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
>
```

Nota: `FileDropzone.tsx` usa `<button>` correctamente. Solo el dropzone de Workers.tsx tiene este problema.

---

### H-08: Checkboxes de asistencia en Comites sin label accesible

- **Criterio:** 2.1.1 Teclado, 1.3.1 Informacion y relaciones
- **Severidad:** P2
- **Ubicacion:** `Committees.tsx` (lineas 261-270)
- **Problema:** El `<label>` envuelve al Checkbox, pero el componente Checkbox de Radix no recibe un `id` ni `aria-label` explicito. El `<label>` nativo no se asocia correctamente con el Checkbox de Radix (que renderiza un `<button>`).

**Actual:**
```tsx
<label key={m.id} className="flex items-center gap-3 ...">
  <Checkbox checked={!!attendance[m.id]} onCheckedChange={...} />
  <div>...</div>
</label>
```

**Recomendado:**
```tsx
<div key={m.id} className="flex items-center gap-3 ...">
  <Checkbox
    id={`attendance-${m.id}`}
    checked={!!attendance[m.id]}
    onCheckedChange={...}
    aria-label={`Asistencia de ${m.nombre}`}
  />
  <label htmlFor={`attendance-${m.id}`} className="flex-1 min-w-0 cursor-pointer">
    <div className="text-sm font-medium">{m.nombre}</div>
    <div className="text-xs text-muted-foreground">{m.rol_comite}</div>
  </label>
</div>
```

---

### H-09: Botones de accion con solo icono sin `aria-label`

- **Criterio:** 2.1.1 Teclado, 4.1.2 Nombre/Rol/Valor
- **Severidad:** P1
- **Ubicacion:** `Workers.tsx` (lineas 545, 549), `Documents.tsx` (lineas 656-665, 667-670)
- **Problema:** Los botones `size="icon"` (Editar, Eliminar, Ver) usan atributo `title` pero no `aria-label`. Los lectores de pantalla no leen `title` de forma confiable.

**Actual:**
```tsx
<Button variant="ghost" size="icon" onClick={() => openEdit(w)} title="Editar">
  <Pencil className="h-4 w-4" />
</Button>
```

**Recomendado:**
```tsx
<Button variant="ghost" size="icon" onClick={() => openEdit(w)} aria-label="Editar trabajador">
  <Pencil className="h-4 w-4" aria-hidden="true" />
</Button>
```

---

### H-10: Boton de notificaciones sin `aria-label`

- **Criterio:** 4.1.2 Nombre/Rol/Valor
- **Severidad:** P1
- **Ubicacion:** `AppHeader.tsx` (linea 106)
- **Problema:** El boton del icono de campana (Bell) no tiene `aria-label`.

**Actual:**
```tsx
<Button variant="ghost" size="icon" className="relative">
  <Bell className="h-5 w-5" />
  {totalCount > 0 && <span className="absolute ...">...</span>}
</Button>
```

**Recomendado:**
```tsx
<Button variant="ghost" size="icon" className="relative" aria-label={`Notificaciones${totalCount > 0 ? ` (${totalCount} pendientes)` : ''}`}>
  <Bell className="h-5 w-5" aria-hidden="true" />
  {totalCount > 0 && <span className="absolute ..." aria-hidden="true">...</span>}
</Button>
```

---

### H-11: SidebarTrigger sin `aria-label`

- **Criterio:** 4.1.2 Nombre/Rol/Valor
- **Severidad:** P2
- **Ubicacion:** `AppHeader.tsx` (linea 84)
- **Problema:** El componente `SidebarTrigger` de shadcn renderiza un boton con icono pero sin texto accesible.

**Recomendado:** Verificar si el componente `SidebarTrigger` ya incluye `aria-label` internamente. Si no:
```tsx
<SidebarTrigger aria-label="Abrir/cerrar menu lateral" />
```

---

## 3. Lectores de pantalla (WCAG 1.1.1, 4.1.2, 4.1.3)

### H-12: Iconos decorativos sin `aria-hidden`

- **Criterio:** 1.1.1 Contenido no textual
- **Severidad:** P3
- **Ubicacion:** Todos los archivos que usan iconos de lucide-react
- **Problema:** Los iconos de lucide-react no agregan `aria-hidden="true"` por defecto. Los lectores de pantalla pueden intentar leer el SVG.

**Afectados (ejemplos):**
- `Pila.tsx` linea 349: `<FileSpreadsheet className="h-4 w-4" />`
- `MedicalExams.tsx` linea 229: `<Search className="..." />`
- `Login.tsx` linea 96: `<Building2 className="..." />`

**Recomendado:** Agregar `aria-hidden="true"` a todos los iconos decorativos:
```tsx
<FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
```

Nota: lucide-react v0.300+ agrega `aria-hidden` automaticamente. Verificar la version instalada. Si es anterior, aplicar manualmente.

---

### H-13: Toasts de `sonner` sin region `aria-live`

- **Criterio:** 4.1.3 Mensajes de estado
- **Severidad:** P1
- **Ubicacion:** Global — usado en todos los archivos
- **Problema:** La libreria `sonner` (Toaster) debe estar configurada con `role` y region `aria-live` para que los lectores de pantalla anuncien las notificaciones. Verificar que el componente `<Toaster>` incluya estas propiedades.

**Recomendado:** En el punto donde se monta `<Toaster>` (probablemente `App.tsx` o `main.tsx`):
```tsx
<Toaster
  position="top-right"
  toastOptions={{
    role: "status",
  }}
/>
```
Sonner ya incluye `aria-live="polite"` por defecto. Verificar que no se haya sobreescrito.

---

### H-14: Logo en Login sin `alt` descriptivo suficiente

- **Criterio:** 1.1.1 Contenido no textual
- **Severidad:** P3
- **Ubicacion:** `Login.tsx` (linea 58, 82), `AppSidebar.tsx` (linea 54)
- **Problema:** El logo tiene `alt="Regis Colombia"` que es aceptable. Sin embargo, cuando el logo va acompanado del texto "Regis Colombia" inmediatamente al lado, el `alt` es redundante. En esos casos, el logo deberia tener `alt=""` para evitar duplicacion en lectores de pantalla.

**Recomendado (cuando el texto aparece junto al logo):**
```tsx
<img src={logo} alt="" className="h-10 w-10 rounded-md object-cover" />
```

---

### H-15: Tabla PILA sin `<caption>` ni `aria-label`

- **Criterio:** 1.3.1 Informacion y relaciones
- **Severidad:** P2
- **Ubicacion:** `Pila.tsx` (linea 352), `MedicalExams.tsx` (linea 244), `Documents.tsx` (linea 605), `Workers.tsx` (linea 504)
- **Problema:** Las tablas no tienen `<caption>` ni `aria-label` para que los lectores de pantalla identifiquen su proposito.

**Recomendado:**
```tsx
<Table aria-label="Registros PILA por empresa y periodo">
```
o agregar un `<caption>` dentro del `<Table>`:
```tsx
<caption className="sr-only">Registros PILA por empresa y periodo</caption>
```

---

### H-16: Contenido cargando sin anuncio accesible

- **Criterio:** 4.1.3 Mensajes de estado
- **Severidad:** P2
- **Ubicacion:** `Documents.tsx` (linea 593), `Workers.tsx` (linea 518)
- **Problema:** Los spinners de carga (`Loader2 className="animate-spin"`) no anuncian a los lectores de pantalla que el contenido esta cargando.

**Actual:**
```tsx
<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
<span className="ml-2 text-muted-foreground">Cargando documentos...</span>
```

**Recomendado:**
```tsx
<div role="status" aria-live="polite">
  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
  <span className="ml-2 text-muted-foreground">Cargando documentos...</span>
</div>
```

---

### H-17: Badge contador de alertas inaccesible

- **Criterio:** 4.1.2 Nombre/Rol/Valor
- **Severidad:** P2
- **Ubicacion:** `AppHeader.tsx` (lineas 108-115)
- **Problema:** El badge numerico sobre el icono de campana no es leido por lectores de pantalla ya que es un `<span>` posicionado absolutamente sin texto alternativo.

**Recomendado:** Resolver con `aria-label` en el boton padre (ver H-10) y marcar el badge como `aria-hidden="true"`.

---

## 4. Formularios (WCAG 1.3.1, 3.3.1, 3.3.2)

### H-18: Labels no asociados con htmlFor/id

- **Criterio:** 1.3.1 Informacion y relaciones, 3.3.2 Etiquetas o instrucciones
- **Severidad:** P1
- **Ubicacion:** `Pila.tsx` (lineas 241-243), `MedicalExams.tsx` (lineas 138-139), `Committees.tsx` (lineas 178-180, 189, 200), `Documents.tsx` (lineas 423-425, 442-443, 459), `Workers.tsx` (lineas 592-613)
- **Problema:** Multiples `<Label>` no tienen `htmlFor` y los `<Input>`/`<Select>` correspondientes no tienen `id`. Esto rompe la asociacion entre etiqueta y campo.

**Actual (ejemplo de Pila.tsx):**
```tsx
<Label>Empresa</Label>
<Select value={uploadEmpresa} onValueChange={setUploadEmpresa}>
  <SelectTrigger><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
```

**Recomendado:**
```tsx
<Label htmlFor="upload-empresa">Empresa</Label>
<Select value={uploadEmpresa} onValueChange={setUploadEmpresa}>
  <SelectTrigger id="upload-empresa"><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
```

**Archivos que SI implementan htmlFor correctamente:** `Login.tsx` (lineas 94, 112, 135) — buen ejemplo a seguir.

---

### H-19: Mensajes de error no vinculados con `aria-describedby`

- **Criterio:** 3.3.1 Identificacion de errores
- **Severidad:** P1
- **Ubicacion:** `Login.tsx` (lineas 107, 130)
- **Problema:** Los mensajes de error aparecen visualmente debajo del campo, y el campo tiene `aria-invalid`, pero falta `aria-describedby` para vincular el mensaje de error con el campo.

**Actual:**
```tsx
<Input id="nit" aria-invalid={!!errors.nit} ... />
{errors.nit && <p className="text-xs text-destructive">{errors.nit}</p>}
```

**Recomendado:**
```tsx
<Input id="nit" aria-invalid={!!errors.nit} aria-describedby={errors.nit ? "nit-error" : undefined} ... />
{errors.nit && <p id="nit-error" className="text-xs text-destructive" role="alert">{errors.nit}</p>}
```

---

### H-20: Campos obligatorios sin indicador accesible

- **Criterio:** 3.3.2 Etiquetas o instrucciones
- **Severidad:** P2
- **Ubicacion:** `Workers.tsx` (lineas 592-598)
- **Problema:** Los campos obligatorios se marcan con un asterisco visual (`Nombre completo *`) pero no hay `aria-required="true"` en el input.

**Actual:**
```tsx
<Label>Nombre completo *</Label>
<Input value={form.nombre} onChange={...} placeholder="Juan Perez" />
```

**Recomendado:**
```tsx
<Label htmlFor="worker-nombre">Nombre completo <span aria-hidden="true">*</span></Label>
<Input id="worker-nombre" value={form.nombre} onChange={...} placeholder="Juan Perez" aria-required="true" />
```

---

### H-21: Inputs de busqueda sin label

- **Criterio:** 1.3.1 Informacion y relaciones
- **Severidad:** P2
- **Ubicacion:** `MedicalExams.tsx` (linea 231), `Workers.tsx` (linea 476)
- **Problema:** Los campos de busqueda usan un icono y placeholder pero no tienen `<Label>` ni `aria-label`.

**Actual:**
```tsx
<Search className="absolute left-2.5 top-2.5 ..." />
<Input placeholder="Buscar por nombre o cedula..." ... className="pl-8" />
```

**Recomendado:**
```tsx
<Search className="absolute left-2.5 top-2.5 ..." aria-hidden="true" />
<Input placeholder="Buscar por nombre o cedula..." aria-label="Buscar examenes" ... className="pl-8" />
```

---

## 5. Jerarquia de encabezados (WCAG 1.3.1)

### H-22: Login tiene `h1` oculto en desktop y `h2` visible

- **Criterio:** 1.3.1 Informacion y relaciones
- **Severidad:** P3
- **Ubicacion:** `Login.tsx` (lineas 65, 86)
- **Problema:** En desktop, el panel izquierdo tiene un `<h1>` con la descripcion del producto. El panel derecho usa `<h2>` para "Iniciar sesion". En mobile, el `<h1>` se oculta con `hidden lg:flex`, dejando la pagina sin `<h1>` visible.

**Recomendado:** Cambiar "Iniciar sesion" a `<h1>` en el panel derecho y el texto del panel izquierdo a un `<p>` o un encabezado de nivel inferior:
```tsx
<h1 className="text-2xl font-semibold text-foreground">Iniciar sesion</h1>
```

---

### H-23: UploadPila tiene `h1` y `h2` inconsistentes

- **Criterio:** 1.3.1 Informacion y relaciones
- **Severidad:** P3
- **Ubicacion:** `UploadPila.tsx` (linea 139)
- **Problema:** "Regis Colombia" es `<h1>` y los estados de error/exito usan `<h2>`. Esto es correcto estructuralmente. Sin embargo, el `<h1>` es el nombre de la empresa, no el titulo de la pagina. Seria mas semantico que "Cargar Planilla PILA" sea el `<h1>`.

---

### H-24: PageHeader usa `h1` correctamente

- **Criterio:** 1.3.1 Informacion y relaciones
- **Severidad:** Informativo (OK)
- **Ubicacion:** `PageHeader.tsx` (linea 15)
- **Estado:** CONFORME. `PageHeader` renderiza un `<h1>` y cada pagina tiene exactamente una instancia de `PageHeader`.

---

## 6. Foco visible (WCAG 2.4.7)

### H-25: Botones `variant="ghost"` sin foco visible personalizado

- **Criterio:** 2.4.7 Foco visible
- **Severidad:** P2
- **Ubicacion:** Global — todos los `Button variant="ghost"` y `variant="outline"`
- **Problema:** Los botones ghost de shadcn/ui dependen del `focus-visible:ring` de Tailwind. Si el CSS del proyecto sobreescribe o no incluye `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, el foco puede ser invisible.

**Recomendado:** Verificar en `globals.css` que exista:
```css
@layer base {
  *:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
}
```

---

### H-26: Links en tabla PILA sin indicador de foco

- **Criterio:** 2.4.7 Foco visible
- **Severidad:** P3
- **Ubicacion:** `Pila.tsx` (linea 398)
- **Problema:** Los enlaces "Ver archivo" usan `className="text-primary text-xs hover:underline"` pero no definen estilos de foco explicitos.

**Recomendado:**
```tsx
<a href={r.archivo_url} target="_blank" rel="noopener noreferrer"
   className="text-primary text-xs hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 rounded">
  Ver archivo
</a>
```

---

### H-27: Toggle de vista Admin/Cliente sin foco visible

- **Criterio:** 2.4.7 Foco visible
- **Severidad:** P3
- **Ubicacion:** `AppHeader.tsx` (lineas 91-99)
- **Problema:** Los botones del toggle no tienen clases de foco visible.

**Recomendado:** Agregar `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1` a las clases.

---

### H-28: `<main>` sin `id` ni landmark role explicito

- **Criterio:** 1.3.1 Informacion y relaciones, 2.4.1 Evitar bloques
- **Severidad:** P3
- **Ubicacion:** `AppLayout.tsx` (linea 14)
- **Problema:** El elemento `<main>` es correcto semanticamente, pero no tiene un `id` para enlaces "skip to content" ni un `aria-label`.

**Actual:**
```tsx
<main className="flex-1 p-6 lg:p-8">
  <Outlet />
</main>
```

**Recomendado:**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
  Ir al contenido principal
</a>
{/* ... sidebar, header ... */}
<main id="main-content" className="flex-1 p-6 lg:p-8" aria-label="Contenido principal">
  <Outlet />
</main>
```

---

## Resumen de acciones prioritarias

### Acciones inmediatas (P1 — bloquean accesibilidad)

| # | Hallazgo | Esfuerzo estimado |
|---|----------|-------------------|
| H-02 | Agregar iconos a badges de estado en Documents y MedicalExams | 30 min |
| H-07 | Hacer dropzone de Workers accesible por teclado | 15 min |
| H-09 | Agregar `aria-label` a botones icon-only | 30 min |
| H-10 | Agregar `aria-label` al boton de notificaciones | 5 min |
| H-13 | Verificar configuracion de `sonner` Toaster | 10 min |
| H-18 | Asociar Labels con htmlFor/id en formularios | 1 hora |
| H-19 | Vincular errores con `aria-describedby` en Login | 15 min |
| H-01 | Verificar/ajustar ratio de contraste de `--muted-foreground` | 15 min |

### Acciones importantes (P2)

| # | Hallazgo | Esfuerzo estimado |
|---|----------|-------------------|
| H-03 | Texto alternativo para indicadores de severidad | 10 min |
| H-04 | Aumentar tamano minimo de badges a 12px | 20 min |
| H-05 | Corregir contraste del verde WhatsApp | 5 min |
| H-06 | Agregar roles ARIA al toggle Admin/Cliente | 15 min |
| H-08 | Corregir labels de checkboxes de asistencia | 20 min |
| H-11 | Agregar `aria-label` al SidebarTrigger | 5 min |
| H-15 | Agregar `aria-label` a tablas | 15 min |
| H-16 | Agregar `role="status"` a spinners de carga | 10 min |
| H-17 | Marcar badge de contador como `aria-hidden` | 5 min |
| H-20 | Agregar `aria-required` a campos obligatorios | 15 min |
| H-21 | Agregar `aria-label` a campos de busqueda | 10 min |
| H-25 | Verificar estilos globales de foco visible | 15 min |

### Mejoras (P3)

| # | Hallazgo | Esfuerzo estimado |
|---|----------|-------------------|
| H-12 | Agregar `aria-hidden` a iconos decorativos | Variable |
| H-14 | Ajustar alt redundante en logos | 10 min |
| H-22 | Corregir jerarquia h1/h2 en Login | 5 min |
| H-23 | Ajustar encabezados en UploadPila | 5 min |
| H-26 | Agregar foco visible a enlaces de tabla | 10 min |
| H-27 | Agregar foco visible al toggle | 5 min |
| H-28 | Agregar skip-to-content link | 15 min |

---

## Elementos conformes (lo que se hace bien)

1. `Login.tsx` usa `htmlFor`/`id` correctamente en campos de formulario y `aria-invalid` en inputs con error.
2. `PageHeader.tsx` garantiza un `<h1>` por pagina.
3. `FileDropzone.tsx` usa un `<button>` semantico en lugar de un `<div>`.
4. El sidebar usa componentes Radix que manejan roles ARIA internamente.
5. Los dialogs/modals usan `Dialog`/`AlertDialog` de Radix, que incluyen trap de foco y roles correctos.
6. El logo tiene `alt` text descriptivo.
7. Los formularios del Login usan `autoComplete` apropiado (`username`, `current-password`).
8. `UploadPila.tsx` funciona sin autenticacion — buena decision de accesibilidad para usuarios externos.
