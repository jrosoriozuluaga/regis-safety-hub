-- DRAFT SEED DATA — Ejecutar manualmente: psql $DATABASE_URL < demo_data_DRAFT.sql
-- O usar: supabase db reset (aplica seeds automaticamente)
-- IMPORTANTE: NO ejecutar en produccion con datos reales. Solo para demo.
--
-- Genera datos de prueba para 3 empresas:
--   1. Construandes Ltda (construccion, CIIU 6820)
--   2. DevCo Technologies S.A.S. (software, CIIU 6201)
--   3. Sabor Criollo S.A.S. (restaurante, CIIU 7020)
--
-- Fecha de generacion: 2026-05-20

BEGIN;

-- ============================================================
-- CTE base: obtener IDs de las 3 empresas existentes
-- ============================================================
-- Usamos esta CTE en cada bloque. Como SQL no permite CTEs
-- compartidas entre statements, repetimos el patron donde
-- se necesite o usamos variables temporales.

-- ============================================================
-- 1. TRABAJADORES (5+ por empresa, 18 total)
-- ============================================================

-- Construandes Ltda (construccion) — 6 trabajadores
INSERT INTO trabajadores (id, empresa_id, nombre, cedula, cargo, area, fecha_ingreso, activo)
SELECT
  gen_random_uuid(),
  e.id,
  v.nombre,
  v.cedula,
  v.cargo,
  v.area,
  v.fecha_ingreso::date,
  true
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('Carlos Andres Moreno Gutierrez',  '1053782456', 'Maestro de obra',          'Operaciones',    '2024-06-15'),
  ('Luis Fernando Ramirez Torres',    '80234567',   'Oficial de construccion',  'Operaciones',    '2024-09-01'),
  ('Maria Fernanda Lopez Castillo',   '52987654',   'Ingeniera residente',      'Ingenieria',     '2025-01-10'),
  ('Jorge Enrique Pena Suarez',       '1019876543', 'Ayudante de obra',         'Operaciones',    '2025-03-20'),
  ('Diana Marcela Ortiz Reyes',       '1098234567', 'Coordinadora SST',         'SST',            '2024-04-01'),
  ('Pedro Pablo Hernandez Diaz',      '80567891',   'Almacenista',              'Logistica',      '2025-06-15')
) AS v(nombre, cedula, cargo, area, fecha_ingreso)
WHERE e.razon_social ILIKE '%Construandes%'
ON CONFLICT (empresa_id, cedula) DO NOTHING;

-- DevCo Technologies S.A.S. (software) — 6 trabajadores
INSERT INTO trabajadores (id, empresa_id, nombre, cedula, cargo, area, fecha_ingreso, activo)
SELECT
  gen_random_uuid(),
  e.id,
  v.nombre,
  v.cedula,
  v.cargo,
  v.area,
  v.fecha_ingreso::date,
  true
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('Andres Felipe Vargas Munoz',      '1020456789', 'Desarrollador Frontend',   'Desarrollo',     '2024-07-01'),
  ('Catalina Gomez Arango',           '1037654321', 'Desarrolladora Backend',   'Desarrollo',     '2024-08-15'),
  ('Santiago Rivera Caicedo',         '1018234567', 'Lider Tecnico',            'Desarrollo',     '2024-03-01'),
  ('Laura Valentina Pineda Rios',     '52345678',   'Disenadora UX',            'Diseno',         '2025-01-20'),
  ('Juan David Ospina Mejia',         '1098765432', 'QA Engineer',              'Calidad',        '2025-02-10'),
  ('Natalia Andrea Correa Velez',     '1040987654', 'Product Manager',          'Producto',       '2024-11-01')
) AS v(nombre, cedula, cargo, area, fecha_ingreso)
WHERE e.razon_social ILIKE '%DevCo%'
ON CONFLICT (empresa_id, cedula) DO NOTHING;

-- Sabor Criollo S.A.S. (restaurante) — 6 trabajadores
INSERT INTO trabajadores (id, empresa_id, nombre, cedula, cargo, area, fecha_ingreso, activo)
SELECT
  gen_random_uuid(),
  e.id,
  v.nombre,
  v.cedula,
  v.cargo,
  v.area,
  v.fecha_ingreso::date,
  true
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('Gloria Patricia Cardenas Rojas',  '52678912',   'Chef principal',           'Cocina',         '2024-05-01'),
  ('Roberto Carlos Florez Agudelo',   '80345612',   'Sous chef',                'Cocina',         '2024-10-15'),
  ('Ana Maria Betancur Salazar',      '1055678234', 'Mesera jefe',              'Servicio',       '2025-02-01'),
  ('Diego Alejandro Montoya Arias',   '1019234567', 'Barista',                  'Servicio',       '2025-04-10'),
  ('Yuliana Marcela Zapata Henao',    '1037891234', 'Administradora',           'Administracion', '2024-06-20'),
  ('Jhon Freddy Galvis Quintero',     '80789456',   'Auxiliar de cocina',       'Cocina',         '2025-07-01')
) AS v(nombre, cedula, cargo, area, fecha_ingreso)
WHERE e.razon_social ILIKE '%Sabor Criollo%'
ON CONFLICT (empresa_id, cedula) DO NOTHING;


-- ============================================================
-- 2. DOCUMENTOS (3-5 por empresa)
-- ============================================================

INSERT INTO documentos (id, empresa_id, tipo, nombre_archivo, periodo_anio, periodo_mes, estado, fecha_solicitud, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre_archivo,
  v.periodo_anio,
  v.periodo_mes,
  v.estado,
  NOW() - INTERVAL '30 days',
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('politica_sst',         'Politica SST 2026.pdf',              2026, 1, 'aprobado'),
  ('plan_trabajo_anual',   'Plan de Trabajo Anual 2026.xlsx',    2026, 1, 'validado'),
  ('reglamento_higiene',   'Reglamento Higiene y Seguridad.pdf', 2026, 2, 'cargado'),
  ('plan_capacitacion',    'Plan Capacitacion 2026.pdf',         2026, 3, 'pendiente'),
  ('cronograma',           'Cronograma Actividades SST.xlsx',    2026, 1, 'aprobado')
) AS v(tipo, nombre_archivo, periodo_anio, periodo_mes, estado)
WHERE e.razon_social ILIKE '%Construandes%';

INSERT INTO documentos (id, empresa_id, tipo, nombre_archivo, periodo_anio, periodo_mes, estado, fecha_solicitud, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre_archivo,
  v.periodo_anio,
  v.periodo_mes,
  v.estado,
  NOW() - INTERVAL '20 days',
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('politica_sst',         'Politica SST DevCo 2026.pdf',         2026, 1, 'aprobado'),
  ('plan_trabajo_anual',   'PTA DevCo 2026.xlsx',                 2026, 1, 'aprobado'),
  ('reglamento_higiene',   'Reglamento Higiene DevCo.pdf',        2026, 2, 'validado'),
  ('plan_capacitacion',    'Plan Capacitacion DevCo 2026.pdf',    2026, 3, 'cargado')
) AS v(tipo, nombre_archivo, periodo_anio, periodo_mes, estado)
WHERE e.razon_social ILIKE '%DevCo%';

INSERT INTO documentos (id, empresa_id, tipo, nombre_archivo, periodo_anio, periodo_mes, estado, fecha_solicitud, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre_archivo,
  v.periodo_anio,
  v.periodo_mes,
  v.estado,
  NOW() - INTERVAL '25 days',
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('politica_sst',         'Politica SST Sabor Criollo 2026.pdf',    2026, 1, 'validado'),
  ('plan_trabajo_anual',   'PTA Sabor Criollo 2026.xlsx',            2026, 1, 'cargado'),
  ('reglamento_higiene',   'Reglamento Higiene Restaurante.pdf',     2026, 2, 'pendiente'),
  ('cronograma',           'Cronograma SST Sabor Criollo.xlsx',      2026, 1, 'aprobado'),
  ('plan_capacitacion',    'Plan Capacitacion Restaurante 2026.pdf', 2026, 4, 'pendiente')
) AS v(tipo, nombre_archivo, periodo_anio, periodo_mes, estado)
WHERE e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 3. INVENTARIO DE EQUIPOS (5-8 por empresa)
-- ============================================================

