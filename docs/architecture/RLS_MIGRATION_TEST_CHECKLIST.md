# Checklist de Verificación Post-Aplicación — RLS Migration 006

**Fecha de creación:** 2026-05-21  
**Migración:** `006_rls_tenant_isolation_DRAFT.sql`  
**Prerequisito:** Tener al menos 2 usuarios en la tabla `usuarios`:
- Admin Regis (rol=admin, empresa_id=NULL)
- Cliente empresa (rol=cliente, empresa_id=UUID de alguna empresa)

---

## Test 1 — Admin Regis (admin@regiscolombia.com o equivalente)

- [ ] Login funciona correctamente
- [ ] Dashboard muestra las 3 empresas (Construandes, DevCo, Sabor Criollo)
- [ ] Página Trabajadores: muestra trabajadores de CUALQUIER empresa
- [ ] Página Exámenes Médicos: muestra exámenes de CUALQUIER empresa
- [ ] Página PILA: muestra registros PILA de CUALQUIER empresa
- [ ] Página Matrices de Riesgo: muestra matrices de CUALQUIER empresa
- [ ] Página Comités: muestra comités y actas de CUALQUIER empresa
- [ ] Página Planes de Emergencia: ve planes de CUALQUIER empresa
- [ ] Página Inventario Equipos: ve equipos de CUALQUIER empresa
- [ ] Página Cumplimiento: ve scoring de CUALQUIER empresa
- [ ] Página Documents: ve documentos de CUALQUIER empresa
- [ ] Puede CREAR un nuevo registro (ej: agregar trabajador a Construandes)
- [ ] Puede EDITAR un registro existente
- [ ] Puede BORRAR un registro (ej: eliminar trabajador de prueba)
- [ ] Página Configuración del Sistema: puede ver y editar settings
- [ ] Página Templates: puede ver y editar templates de email
- [ ] Página Log de Actividad: muestra logs de TODAS las empresas

## Test 2 — Consultor Regis (si existe, o crear uno)

- [ ] Login funciona correctamente
- [ ] Dashboard muestra las 3 empresas (mismo acceso que admin)
- [ ] Puede ver trabajadores de CUALQUIER empresa
- [ ] Puede ver exámenes de CUALQUIER empresa
- [ ] Puede CREAR registros en cualquier empresa
- [ ] Puede EDITAR registros de cualquier empresa
- [ ] NO puede BORRAR registros (solo admin borra)
- [ ] Puede ver Configuración del Sistema (lectura)
- [ ] NO puede modificar Configuración del Sistema (solo admin)
- [ ] Puede ver Templates (lectura)

## Test 3 — Cliente Empresa (ej: admin@saborcriollo.com)

- [ ] Login funciona correctamente
- [ ] Dashboard muestra SOLO su empresa (Sabor Criollo)
- [ ] **NO ve** trabajadores de DevCo ni Construandes
- [ ] **NO ve** exámenes médicos de otras empresas
- [ ] **NO ve** registros PILA de otras empresas
- [ ] **NO ve** matrices de riesgo de otras empresas
- [ ] **NO ve** comités ni actas de otras empresas
- [ ] **NO ve** planes de emergencia de otras empresas
- [ ] **NO ve** equipos de otras empresas
- [ ] **NO ve** documentos de otras empresas
- [ ] Puede ver SUS propios datos (su empresa)
- [ ] Puede subir documentos A SU empresa
- [ ] Puede ver su propio perfil de usuario
- [ ] **NO puede** acceder a Configuración del Sistema
- [ ] **NO puede** acceder a Templates
- [ ] **NO puede** crear nuevos usuarios
- [ ] Los logs muestran solo actividad de SU empresa

## Test 4 — Flujo Público UploadPila (sin autenticación)

