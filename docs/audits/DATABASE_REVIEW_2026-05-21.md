# Revision de Base de Datos - Regis SG-SST

**Fecha:** 2026-05-21  
**Esquema:** `public` (26 tablas)  
**Proyecto Supabase:** `nrtjizkeopxhpmjxxnjk`  
**Revisor:** DBA Senior (asistido por IA)  
**Escala objetivo:** 90+ empresas, ~4,500 trabajadores, ~65,000 registros PILA/ano

---

## Resumen Ejecutivo

El esquema esta bien estructurado para un MVP funcional. La columna generada `capitulo_0312` y los CHECK constraints sobre valores GTC 45 demuestran buen conocimiento del dominio. Sin embargo, existen **8 hallazgos P1**, **14 P2** y **9 P3** que deben abordarse antes de escalar a 90+ empresas. Los problemas mas criticos son: politicas RLS completamente abiertas, indices faltantes en FK, ausencia de constraint UNIQUE en `pila_records(empresa_id, periodo)`, y columnas `updated_at` faltantes en 12 tablas.

---

## 1. Normalizacion

### H-1.1 `analisis_json` en `planes_emergencia` (P3)

**Hallazgo:** La columna `analisis_json jsonb` almacena datos estructurados de analisis de vulnerabilidad generados por IA. Sin embargo, ya existe la tabla `amenazas_vulnerabilidad` que normaliza exactamente esa informacion.

**Impacto:** Duplicacion de datos entre `analisis_json` y `amenazas_vulnerabilidad`. Riesgo de inconsistencia. Sin embargo, dado que `analisis_json` se usa como cache del resultado crudo de Claude antes de que el consultor lo revise y lo convierta en filas normalizadas, es un patron aceptable siempre que se documente.

**SQL correctivo (opcional):**
```sql
-- Solo si se decide eliminar la columna. Verificar primero que ningun 
-- codigo la lee despues de la normalizacion.
COMMENT ON COLUMN public.planes_emergencia.analisis_json IS 
  'Cache temporal del analisis IA. Fuente de verdad: amenazas_vulnerabilidad';
```

### H-1.2 `metadata jsonb` en `logs_actividad` (P3)

**Hallazgo:** JSONB es apropiado aqui. Los logs de auditoria tienen esquemas heterogeneos y no se consultan por campos internos con frecuencia. Uso correcto.

**Veredicto:** Sin accion requerida.

### H-1.3 `validado_por` / `aprobado_por` como TEXT en `pila_records` y `documentos` (P2)

**Hallazgo:** Estas columnas almacenan nombres o identificadores como texto libre en lugar de ser FK a `usuarios.id`. Esto impide rastrear quien valido/aprobo un documento de forma referencial.

**Impacto:** No se puede generar reportes fiables de "documentos aprobados por consultor X". Si un usuario cambia de nombre, los registros historicos quedan inconsistentes.

**SQL correctivo:**
```sql
-- pila_records
ALTER TABLE public.pila_records 
  ADD COLUMN validado_por_id uuid REFERENCES usuarios(id),
  ADD COLUMN aprobado_por_id uuid REFERENCES usuarios(id);

CREATE INDEX idx_pila_validado_por ON public.pila_records(validado_por_id);
CREATE INDEX idx_pila_aprobado_por ON public.pila_records(aprobado_por_id);

-- documentos
ALTER TABLE public.documentos
  ADD COLUMN validado_por_id uuid REFERENCES usuarios(id),
  ADD COLUMN aprobado_por_id uuid REFERENCES usuarios(id);

CREATE INDEX idx_documentos_validado_por ON public.documentos(validado_por_id);
CREATE INDEX idx_documentos_aprobado_por ON public.documentos(aprobado_por_id);

-- Migrar datos existentes (despues de verificar contenido actual):
-- UPDATE pila_records SET validado_por_id = u.id FROM usuarios u WHERE u.nombre = pila_records.validado_por;
-- Luego DROP las columnas TEXT cuando el frontend migre.
```

---

## 2. Indices

### H-2.1 Indice duplicado en `items_cumplimiento` (P2)

**Hallazgo:** Existen dos indices identicos:
- `idx_items_cumplimiento` ON (cumplimiento_id)
- `idx_items_cumplimiento_cumplimiento` ON (cumplimiento_id)

**Impacto:** Desperdicio de espacio de almacenamiento y tiempo de escritura. Cada INSERT/UPDATE mantiene ambos indices innecesariamente.

**SQL correctivo:**
```sql
DROP INDEX IF EXISTS public.idx_items_cumplimiento;
-- Mantener idx_items_cumplimiento_cumplimiento
```