-- Construandes Ltda — 8 equipos
INSERT INTO inventario_equipos (id, empresa_id, tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_ultima_inspeccion, estado, notas)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre,
  v.ubicacion,
  v.marca,
  v.serial,
  v.fecha_adquisicion::date,
  v.fecha_vencimiento::date,
  v.fecha_inspeccion::date,
  v.estado,
  v.notas
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('extintor',       'Extintor ABC 10 lb - Oficina',        'Oficina principal',   'Kidde',        'EXT-001-CA', '2025-01-15', '2026-01-15', '2026-03-01', 'vigente',    'Recarga anual programada'),
  ('extintor',       'Extintor ABC 20 lb - Obra',           'Frente de obra',      'Kidde',        'EXT-002-CA', '2024-06-01', '2025-06-01', '2025-05-15', 'vencido',    'REQUIERE RECARGA URGENTE'),
  ('extintor',       'Extintor CO2 15 lb',                  'Bodega materiales',   'Ansul',        'EXT-003-CA', '2025-06-01', '2026-06-01', '2026-04-10', 'por_vencer', 'Vence en 11 dias'),
  ('botiquin',       'Botiquin Tipo A - Oficina',           'Oficina principal',   'Cruz Roja',    'BOT-001-CA', '2025-03-01', '2026-09-01', '2026-04-15', 'vigente',    'Revision trimestral'),
  ('botiquin',       'Botiquin Tipo B - Obra',              'Frente de obra',      'Cruz Roja',    'BOT-002-CA', '2025-01-10', '2026-01-10', '2025-12-20', 'vencido',    'Medicamentos vencidos'),
  ('camilla',        'Camilla rigida con inmovilizador',    'Bodega SST',          'Ferno',        'CAM-001-CA', '2024-08-01', '2027-08-01', '2026-02-01', 'vigente',    'Buen estado'),
  ('detector_humo',  'Detector de humo oficina',            'Oficina principal',   'Honeywell',    'DET-001-CA', '2025-02-15', '2027-02-15', '2026-01-10', 'vigente',    'Bateria verificada'),
  ('senalizacion',   'Kit senalizacion evacuacion',         'Todas las areas',     'Seton',        'SEN-001-CA', '2024-12-01', '2026-12-01', '2026-03-15', 'vigente',    'Incluye 12 senales fotoluminiscentes')
) AS v(tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_inspeccion, estado, notas)
WHERE e.razon_social ILIKE '%Construandes%';

-- DevCo Technologies S.A.S. — 6 equipos
INSERT INTO inventario_equipos (id, empresa_id, tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_ultima_inspeccion, estado, notas)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre,
  v.ubicacion,
  v.marca,
  v.serial,
  v.fecha_adquisicion::date,
  v.fecha_vencimiento::date,
  v.fecha_inspeccion::date,
  v.estado,
  v.notas
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('extintor',       'Extintor ABC 10 lb',                  'Piso 3 - Oficina',    'Kidde',        'EXT-001-DC', '2025-03-01', '2026-03-01', '2026-02-15', 'vencido',    'Vencido en marzo - pendiente recarga'),
  ('extintor',       'Extintor CO2 10 lb - Servidores',     'Cuarto servidores',   'Ansul',        'EXT-002-DC', '2025-07-01', '2026-07-01', '2026-05-01', 'por_vencer', 'Vence en julio'),
  ('botiquin',       'Botiquin Tipo A',                     'Recepcion',           'Cruz Roja',    'BOT-001-DC', '2025-05-01', '2027-05-01', '2026-04-20', 'vigente',    'Completo'),
  ('desfibrilador',  'DEA Philips HeartStart',              'Recepcion',           'Philips',      'DEA-001-DC', '2025-01-15', '2029-01-15', '2026-03-01', 'vigente',    'Pads vigentes hasta 2028'),
  ('detector_humo',  'Detector humo inteligente',           'Cuarto servidores',   'Nest',         'DET-001-DC', '2025-04-01', '2028-04-01', '2026-04-01', 'vigente',    'Conectado a red WiFi'),
  ('senalizacion',   'Kit senalizacion evacuacion oficina', 'Todas las areas',     'Brady',        'SEN-001-DC', '2025-02-01', '2027-02-01', '2026-01-15', 'vigente',    '8 senales rutas de evacuacion')
) AS v(tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_inspeccion, estado, notas)
WHERE e.razon_social ILIKE '%DevCo%';

-- Sabor Criollo S.A.S. — 7 equipos
INSERT INTO inventario_equipos (id, empresa_id, tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_ultima_inspeccion, estado, notas)
SELECT
  gen_random_uuid(),
  e.id,
  v.tipo,
  v.nombre,
  v.ubicacion,
  v.marca,
  v.serial,
  v.fecha_adquisicion::date,
  v.fecha_vencimiento::date,
  v.fecha_inspeccion::date,
  v.estado,
  v.notas
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('extintor',       'Extintor ABC 10 lb - Cocina',         'Cocina',              'Kidde',        'EXT-001-SC', '2025-04-01', '2026-04-01', '2026-03-20', 'vencido',    'Vencido - area critica cocina'),
  ('extintor',       'Extintor Clase K - Cocina',           'Cocina',              'Ansul',        'EXT-002-SC', '2025-08-01', '2026-08-01', '2026-05-01', 'vigente',    'Especifico para grasas y aceites'),
  ('extintor',       'Extintor ABC 10 lb - Salon',          'Salon comedor',       'Kidde',        'EXT-003-SC', '2025-05-15', '2026-05-15', '2026-05-01', 'por_vencer', 'Vence en dias'),
  ('botiquin',       'Botiquin Tipo A',                     'Barra',               'Cruz Roja',    'BOT-001-SC', '2025-06-01', '2026-12-01', '2026-04-10', 'vigente',    'Revision mensual'),
  ('camilla',        'Camilla plegable',                    'Bodega',              'Ferno',        'CAM-001-SC', '2024-11-01', '2027-11-01', '2026-02-15', 'vigente',    'Acceso rapido desde cocina'),
  ('kit_derrames',   'Kit derrames quimicos cocina',        'Cocina - bajo mesón', 'SpillTech',    'KIT-001-SC', '2025-03-01', '2026-03-01', '2026-02-28', 'vencido',    'Material absorbente agotado'),
  ('detector_humo',  'Detector humo cocina industrial',     'Cocina',              'Honeywell',    'DET-001-SC', '2025-05-01', '2028-05-01', '2026-04-01', 'vigente',    'Sensor termico + humo')
) AS v(tipo, nombre, ubicacion, marca, serial, fecha_adquisicion, fecha_vencimiento, fecha_inspeccion, estado, notas)
WHERE e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 4. PILA RECORDS (6 periodos por empresa, 2025-12 a 2026-05)
-- ============================================================

-- Construandes Ltda
INSERT INTO pila_records (id, empresa_id, periodo, estado, fecha_carga, fecha_solicitud, fecha_validacion, fecha_aprobacion, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.periodo,
  v.estado,
  CASE WHEN v.estado != 'pendiente' THEN (v.fecha_ref || ' 10:00:00')::timestamptz ELSE NULL END,
  (v.fecha_ref || ' 08:00:00')::timestamptz,
  CASE WHEN v.estado IN ('validada','aprobada') THEN (v.fecha_ref || ' 14:00:00')::timestamptz ELSE NULL END,
  CASE WHEN v.estado = 'aprobada' THEN (v.fecha_ref || ' 16:00:00')::timestamptz ELSE NULL END,
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('2025-12', 'aprobada', '2026-01-18'),
  ('2026-01', 'aprobada', '2026-02-17'),
  ('2026-02', 'aprobada', '2026-03-18'),
  ('2026-03', 'validada', '2026-04-17'),
  ('2026-04', 'cargada',  '2026-05-16'),
  ('2026-05', 'pendiente','2026-05-20')
) AS v(periodo, estado, fecha_ref)
WHERE e.razon_social ILIKE '%Construandes%'
ON CONFLICT DO NOTHING;

