# RLS Gap Analysis — 005 DRAFT vs 006 DRAFT

**Fecha:** 2026-05-21  
**Propósito:** Documentar qué cubre cada migración y qué queda pendiente

---

## Estado actual de RLS (pre-migración)

### Tablas completamente abiertas (USING(true)) — 2 tablas
| Tabla | Policy | Riesgo |
|-------|--------|--------|
| `inventario_equipos` | `USING(true) WITH CHECK(true)` TO public | Cualquiera puede leer/escribir sin autenticarse |
| `items_cumplimiento` | `USING(true) WITH CHECK(true)` TO public | Cualquiera puede leer/escribir sin autenticarse |

### Tablas con auth-only (cualquier autenticado ve todo) — 19 tablas
| Tabla | Policy |
|-------|--------|
| actas_comite | `auth.role() = 'authenticated'` |
| amenazas_vulnerabilidad | `auth.role() = 'authenticated'` |
| asistencia_comite | `auth.role() = 'authenticated'` |
| comites | `auth.role() = 'authenticated'` |
| configuracion_sistema | `auth.role() = 'authenticated'` |
| cumplimiento_empresa | `auth.role() = 'authenticated'` |
| documentos | `auth.role() = 'authenticated'` |
| empresas_cliente | `auth.role() = 'authenticated'` |
| examenes_medicos | `auth.role() = 'authenticated'` |
| integrantes_comite | `auth.role() = 'authenticated'` |
| logs_actividad | `auth.role() = 'authenticated'` |
| matrices_riesgo | `auth.role() = 'authenticated'` |
| planes_emergencia | `auth.role() = 'authenticated'` |
| puntos_acta | `auth.role() = 'authenticated'` |
| recomendaciones_medicas | `auth.role() = 'authenticated'` |
| riesgos_matriz | `auth.role() = 'authenticated'` |
| templates_documento | `auth.role() = 'authenticated'` |
| trabajadores | `auth.role() = 'authenticated'` |
| usuarios | `auth.role() = 'authenticated'` |
| pila_records | `TO authenticated USING(true)` (variante) |

### Tablas de referencia con public_read (correctas) — 4 tablas
| Tabla | Policy | Estado |
|-------|--------|--------|
| ciiu_codigos | `SELECT USING(true)` | ✅ Correcto |
| categorias_peligro_gtc45 | `SELECT USING(true)` | ✅ Correcto |
| ciiu_riesgos_tipicos | `SELECT USING(true)` | ✅ Correcto |
| estandares_0312 | `SELECT USING(true)` | ✅ Correcto |

---

## Cobertura de Migración 005 (bucket security)

| Componente | Cubierto | Detalle |
|------------|----------|---------|
| Bucket `documentos` → privado | ✅ | `UPDATE storage.buckets SET public = false` |
| Helper `get_user_empresa_id()` | ✅ | En schema `public` |
| Helper `get_user_role()` | ✅ | En schema `public` |
| Policies en `storage.objects` | ✅ | 8 policies (SELECT/INSERT/UPDATE/DELETE por rol) |
| Policy anon para PILA upload | ✅ | `storage_insert_anon_pila` solo en path `pila/` |
| Tablas de aplicación | ❌ | **No toca ninguna tabla** |

---

## Cobertura de Migración 006 (tenant isolation)

### Helper functions
| Función | Schema | Propósito |
|---------|--------|-----------|
| `auth.current_empresa_id()` | auth | Devuelve empresa_id del usuario actual |
| `auth.is_regis_admin()` | auth | TRUE si rol=admin, empresa_id=NULL |
| `auth.is_regis_staff()` | auth | TRUE si rol=admin o consultor (⚠️ NUEVA, no en spec original) |

### Tablas con empresa_id directo (10 tablas)
| Tabla | Cubierta 006 | SELECT | INSERT | UPDATE | DELETE |
|-------|-------------|--------|--------|--------|--------|
| empresas_cliente | ✅ | staff OR id=empresa | staff only | staff OR id=empresa | admin only |
| trabajadores | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| examenes_medicos | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| documentos | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| pila_records | ✅ | staff OR empresa_id + anon | staff OR empresa_id + anon | staff OR empresa_id + anon | admin only |
| matrices_riesgo | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| comites | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| planes_emergencia | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| inventario_equipos | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |
| cumplimiento_empresa | ✅ | staff OR empresa_id | staff OR empresa_id | staff OR empresa_id | admin only |