### H-2.2 FK sin indice: `usuarios.empresa_id` (P1)

**Hallazgo:** `usuarios.empresa_id` es FK a `empresas_cliente(id)` pero no tiene indice. Se usa en JOINs frecuentes y en filtros RLS (cuando se implemente filtrado por empresa).

**Impacto:** Full table scan en `usuarios` cada vez que se busca por empresa. Con 90+ empresas y multiples consultores, se degrada.

**SQL correctivo:**
```sql
CREATE INDEX idx_usuarios_empresa ON public.usuarios(empresa_id);
```

### H-2.3 FK sin indice: `empresas_cliente.consultor_id` (P2)

**Hallazgo:** Sin indice en la FK. Se usa para listar "empresas asignadas a un consultor".

**SQL correctivo:**
```sql
CREATE INDEX idx_empresas_consultor ON public.empresas_cliente(consultor_id);
```

### H-2.4 FK sin indice: `examenes_medicos.consultor_revision_id` (P3)

**SQL correctivo:**
```sql
CREATE INDEX idx_examenes_consultor_revision ON public.examenes_medicos(consultor_revision_id);
```

### H-2.5 FK sin indice: `matrices_riesgo.empresa_id` (P2)

**Hallazgo:** Se filtra frecuentemente por empresa. No tiene indice dedicado.

**SQL correctivo:**
```sql
CREATE INDEX idx_matrices_empresa ON public.matrices_riesgo(empresa_id);
```

### H-2.6 FK sin indice: `integrantes_comite.comite_id` (P2)

**SQL correctivo:**
```sql
CREATE INDEX idx_integrantes_comite ON public.integrantes_comite(comite_id);
```

### H-2.7 FK sin indice: `planes_emergencia.empresa_id` (P2)

**SQL correctivo:**
```sql
CREATE INDEX idx_planes_empresa ON public.planes_emergencia(empresa_id);
```

### H-2.8 FK sin indice: `amenazas_vulnerabilidad.plan_id` (P2)

**SQL correctivo:**
```sql
CREATE INDEX idx_amenazas_plan ON public.amenazas_vulnerabilidad(plan_id);
```

### H-2.9 FK sin indice: `cumplimiento_empresa.empresa_id` (P2)

**Hallazgo:** Cubierto parcialmente por el UNIQUE constraint `(empresa_id, anio)`, pero un indice solo en `empresa_id` optimiza queries que no filtran por ano.

**SQL correctivo:**
```sql
-- El UNIQUE ya cubre queries con empresa_id + anio.
-- Solo si se filtra frecuentemente solo por empresa_id:
CREATE INDEX idx_cumplimiento_empresa ON public.cumplimiento_empresa(empresa_id);
```

### H-2.10 Indice faltante: `logs_actividad.tipo` y `logs_actividad.modulo` (P2)

**Hallazgo:** El dashboard filtra logs por tipo y modulo. Solo hay indice en `created_at` y `empresa_id`.

**SQL correctivo:**
```sql
CREATE INDEX idx_logs_tipo_modulo ON public.logs_actividad(tipo, modulo);
```

### H-2.11 Indice faltante: `puntos_acta.acta_id` (P2)

**SQL correctivo:**
```sql
CREATE INDEX idx_puntos_acta ON public.puntos_acta(acta_id);
```

---

## 3. Foreign Keys

### H-3.1 FK faltante: `pila_records.empresa_id` sin ON DELETE (P1)

**Hallazgo:** `pila_records_empresa_id_fkey` no tiene `ON DELETE CASCADE` ni `ON DELETE RESTRICT`. Si se elimina una empresa, los registros PILA quedan huerfanos. Otras tablas hijas SI tienen CASCADE (trabajadores, documentos, inventario_equipos).

**Impacto:** Registros huerfanos en produccion si se desactiva/elimina una empresa.

**SQL correctivo:**
```sql
ALTER TABLE public.pila_records 
  DROP CONSTRAINT pila_records_empresa_id_fkey,
  ADD CONSTRAINT pila_records_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;
```

### H-3.2 FK faltante: `examenes_medicos.empresa_id` sin ON DELETE (P1)

**Hallazgo:** Misma situacion. `examenes_medicos_empresa_id_fkey` no tiene ON DELETE.

**SQL correctivo:**
```sql
ALTER TABLE public.examenes_medicos 
  DROP CONSTRAINT examenes_medicos_empresa_id_fkey,
  ADD CONSTRAINT examenes_medicos_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;
```

### H-3.3 FK faltante: `examenes_medicos.trabajador_id` sin ON DELETE (P2)