-- DevCo Technologies S.A.S.
INSERT INTO pila_records (id, empresa_id, periodo, estado, fecha_carga, fecha_solicitud, fecha_validacion, fecha_aprobacion, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.periodo,
  v.estado,
  CASE WHEN v.estado != 'pendiente' THEN (v.fecha_ref || ' 10:00:00')::timestamptz ELSE NULL END,
  (v.fecha_ref || ' 08:00:00')::timestamptz,
  CASE WHEN v.estado IN ('validada','aprobada') THEN (v.fecha_ref || ' 14:00:00')::timestamptz ELSE NULL END,
  CASE WHEN v.estado = 'aprobada' THEN (v.fecha_ref || ' 16:00:00')::timestamptz ELSE NULL END,
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('2025-12', 'aprobada', '2026-01-16'),
  ('2026-01', 'aprobada', '2026-02-16'),
  ('2026-02', 'aprobada', '2026-03-17'),
  ('2026-03', 'aprobada', '2026-04-16'),
  ('2026-04', 'validada', '2026-05-17'),
  ('2026-05', 'pendiente','2026-05-20')
) AS v(periodo, estado, fecha_ref)
WHERE e.razon_social ILIKE '%DevCo%'
ON CONFLICT DO NOTHING;

-- Sabor Criollo S.A.S.
INSERT INTO pila_records (id, empresa_id, periodo, estado, fecha_carga, fecha_solicitud, fecha_validacion, fecha_aprobacion, created_at)
SELECT
  gen_random_uuid(),
  e.id,
  v.periodo,
  v.estado,
  CASE WHEN v.estado != 'pendiente' THEN (v.fecha_ref || ' 10:00:00')::timestamptz ELSE NULL END,
  (v.fecha_ref || ' 08:00:00')::timestamptz,
  CASE WHEN v.estado IN ('validada','aprobada') THEN (v.fecha_ref || ' 14:00:00')::timestamptz ELSE NULL END,
  CASE WHEN v.estado = 'aprobada' THEN (v.fecha_ref || ' 16:00:00')::timestamptz ELSE NULL END,
  NOW()
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('2025-12', 'aprobada',  '2026-01-20'),
  ('2026-01', 'aprobada',  '2026-02-18'),
  ('2026-02', 'validada',  '2026-03-19'),
  ('2026-03', 'aprobada',  '2026-04-18'),
  ('2026-04', 'cargada',   '2026-05-18'),
  ('2026-05', 'pendiente', '2026-05-20')
) AS v(periodo, estado, fecha_ref)
WHERE e.razon_social ILIKE '%Sabor Criollo%'
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. EXAMENES MEDICOS (3-5 por empresa, vinculados a trabajadores)
-- ============================================================

-- Construandes Ltda — 4 examenes
INSERT INTO examenes_medicos (id, trabajador_id, empresa_id, tipo_examen, fecha_examen, concepto_aptitud, medico_nombre, procesado_por_ia, confianza_extraccion, texto_extraido_raw)
SELECT
  gen_random_uuid(),
  t.id,
  t.empresa_id,
  v.tipo_examen,
  v.fecha_examen::date,
  v.concepto,
  v.medico,
  true,
  v.confianza,
  v.texto_raw
FROM trabajadores t
JOIN empresas_cliente e ON e.id = t.empresa_id
CROSS JOIN (VALUES
  ('1053782456', 'ingreso',   '2024-06-10', 'apto',                   'Dr. Ricardo Meneses',   0.95, '{"nombre":"Carlos Andres Moreno","cedula":"1053782456","tipo":"ingreso","concepto":"Apto para trabajo en alturas y actividades de construccion","restricciones":[],"recomendaciones":["Uso permanente de EPP","Control audiometrico anual"]}'),
  ('80234567',   'ingreso',   '2024-08-28', 'apto',                   'Dra. Patricia Lozano',  0.92, '{"nombre":"Luis Fernando Ramirez","cedula":"80234567","tipo":"ingreso","concepto":"Apto sin restricciones","restricciones":[],"recomendaciones":["Proteccion auditiva en zonas de ruido"]}'),
  ('52987654',   'periodico', '2026-02-15', 'apto',                   'Dr. Ricardo Meneses',   0.97, '{"nombre":"Maria Fernanda Lopez","cedula":"52987654","tipo":"periodico","concepto":"Apto. Sin alteraciones respecto a evaluacion anterior","restricciones":[],"recomendaciones":["Pausas activas cada 2 horas"]}'),
  ('1098234567', 'periodico', '2026-03-10', 'apto_con_restricciones', 'Dra. Claudia Herrera',  0.89, '{"nombre":"Diana Marcela Ortiz","cedula":"1098234567","tipo":"periodico","concepto":"Apta con restricciones. Evitar carga de peso superior a 15 kg","restricciones":["No levantar mas de 15 kg"],"recomendaciones":["Terapia fisica 2 veces por semana","Control lumbar en 3 meses"]}')
) AS v(cedula_ref, tipo_examen, fecha_examen, concepto, medico, confianza, texto_raw)
WHERE t.cedula = v.cedula_ref
  AND e.razon_social ILIKE '%Construandes%';

-- DevCo Technologies S.A.S. — 4 examenes
INSERT INTO examenes_medicos (id, trabajador_id, empresa_id, tipo_examen, fecha_examen, concepto_aptitud, medico_nombre, procesado_por_ia, confianza_extraccion, texto_extraido_raw)
SELECT
  gen_random_uuid(),
  t.id,
  t.empresa_id,
  v.tipo_examen,
  v.fecha_examen::date,
  v.concepto,
  v.medico,
  true,
  v.confianza,
  v.texto_raw
FROM trabajadores t
JOIN empresas_cliente e ON e.id = t.empresa_id
CROSS JOIN (VALUES
  ('1020456789', 'ingreso',   '2024-06-28', 'apto',                   'Dr. Andres Caballero',  0.96, '{"nombre":"Andres Felipe Vargas","cedula":"1020456789","tipo":"ingreso","concepto":"Apto para trabajo en oficina con pantalla de visualizacion de datos","restricciones":[],"recomendaciones":["Pausas activas cada hora","Uso de filtro de luz azul"]}'),
  ('1037654321', 'ingreso',   '2024-08-12', 'apto',                   'Dra. Sandra Milena Gil', 0.94, '{"nombre":"Catalina Gomez Arango","cedula":"1037654321","tipo":"ingreso","concepto":"Apta sin restricciones","restricciones":[],"recomendaciones":["Ergonomia del puesto de trabajo"]}'),
  ('1018234567', 'periodico', '2026-01-20', 'apto',                   'Dr. Andres Caballero',  0.93, '{"nombre":"Santiago Rivera Caicedo","cedula":"1018234567","tipo":"periodico","concepto":"Apto. Mejoria en postura. Continuar ejercicios","restricciones":[],"recomendaciones":["Continuar programa de pausas activas"]}'),
  ('52345678',   'periodico', '2026-03-05', 'apto_con_restricciones', 'Dra. Sandra Milena Gil', 0.91, '{"nombre":"Laura Valentina Pineda","cedula":"52345678","tipo":"periodico","concepto":"Apta con restricciones. Sindrome de tunel carpiano leve","restricciones":["Limitar uso continuo de mouse a 45 min"],"recomendaciones":["Mouse ergonomico obligatorio","Ejercicios de estiramiento de muneca cada hora","Control en 2 meses"]}')
) AS v(cedula_ref, tipo_examen, fecha_examen, concepto, medico, confianza, texto_raw)
WHERE t.cedula = v.cedula_ref
  AND e.razon_social ILIKE '%DevCo%';

-- Sabor Criollo S.A.S. — 5 examenes
INSERT INTO examenes_medicos (id, trabajador_id, empresa_id, tipo_examen, fecha_examen, concepto_aptitud, medico_nombre, procesado_por_ia, confianza_extraccion, texto_extraido_raw)
SELECT
  gen_random_uuid(),
  t.id,
  t.empresa_id,
  v.tipo_examen,
  v.fecha_examen::date,
  v.concepto,
  v.medico,
  true,
  v.confianza,
  v.texto_raw
