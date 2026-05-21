# Auditoría de Rendimiento — Regis SG-SST

**Fecha:** 2026-05-21  
**Método:** Análisis estático de código (sin ejecución)  
**Alcance:** Bundle size, lazy loading, patrones de queries, re-renders, imágenes

---

## Resumen ejecutivo

| Categoría | Hallazgos P1 | Hallazgos P2 | Hallazgos P3 |
|-----------|:---:|:---:|:---:|
| Bundle size | 2 | 3 | 2 |
| Lazy loading | 0 | 1 | 1 |
| Queries a Supabase | 2 | 3 | 2 |
| Re-renders | 1 | 2 | 1 |
| Imágenes | 0 | 0 | 1 |
| **Total** | **5** | **9** | **7** |

---

## 1. Bundle Size

### P1-BUNDLE-01: `xlsx` se importa estáticamente en Workers.tsx y Companies.tsx (~900 KB gzipped)

**Archivo:** `src/pages/Workers.tsx:21`, `src/pages/Companies.tsx:21`  
**Problema:** `import * as XLSX from "xlsx"` importa la totalidad de la librería SheetJS (~900 KB min+gzip). Es la dependencia más pesada del proyecto y solo se usa para importar/exportar CSV/Excel, una acción poco frecuente.  
**Solución:**
```typescript
// Reemplazar importación estática:
// import * as XLSX from "xlsx";

// Con importación dinámica dentro del handler:
const handleExport = async () => {
  const XLSX = await import("xlsx");
  // ... usar XLSX
};
```
**Impacto estimado:** Reducción de ~900 KB del chunk principal. La funcionalidad se carga solo cuando el usuario hace clic en "Exportar".

### P1-BUNDLE-02: `recharts` incluido pero NO utilizado (~450 KB gzipped)

**Archivo:** `package.json:61`, `src/components/ui/chart.tsx`  
**Problema:** `recharts` (v2.15.4) está en `dependencies` y se importa en `chart.tsx`, pero ninguna página ni componente del dashboard importa `chart.tsx`. El AdminDashboard usa barras CSS manuales en vez de recharts. Es decir, ~450 KB de código muerto en el bundle.  
**Solución:** Eliminar `recharts` de `package.json` y borrar `src/components/ui/chart.tsx`, o si se planea usarlo en el futuro, hacer import dinámico cuando se necesite.  
**Impacto estimado:** Reducción de ~450 KB del bundle total.

### P2-BUNDLE-03: `papaparse` duplica funcionalidad con `xlsx`

**Archivo:** `src/pages/Workers.tsx:20`, `src/pages/Companies.tsx:20`  
**Problema:** Ambas librerías (`papaparse` ~40 KB + `xlsx` ~900 KB) se importan en los mismos archivos. `xlsx` ya puede parsear CSV. Tener ambas es redundante.  
**Solución:** Usar solo `xlsx` para CSV y Excel, o solo `papaparse` para CSV (mucho más liviano) y `xlsx` solo para .xlsx. En cualquier caso, ambas deben ser importadas dinámicamente.  
**Impacto estimado:** Reducción de ~40 KB si se elimina papaparse.

### P2-BUNDLE-04: Componentes shadcn/ui instalados pero nunca usados

**Archivos:** `src/components/ui/carousel.tsx`, `resizable.tsx`, `drawer.tsx`, `input-otp.tsx`  
**Problema:** Estos componentes UI están instalados junto con sus dependencias (`embla-carousel-react`, `react-resizable-panels`, `vaul`, `input-otp`) pero no se importan desde ninguna página del proyecto. Vite debería hacer tree-shaking si no se importan, pero las dependencias siguen en `node_modules` y `package.json`, aumentando el tiempo de `npm install`.  
**Solución:** Eliminar de `package.json` las dependencias: `embla-carousel-react`, `react-resizable-panels`, `vaul`, `input-otp`. Borrar los archivos `.tsx` correspondientes en `src/components/ui/`.  
**Impacto estimado:** Reducción de ~80 KB en el bundle (si Vite no los elimina completamente) + instalación de dependencias más rápida.