**Hallazgo:** Si se elimina un trabajador (CASCADE desde empresa), los examenes medicos no se eliminan automaticamente porque la FK no tiene ON DELETE.

**SQL correctivo:**
```sql
ALTER TABLE public.examenes_medicos 
  DROP CONSTRAINT examenes_medicos_trabajador_id_fkey,
  ADD CONSTRAINT examenes_medicos_trabajador_id_fkey 
    FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id) ON DELETE CASCADE;
```

### H-3.4 FK faltante: `actas_comite.comite_id` sin ON DELETE (P1)

**Hallazgo:** `comites` tiene CASCADE a `integrantes_comite`, pero `actas_comite` NO tiene CASCADE. Si se elimina un comite, sus actas quedan huerfanas pero sus puntos e integrantes si se eliminan.

**SQL correctivo:**
```sql
ALTER TABLE public.actas_comite 
  DROP CONSTRAINT actas_comite_comite_id_fkey,
  ADD CONSTRAINT actas_comite_comite_id_fkey 
    FOREIGN KEY (comite_id) REFERENCES comites(id) ON DELETE CASCADE;
```

### H-3.5 FK faltante: `logs_actividad` sin ON DELETE en `empresa_id` y `usuario_id` (P2)

**Hallazgo:** Los logs son registros de auditoria. NO deben tener CASCADE. Deberian tener `ON DELETE SET NULL` para preservar el log cuando se elimina la empresa/usuario.

**SQL correctivo:**
```sql
ALTER TABLE public.logs_actividad 
  DROP CONSTRAINT logs_actividad_empresa_id_fkey,
  ADD CONSTRAINT logs_actividad_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE SET NULL;

ALTER TABLE public.logs_actividad 
  DROP CONSTRAINT logs_actividad_usuario_id_fkey,
  ADD CONSTRAINT logs_actividad_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL;
```

### H-3.6 FK faltante: `asistencia_comite.integrante_id` sin ON DELETE (P2)

**Hallazgo:** Si un integrante se elimina (CASCADE desde comite), la asistencia queda huerfana.

**SQL correctivo:**
```sql
ALTER TABLE public.asistencia_comite 
  DROP CONSTRAINT asistencia_comite_integrante_id_fkey,
  ADD CONSTRAINT asistencia_comite_integrante_id_fkey 
    FOREIGN KEY (integrante_id) REFERENCES integrantes_comite(id) ON DELETE CASCADE;
```

---

## 4. CHECK Constraints

### H-4.1 UNIQUE faltante: `pila_records(empresa_id, periodo)` (P1)

**Hallazgo:** No existe constraint UNIQUE en `(empresa_id, periodo)`. El codigo `syncPeriods()` depende de que no haya duplicados, pero la BD no lo garantiza. Una race condition o bug en el frontend puede crear registros PILA duplicados por empresa/periodo.

**Impacto:** Datos PILA duplicados que causan conteos incorrectos, correos duplicados, y reportes de cumplimiento erroneos.

**SQL correctivo:**
```sql
-- Primero verificar y limpiar duplicados existentes:
-- DELETE FROM pila_records WHERE id NOT IN (
--   SELECT DISTINCT ON (empresa_id, periodo) id FROM pila_records 
--   ORDER BY empresa_id, periodo, created_at DESC
-- );

ALTER TABLE public.pila_records 
  ADD CONSTRAINT pila_records_empresa_periodo_key UNIQUE (empresa_id, periodo);
```

### H-4.2 CHECK faltante: `inventario_equipos.tipo` sin constraint (P2)

**Hallazgo:** La columna `tipo` no tiene CHECK constraint. Cualquier texto puede insertarse.

**SQL correctivo:**
```sql
ALTER TABLE public.inventario_equipos 
  ADD CONSTRAINT inventario_equipos_tipo_check 
  CHECK (tipo = ANY(ARRAY[
    'extintor'::text, 'camilla'::text, 'botiquin'::text, 
    'desfibrilador'::text, 'senalizacion'::text, 'epp'::text, 
    'detector_humo'::text, 'lampara_emergencia'::text, 'otro'::text
  ]));
```

### H-4.3 CHECK faltante: `inventario_equipos.estado` sin constraint (P2)

**Hallazgo:** `estado` acepta cualquier texto. Deberia estar restringido.

**SQL correctivo:**
```sql
ALTER TABLE public.inventario_equipos 
  ADD CONSTRAINT inventario_equipos_estado_check 
  CHECK (estado = ANY(ARRAY[
    'vigente'::text, 'por_vencer'::text, 'vencido'::text, 
    'en_mantenimiento'::text, 'dado_de_baja'::text
  ]));
```

### H-4.4 CHECK faltante: `logs_actividad.tipo` sin constraint (P3)