FROM trabajadores t
JOIN empresas_cliente e ON e.id = t.empresa_id
CROSS JOIN (VALUES
  ('52678912',   'ingreso',   '2024-04-25', 'apto',                   'Dra. Lucia Estrada',    0.95, '{"nombre":"Gloria Patricia Cardenas","cedula":"52678912","tipo":"ingreso","concepto":"Apta para manipulacion de alimentos. Certificado manipulacion vigente","restricciones":[],"recomendaciones":["Vacunacion hepatitis A verificada","Curso manipulacion de alimentos vigente"]}'),
  ('80345612',   'ingreso',   '2024-10-10', 'apto',                   'Dr. Julio Cesar Pardo', 0.93, '{"nombre":"Roberto Carlos Florez","cedula":"80345612","tipo":"ingreso","concepto":"Apto. Frotis de unas y coprologico negativos","restricciones":[],"recomendaciones":["Uso de cofia y guantes permanente"]}'),
  ('1055678234', 'ingreso',   '2025-01-28', 'apto',                   'Dra. Lucia Estrada',    0.96, '{"nombre":"Ana Maria Betancur","cedula":"1055678234","tipo":"ingreso","concepto":"Apta para atencion al publico y manipulacion de alimentos","restricciones":[],"recomendaciones":["Calzado antideslizante obligatorio"]}'),
  ('1037891234', 'periodico', '2026-02-20', 'apto',                   'Dr. Julio Cesar Pardo', 0.94, '{"nombre":"Yuliana Marcela Zapata","cedula":"1037891234","tipo":"periodico","concepto":"Apta sin restricciones. Examenes de laboratorio normales","restricciones":[],"recomendaciones":["Continuar habitos de higiene"]}'),
  ('80789456',   'egreso',    '2026-04-15', 'apto',                   'Dra. Lucia Estrada',    0.90, '{"nombre":"Jhon Freddy Galvis (retiro anterior)","cedula":"80789456","tipo":"egreso","concepto":"Apto al egreso. Sin patologias de origen laboral","restricciones":[],"recomendaciones":["Sin recomendaciones"]}')
) AS v(cedula_ref, tipo_examen, fecha_examen, concepto, medico, confianza, texto_raw)
WHERE t.cedula = v.cedula_ref
  AND e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 5b. RECOMENDACIONES MEDICAS (para examenes con restricciones)
-- ============================================================

-- Construandes — Diana Marcela Ortiz (restriccion lumbar)
INSERT INTO recomendaciones_medicas (id, examen_id, tipo, descripcion, prioridad, estado)
SELECT
  gen_random_uuid(),
  em.id,
  v.tipo,
  v.descripcion,
  v.prioridad,
  v.estado
FROM examenes_medicos em
JOIN trabajadores t ON t.id = em.trabajador_id
CROSS JOIN (VALUES
  ('restriccion',    'No levantar cargas superiores a 15 kg',        'alta',  'en_cumplimiento'),
  ('recomendacion',  'Terapia fisica 2 veces por semana',            'alta',  'en_cumplimiento'),
  ('recomendacion',  'Control medico lumbar en 3 meses',             'media', 'pendiente')
) AS v(tipo, descripcion, prioridad, estado)
WHERE t.cedula = '1098234567'
  AND em.tipo_examen = 'periodico';

-- DevCo — Laura Valentina Pineda (tunel carpiano)
INSERT INTO recomendaciones_medicas (id, examen_id, tipo, descripcion, prioridad, estado)
SELECT
  gen_random_uuid(),
  em.id,
  v.tipo,
  v.descripcion,
  v.prioridad,
  v.estado
FROM examenes_medicos em
JOIN trabajadores t ON t.id = em.trabajador_id
CROSS JOIN (VALUES
  ('restriccion',    'Limitar uso continuo de mouse a 45 minutos',   'alta',  'en_cumplimiento'),
  ('recomendacion',  'Mouse ergonomico obligatorio',                 'alta',  'cumplida'),
  ('recomendacion',  'Ejercicios de estiramiento de muneca cada hora','media', 'en_cumplimiento'),
  ('recomendacion',  'Control medico tunel carpiano en 2 meses',     'media', 'pendiente')
) AS v(tipo, descripcion, prioridad, estado)
WHERE t.cedula = '52345678'
  AND em.tipo_examen = 'periodico';


-- ============================================================
-- 6. COMITES COPASST (1 por empresa) + INTEGRANTES + ACTAS + PUNTOS
-- ============================================================

-- 6a. Comites (uno por empresa)
INSERT INTO comites (id, empresa_id, tipo, fecha_inicio_periodo, fecha_fin_periodo, activo)
SELECT
  gen_random_uuid(),
  e.id,
  'copasst',
  '2026-01-01'::date,
  '2027-12-31'::date,
  true
FROM empresas_cliente e
WHERE e.razon_social ILIKE ANY(ARRAY['%Construandes%', '%DevCo%', '%Sabor Criollo%'])
ON CONFLICT (empresa_id, tipo, fecha_inicio_periodo) DO NOTHING;

-- 6b. Integrantes del comite — Construandes
INSERT INTO integrantes_comite (id, comite_id, nombre, cedula, cargo_empresa, rol_comite, es_principal, activo)
SELECT
  gen_random_uuid(),
  c.id,
  v.nombre,
  v.cedula,
  v.cargo_empresa,
  v.rol_comite,
  true,
  true
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  ('Maria Fernanda Lopez Castillo',   '52987654',   'Ingeniera residente',       'presidente'),
  ('Diana Marcela Ortiz Reyes',       '1098234567', 'Coordinadora SST',          'secretario'),
  ('Carlos Andres Moreno Gutierrez',  '1053782456', 'Maestro de obra',           'representante_empleador'),
  ('Luis Fernando Ramirez Torres',    '80234567',   'Oficial de construccion',   'representante_trabajadores')
) AS v(nombre, cedula, cargo_empresa, rol_comite)
WHERE e.razon_social ILIKE '%Construandes%'
  AND c.tipo = 'copasst';

-- Integrantes — DevCo Technologies
INSERT INTO integrantes_comite (id, comite_id, nombre, cedula, cargo_empresa, rol_comite, es_principal, activo)
SELECT
  gen_random_uuid(),
  c.id,
  v.nombre,
  v.cedula,
  v.cargo_empresa,
  v.rol_comite,
  true,
  true
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  ('Santiago Rivera Caicedo',         '1018234567', 'Lider Tecnico',             'presidente'),
  ('Natalia Andrea Correa Velez',     '1040987654', 'Product Manager',           'secretario'),
  ('Andres Felipe Vargas Munoz',      '1020456789', 'Desarrollador Frontend',    'representante_empleador'),
  ('Juan David Ospina Mejia',         '1098765432', 'QA Engineer',               'representante_trabajadores')
) AS v(nombre, cedula, cargo_empresa, rol_comite)
WHERE e.razon_social ILIKE '%DevCo%'
  AND c.tipo = 'copasst';

-- Integrantes — Sabor Criollo
INSERT INTO integrantes_comite (id, comite_id, nombre, cedula, cargo_empresa, rol_comite, es_principal, activo)
SELECT
  gen_random_uuid(),
  c.id,
  v.nombre,
  v.cedula,
  v.cargo_empresa,
  v.rol_comite,
  true,
  true
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  ('Yuliana Marcela Zapata Henao',    '1037891234', 'Administradora',            'presidente'),
  ('Gloria Patricia Cardenas Rojas',  '52678912',   'Chef principal',            'secretario'),
  ('Roberto Carlos Florez Agudelo',   '80345612',   'Sous chef',                 'representante_empleador'),
  ('Ana Maria Betancur Salazar',      '1055678234', 'Mesera jefe',               'representante_trabajadores')
) AS v(nombre, cedula, cargo_empresa, rol_comite)
WHERE e.razon_social ILIKE '%Sabor Criollo%'
  AND c.tipo = 'copasst';