### P2-BUNDLE-05: `next-themes` usado solo en sonner.tsx

**Archivo:** `src/components/ui/sonner.tsx:1`  
**Problema:** `next-themes` (~8 KB) se importa solo para obtener el tema en el componente Sonner. Esta librería está diseñada para Next.js, no para Vite+React. Funciona pero agrega peso innecesario.  
**Solución:** Reemplazar `useTheme()` de `next-themes` con un hook propio que lea la clase `dark`/`light` del `<html>` o pase el tema como prop.  
**Impacto estimado:** Reducción de ~8 KB + eliminación de dependencia diseñada para otro framework.

### P3-BUNDLE-06: `lucide-react` importa iconos individuales (correcto)

**Archivo:** Múltiples páginas  
**Observación:** El proyecto importa iconos individualmente (`import { Loader2, Send } from "lucide-react"`), lo cual es correcto y permite tree-shaking. Sin embargo, la versión usada (0.462.0) incluye 1400+ iconos — verificar que el tree-shaking funciona correctamente en el build.  
**Acción:** Ejecutar `npm run build` y verificar que el chunk de lucide no exceda ~50 KB.

### P3-BUNDLE-07: `date-fns` se usa correctamente (tree-shakeable)

**Observación:** `date-fns` v3 es tree-shakeable por defecto. El proyecto no usa `lodash` ni `moment.js`. Esto es correcto y no requiere acción.

---

## 2. Lazy Loading

### P2-LAZY-01: Dashboard se carga estáticamente (debería ser lazy)

**Archivo:** `src/App.tsx:16`  
**Problema:** `import Dashboard from "./pages/Dashboard"` se carga de forma estática (eagerly). El comentario dice "first-paint critical", pero el Dashboard solo se muestra después del login, detrás de `<ProtectedRoute>`. El Login sí es first-paint critical, pero el Dashboard no.  
**Solución:**
```typescript
// Cambiar de:
import Dashboard from "./pages/Dashboard";
// A:
const Dashboard = lazy(() => import("./pages/Dashboard"));
```
**Impacto estimado:** El AdminDashboard importa `OnboardingChecklist` y hace múltiples queries; diferir su carga reduce el JS del bundle inicial en ~15-25 KB.

### P3-LAZY-02: Modales pesados dentro de páginas no usan lazy loading

**Archivos:** `src/pages/Workers.tsx`, `src/pages/Companies.tsx`  
**Problema:** Los diálogos de importación CSV/Excel (que usan `xlsx` y `papaparse`) están inline en la página. Si se aplica P1-BUNDLE-01 (import dinámico de xlsx), este problema se resuelve automáticamente.  
**Solución:** Ya cubierta por P1-BUNDLE-01.

---

## 3. Patrones de Queries

### P1-QUERY-01: N+1 en `pilaService.syncPeriods()` — hasta 18 queries secuenciales

**Archivo:** `src/services/index.ts:179-203`  
**Problema:** Para cada empresa (3) x cada periodo (6) = 18 iteraciones, se ejecuta un SELECT individual (`.maybeSingle()`) seguido de un posible INSERT o UPDATE. Son potencialmente **36 queries secuenciales** en cada sincronización.  
**Solución:**
```typescript
// 1. Cargar todos los registros existentes en UNA sola query:
const { data: existing } = await supabase
  .from("pila_records")
  .select("id, estado, empresa_id, periodo")
  .in("empresa_id", targetEmpresas.map(e => e.id))
  .in("periodo", periods);

// 2. Construir un Map para lookup O(1)
const existingMap = new Map(existing.map(r => [`${r.empresa_id}-${r.periodo}`, r]));

// 3. Hacer batch insert de los faltantes y batch update de los vencidos
const toInsert = [];
const toUpdate = [];
for (const emp of targetEmpresas) {
  for (const periodo of periods) {
    const key = `${emp.id}-${periodo}`;
    const record = existingMap.get(key);
    if (!record) toInsert.push({ empresa_id: emp.id, periodo, estado: ... });
    else if (record.estado === "pendiente" && isOverdue(periodo)) toUpdate.push(record.id);
  }
}
if (toInsert.length) await supabase.from("pila_records").insert(toInsert);
if (toUpdate.length) await supabase.from("pila_records").update({ estado: "vencida" }).in("id", toUpdate);
```
**Impacto estimado:** De ~36 queries a **3 queries**. Tiempo de sincronización reducido de ~3-5 segundos a <500ms.