**Hallazgo:** `tipo` en logs acepta cualquier valor. Seria util restringirlo para consistencia en reportes.

**SQL correctivo:**
```sql
ALTER TABLE public.logs_actividad 
  ADD CONSTRAINT logs_actividad_tipo_check 
  CHECK (tipo = ANY(ARRAY[
    'creacion'::text, 'actualizacion'::text, 'eliminacion'::text, 
    'carga'::text, 'descarga'::text, 'envio_correo'::text, 
    'envio_whatsapp'::text, 'validacion'::text, 'aprobacion'::text,
    'generacion_ia'::text, 'login'::text, 'error'::text
  ]));
```

### H-4.5 CHECK faltante: `riesgos_matriz.aceptabilidad` sin constraint (P2)

**Hallazgo:** La aceptabilidad del riesgo segun GTC 45 tiene valores definidos pero no estan restringidos.

**SQL correctivo:**
```sql
ALTER TABLE public.riesgos_matriz 
  ADD CONSTRAINT riesgos_matriz_aceptabilidad_check 
  CHECK (aceptabilidad = ANY(ARRAY[
    'aceptable'::text, 'aceptable_con_control'::text, 
    'mejorable'::text, 'no_aceptable'::text, 'no_aceptable_critico'::text
  ]));
```

### H-4.6 CHECK faltante: `templates_documento.tipo` sin constraint (P3)

**SQL correctivo:**
```sql
ALTER TABLE public.templates_documento 
  ADD CONSTRAINT templates_documento_tipo_check 
  CHECK (tipo = ANY(ARRAY[
    'email'::text, 'acta'::text, 'informe'::text, 
    'carta'::text, 'politica'::text, 'otro'::text
  ]));
```

---

## 5. NULL vs NOT NULL

### H-5.1 `examenes_medicos.empresa_id` deberia validar coherencia con trabajador (P2)

**Hallazgo:** `empresa_id` es NOT NULL (correcto), pero no hay CHECK ni trigger que valide que `trabajadores.empresa_id` coincida con `examenes_medicos.empresa_id`. Un bug podria asociar un examen de la empresa A a un trabajador de la empresa B.

**SQL correctivo:**
```sql
CREATE OR REPLACE FUNCTION check_examen_empresa_consistency()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM trabajadores 
    WHERE id = NEW.trabajador_id AND empresa_id = NEW.empresa_id
  ) THEN
    RAISE EXCEPTION 'El trabajador % no pertenece a la empresa %', 
      NEW.trabajador_id, NEW.empresa_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_examen_empresa
  BEFORE INSERT OR UPDATE ON public.examenes_medicos
  FOR EACH ROW EXECUTE FUNCTION check_examen_empresa_consistency();
```

### H-5.2 Columnas que deberian ser NOT NULL (P2)

| Tabla | Columna | Razon |
|-------|---------|-------|
| `trabajadores` | `cargo` | Todo trabajador debe tener cargo para GTC 45 |
| `trabajadores` | `fecha_ingreso` | Obligatorio para calcular periodicidad de examenes |
| `matrices_riesgo` | `fecha_elaboracion` | Ya es NOT NULL - correcto |
| `actas_comite` | `lugar` | Requerido por formato de acta legal |
| `actas_comite` | `hora_inicio` | Requerido por formato de acta legal |
| `empresas_cliente` | `ciudad` | Necesario para reportes y correspondencia |
| `empresas_cliente` | `email_contacto` | Sin email no se puede comunicar con la empresa |

**SQL correctivo (selectivo):**
```sql
-- Aplicar solo despues de verificar que no hay NULLs existentes:
-- SELECT count(*) FROM trabajadores WHERE cargo IS NULL;

ALTER TABLE public.trabajadores ALTER COLUMN cargo SET NOT NULL;
ALTER TABLE public.trabajadores ALTER COLUMN fecha_ingreso SET NOT NULL;
ALTER TABLE public.empresas_cliente ALTER COLUMN email_contacto SET NOT NULL;
ALTER TABLE public.empresas_cliente ALTER COLUMN ciudad SET NOT NULL;
```

### H-5.3 `cumplimiento_empresa` sin `created_at` (P2)

**Hallazgo:** Solo tiene `updated_at`, no `created_at`. No se puede saber cuando se creo la evaluacion por primera vez.

**SQL correctivo:**
```sql
ALTER TABLE public.cumplimiento_empresa 
  ADD COLUMN created_at timestamptz DEFAULT now();
```

---

## 6. Tipos de Datos

### H-6.1 `pila_records.periodo` como TEXT en vez de DATE o columnas separadas (P2)

