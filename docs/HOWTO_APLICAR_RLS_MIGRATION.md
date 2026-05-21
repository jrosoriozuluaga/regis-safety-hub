# Cómo Aplicar la Migración RLS (005 + 006)

**Fecha:** 2026-05-21  
**Autor:** Equipo de desarrollo  
**Criticidad:** ALTA — Cambio de seguridad en producción

---

## Prerequisitos

1. Acceso al Supabase Dashboard con permisos de admin
2. Al menos 1 usuario admin en la tabla `usuarios` con `auth_user_id` vinculado a `auth.users`
3. Leer y entender los archivos:
   - `supabase/migrations/005_bucket_security_DRAFT.sql`
   - `supabase/migrations/006_rls_tenant_isolation_DRAFT.sql`
   - `supabase/migrations/006_rls_tenant_isolation_ROLLBACK.sql`
   - `docs/RLS_MIGRATION_TEST_CHECKLIST.md`

---

## Recomendación: Aplicar 005 y 006 POR SEPARADO

**005 primero, testear, luego 006.** Razones:
- 005 cambia el bucket a privado + agrega policies de Storage. Si algo falla, el impacto es solo en descarga de archivos (se puede revertir cambiando el bucket a público).
- 006 cambia TODAS las policies de TODAS las tablas. Si algo falla, la app entera puede dejar de funcionar. El rollback es más complejo.
- Aplicar ambas juntas hace difícil diagnosticar cuál causó el problema.

**Tiempo estimado:** 005 → 15 min + tests. 006 → 30 min + tests completos.

---

## Paso 0 — Backup

1. Ir a **Supabase Dashboard** → **Database** → **Backups**
2. Click en **Trigger a manual backup** (o verificar que hay un backup reciente)
3. Esperar que termine (1-3 minutos)
4. Anotar la hora del backup: `__________`

---

## Paso 1 — Verificar estado actual

Abrir **SQL Editor** en Supabase Dashboard y ejecutar:

```sql
-- Verificar que la tabla usuarios tiene datos correctos
SELECT id, email, rol, empresa_id, auth_user_id 
FROM usuarios 
ORDER BY rol;
```

**Verificar:**
- [ ] Hay al menos 1 admin con `empresa_id IS NULL`
- [ ] Los `auth_user_id` no son NULL (están vinculados a auth.users)
- [ ] Si hay clientes, tienen `empresa_id` válido

Si `auth_user_id` es NULL para algún usuario, la migración NO funcionará para ese usuario. Vincular primero.

---

## Paso 2 — Aplicar migración 005 (Storage)

1. Abrir `supabase/migrations/005_bucket_security_DRAFT.sql`
2. En SQL Editor, ejecutar **bloque por bloque**:
   - **Bloque 1:** Helper functions (`get_user_empresa_id`, `get_user_role`)
   - **Bloque 2:** `UPDATE storage.buckets SET public = false` — ⚠️ DESPUÉS DE ESTO, las URLs directas dejan de funcionar
   - **Bloque 3:** Policies en `storage.objects` (8 policies)

3. Verificar después de cada bloque que no hay errores

### Tests post-005:
- [ ] Login funciona
- [ ] Subir un documento desde Documents.tsx → funciona
- [ ] Descargar un documento existente → **PUEDE FALLAR** si el frontend usa URLs directas en vez de signed URLs
- [ ] Si falla la descarga: el frontend necesita migrar a `createSignedUrl()` (tarea separada del plan)
- [ ] UploadPila: subir un PILA en incógnito → funciona (policy anon en pila/ prefix)

**Si algo falla:** ejecutar la sección ROLLBACK al final de 005 (está comentada).

---

## Paso 3 — Aplicar migración 006 (Tenant isolation)

⚠️ **SOLO después de que 005 esté funcionando correctamente.**

1. Abrir `supabase/migrations/006_rls_tenant_isolation_DRAFT.sql`
2. Ejecutar en SQL Editor, **un bloque a la vez**:

   | Bloque | Descripción | Riesgo |
   |--------|-------------|--------|
   | 1 | Helper functions (`auth.current_empresa_id`, `auth.is_regis_admin`, `auth.is_regis_staff`) | Bajo — solo crea funciones |
   | 2 | DROP de todas las policies existentes | ⚠️ ALTO — durante los segundos entre DROP y CREATE, la app no tiene policies. Ejecutar bloques 2 y 3 lo más rápido posible. |
   | 3 | Nuevas policies tenant-scoped (tablas con empresa_id directo) | Medio — si una policy tiene error, esa tabla queda sin acceso |
   | 4 | Policies via JOIN (tablas sin empresa_id directo) | Medio — JOINs más complejos, posible error de sintaxis |
   | 5 | Special cases (usuarios, config, templates, logs) | Medio |
   | 7 | Indexes de performance | Bajo |

3. **IMPORTANTE:** Entre el bloque 2 (DROP) y los bloques 3-5 (CREATE), la app estará rota. Ejecutar lo más rápido posible. Si es posible, copiar bloques 2+3+4+5 juntos y ejecutarlos en una sola operación.

### Tests post-006:
- Ejecutar TODA la checklist en `docs/RLS_MIGRATION_TEST_CHECKLIST.md`
- Priorizar Tests 1, 3 y 4 (admin, cliente, upload público)

**Si algo falla:** ejecutar `006_rls_tenant_isolation_ROLLBACK.sql` completo inmediatamente.

---

## Paso 4 — Verificación final

Si todos los tests pasan:

1. Renombrar archivos en el repo (quitar `_DRAFT`):
   ```bash
   git mv supabase/migrations/005_bucket_security_DRAFT.sql supabase/migrations/005_bucket_security.sql
   git mv supabase/migrations/006_rls_tenant_isolation_DRAFT.sql supabase/migrations/006_rls_tenant_isolation.sql
   ```

2. Commit:
   ```bash
   git commit -m "feat(security): aplicar RLS tenant isolation (R01 cerrado)"
   ```

3. Marcar el ROLLBACK como aplicado (opcional):
   ```bash
   # Mover rollback a carpeta de referencia o agregar nota
   ```

---

## Troubleshooting

### "permission denied for table X"
La tabla no tiene policy para el rol actual. Verificar:
```sql
SELECT polname, polroles::regrole[], polqual 
FROM pg_policy 
WHERE polrelid = 'public.NOMBRE_TABLA'::regclass;
```

### "function auth.current_empresa_id() does not exist"
El bloque 1 no se ejecutó correctamente. Re-ejecutar las 3 funciones CREATE.

### Admin no ve nada después de la migración
Verificar que el admin tiene un registro en `usuarios` con:
```sql
SELECT * FROM usuarios WHERE auth_user_id = auth.uid();
```
Si no existe, la función `is_regis_staff()` retorna FALSE y no ve nada.

### UploadPila falla en incógnito
Verificar que las policies anon existen:
```sql
SELECT polname FROM pg_policy WHERE polrelid = 'public.pila_records'::regclass;
-- Debe incluir: anon_pila_select, anon_pila_insert, anon_pila_update
```

### Performance degradada
Las funciones helper se ejecutan en cada query. Verificar que el índice existe:
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'usuarios' AND indexdef LIKE '%auth_user_id%';
-- Debe existir idx_usuarios_auth_user_id
```

---

## Contactos de emergencia

Si la migración sale mal y el rollback no funciona:
1. Restaurar el backup del Paso 0
2. Notificar al equipo
3. Documentar exactamente qué pasó para debugging