### P1-QUERY-02: Dashboard AdminDashboard dispara 7 queries por empresa en OnboardingChecklist

**Archivo:** `src/components/common/OnboardingChecklist.tsx:47-63`, `src/components/dashboard/AdminDashboard.tsx:278`  
**Problema:** El AdminDashboard renderiza `<OnboardingChecklist>` para **cada empresa**. Cada instancia dispara 7 queries COUNT. Con 3 empresas = **21 queries** solo para el checklist. Con 90 empresas (objetivo de escalabilidad) = **630 queries en el Dashboard**.  
**Solución:**
1. Crear un endpoint o servicio que retorne todos los conteos para todas las empresas en una sola query (usando `GROUP BY empresa_id` vía RPC o Edge Function).
2. Alternativamente, paginación: mostrar solo las top 5 empresas con menor progreso, con un "Ver todas" que cargue las demás.
3. Mínimo inmediato: crear una vista SQL `onboarding_progress` que materialice estos conteos.
**Impacto estimado:** De 21+ queries a 1 query. Crítico para escalar a 90 empresas.

### P2-QUERY-03: `alertsService.getAlerts()` ejecuta 6 queries sin límite

**Archivo:** `src/services/index.ts:732-853`  
**Problema:** La función `getAlerts()` ejecuta 6 queries separadas (pila vencidas, pila pendientes, exámenes, cumplimiento, equipos, actas). Ninguna tiene `.limit()` excepto `examenesRestr` (limit 20). Las queries de pila_records vencidas/pendientes pueden retornar cientos de registros con 90 empresas.  
**Solución:**
- Agregar `.limit(50)` a cada sub-query de alertas.
- Consolidar en una sola RPC/Vista SQL que retorne las alertas ya ordenadas y limitadas.
- Cachear el resultado con `@tanstack/react-query` (staleTime de 5 minutos).
**Impacto estimado:** Reducción de datos transferidos y tiempo de respuesta del Dashboard.

### P2-QUERY-04: 18 queries con `.select("*")` en services/index.ts

**Archivo:** `src/services/index.ts` (múltiples líneas)  
**Problema:** 18 queries usan `.select("*")` cuando típicamente solo se necesitan 3-5 columnas. Esto transfiere columnas como `metadata` (JSON grande), `contenido` (HTML largo de templates), etc.  
**Solución:** Reemplazar `.select("*")` con columnas específicas. Ejemplos:
```typescript
// empresasService.list():
.select("id, razon_social, nit, ciiu_codigo, ciudad, num_trabajadores, nivel_riesgo_arl, capitulo_0312, email_contacto, nombre_contacto, activo")

// trabajadoresService.listByEmpresa():
.select("id, nombre, cedula, cargo, fecha_ingreso, activo")
```
**Impacto estimado:** Reducción de 30-60% en datos transferidos por query.

### P2-QUERY-05: Compliance.tsx ejecuta 7 queries directas sin servicio

**Archivo:** `src/pages/Compliance.tsx:71-87`  
**Problema:** La página ejecuta 7 queries directas a Supabase en `loadCumplimientoData()`, violando la convención de usar `services/index.ts`. Además, estas queries se repiten con lógica similar a las de `OnboardingChecklist.tsx`.  
**Solución:** Mover a un `cumplimientoService.loadEvidenceStatus(empresaId)` centralizado que retorne los conteos de evidencia. Reutilizable entre Compliance y OnboardingChecklist.  
**Impacto estimado:** Código más mantenible + potencial reutilización que elimina queries duplicadas.