### Tablas via JOIN (8 tablas)
| Tabla | FK Path | Cubierta 006 |
|-------|---------|-------------|
| riesgos_matriz | → matrices_riesgo.empresa_id | ✅ |
| actas_comite | → comites.empresa_id | ✅ |
| integrantes_comite | → comites.empresa_id | ✅ |
| puntos_acta | → actas_comite → comites.empresa_id | ✅ |
| asistencia_comite | → actas_comite → comites.empresa_id | ✅ |
| amenazas_vulnerabilidad | → planes_emergencia.empresa_id | ✅ |
| recomendaciones_medicas | → examenes_medicos.empresa_id | ✅ |
| items_cumplimiento | → cumplimiento_empresa.empresa_id | ✅ |

### Tablas especiales (4 tablas)
| Tabla | Cubierta 006 | Política |
|-------|-------------|----------|
| usuarios | ✅ | staff sees all, self-access, same-company |
| configuracion_sistema | ✅ | staff reads, admin modifies |
| templates_documento | ✅ | staff reads, admin CUD |
| logs_actividad | ✅ | staff reads all, empresa_id filter for clients, append-only |

### Tablas de referencia (4 tablas) — SIN CAMBIOS
| Tabla | Cubierta 006 | Razón |
|-------|-------------|-------|
| ciiu_codigos | ➖ No necesario | public_read ya correcto |
| categorias_peligro_gtc45 | ➖ No necesario | public_read ya correcto |
| ciiu_riesgos_tipicos | ➖ No necesario | public_read ya correcto |
| estandares_0312 | ➖ No necesario | public_read ya correcto |

---

## Hallazgos NO previstos en el análisis original

### 1. Rol consultor queda bloqueado con el patrón propuesto (CRÍTICO)

**Problema:** El spec original usa `auth.is_regis_admin()` para el acceso amplio. Pero los consultores (rol=consultor, empresa_id=NULL) NO son admin. Con el patrón original:
- `is_regis_admin()` → FALSE para consultores
- `empresa_id = current_empresa_id()` → NULL = NULL → siempre FALSE

**Resultado:** Consultores no ven NADA. App completamente rota para ellos.

**Solución aplicada:** Se creó `auth.is_regis_staff()` que retorna TRUE para admin Y consultor. Se usa en todas las policies de SELECT/INSERT/UPDATE. Solo DELETE usa `is_regis_admin()`.

### 2. UploadPila hace queries directas sin auth (CRÍTICO)

**Problema:** `/upload-pila?t=token` es una página pública que usa el Supabase anon key para:
1. SELECT en `pila_records` (buscar registro existente)
2. UPDATE en `pila_records` (actualizar con archivo_url)
3. INSERT en `pila_records` (crear si no existe)
4. INSERT en `logs_actividad` (log de la acción)

Sin policies anon, el flujo público de upload se rompe completamente.

**Solución aplicada:** Se agregaron policies anon para pila_records (SELECT/INSERT/UPDATE) y logs_actividad (INSERT). Documentado como riesgo de seguridad con recomendación de migrar a Edge Function.

### 3. Overlap de helper functions entre 005 y 006

**005 crea:** `public.get_user_empresa_id()` y `public.get_user_role()`  
**006 crea:** `auth.current_empresa_id()`, `auth.is_regis_admin()`, `auth.is_regis_staff()`

Las funciones en 005 y 006 hacen queries similares a la tabla `usuarios`. No hay conflicto — coexisten. Las de 005 se usan en policies de `storage.objects`, las de 006 en policies de tablas de aplicación.

**Recomendación futura:** Unificar en el schema `auth` y actualizar 005 para usar las mismas funciones.

### 4. Policies de escritura en tablas de referencia inexistentes

Las 4 tablas de referencia (ciiu_codigos, categorias_peligro_gtc45, ciiu_riesgos_tipicos, estandares_0312) solo tienen `public_read`. No tienen policy de INSERT/UPDATE/DELETE para NADIE (ni siquiera admin). Si el admin necesita editar estándares desde la UI, necesitará policies adicionales.

**Impacto actual:** Nulo — estas tablas se gestionan via seeds/migrations.  
**Impacto futuro:** Bajo — agregar policies admin-only si se necesita UI de edición.

### 5. Índice en usuarios.auth_user_id no existía

Las funciones helper hacen `WHERE auth_user_id = auth.uid()` en CADA evaluación de policy. Sin índice, esto es un sequential scan en la tabla usuarios por cada query a cualquier tabla. Se agregó `idx_usuarios_auth_user_id` en el bloque 7.

---

## Resumen de cobertura

| Categoría | Total tablas | Cubiertas por 006 | Sin cambios necesarios |
|-----------|-------------|-------------------|----------------------|
| Con empresa_id directo | 10 | 10 ✅ | 0 |
| Via JOIN | 8 | 8 ✅ | 0 |
| Especiales | 4 | 4 ✅ | 0 |
| Referencia (read-only) | 4 | 0 | 4 ✅ |
| **Total** | **26** | **22** | **4** |

**Resultado:** 100% de las tablas que necesitan tenant isolation están cubiertas.