**Hallazgo:** `periodo` almacena "YYYY-MM" como texto. Esto impide operaciones de rango de fechas eficientes y requiere casteo para ordenamiento correcto.

**Impacto:** Queries como "ultimos 6 meses" requieren manipulacion de strings. A 90 empresas x 12 meses x 5 anos = 5,400 registros, el impacto es menor, pero es una deuda tecnica.

**SQL correctivo:**
```sql
-- Opcion A: Agregar columna DATE (recomendado, compatible hacia atras)
ALTER TABLE public.pila_records ADD COLUMN periodo_date date;
UPDATE public.pila_records SET periodo_date = (periodo || '-01')::date;
ALTER TABLE public.pila_records ALTER COLUMN periodo_date SET NOT NULL;
CREATE INDEX idx_pila_periodo_date ON public.pila_records(periodo_date);

-- Opcion B: Separar en anio/mes (como en documentos)
-- ALTER TABLE public.pila_records ADD COLUMN periodo_anio integer, ADD COLUMN periodo_mes integer;
```

### H-6.2 `confianza_extraccion` en `examenes_medicos` es NUMERIC(3,2) (P3)

**Hallazgo:** NUMERIC(3,2) permite valores de 0.00 a 9.99. Para un porcentaje de confianza (0-1 o 0-100), falta un CHECK constraint.

**SQL correctivo:**
```sql
ALTER TABLE public.examenes_medicos 
  ADD CONSTRAINT examenes_confianza_check 
  CHECK (confianza_extraccion >= 0 AND confianza_extraccion <= 1);
```

### H-6.3 `vuln_*` en `amenazas_vulnerabilidad` son NUMERIC(2,1) (P3)

**Hallazgo:** El CHECK ya restringe a {0.0, 0.5, 1.0} lo cual es correcto para la metodologia de analisis de vulnerabilidad. Sin embargo, NUMERIC(2,1) permite hasta 9.9, que es inconsistente con el CHECK. No es un problema funcional dado que el CHECK es mas restrictivo.

**Veredicto:** Sin accion requerida. El CHECK es suficiente.

---

## 7. Convenciones de Nombres

### H-7.1 Mezcla espanol/ingles (P3)

**Hallazgo:** La mayoria de nombres estan en espanol (correcto para un dominio colombiano), pero hay inconsistencias:
- `drive_file_id`, `drive_folder_id`, `drive_folder_url` (ingles)
- `archivo_url` (espanol)
- `email` vs `email_contacto` (mixto)
- `metadata` (ingles en `logs_actividad`)

**Veredicto:** Dado que `drive`, `email` y `metadata` son terminos tecnicos universales, la mezcla es aceptable y no requiere accion. El equipo debe mantener la convencion de usar espanol para terminos de dominio e ingles para terminos tecnicos.

### H-7.2 Singular vs plural inconsistente (P3)

**Hallazgo:**
- Plural: `empresas_cliente`, `examenes_medicos`, `matrices_riesgo`, `planes_emergencia`
- Singular implicito: `cumplimiento_empresa` (deberia ser `cumplimiento_empresas` o `cumplimientos_empresa`)
- `riesgos_matriz` invierte el orden: deberia ser `matriz_riesgos` por consistencia con `integrantes_comite`, `puntos_acta`

**Veredicto:** Cambiar nombres de tabla en produccion es costoso y riesgoso. Documentar la convencion y mantenerla para tablas nuevas. No requiere cambio.

### H-7.3 Nombres de constraint inconsistentes (P3)

**Hallazgo:** 
- `"Allow all access"` en `items_cumplimiento` (ingles, con espacios)
- `"Allow all for authenticated"` en `pila_records` (ingles, con espacios)
- `"auth_full_access"` en la mayoria (snake_case)
- `"public_read"` en tablas de referencia

**SQL correctivo:** No critico, pero para consistencia futura usar `{tabla}_{accion}_{rol}`.

---

## 8. Rendimiento a Escala (90+ empresas)

### H-8.1 `logs_actividad` sin particionamiento (P1)

**Hallazgo:** A 90 empresas con actividad diaria, `logs_actividad` crecera rapidamente (~100,000+ registros/mes). No hay particionamiento ni politica de retencion.

**Impacto:** Queries de dashboard que hacen `ORDER BY created_at DESC LIMIT 50` se degradaran. El indice `idx_logs_created` ayuda, pero la tabla se volvera masiva.