-- 6c. Actas de comite (2-3 por comite)
-- Construandes — 3 actas
INSERT INTO actas_comite (id, comite_id, numero_acta, fecha_reunion, tipo_reunion, lugar, hora_inicio, hora_fin, estado, hay_quorum, generada_por_ia, firmada, archivada, recordatorios_firma)
SELECT
  gen_random_uuid(),
  c.id,
  v.numero,
  v.fecha::timestamptz,
  'ordinaria',
  v.lugar,
  v.hora_ini::time,
  v.hora_fin::time,
  v.estado,
  true,
  true,
  v.firmada,
  v.archivada,
  v.recordatorios
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, '2026-01-30 09:00:00', 'Oficina Construandes - Sala de reuniones', '09:00', '10:30', 'firmada',   true,  true,  0),
  (2, '2026-02-27 09:00:00', 'Oficina Construandes - Sala de reuniones', '09:00', '10:15', 'firmada',   true,  false, 0),
  (3, '2026-03-27 09:00:00', 'Oficina Construandes - Sala de reuniones', '09:00', '10:45', 'generada',  false, false, 2)
) AS v(numero, fecha, lugar, hora_ini, hora_fin, estado, firmada, archivada, recordatorios)
WHERE e.razon_social ILIKE '%Construandes%'
  AND c.tipo = 'copasst';

-- DevCo — 2 actas
INSERT INTO actas_comite (id, comite_id, numero_acta, fecha_reunion, tipo_reunion, lugar, hora_inicio, hora_fin, estado, hay_quorum, generada_por_ia, firmada, archivada, recordatorios_firma)
SELECT
  gen_random_uuid(),
  c.id,
  v.numero,
  v.fecha::timestamptz,
  'ordinaria',
  v.lugar,
  v.hora_ini::time,
  v.hora_fin::time,
  v.estado,
  true,
  true,
  v.firmada,
  v.archivada,
  v.recordatorios
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, '2026-01-28 14:00:00', 'DevCo - Sala de juntas piso 3',   '14:00', '15:00', 'firmada',   true,  true,  0),
  (2, '2026-02-25 14:00:00', 'DevCo - Sala de juntas piso 3',   '14:00', '15:30', 'generada',  false, false, 1)
) AS v(numero, fecha, lugar, hora_ini, hora_fin, estado, firmada, archivada, recordatorios)
WHERE e.razon_social ILIKE '%DevCo%'
  AND c.tipo = 'copasst';

-- Sabor Criollo — 3 actas
INSERT INTO actas_comite (id, comite_id, numero_acta, fecha_reunion, tipo_reunion, lugar, hora_inicio, hora_fin, estado, hay_quorum, generada_por_ia, firmada, archivada, recordatorios_firma)
SELECT
  gen_random_uuid(),
  c.id,
  v.numero,
  v.fecha::timestamptz,
  'ordinaria',
  v.lugar,
  v.hora_ini::time,
  v.hora_fin::time,
  v.estado,
  true,
  true,
  v.firmada,
  v.archivada,
  v.recordatorios
FROM comites c
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, '2026-02-05 08:00:00', 'Sabor Criollo - Oficina admin',   '08:00', '09:00', 'firmada',   true,  true,  0),
  (2, '2026-03-05 08:00:00', 'Sabor Criollo - Oficina admin',   '08:00', '09:15', 'firmada',   true,  false, 0),
  (3, '2026-04-02 08:00:00', 'Sabor Criollo - Oficina admin',   '08:00', '09:30', 'borrador',  false, false, 0)
) AS v(numero, fecha, lugar, hora_ini, hora_fin, estado, firmada, archivada, recordatorios)
WHERE e.razon_social ILIKE '%Sabor Criollo%'
  AND c.tipo = 'copasst';

-- 6d. Puntos de acta (3-4 por acta)
-- Construandes Acta 1
INSERT INTO puntos_acta (id, acta_id, orden, descripcion, compromisos, responsable, fecha_limite)
SELECT
  gen_random_uuid(),
  a.id,
  v.orden,
  v.descripcion,
  v.compromisos,
  v.responsable,
  v.fecha_limite::date
FROM actas_comite a
JOIN comites c ON c.id = a.comite_id
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, 'Revision del cumplimiento del plan de trabajo SST del mes anterior',            'Actualizar tablero de seguimiento con avances del mes',                                       'Diana Marcela Ortiz', '2026-02-15'),
  (2, 'Reporte de accidentes e incidentes de trabajo del periodo',                     'Investigar incidente de caida de material en obra norte. Implementar malla de seguridad',     'Carlos Andres Moreno','2026-02-10'),
  (3, 'Inspeccion de EPP: estado actual del inventario y dotacion',                    'Solicitar reposicion de 5 cascos y 10 pares de guantes con desgaste',                         'Pedro Pablo Hernandez','2026-02-20'),
  (4, 'Programacion de capacitacion en trabajo en alturas para febrero',               'Coordinar con ARL la capacitacion. Confirmar lista de asistentes',                            'Diana Marcela Ortiz', '2026-02-05')
) AS v(orden, descripcion, compromisos, responsable, fecha_limite)
WHERE a.numero_acta = 1
  AND e.razon_social ILIKE '%Construandes%';

-- Construandes Acta 2
INSERT INTO puntos_acta (id, acta_id, orden, descripcion, compromisos, responsable, fecha_limite)
SELECT
  gen_random_uuid(),
  a.id,
  v.orden,
  v.descripcion,
  v.compromisos,
  v.responsable,
  v.fecha_limite::date
FROM actas_comite a
JOIN comites c ON c.id = a.comite_id
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, 'Seguimiento a compromisos del acta anterior',                                   'Se verifico cumplimiento de malla de seguridad. Pendiente reposicion EPP',                    'Diana Marcela Ortiz', '2026-03-15'),
  (2, 'Resultados de la capacitacion en trabajo en alturas',                           'Archivar certificados. Programar recertificacion para agosto',                                'Maria Fernanda Lopez','2026-03-01'),
  (3, 'Identificacion de nuevos peligros en obra sector sur',                          'Incluir riesgo de excavacion profunda en matriz de riesgos',                                  'Diana Marcela Ortiz', '2026-03-10')
) AS v(orden, descripcion, compromisos, responsable, fecha_limite)
WHERE a.numero_acta = 2
  AND e.razon_social ILIKE '%Construandes%';

-- DevCo Acta 1
INSERT INTO puntos_acta (id, acta_id, orden, descripcion, compromisos, responsable, fecha_limite)
SELECT
  gen_random_uuid(),
  a.id,
  v.orden,
  v.descripcion,
  v.compromisos,
  v.responsable,
  v.fecha_limite::date
FROM actas_comite a
JOIN comites c ON c.id = a.comite_id
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, 'Evaluacion de condiciones ergonomicas de los puestos de trabajo',               'Solicitar evaluacion ergonomica con la ARL para todos los puestos',                           'Natalia Correa',      '2026-02-15'),
  (2, 'Revision del programa de pausas activas y adherencia del equipo',               'Implementar recordatorio automatico de pausas activas cada 2 horas via Slack',                'Santiago Rivera',     '2026-02-10'),
  (3, 'Reporte de sintomas de fatiga visual y tunel carpiano',                         'Entregar mouse ergonomico a Laura Pineda. Evaluar sillas ergonomicas para todo el equipo',    'Natalia Correa',      '2026-02-20'),
  (4, 'Programacion del simulacro de evacuacion del primer semestre',                  'Coordinar simulacro con administracion del edificio para marzo',                              'Santiago Rivera',     '2026-02-28')
) AS v(orden, descripcion, compromisos, responsable, fecha_limite)
WHERE a.numero_acta = 1
  AND e.razon_social ILIKE '%DevCo%';

-- Sabor Criollo Acta 1
INSERT INTO puntos_acta (id, acta_id, orden, descripcion, compromisos, responsable, fecha_limite)
SELECT
  gen_random_uuid(),
  a.id,
  v.orden,
  v.descripcion,
  v.compromisos,
  v.responsable,
  v.fecha_limite::date