### P3-QUERY-06: `empresasService.list()` se llama múltiples veces sin caché

**Archivos:** `AdminDashboard.tsx:149`, `Pila.tsx:80`, `Compliance.tsx:46`  
**Problema:** Cada página que necesita la lista de empresas hace su propio `empresasService.list()`. No hay caché de React Query configurado para estas llamadas.  
**Solución:** Usar `@tanstack/react-query` (ya instalado) con `useQuery`:
```typescript
const { data: empresas } = useQuery({
  queryKey: ["empresas"],
  queryFn: empresasService.list,
  staleTime: 5 * 60 * 1000, // 5 minutos
});
```
**Impacto estimado:** Eliminación de llamadas redundantes al cambiar entre páginas.

### P3-QUERY-07: `QueryClient` sin configuración de caché

**Archivo:** `src/App.tsx:39`  
**Problema:** `const queryClient = new QueryClient()` usa los defaults de React Query (staleTime: 0, gcTime: 5 min). Esto significa que cada vez que un componente se monta, los datos se consideran "stale" y se re-fetcha.  
**Solución:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 10 * 60 * 1000,   // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
});
```
**Impacto estimado:** Reducción significativa de queries redundantes durante la navegación.

---

## 4. Re-renders

### P1-RENDER-01: `ViewModeProvider` crea nuevo objeto `value` en cada render

**Archivo:** `src/context/ViewModeContext.tsx:24-27`  
**Problema:** El objeto `value={{ mode, setMode, toggle: () => ... }}` crea una nueva función `toggle` y un nuevo objeto en cada render del provider. Esto causa re-render de todos los consumidores de `useViewMode()` aunque nada haya cambiado.  
**Solución:**
```typescript
import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";

export function ViewModeProvider({ children, user }: { ... }) {
  const [mode, setMode] = useState<ViewMode>("admin");

  useEffect(() => {
    if (user) setMode(user.role === "cliente" ? "client" : "admin");
  }, [user]);

  const toggle = useCallback(() => setMode(m => m === "admin" ? "client" : "admin"), []);
  const value = useMemo(() => ({ mode, setMode, toggle }), [mode, toggle]);

  return <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>;
}
```
**Impacto estimado:** Elimina re-renders cascada en todas las páginas que usan `useViewMode()`.

### P2-RENDER-02: `AuthProvider` crea nuevo objeto `value` en cada render

**Archivo:** `src/context/AuthContext.tsx:23-38`  
**Problema:** Similar a ViewModeProvider, el objeto `value` con funciones `login` y `logout` se recrea en cada render.  
**Solución:**
```typescript
const login = useCallback(async (nit: string, password: string) => {
  const u = await authService.login(nit, password);
  setUser(u);
  return u;
}, []);

const logout = useCallback(() => {
  authService.logout();
  setUser(null);
}, []);