**SQL correctivo:**
```sql
-- Opcion 1: Politica de archivado (mas sencilla)
-- Crear tabla de archivo y mover registros > 6 meses
CREATE TABLE public.logs_actividad_archivo (LIKE public.logs_actividad INCLUDING ALL);

-- Opcion 2: Particionamiento por rango (mas robusto, requiere recrear tabla)
-- Solo viable en una migracion mayor.

-- Opcion 3: Agregar indice parcial para queries recientes
CREATE INDEX idx_logs_recientes ON public.logs_actividad(created_at DESC) 
  WHERE created_at > now() - interval '3 months';
```

### H-8.2 `riesgos_matriz` crecera exponencialmente (P2)

**Hallazgo:** Cada empresa puede tener multiples matrices con 20-50 riesgos cada una. A 90 empresas x 2 versiones x 35 riesgos = 6,300 filas. El indice `idx_riesgos_matriz(matriz_id)` es correcto pero las queries que agregan por empresa requieren JOIN a `matrices_riesgo`.

**SQL correctivo:**
```sql
-- Indice compuesto para queries que filtran por empresa a traves de la matriz
CREATE INDEX idx_riesgos_categoria ON public.riesgos_matriz(categoria_peligro);
```

### H-8.3 Queries de cumplimiento requieren JOINs pesados (P2)

**Hallazgo:** Calcular el puntaje de cumplimiento de una empresa requiere:
`items_cumplimiento` JOIN `cumplimiento_empresa` JOIN `estandares_0312`
Con 60 estandares x 90 empresas = 5,400 items_cumplimiento. No es critico pero el JOIN triple se ejecuta en cada carga de dashboard.

**SQL correctivo:**
```sql
-- Vista materializada para dashboard de cumplimiento
CREATE MATERIALIZED VIEW mv_cumplimiento_resumen AS
SELECT 
  ce.empresa_id,
  ce.anio,
  ce.puntaje_total,
  ce.puntaje_planear,
  ce.puntaje_hacer,
  ce.puntaje_verificar,
  ce.puntaje_actuar,
  ec.razon_social,
  ec.capitulo_0312
FROM cumplimiento_empresa ce
JOIN empresas_cliente ec ON ec.id = ce.empresa_id
WHERE ec.activo = true;

CREATE UNIQUE INDEX idx_mv_cumplimiento ON mv_cumplimiento_resumen(empresa_id, anio);

-- Refrescar periodicamente:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_cumplimiento_resumen;
```

---

## 9. Auditoria

### H-9.1 Tablas sin `updated_at` (P1)

**Hallazgo:** Las siguientes tablas NO tienen columna `updated_at`:

| Tabla | Tiene `created_at` | Tiene `updated_at` |
|-------|-------------------|--------------------|
| `trabajadores` | Si | **NO** |
| `examenes_medicos` | Si | **NO** |
| `recomendaciones_medicas` | Si | **NO** |
| `matrices_riesgo` | Si | **NO** |
| `riesgos_matriz` | Si | **NO** |
| `comites` | Si | **NO** |
| `integrantes_comite` | Si | **NO** |
| `actas_comite` | Si | **NO** |
| `puntos_acta` | Si | **NO** |
| `asistencia_comite` | Si | **NO** |
| `planes_emergencia` | Si | **NO** |
| `amenazas_vulnerabilidad` | Si | **NO** |
| `logs_actividad` | Si | N/A (immutable) |
| `pila_records` | Si | **NO** |
| `inventario_equipos` | Si | Si |

**Impacto:** No se puede saber cuando se modifico por ultima vez un registro PILA, un acta, un examen medico, etc. Critico para auditoria SG-SST y para sincronizacion de datos.