FROM actas_comite a
JOIN comites c ON c.id = a.comite_id
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, 'Revision de condiciones de seguridad en cocina: estado de equipos y ventilacion','Solicitar mantenimiento de campana extractora. Revisar estado de valvulas de gas',            'Gloria Cardenas',     '2026-02-20'),
  (2, 'Verificacion del estado del botiquin y extintores',                              'Recargar extintor vencido de cocina. Reponer insumos del botiquin',                           'Yuliana Zapata',      '2026-02-15'),
  (3, 'Revision de certificados de manipulacion de alimentos vigentes',                 'Renovar certificado de Diego Montoya que vence en marzo',                                     'Roberto Florez',      '2026-02-28'),
  (4, 'Programacion de capacitacion en manejo seguro de cuchillos y equipos de cocina', 'Coordinar capacitacion con proveedor de equipos para la primera semana de marzo',             'Gloria Cardenas',     '2026-03-07')
) AS v(orden, descripcion, compromisos, responsable, fecha_limite)
WHERE a.numero_acta = 1
  AND e.razon_social ILIKE '%Sabor Criollo%';

-- Sabor Criollo Acta 2
INSERT INTO puntos_acta (id, acta_id, orden, descripcion, compromisos, responsable, fecha_limite)
SELECT
  gen_random_uuid(),
  a.id,
  v.orden,
  v.descripcion,
  v.compromisos,
  v.responsable,
  v.fecha_limite::date
FROM actas_comite a
JOIN comites c ON c.id = a.comite_id
JOIN empresas_cliente e ON e.id = c.empresa_id
CROSS JOIN (VALUES
  (1, 'Seguimiento a compromisos del acta anterior',                                    'Campana extractora reparada. Extintor recargado. Certificado de Diego pendiente',              'Yuliana Zapata',      '2026-03-20'),
  (2, 'Reporte de quemaduras leves del periodo y analisis de causas',                   'Implementar protectores de antebrazo para personal de cocina. Reforzar protocolo de manejo de aceite caliente', 'Gloria Cardenas', '2026-03-15'),
  (3, 'Evaluacion de pisos: condicion antideslizante en cocina y salon',                'Instalar tapetes antideslizantes adicionales en zona de lavado',                               'Roberto Florez',      '2026-03-25')
) AS v(orden, descripcion, compromisos, responsable, fecha_limite)
WHERE a.numero_acta = 2
  AND e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 7. PLANES DE EMERGENCIA (1 por empresa)
-- ============================================================

INSERT INTO planes_emergencia (id, empresa_id, estado, transcripcion, analisis_json, generado_por_ia)
SELECT
  gen_random_uuid(),
  e.id,
  'en_revision',
  'Inspeccion de seguridad realizada en las oficinas y frente de obra de Construandes. Se identificaron rutas de evacuacion parcialmente obstruidas por material de construccion en el piso 2. El sistema de alarma funciona correctamente. Se recomienda despejar pasillos y realizar simulacro de evacuacion antes de finalizar el trimestre.',
  '{"amenazas":[{"tipo":"natural","descripcion":"Sismo","probabilidad":"posible","nivel_riesgo":"medio"},{"tipo":"tecnologica","descripcion":"Incendio por cortocircuito en obra","probabilidad":"probable","nivel_riesgo":"alto"},{"tipo":"natural","descripcion":"Inundacion por lluvias","probabilidad":"posible","nivel_riesgo":"medio"}],"vulnerabilidades":{"personas":{"calificacion":0.5,"observacion":"Personal parcialmente capacitado en evacuacion. Falta simulacro reciente"},"recursos":{"calificacion":0.5,"observacion":"Extintores presentes pero uno vencido. Botiquin de obra incompleto"},"procesos":{"calificacion":1.0,"observacion":"Plan de emergencias documentado y socializado"}},"recursos_emergencia":{"brigada_formada":true,"num_brigadistas":3,"ruta_hospital":"Hospital San Jose - 8 min en vehiculo","punto_encuentro":"Parqueadero exterior lote norte"},"recomendaciones":["Despejar rutas de evacuacion del piso 2","Recargar extintor vencido de bodega","Programar simulacro para Q1 2026","Capacitar 2 brigadistas adicionales"]}'::jsonb,
  true
FROM empresas_cliente e
WHERE e.razon_social ILIKE '%Construandes%';

INSERT INTO planes_emergencia (id, empresa_id, estado, transcripcion, analisis_json, generado_por_ia)
SELECT
  gen_random_uuid(),
  e.id,
  'en_revision',
  'Recorrido de seguridad en las oficinas de DevCo Technologies, piso 3 del edificio Torre Empresarial. Las rutas de evacuacion estan correctamente senalizadas. El cuarto de servidores cuenta con extintor CO2 vigente y detector de humo funcional. Se detecto que la puerta de emergencia del piso tiene el sistema de apertura con llave, lo cual incumple la norma. Se recomienda cambiar a barra antipanico.',
  '{"amenazas":[{"tipo":"natural","descripcion":"Sismo","probabilidad":"posible","nivel_riesgo":"medio"},{"tipo":"tecnologica","descripcion":"Incendio electrico en cuarto de servidores","probabilidad":"posible","nivel_riesgo":"alto"},{"tipo":"tecnologica","descripcion":"Falla electrica prolongada","probabilidad":"posible","nivel_riesgo":"bajo"}],"vulnerabilidades":{"personas":{"calificacion":1.0,"observacion":"Personal capacitado. DEA disponible en recepcion"},"recursos":{"calificacion":0.5,"observacion":"Puerta de emergencia con llave en lugar de barra antipanico"},"procesos":{"calificacion":1.0,"observacion":"Plan documentado. Responsables asignados"}},"recursos_emergencia":{"brigada_formada":true,"num_brigadistas":2,"ruta_hospital":"Clinica del Country - 5 min","punto_encuentro":"Plazoleta principal del edificio"},"recomendaciones":["Cambiar cerradura de puerta de emergencia a barra antipanico","Instalar iluminacion de emergencia en cuarto de servidores","Programar simulacro conjunto con administracion del edificio"]}'::jsonb,
  true
FROM empresas_cliente e
WHERE e.razon_social ILIKE '%DevCo%';

INSERT INTO planes_emergencia (id, empresa_id, estado, transcripcion, analisis_json, generado_por_ia)
SELECT
  gen_random_uuid(),
  e.id,
  'en_revision',
  'Visita de seguridad al restaurante Sabor Criollo. Se inspeccionaron cocina, salon comedor, barra y bodega. En la cocina se encontro un extintor ABC vencido y el kit de derrames con material absorbente agotado. La campana extractora fue reparada recientemente. Los pisos de la cocina necesitan tapetes antideslizantes adicionales en la zona de lavado. El punto de encuentro esta claramente senalizado en la entrada principal.',
  '{"amenazas":[{"tipo":"tecnologica","descripcion":"Incendio por aceite o gas en cocina","probabilidad":"probable","nivel_riesgo":"alto"},{"tipo":"tecnologica","descripcion":"Quemaduras por liquidos calientes","probabilidad":"probable","nivel_riesgo":"alto"},{"tipo":"natural","descripcion":"Sismo","probabilidad":"posible","nivel_riesgo":"medio"},{"tipo":"social","descripcion":"Atraco o robo","probabilidad":"posible","nivel_riesgo":"medio"}],"vulnerabilidades":{"personas":{"calificacion":0.5,"observacion":"Chef y sous chef con capacitacion basica en emergencias. Falta capacitacion a meseros"},"recursos":{"calificacion":0.0,"observacion":"Extintor cocina vencido. Kit derrames agotado. Falta tapete antideslizante en lavado"},"procesos":{"calificacion":0.5,"observacion":"Plan de emergencias en elaboracion. Protocolo de cierre de gas documentado"}},"recursos_emergencia":{"brigada_formada":false,"num_brigadistas":0,"ruta_hospital":"Clinica Las Americas - 10 min","punto_encuentro":"Andén entrada principal"},"recomendaciones":["Recargar extintor ABC de cocina URGENTE","Reponer kit de derrames quimicos","Instalar tapetes antideslizantes en zona de lavado","Formar brigada de emergencias con al menos 2 personas","Capacitar a todo el personal en uso de extintores"]}'::jsonb,
  true
FROM empresas_cliente e
WHERE e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 8. MATRICES DE RIESGO (1 por empresa + riesgos GTC 45)
-- ============================================================

-- 8a. Crear las matrices
INSERT INTO matrices_riesgo (id, empresa_id, version, fecha_elaboracion, estado, generada_por_ia)
SELECT
  gen_random_uuid(),
  e.id,
  1,
  '2026-03-15'::date,
  'borrador',
  true