const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
```
**Impacto estimado:** Reduce re-renders innecesarios en todos los componentes que usan `useAuth()`.

### P2-RENDER-03: AdminDashboard no usa `useMemo` ni `useCallback`

**Archivo:** `src/components/dashboard/AdminDashboard.tsx:141-165`  
**Problema:** El componente AdminDashboard no memoriza ningún cálculo. `totalWorkers` se recalcula en cada render. Las listas `complianceData` y `alerts` se procesan en los callbacks de `useEffect`, lo cual está bien, pero el componente no usa `useMemo` para derivaciones.  
**Solución:** Envolver `totalWorkers` en `useMemo`:
```typescript
const totalWorkers = useMemo(
  () => empresas.reduce((s, e) => s + e.num_trabajadores, 0),
  [empresas]
);
```
**Impacto estimado:** Menor (con pocas empresas el cálculo es trivial), pero buena práctica para escalar a 90 empresas.

### P3-RENDER-04: Inline objects en render de tablas (Pila, Compliance)

**Archivo:** `src/pages/Pila.tsx:282-333`, `src/pages/Compliance.tsx:308-321`  
**Problema:** Arrays de objetos de configuración (`statusIcon`, `statusColor`) se definen fuera del componente (correcto en Pila.tsx). Sin embargo, en Compliance.tsx línea 308, se crea un array inline dentro del JSX en cada render.  
**Solución:** Mover arrays de configuración estáticos a constantes fuera del componente.  
**Impacto estimado:** Marginal, pero evita creación de objetos innecesarios.

---

## 5. Imágenes

### P3-IMG-01: Logo en formato JPEG, sin lazy loading

**Archivo:** `src/assets/regis-logo.jpeg` (4 KB)  
**Problema:** El logo es de 4 KB, lo cual es bastante liviano. Sin embargo, está en formato JPEG en vez de WebP/SVG. Además, el tag `<img>` en el sidebar no usa `loading="lazy"`.  
**Solución:**
- Convertir a WebP o SVG para mejor calidad a menor peso.
- Agregar `loading="lazy"` al `<img>` en `AppSidebar.tsx:54`.
- El impacto es mínimo porque el archivo ya es de 4 KB.
**Impacto estimado:** Negligible en rendimiento, mejora en buenas prácticas.

---

## 6. Configuración de Vite

### P2-VITE-01: Sin configuración de code-splitting manual

**Archivo:** `vite.config.ts`  
**Problema:** No hay configuración de `build.rollupOptions.output.manualChunks`. Vite genera chunks automáticos, pero agrupar vendors pesados mejora el caching del navegador.  
**Solución:**
```typescript
export default defineConfig(({ mode }) => ({
  // ...existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs', '@radix-ui/react-popover'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
}));
```
**Impacto estimado:** Mejor cache hit rate en deploys sucesivos. Los vendors cambian menos que el código de la app.

---

## 7. Resumen de acciones prioritarias

### Acciones inmediatas (antes del demo)

| # | Acción | Archivos | Impacto |
|---|--------|----------|---------|
| 1 | Eliminar `recharts` de package.json | `package.json`, `src/components/ui/chart.tsx` | -450 KB |
| 2 | Import dinámico de `xlsx` | `Workers.tsx`, `Companies.tsx` | -900 KB del chunk inicial |
| 3 | Corregir N+1 en `syncPeriods()` | `services/index.ts` | 36 queries -> 3 |
| 4 | Memorizar `value` en ViewModeProvider y AuthProvider | `ViewModeContext.tsx`, `AuthContext.tsx` | Elimina re-renders cascada |

### Acciones a corto plazo (post-demo)

| # | Acción | Impacto |
|---|--------|---------|
| 5 | Consolidar OnboardingChecklist en 1 query por RPC | Crítico para 90 empresas |
| 6 | Configurar `staleTime` en QueryClient | Menos queries redundantes |
| 7 | Agregar `.limit()` a queries de alertas | Menos datos transferidos |
| 8 | Reemplazar `.select("*")` por columnas específicas | -30-60% transferencia |
| 9 | Lazy load de Dashboard | -15-25 KB del bundle inicial |
| 10 | Configurar `manualChunks` en Vite | Mejor caching de navegador |

### Estimación de impacto total

- **Bundle size inicial:** Reducción estimada de ~1.35 MB (recharts + xlsx dinámico + dependencias no usadas)
- **Queries del Dashboard:** De ~30+ queries a ~5-8 queries
- **Re-renders:** Eliminación de cascadas por context providers
- **Escalabilidad a 90 empresas:** Requiere las acciones 5 y 7 como mínimo

---

## 8. Dependencias a eliminar

```bash
npm uninstall recharts embla-carousel-react react-resizable-panels vaul input-otp next-themes
```

Archivos a eliminar:
- `src/components/ui/chart.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/resizable.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/input-otp.tsx`

> **Nota:** Antes de eliminar `next-themes`, reemplazar su uso en `src/components/ui/sonner.tsx` con un hook propio o prop directa.