**SQL correctivo:**
```sql
-- Agregar updated_at a todas las tablas que lo necesitan
ALTER TABLE public.trabajadores ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.examenes_medicos ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.recomendaciones_medicas ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.matrices_riesgo ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.riesgos_matriz ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.comites ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.integrantes_comite ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.actas_comite ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.puntos_acta ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.asistencia_comite ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.planes_emergencia ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.amenazas_vulnerabilidad ADD COLUMN updated_at timestamptz DEFAULT now();
ALTER TABLE public.pila_records ADD COLUMN updated_at timestamptz DEFAULT now();

-- Trigger para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a cada tabla (ejemplo para trabajadores, repetir para las demas):
CREATE TRIGGER trg_updated_at_trabajadores
  BEFORE UPDATE ON public.trabajadores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_examenes_medicos
  BEFORE UPDATE ON public.examenes_medicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_recomendaciones_medicas
  BEFORE UPDATE ON public.recomendaciones_medicas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_matrices_riesgo
  BEFORE UPDATE ON public.matrices_riesgo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_riesgos_matriz
  BEFORE UPDATE ON public.riesgos_matriz
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_comites
  BEFORE UPDATE ON public.comites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_integrantes_comite
  BEFORE UPDATE ON public.integrantes_comite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_actas_comite
  BEFORE UPDATE ON public.actas_comite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_puntos_acta
  BEFORE UPDATE ON public.puntos_acta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_asistencia_comite
  BEFORE UPDATE ON public.asistencia_comite
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_planes_emergencia
  BEFORE UPDATE ON public.planes_emergencia
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_amenazas_vulnerabilidad
  BEFORE UPDATE ON public.amenazas_vulnerabilidad
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_updated_at_pila_records
  BEFORE UPDATE ON public.pila_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### H-9.2 Falta `created_by` en tablas clave (P2)

**Hallazgo:** No hay columna `created_by` (uuid FK a usuarios) en tablas donde importa saber quien creo el registro: `matrices_riesgo`, `actas_comite`, `planes_emergencia`, `documentos`.

**SQL correctivo:**
```sql
ALTER TABLE public.matrices_riesgo ADD COLUMN created_by uuid REFERENCES usuarios(id);
ALTER TABLE public.actas_comite ADD COLUMN created_by uuid REFERENCES usuarios(id);
ALTER TABLE public.planes_emergencia ADD COLUMN created_by uuid REFERENCES usuarios(id);
ALTER TABLE public.documentos ADD COLUMN created_by uuid REFERENCES usuarios(id);
```

---

## 10. Soft Delete vs Hard Delete

### H-10.1 Inconsistencia en estrategia de eliminacion (P1)

**Hallazgo:** Tres patrones coexisten sin criterio claro:

| Patron | Tablas |
|--------|--------|
| `activo boolean` (soft delete) | `empresas_cliente`, `usuarios`, `trabajadores`, `comites`, `integrantes_comite`, `estandares_0312`, `templates_documento` |
| `ON DELETE CASCADE` (hard delete en cascada) | `trabajadores`, `matrices_riesgo`, `comites`, `riesgos_matriz`, `integrantes_comite`, `puntos_acta`, `asistencia_comite`, `planes_emergencia`, `amenazas_vulnerabilidad`, `documentos`, `cumplimiento_empresa`, `items_cumplimiento`, `inventario_equipos` |
| Sin politica | `pila_records`, `examenes_medicos`, `actas_comite`, `logs_actividad` |

**Problemas concretos:**
1. `empresas_cliente` tiene `activo = true/false` (soft delete), PERO sus hijas tienen `ON DELETE CASCADE`. Si alguien ejecuta un DELETE fisico en vez de `SET activo = false`, se borran TODOS los datos de la empresa en cascada.
2. `trabajadores` tiene `activo` boolean Y `ON DELETE CASCADE`. Doble mecanismo sin coordinacion.
3. `comites` tiene soft delete (`activo`) pero sus `actas_comite` hijas no tienen CASCADE, creando huerfanos.

**Impacto:** Perdida catastrofica de datos si un admin ejecuta DELETE en lugar de UPDATE. Para un sistema SG-SST con obligaciones legales de retencion de documentos, esto es critico.

**SQL correctivo:**
```sql
-- Estrategia recomendada: Soft delete en empresas_cliente, RESTRICT en vez de CASCADE
-- para prevenir eliminacion accidental.

-- Paso 1: Cambiar CASCADE a RESTRICT en tablas hijas criticas
ALTER TABLE public.trabajadores 
  DROP CONSTRAINT trabajadores_empresa_id_fkey,
  ADD CONSTRAINT trabajadores_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE RESTRICT;

ALTER TABLE public.documentos 
  DROP CONSTRAINT documentos_empresa_id_fkey,
  ADD CONSTRAINT documentos_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE RESTRICT;

ALTER TABLE public.cumplimiento_empresa 
  DROP CONSTRAINT cumplimiento_empresa_empresa_id_fkey,
  ADD CONSTRAINT cumplimiento_empresa_empresa_id_fkey 
    FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE RESTRICT;

-- Paso 2: Agregar columna activo a tablas que no la tienen pero deberian
ALTER TABLE public.pila_records ADD COLUMN activo boolean DEFAULT true;
ALTER TABLE public.examenes_medicos ADD COLUMN activo boolean DEFAULT true;
ALTER TABLE public.documentos ADD COLUMN activo boolean DEFAULT true;
ALTER TABLE public.actas_comite ADD COLUMN activo boolean DEFAULT true;