FROM empresas_cliente e
WHERE e.razon_social ILIKE ANY(ARRAY['%Construandes%', '%DevCo%', '%Sabor Criollo%']);

-- 8b. Riesgos — Construandes (construccion)
INSERT INTO riesgos_matriz (id, matriz_id, proceso, zona, actividad, tarea, es_rutinaria, categoria_peligro, descripcion_peligro, fuente_peligro, efectos_posibles, control_fuente, control_medio, control_individuo, nivel_deficiencia, nivel_exposicion, nivel_consecuencia, aceptabilidad, medida_administrativa, medida_epp, num_expuestos)
SELECT
  gen_random_uuid(),
  m.id,
  v.proceso,
  v.zona,
  v.actividad,
  v.tarea,
  v.rutinaria,
  v.cat_peligro,
  v.desc_peligro,
  v.fuente,
  v.efectos,
  v.ctrl_fuente,
  v.ctrl_medio,
  v.ctrl_individuo,
  v.nd,
  v.ne,
  v.nc,
  v.aceptabilidad,
  v.med_admin,
  v.med_epp,
  v.expuestos
FROM matrices_riesgo m
JOIN empresas_cliente e ON e.id = m.empresa_id
CROSS JOIN (VALUES
  ('Construccion',    'Frente de obra',  'Trabajo en alturas',          'Instalacion de estructuras en altura',  true,  'Condiciones de seguridad',  'Caida de alturas mayor a 1.5 m',           'Andamios y escaleras',         'Fracturas, politraumatismo, muerte',                   'Andamios certificados',   'Linea de vida',          'Arnes de seguridad',       6, 3, 100, 'no_aceptable',    'Permiso de trabajo en alturas obligatorio. Capacitacion certificada',                     'Arnes 4 puntos, casco con barbuquejo, botas antideslizantes',  6),
  ('Construccion',    'Frente de obra',  'Excavaciones',                'Excavacion de zanjas para cimentacion', true,  'Condiciones de seguridad',  'Derrumbe o colapso de excavacion',         'Terreno inestable',            'Atrapamiento, asfixia, muerte',                        'Entibado de paredes',     'Senalizacion perimetral','Casco, botas punta acero',  6, 2, 100, 'no_aceptable',    'Inspeccion diaria del terreno. Prohibido trabajar solo en excavaciones',                  'Casco, botas con punta de acero, chaleco reflectivo',          4),
  ('Construccion',    'Frente de obra',  'Uso de herramientas manuales','Corte y pulido de materiales',          true,  'Condiciones de seguridad',  'Proyeccion de particulas y cortes',        'Pulidora, sierra circular',    'Heridas cortantes, lesion ocular',                     'Guardas de seguridad',    'Pantallas protectoras',  'Gafas de seguridad',        2, 4, 25,  'mejorable',       'Capacitacion en manejo seguro de herramientas. Inspeccion preoperacional',                'Gafas de seguridad, guantes de carnaza, proteccion auditiva',  5),
  ('Logistica',       'Bodega',          'Almacenamiento de materiales','Carga y descarga manual de materiales', true,  'Biomecanico',               'Sobreesfuerzo por manipulacion de cargas', 'Materiales de construccion',   'Lumbalgia, hernia discal, lesiones musculoesqueleticas','Ayudas mecanicas',        NULL,                     'Faja lumbar',               6, 3, 25,  'no_aceptable_si', 'Limite de carga 25 kg por persona. Tecnica de levantamiento seguro',                     'Faja lumbar, guantes, botas de seguridad',                     4),
  ('Administracion',  'Oficina',         'Trabajo de escritorio',       'Digitacion y revision de planos',       true,  'Biomecanico',               'Postura prolongada sedente',                'Silla y escritorio',           'Dolor lumbar, fatiga visual, sindrome tunel carpiano', 'Mobiliario ergonomico',   'Apoyapies',              NULL,                        2, 4, 10,  'aceptable',       'Pausas activas cada 2 horas. Evaluacion ergonomica del puesto',                          NULL,                                                           3)
) AS v(proceso, zona, actividad, tarea, rutinaria, cat_peligro, desc_peligro, fuente, efectos, ctrl_fuente, ctrl_medio, ctrl_individuo, nd, ne, nc, aceptabilidad, med_admin, med_epp, expuestos)
WHERE e.razon_social ILIKE '%Construandes%';

-- 8b. Riesgos — DevCo Technologies (software)
INSERT INTO riesgos_matriz (id, matriz_id, proceso, zona, actividad, tarea, es_rutinaria, categoria_peligro, descripcion_peligro, fuente_peligro, efectos_posibles, control_fuente, control_medio, control_individuo, nivel_deficiencia, nivel_exposicion, nivel_consecuencia, aceptabilidad, medida_administrativa, medida_epp, num_expuestos)
SELECT
  gen_random_uuid(),
  m.id,
  v.proceso,
  v.zona,
  v.actividad,
  v.tarea,
  v.rutinaria,
  v.cat_peligro,
  v.desc_peligro,
  v.fuente,
  v.efectos,
  v.ctrl_fuente,
  v.ctrl_medio,
  v.ctrl_individuo,
  v.nd,
  v.ne,
  v.nc,
  v.aceptabilidad,
  v.med_admin,
  v.med_epp,
  v.expuestos
FROM matrices_riesgo m
JOIN empresas_cliente e ON e.id = m.empresa_id
CROSS JOIN (VALUES
  ('Desarrollo',      'Oficina piso 3',  'Programacion',                'Codificacion frente a pantalla',        true,  'Biomecanico',               'Postura sedente prolongada y movimientos repetitivos', 'Computador, silla, escritorio','Dolor lumbar, sindrome tunel carpiano, fatiga visual',  'Sillas ergonomicas',      'Monitor a altura de ojos','Pad ergonomico',           2, 4, 10,  'aceptable',       'Pausas activas obligatorias cada hora. Evaluacion ergonomica semestral',                  NULL,                                                          12),
  ('Desarrollo',      'Oficina piso 3',  'Programacion',                'Uso prolongado de mouse y teclado',     true,  'Biomecanico',               'Movimientos repetitivos de muneca',        'Mouse, teclado',               'Sindrome tunel carpiano, tendinitis',                  'Mouse vertical ergonomico','Apoya munecas',           NULL,                        2, 4, 25,  'mejorable',       'Rotacion de tareas. Ejercicios de estiramiento cada 45 minutos',                         NULL,                                                          12),
  ('Desarrollo',      'Oficina piso 3',  'Trabajo en equipo',           'Reuniones virtuales prolongadas',       true,  'Psicosocial',               'Fatiga mental por carga de trabajo y reuniones',       'Jornada laboral',              'Estres, burnout, ansiedad, insomnio',                  NULL,                      NULL,                     NULL,                        2, 3, 25,  'mejorable',       'Politica de reuniones max 45 min. Dias sin reuniones. Programa de bienestar',            NULL,                                                          15),
  ('Infraestructura', 'Cuarto servidores','Mantenimiento de servidores', 'Manipulacion de equipos electricos',    false, 'Condiciones de seguridad',  'Contacto electrico directo o indirecto',   'Cableado y UPS',               'Electrocucion, quemaduras',                            'Canaletas aisladas',      'Senalizacion electrica', 'Guantes dielectricos',      2, 1, 60,  'mejorable',       'Solo personal autorizado. Procedimiento de bloqueo y etiquetado (LOTO)',                 'Guantes dielectricos, calzado dielectrico',                    2)
) AS v(proceso, zona, actividad, tarea, rutinaria, cat_peligro, desc_peligro, fuente, efectos, ctrl_fuente, ctrl_medio, ctrl_individuo, nd, ne, nc, aceptabilidad, med_admin, med_epp, expuestos)
WHERE e.razon_social ILIKE '%DevCo%';