- [ ] Desde el panel admin, generar un link de upload PILA para una empresa
- [ ] Copiar la URL con token (ejemplo: /upload-pila?t=eyJ...)
- [ ] Abrir en ventana de incógnito (SIN login, SIN sesión)
- [ ] La página carga correctamente y muestra nombre de empresa + periodo
- [ ] Seleccionar un PDF y hacer click en "Subir"
- [ ] El archivo se sube correctamente (mensaje de éxito)
- [ ] Verificar en el panel admin que el registro PILA se actualizó
- [ ] Verificar que se creó una entrada en logs_actividad

## Test 5 — Edge Functions (usan service_role, bypasean RLS)

- [ ] `process-exam-pdf`: subir un PDF de examen médico → extracción funciona
- [ ] `generate-acta`: generar un acta de comité → contenido generado
- [ ] `transcribe-audio`: procesar un audio → transcripción + análisis
- [ ] `send-pila-reminder`: ejecutar reminder → email enviado
- [ ] `send-whatsapp-reminder`: ejecutar reminder → WhatsApp enviado
- [ ] `generate-bitacora`: generar bitácora mensual → reporte OK
- [ ] `weekly-summary`: generar resumen semanal → reporte OK

## Test 6 — Casos Negativos (CRÍTICOS)

- [ ] **Cross-tenant via API:** Logueado como cliente Sabor Criollo, abrir DevTools → Console, ejecutar:
  ```javascript
  // Intentar leer trabajadores de otra empresa
  const { data, error } = await supabase
    .from('trabajadores')
    .select('*')
    .eq('empresa_id', 'UUID_DE_OTRA_EMPRESA');
  console.log('data:', data, 'error:', error);
  // Esperado: data = [] (array vacío), error = null
  ```
- [ ] **Cross-tenant INSERT:** Intentar insertar un trabajador en otra empresa:
  ```javascript
  const { error } = await supabase
    .from('trabajadores')
    .insert({ empresa_id: 'UUID_DE_OTRA_EMPRESA', nombre: 'Test', cedula: '999' });
  console.log('error:', error);
  // Esperado: error con policy violation
  ```
- [ ] **Anon access sin token:** Abrir en incógnito sin ir a /upload-pila, intentar:
  ```javascript
  // Usando fetch directo al endpoint REST de Supabase
  fetch('https://nrtjizkeopxhpmjxxnjk.supabase.co/rest/v1/empresas_cliente', {
    headers: { 'apikey': 'ANON_KEY', 'Content-Type': 'application/json' }
  }).then(r => r.json()).then(console.log);
  // Esperado: [] (array vacío) — anon no tiene policy en empresas_cliente
  ```
- [ ] **DELETE como cliente:** Intentar borrar un registro como rol cliente:
  ```javascript
  const { error } = await supabase
    .from('trabajadores')
    .delete()
    .eq('id', 'UUID_DE_TRABAJADOR_PROPIO');
  console.log('error:', error);
  // Esperado: error (solo admin puede borrar)
  ```

## Test 7 — Performance

- [ ] Las páginas cargan en tiempo razonable (<3 segundos)
- [ ] No hay errores en la consola del navegador
- [ ] El selector de empresa (para admin) funciona correctamente
- [ ] Filtrar por empresa en Dashboard no genera errores

---

## Resultado

| Test | Estado | Notas |
|------|--------|-------|
| 1 - Admin Regis | ⬜ | |
| 2 - Consultor | ⬜ | |
| 3 - Cliente | ⬜ | |
| 4 - UploadPila público | ⬜ | |
| 5 - Edge Functions | ⬜ | |
| 6 - Casos negativos | ⬜ | |
| 7 - Performance | ⬜ | |

**Decisión:** ⬜ APROBADO — renombrar archivos quitando _DRAFT | ⬜ RECHAZADO — ejecutar ROLLBACK

**Si RECHAZADO, ejecutar inmediatamente:**
```sql
-- Copiar contenido de 006_rls_tenant_isolation_ROLLBACK.sql
-- Pegar en Supabase Dashboard → SQL Editor → Run
```