-- Paso 3: Crear funcion de "archivado" de empresa en vez de DELETE
CREATE OR REPLACE FUNCTION archivar_empresa(p_empresa_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE empresas_cliente SET activo = false, updated_at = now() WHERE id = p_empresa_id;
  UPDATE trabajadores SET activo = false WHERE empresa_id = p_empresa_id;
  UPDATE comites SET activo = false WHERE empresa_id = p_empresa_id;
  -- Los datos se preservan para cumplimiento legal
END;
$$ LANGUAGE plpgsql;
```

---

## 11. Hallazgos Adicionales de Seguridad

### H-11.1 Politicas RLS abiertas - CRITICO (P1)

**Hallazgo:** Casi todas las politicas RLS son `USING ((auth.role() = 'authenticated'))`, lo que significa que **cualquier usuario autenticado puede ver y modificar TODOS los datos de TODAS las empresas**. Peor aun, dos tablas tienen politicas completamente abiertas:

- `inventario_equipos`: `USING (true) WITH CHECK (true)` -- cualquiera puede leer/escribir
- `items_cumplimiento`: `USING (true) WITH CHECK (true)` -- cualquiera puede leer/escribir

**Impacto:** Un usuario cliente de la empresa A puede ver, modificar o eliminar datos de la empresa B. Esto viola la Ley 1581/2012 (Habeas Data) y los principios de segregacion de datos SG-SST.

**SQL correctivo (ejemplo para empresas_cliente):**
```sql
-- Eliminar politica abierta
DROP POLICY "auth_full_access" ON public.empresas_cliente;

-- Admin/consultor: acceso total
CREATE POLICY "admin_consultor_full" ON public.empresas_cliente
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = auth.uid() 
      AND rol IN ('admin', 'consultor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE auth_user_id = auth.uid() 
      AND rol IN ('admin', 'consultor')
    )
  );

-- Cliente: solo su empresa
CREATE POLICY "cliente_own_empresa" ON public.empresas_cliente
  FOR SELECT TO authenticated
  USING (
    id = (SELECT empresa_id FROM usuarios WHERE auth_user_id = auth.uid())
  );

-- Repetir patron similar para todas las tablas con empresa_id
```

### H-11.2 `pila_records` usa `TO authenticated` mientras otras usan `TO public` (P3)

**Hallazgo:** Inconsistencia menor. `pila_records` usa `TO authenticated` (correcto), pero las demas usan `TO public` con `auth.role() = 'authenticated'` en el USING. Funcionalmente equivalente pero inconsistente.

---

## Resumen de Hallazgos por Severidad

| Severidad | Cantidad | Hallazgos |
|-----------|----------|-----------|
| **P1 - Critico** | 8 | H-2.2 (idx usuarios.empresa_id), H-3.1 (FK pila sin CASCADE), H-3.2 (FK examenes sin CASCADE), H-3.4 (FK actas sin CASCADE), H-4.1 (UNIQUE pila), H-8.1 (logs sin particion), H-9.1 (updated_at faltante 12 tablas), H-10.1 (soft delete inconsistente), H-11.1 (RLS abiertas) |
| **P2 - Importante** | 14 | H-1.3, H-2.1, H-2.3, H-2.5, H-2.6, H-2.7, H-2.8, H-2.10, H-2.11, H-3.3, H-3.5, H-3.6, H-4.2, H-4.3, H-4.5, H-5.1, H-5.2, H-5.3, H-6.1, H-8.2, H-8.3, H-9.2 |
| **P3 - Deseable** | 9 | H-1.1, H-1.2, H-2.4, H-2.9, H-4.4, H-4.6, H-6.2, H-6.3, H-7.1, H-7.2, H-7.3, H-11.2 |

## Plan de Ejecucion Recomendado

### Fase 1 - Inmediato (antes de produccion con 90+ empresas)
1. Corregir RLS (H-11.1) -- **Seguridad critica**
2. Agregar UNIQUE a pila_records (H-4.1) -- **Integridad de datos**
3. Agregar indices faltantes en FK (H-2.2 a H-2.11) -- **Script unico, bajo riesgo**
4. Corregir ON DELETE en FK (H-3.1 a H-3.6) -- **Integridad referencial**

### Fase 2 - Corto plazo (1-2 semanas)
5. Agregar `updated_at` + triggers (H-9.1) -- **Auditoria**
6. Agregar CHECK constraints (H-4.2 a H-4.5) -- **Integridad de datos**
7. Migrar `validado_por` a FK (H-1.3) -- **Requiere cambio en frontend**

### Fase 3 - Mediano plazo (1 mes)
8. Unificar estrategia soft delete (H-10.1) -- **Requiere analisis de impacto**
9. Agregar `created_by` (H-9.2)
10. Politica de retencion de logs (H-8.1)
11. Vista materializada de cumplimiento (H-8.3)

---

*Documento generado como parte de la revision pre-produccion del esquema Regis SG-SST.*