-- 8b. Riesgos — Sabor Criollo (restaurante)
INSERT INTO riesgos_matriz (id, matriz_id, proceso, zona, actividad, tarea, es_rutinaria, categoria_peligro, descripcion_peligro, fuente_peligro, efectos_posibles, control_fuente, control_medio, control_individuo, nivel_deficiencia, nivel_exposicion, nivel_consecuencia, aceptabilidad, medida_administrativa, medida_epp, num_expuestos)
SELECT
  gen_random_uuid(),
  m.id,
  v.proceso,
  v.zona,
  v.actividad,
  v.tarea,
  v.rutinaria,
  v.cat_peligro,
  v.desc_peligro,
  v.fuente,
  v.efectos,
  v.ctrl_fuente,
  v.ctrl_medio,
  v.ctrl_individuo,
  v.nd,
  v.ne,
  v.nc,
  v.aceptabilidad,
  v.med_admin,
  v.med_epp,
  v.expuestos
FROM matrices_riesgo m
JOIN empresas_cliente e ON e.id = m.empresa_id
CROSS JOIN (VALUES
  ('Cocina',          'Cocina',          'Coccion de alimentos',        'Manejo de sartenes con aceite caliente', true,  'Condiciones de seguridad',  'Quemaduras por contacto con superficies y liquidos calientes', 'Estufas, hornos, freidoras',   'Quemaduras grado I-III',                               'Protectores en hornillas','Campana extractora',     'Guantes termicos',          6, 4, 25,  'no_aceptable',    'Protocolo de manejo seguro de aceite caliente. Capacitacion en primeros auxilios',        'Guantes termicos, delantal antifluidos, calzado antideslizante', 4),
  ('Cocina',          'Cocina',          'Preparacion de alimentos',    'Corte de carnes y verduras',             true,  'Condiciones de seguridad',  'Heridas cortantes por uso de cuchillos',   'Cuchillos, procesadores',      'Heridas cortantes, amputacion de falange',             'Cuchillos con mango ergonomico','Tabla de corte antideslizante','Guantes anticorte',  6, 4, 25,  'no_aceptable',    'Capacitacion tecnica de corte. Mantenimiento de filo de cuchillos',                      'Guantes de malla anticorte',                                    4),
  ('Cocina',          'Cocina',          'Limpieza de cocina',          'Lavado de pisos y equipos',              true,  'Condiciones de seguridad',  'Caida al mismo nivel por piso humedo',     'Agua y detergentes',           'Contusiones, esguinces, fracturas',                    'Piso antideslizante',     'Tapetes de drenaje',     'Botas antideslizantes',     2, 4, 25,  'mejorable',       'Senalizacion de piso humedo obligatoria. Limpieza en horarios de bajo trafico',          'Botas antideslizantes, guantes de caucho',                      6),
  ('Servicio',        'Salon comedor',   'Atencion a clientes',         'Transporte de platos calientes',         true,  'Biomecanico',               'Sobreesfuerzo por carga de bandejas pesadas','Bandejas con platos',          'Tendinitis de hombro, lumbalgia',                      'Bandejas livianas',       NULL,                     NULL,                        2, 4, 10,  'aceptable',       'Limite de peso por bandeja. Tecnica de transporte seguro',                               NULL,                                                            3),
  ('Cocina',          'Cocina',          'Almacenamiento',              'Manejo de cilindros de gas',             false, 'Condiciones de seguridad',  'Fuga de gas propano con riesgo de explosion','Cilindros de gas',             'Explosion, quemaduras, muerte',                        'Valvulas de seguridad',   'Detector de gas',        NULL,                        6, 2, 100, 'no_aceptable',    'Protocolo de apertura y cierre de gas. Inspeccion semanal de mangueras y valvulas',      NULL,                                                            4)
) AS v(proceso, zona, actividad, tarea, rutinaria, cat_peligro, desc_peligro, fuente, efectos, ctrl_fuente, ctrl_medio, ctrl_individuo, nd, ne, nc, aceptabilidad, med_admin, med_epp, expuestos)
WHERE e.razon_social ILIKE '%Sabor Criollo%';


-- ============================================================
-- 9. CUMPLIMIENTO EMPRESA 2026 (evaluacion parcial)
-- ============================================================

INSERT INTO cumplimiento_empresa (id, empresa_id, anio, puntaje_total, puntaje_planear, puntaje_hacer, puntaje_verificar, puntaje_actuar, fecha_evaluacion)
SELECT
  gen_random_uuid(),
  e.id,
  2026,
  v.total,
  v.planear,
  v.hacer,
  v.verificar,
  v.actuar,
  '2026-04-15'::date
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('%Construandes%',    72.50, 20.00, 35.50, 12.00, 5.00),
  ('%DevCo%',           85.00, 24.00, 40.00, 15.00, 6.00),
  ('%Sabor Criollo%',   58.00, 15.00, 28.00, 10.00, 5.00)
) AS v(pattern, total, planear, hacer, verificar, actuar)
WHERE e.razon_social ILIKE v.pattern
ON CONFLICT (empresa_id, anio) DO NOTHING;


-- ============================================================
-- 10. LOGS DE ACTIVIDAD (ultimas acciones simuladas)
-- ============================================================

INSERT INTO logs_actividad (id, tipo, modulo, empresa_id, descripcion, metadata, created_at)
SELECT
  gen_random_uuid(),
  v.tipo,
  v.modulo,
  e.id,
  v.descripcion,
  v.metadata::jsonb,
  v.fecha::timestamptz
FROM empresas_cliente e
CROSS JOIN (VALUES
  ('info',      'pila',        '%Construandes%',    'PILA periodo 2026-04 cargada exitosamente',                     '{"periodo":"2026-04","archivo":"pila_construandes_202604.pdf"}',     '2026-05-16 10:15:00'),
  ('info',      'pila',        '%DevCo%',           'PILA periodo 2026-04 validada por consultor',                   '{"periodo":"2026-04","validado_por":"admin"}',                      '2026-05-17 14:30:00'),
  ('warning',   'equipos',     '%Sabor Criollo%',   'Extintor ABC de cocina vencido - requiere recarga inmediata',   '{"equipo":"Extintor ABC 10 lb - Cocina","tipo":"extintor"}',        '2026-05-15 08:00:00'),
  ('info',      'examenes',    '%Construandes%',    'Examen periodico procesado por IA - Diana Marcela Ortiz',       '{"trabajador":"Diana Marcela Ortiz","confianza":0.89}',             '2026-03-10 11:00:00'),
  ('info',      'comites',     '%DevCo%',           'Acta COPASST #2 generada por IA exitosamente',                  '{"acta_numero":2,"tipo":"copasst"}',                                '2026-02-25 15:30:00'),
  ('warning',   'cumplimiento','%Sabor Criollo%',   'Puntaje de cumplimiento por debajo del 60% - requiere accion', '{"puntaje":58.0,"anio":2026}',                                     '2026-04-15 16:00:00'),
  ('info',      'emergencias', '%Construandes%',    'Plan de emergencia analizado por IA - 4 recomendaciones',       '{"num_amenazas":3,"num_recomendaciones":4}',                        '2026-04-20 09:30:00'),
  ('info',      'matrices',    '%Sabor Criollo%',   'Matriz de riesgos GTC 45 generada por IA - 5 riesgos',         '{"num_riesgos":5,"generada_por_ia":true}',                          '2026-03-15 10:00:00')
) AS v(tipo, modulo, pattern, descripcion, metadata, fecha)
WHERE e.razon_social ILIKE v.pattern;


COMMIT;

-- ============================================================
-- RESUMEN DE DATOS GENERADOS
-- ============================================================
-- Trabajadores:           18 (6 por empresa)
-- Documentos:             14 (4-5 por empresa)
-- Inventario equipos:     21 (6-8 por empresa)
-- PILA Records:           18 (6 periodos x 3 empresas)
-- Examenes medicos:       13 (4-5 por empresa)
-- Recomendaciones medicas: 7 (para examenes con restricciones)
-- Comites COPASST:         3 (1 por empresa)
-- Integrantes comite:     12 (4 por comite)
-- Actas comite:            8 (2-3 por comite)
-- Puntos de acta:         18 (3-4 por acta con puntos)
-- Planes emergencia:       3 (1 por empresa)
-- Matrices riesgo:         3 (1 por empresa)
-- Riesgos GTC 45:         14 (4-5 por empresa)
-- Cumplimiento empresa:    3 (evaluacion 2026)
-- Logs actividad:          8 (actividades recientes)
-- ============================================================
-- TOTAL: ~144 registros
