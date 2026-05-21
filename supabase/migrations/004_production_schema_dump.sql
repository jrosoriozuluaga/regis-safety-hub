--
-- Regis SG-SST Production Schema Dump
-- Generated: 2026-05-20 via Supabase MCP (information_schema + pg_catalog)
-- Project: nrtjizkeopxhpmjxxnjk
-- Schema: public
--
-- NOTE: This dump was generated from catalog queries because Docker was not
-- available for `supabase db dump`. It is functionally equivalent but may
-- differ slightly from pg_dump output in formatting.
--

CREATE TABLE public.ciiu_codigos (
    codigo text NOT NULL,
    descripcion text NOT NULL,
    seccion text,
    nivel_riesgo_tipico integer,
    CONSTRAINT ciiu_codigos_nivel_riesgo_tipico_check CHECK (((nivel_riesgo_tipico >= 1) AND (nivel_riesgo_tipico <= 5))),
    CONSTRAINT ciiu_codigos_pkey PRIMARY KEY (codigo)
);

CREATE TABLE public.categorias_peligro_gtc45 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    categoria text NOT NULL,
    descripcion text,
    ejemplos text,
    CONSTRAINT categorias_peligro_gtc45_pkey PRIMARY KEY (id),
    CONSTRAINT categorias_peligro_gtc45_categoria_key UNIQUE (categoria)
);

CREATE TABLE public.estandares_0312 (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ciclo text NOT NULL,
    estandar text NOT NULL,
    item_codigo text NOT NULL,
    item_descripcion text NOT NULL,
    peso_porcentual numeric(4,2) NOT NULL,
    aplica_cap1 boolean DEFAULT false,
    aplica_cap2 boolean DEFAULT false,
    aplica_cap3 boolean DEFAULT true,
    tipo_documento_evidencia text,
    activo boolean DEFAULT true,
    CONSTRAINT estandares_0312_ciclo_check CHECK ((ciclo = ANY (ARRAY['planear'::text, 'hacer'::text, 'verificar'::text, 'actuar'::text]))),
    CONSTRAINT estandares_0312_pkey PRIMARY KEY (id),
    CONSTRAINT estandares_0312_item_codigo_key UNIQUE (item_codigo)
);

CREATE TABLE public.configuracion_sistema (
    clave text NOT NULL,
    valor text NOT NULL,
    descripcion text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT configuracion_sistema_pkey PRIMARY KEY (clave)
);

CREATE TABLE public.templates_documento (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo text NOT NULL,
    nombre text NOT NULL,
    contenido text NOT NULL,
    version integer DEFAULT 1,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT templates_documento_pkey PRIMARY KEY (id)
);

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid,
    email text NOT NULL,
    nombre text NOT NULL,
    rol text NOT NULL,
    empresa_id uuid,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT usuarios_rol_check CHECK ((rol = ANY (ARRAY['admin'::text, 'consultor'::text, 'cliente'::text]))),
    CONSTRAINT usuarios_pkey PRIMARY KEY (id),
    CONSTRAINT usuarios_auth_user_id_key UNIQUE (auth_user_id),
    CONSTRAINT usuarios_email_key UNIQUE (email)
);

CREATE TABLE public.empresas_cliente (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    razon_social text NOT NULL,
    nit text NOT NULL,
    ciiu_codigo text NOT NULL,
    nivel_riesgo_arl integer NOT NULL,
    num_trabajadores integer NOT NULL,
    capitulo_0312 integer GENERATED ALWAYS AS (
CASE
    WHEN ((num_trabajadores <= 10) AND (nivel_riesgo_arl <= 3)) THEN 1
    WHEN (((num_trabajadores >= 11) AND (num_trabajadores <= 50)) AND (nivel_riesgo_arl <= 3)) THEN 2
    ELSE 3
END) STORED,
    direccion text,
    ciudad text,
    departamento text,
    telefono text,
    email_contacto text,
    nombre_contacto text,
    cargo_contacto text,
    email_contacto_pila text,
    nombre_contacto_pila text,
    whatsapp_contacto_pila text,
    drive_folder_id text,
    drive_folder_url text,
    consultor_id uuid,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT empresas_cliente_nivel_riesgo_arl_check CHECK (((nivel_riesgo_arl >= 1) AND (nivel_riesgo_arl <= 5))),
    CONSTRAINT empresas_cliente_pkey PRIMARY KEY (id),
    CONSTRAINT empresas_cliente_nit_key UNIQUE (nit)
);

CREATE TABLE public.ciiu_riesgos_tipicos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ciiu_codigo text NOT NULL,
    categoria_peligro text NOT NULL,
    descripcion_peligro text NOT NULL,
    fuente_peligro text,
    efectos_posibles text,
    nivel_deficiencia_sugerido integer,
    nivel_exposicion_sugerido integer,
    nivel_consecuencia_sugerido integer,
    control_tipico_fuente text,
    control_tipico_medio text,
    control_tipico_individuo text,
    medida_tipica_administrativa text,
    medida_tipica_epp text,
    CONSTRAINT ciiu_riesgos_tipicos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.trabajadores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    nombre text NOT NULL,
    cedula text NOT NULL,
    cargo text,
    area text,
    fecha_ingreso date,
    fecha_egreso date,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT trabajadores_pkey PRIMARY KEY (id),
    CONSTRAINT trabajadores_empresa_id_cedula_key UNIQUE (empresa_id, cedula)
);

CREATE TABLE public.examenes_medicos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trabajador_id uuid NOT NULL,
    empresa_id uuid NOT NULL,
    tipo_examen text NOT NULL,
    fecha_examen date NOT NULL,
    concepto_aptitud text,
    medico_nombre text,
    archivo_url text,
    archivo_drive_id text,
    procesado_por_ia boolean DEFAULT false,
    confianza_extraccion numeric(3,2),
    revisado_por_consultor boolean DEFAULT false,
    consultor_revision_id uuid,
    texto_extraido_raw text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT examenes_medicos_concepto_aptitud_check CHECK ((concepto_aptitud = ANY (ARRAY['apto'::text, 'apto_con_restricciones'::text, 'no_apto'::text]))),
    CONSTRAINT examenes_medicos_tipo_examen_check CHECK ((tipo_examen = ANY (ARRAY['ingreso'::text, 'periodico'::text, 'egreso'::text]))),
    CONSTRAINT examenes_medicos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.recomendaciones_medicas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    examen_id uuid NOT NULL,
    tipo text NOT NULL,
    descripcion text NOT NULL,
    prioridad text DEFAULT 'media'::text,
    estado text DEFAULT 'pendiente'::text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT recomendaciones_medicas_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'en_cumplimiento'::text, 'cumplida'::text]))),
    CONSTRAINT recomendaciones_medicas_prioridad_check CHECK ((prioridad = ANY (ARRAY['alta'::text, 'media'::text, 'baja'::text]))),
    CONSTRAINT recomendaciones_medicas_tipo_check CHECK ((tipo = ANY (ARRAY['recomendacion'::text, 'restriccion'::text]))),
    CONSTRAINT recomendaciones_medicas_pkey PRIMARY KEY (id)
);

CREATE TABLE public.matrices_riesgo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    version integer DEFAULT 1,
    fecha_elaboracion date NOT NULL,
    fecha_actualizacion date,
    estado text DEFAULT 'borrador'::text,
    documento_url text,
    drive_file_id text,
    generada_por_ia boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT matrices_riesgo_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'aprobada'::text, 'archivada'::text]))),
    CONSTRAINT matrices_riesgo_pkey PRIMARY KEY (id)
);

CREATE TABLE public.riesgos_matriz (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    matriz_id uuid NOT NULL,
    proceso text NOT NULL,
    zona text,
    actividad text NOT NULL,
    tarea text,
    es_rutinaria boolean DEFAULT true,
    categoria_peligro text NOT NULL,
    descripcion_peligro text NOT NULL,
    fuente_peligro text,
    efectos_posibles text,
    control_fuente text,
    control_medio text,
    control_individuo text,
    nivel_deficiencia integer,
    nivel_exposicion integer,
    nivel_consecuencia integer,
    aceptabilidad text,
    medida_eliminacion text,
    medida_sustitucion text,
    medida_ingenieria text,
    medida_administrativa text,
    medida_epp text,
    num_expuestos integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT riesgos_matriz_nivel_consecuencia_check CHECK ((nivel_consecuencia = ANY (ARRAY[10, 25, 60, 100]))),
    CONSTRAINT riesgos_matriz_nivel_deficiencia_check CHECK ((nivel_deficiencia = ANY (ARRAY[0, 2, 6, 10]))),
    CONSTRAINT riesgos_matriz_nivel_exposicion_check CHECK ((nivel_exposicion = ANY (ARRAY[1, 2, 3, 4]))),
    CONSTRAINT riesgos_matriz_pkey PRIMARY KEY (id)
);

CREATE TABLE public.comites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    tipo text NOT NULL,
    fecha_inicio_periodo date NOT NULL,
    fecha_fin_periodo date NOT NULL,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT comites_tipo_check CHECK ((tipo = ANY (ARRAY['copasst'::text, 'convivencia'::text, 'vigia'::text]))),
    CONSTRAINT comites_pkey PRIMARY KEY (id),
    CONSTRAINT comites_empresa_id_tipo_fecha_inicio_periodo_key UNIQUE (empresa_id, tipo, fecha_inicio_periodo)
);

CREATE TABLE public.integrantes_comite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comite_id uuid NOT NULL,
    nombre text NOT NULL,
    cedula text,
    cargo_empresa text,
    rol_comite text NOT NULL,
    es_principal boolean DEFAULT true,
    email text,
    telefono text,
    activo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT integrantes_comite_rol_comite_check CHECK ((rol_comite = ANY (ARRAY['presidente'::text, 'secretario'::text, 'representante_empleador'::text, 'representante_trabajadores'::text, 'suplente_empleador'::text, 'suplente_trabajadores'::text, 'vigia'::text]))),
    CONSTRAINT integrantes_comite_pkey PRIMARY KEY (id)
);

CREATE TABLE public.actas_comite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comite_id uuid NOT NULL,
    numero_acta integer NOT NULL,
    fecha_reunion timestamp with time zone NOT NULL,
    tipo_reunion text NOT NULL,
    lugar text,
    hora_inicio time without time zone,
    hora_fin time without time zone,
    documento_url text,
    documento_drive_id text,
    estado text DEFAULT 'borrador'::text,
    generada_por_ia boolean DEFAULT false,
    revisada_por_consultor boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    contenido_generado text,
    hay_quorum boolean DEFAULT true,
    firmada boolean DEFAULT false,
    fecha_firma timestamp with time zone,
    archivada boolean DEFAULT false,
    fecha_archivado timestamp with time zone,
    recordatorios_firma integer DEFAULT 0,
    proximo_recordatorio_firma timestamp with time zone,
    CONSTRAINT actas_comite_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'generada'::text, 'firmada'::text, 'archivada'::text]))),
    CONSTRAINT actas_comite_tipo_reunion_check CHECK ((tipo_reunion = ANY (ARRAY['ordinaria'::text, 'extraordinaria'::text]))),
    CONSTRAINT actas_comite_pkey PRIMARY KEY (id)
);

CREATE TABLE public.puntos_acta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acta_id uuid NOT NULL,
    orden integer NOT NULL,
    descripcion text NOT NULL,
    compromisos text,
    responsable text,
    fecha_limite date,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puntos_acta_pkey PRIMARY KEY (id)
);

CREATE TABLE public.asistencia_comite (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    acta_id uuid NOT NULL,
    integrante_id uuid NOT NULL,
    asistio boolean DEFAULT false,
    confirmo_digital boolean DEFAULT false,
    fecha_confirmacion timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT asistencia_comite_pkey PRIMARY KEY (id),
    CONSTRAINT asistencia_comite_acta_id_integrante_id_key UNIQUE (acta_id, integrante_id)
);

CREATE TABLE public.planes_emergencia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    fecha_elaboracion date DEFAULT CURRENT_DATE,
    audio_url text,
    transcripcion text,
    documento_url text,
    drive_file_id text,
    estado text DEFAULT 'borrador'::text,
    generado_por_ia boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    analisis_json jsonb,
    CONSTRAINT planes_emergencia_estado_check CHECK ((estado = ANY (ARRAY['borrador'::text, 'generado'::text, 'en_revision'::text, 'revisado'::text, 'aprobado'::text]))),
    CONSTRAINT planes_emergencia_pkey PRIMARY KEY (id)
);

CREATE TABLE public.amenazas_vulnerabilidad (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    tipo_amenaza text NOT NULL,
    descripcion_amenaza text NOT NULL,
    probabilidad text,
    vuln_personas numeric(2,1),
    vuln_recursos numeric(2,1),
    vuln_procesos numeric(2,1),
    observaciones text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT amenazas_vulnerabilidad_probabilidad_check CHECK ((probabilidad = ANY (ARRAY['posible'::text, 'probable'::text, 'inminente'::text]))),
    CONSTRAINT amenazas_vulnerabilidad_tipo_amenaza_check CHECK ((tipo_amenaza = ANY (ARRAY['natural'::text, 'tecnologica'::text, 'social'::text]))),
    CONSTRAINT amenazas_vulnerabilidad_vuln_personas_check CHECK ((vuln_personas = ANY (ARRAY[0.0, 0.5, 1.0]))),
    CONSTRAINT amenazas_vulnerabilidad_vuln_procesos_check CHECK ((vuln_procesos = ANY (ARRAY[0.0, 0.5, 1.0]))),
    CONSTRAINT amenazas_vulnerabilidad_vuln_recursos_check CHECK ((vuln_recursos = ANY (ARRAY[0.0, 0.5, 1.0]))),
    CONSTRAINT amenazas_vulnerabilidad_pkey PRIMARY KEY (id)
);

CREATE TABLE public.documentos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    tipo text NOT NULL,
    nombre_archivo text NOT NULL,
    periodo_mes integer,
    periodo_anio integer,
    archivo_url text,
    drive_file_id text,
    drive_folder_id text,
    estandar_0312_id uuid,
    estado text DEFAULT 'pendiente'::text,
    fecha_solicitud timestamp with time zone,
    fecha_recepcion timestamp with time zone,
    intentos_solicitud integer DEFAULT 0,
    proximo_recordatorio timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    validado_por text,
    fecha_validacion timestamp with time zone,
    aprobado_por text,
    fecha_aprobacion timestamp with time zone,
    observacion_validacion text,
    CONSTRAINT documentos_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'solicitado'::text, 'recibido'::text, 'cargado'::text, 'validado'::text, 'aprobado'::text, 'vigente'::text, 'procesado'::text, 'archivado'::text, 'vencido'::text]))),
    CONSTRAINT documentos_periodo_mes_check CHECK (((periodo_mes >= 1) AND (periodo_mes <= 12))),
    CONSTRAINT documentos_tipo_check CHECK ((tipo = ANY (ARRAY['pila'::text, 'examen_medico'::text, 'matriz_riesgo'::text, 'acta_copasst'::text, 'acta_convivencia'::text, 'plan_emergencias'::text, 'politica_sst'::text, 'plan_trabajo_anual'::text, 'reglamento_higiene'::text, 'plan_capacitacion'::text, 'cronograma'::text, 'acta_recursos'::text, 'matriz_legal'::text, 'otro'::text]))),
    CONSTRAINT documentos_pkey PRIMARY KEY (id)
);

CREATE TABLE public.cumplimiento_empresa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    anio integer NOT NULL,
    puntaje_total numeric(5,2) DEFAULT 0,
    puntaje_planear numeric(5,2) DEFAULT 0,
    puntaje_hacer numeric(5,2) DEFAULT 0,
    puntaje_verificar numeric(5,2) DEFAULT 0,
    puntaje_actuar numeric(5,2) DEFAULT 0,
    fecha_evaluacion date,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cumplimiento_empresa_pkey PRIMARY KEY (id),
    CONSTRAINT cumplimiento_empresa_empresa_id_anio_key UNIQUE (empresa_id, anio)
);

CREATE TABLE public.items_cumplimiento (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cumplimiento_id uuid NOT NULL,
    estandar_id uuid NOT NULL,
    calificacion text NOT NULL,
    puntaje_obtenido numeric(4,2) NOT NULL,
    documento_evidencia_id uuid,
    observaciones text,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT items_cumplimiento_calificacion_check CHECK ((calificacion = ANY (ARRAY['cumple'::text, 'no_cumple'::text, 'no_aplica'::text]))),
    CONSTRAINT items_cumplimiento_pkey PRIMARY KEY (id),
    CONSTRAINT items_cumplimiento_cumplimiento_id_estandar_id_key UNIQUE (cumplimiento_id, estandar_id)
);

CREATE TABLE public.logs_actividad (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tipo text NOT NULL,
    modulo text,
    empresa_id uuid,
    usuario_id uuid,
    descripcion text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT logs_actividad_pkey PRIMARY KEY (id)
);

CREATE TABLE public.pila_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    periodo text NOT NULL,
    estado text DEFAULT 'pendiente'::text NOT NULL,
    archivo_url text,
    fecha_carga timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    drive_file_id text,
    intentos_solicitud integer DEFAULT 0,
    proximo_recordatorio timestamp with time zone,
    fecha_solicitud timestamp with time zone,
    validado_por text,
    fecha_validacion timestamp with time zone,
    aprobado_por text,
    fecha_aprobacion timestamp with time zone,
    observacion_validacion text,
    CONSTRAINT pila_records_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'cargada'::text, 'validada'::text, 'aprobada'::text, 'vencida'::text]))),
    CONSTRAINT pila_records_pkey PRIMARY KEY (id)
);

CREATE TABLE public.inventario_equipos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    empresa_id uuid NOT NULL,
    tipo text NOT NULL,
    nombre text NOT NULL,
    ubicacion text,
    marca text,
    serial text,
    fecha_adquisicion date,
    fecha_vencimiento date,
    fecha_ultima_inspeccion date,
    fecha_proxima_inspeccion date,
    estado text DEFAULT 'vigente'::text NOT NULL,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventario_equipos_pkey PRIMARY KEY (id)
);


-- Foreign Key Constraints

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id);

ALTER TABLE ONLY public.empresas_cliente
    ADD CONSTRAINT empresas_cliente_ciiu_codigo_fkey FOREIGN KEY (ciiu_codigo) REFERENCES ciiu_codigos(codigo);

ALTER TABLE ONLY public.empresas_cliente
    ADD CONSTRAINT fk_consultor FOREIGN KEY (consultor_id) REFERENCES usuarios(id);

ALTER TABLE ONLY public.ciiu_riesgos_tipicos
    ADD CONSTRAINT ciiu_riesgos_tipicos_ciiu_codigo_fkey FOREIGN KEY (ciiu_codigo) REFERENCES ciiu_codigos(codigo);

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.examenes_medicos
    ADD CONSTRAINT examenes_medicos_consultor_revision_id_fkey FOREIGN KEY (consultor_revision_id) REFERENCES usuarios(id);

ALTER TABLE ONLY public.examenes_medicos
    ADD CONSTRAINT examenes_medicos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id);

ALTER TABLE ONLY public.examenes_medicos
    ADD CONSTRAINT examenes_medicos_trabajador_id_fkey FOREIGN KEY (trabajador_id) REFERENCES trabajadores(id);

ALTER TABLE ONLY public.recomendaciones_medicas
    ADD CONSTRAINT recomendaciones_medicas_examen_id_fkey FOREIGN KEY (examen_id) REFERENCES examenes_medicos(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.matrices_riesgo
    ADD CONSTRAINT matrices_riesgo_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.riesgos_matriz
    ADD CONSTRAINT riesgos_matriz_matriz_id_fkey FOREIGN KEY (matriz_id) REFERENCES matrices_riesgo(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.comites
    ADD CONSTRAINT comites_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.integrantes_comite
    ADD CONSTRAINT integrantes_comite_comite_id_fkey FOREIGN KEY (comite_id) REFERENCES comites(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.actas_comite
    ADD CONSTRAINT actas_comite_comite_id_fkey FOREIGN KEY (comite_id) REFERENCES comites(id);

ALTER TABLE ONLY public.puntos_acta
    ADD CONSTRAINT puntos_acta_acta_id_fkey FOREIGN KEY (acta_id) REFERENCES actas_comite(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.asistencia_comite
    ADD CONSTRAINT asistencia_comite_acta_id_fkey FOREIGN KEY (acta_id) REFERENCES actas_comite(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.asistencia_comite
    ADD CONSTRAINT asistencia_comite_integrante_id_fkey FOREIGN KEY (integrante_id) REFERENCES integrantes_comite(id);

ALTER TABLE ONLY public.planes_emergencia
    ADD CONSTRAINT planes_emergencia_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.amenazas_vulnerabilidad
    ADD CONSTRAINT amenazas_vulnerabilidad_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES planes_emergencia(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_estandar_0312_id_fkey FOREIGN KEY (estandar_0312_id) REFERENCES estandares_0312(id);

ALTER TABLE ONLY public.cumplimiento_empresa
    ADD CONSTRAINT cumplimiento_empresa_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.items_cumplimiento
    ADD CONSTRAINT items_cumplimiento_cumplimiento_id_fkey FOREIGN KEY (cumplimiento_id) REFERENCES cumplimiento_empresa(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.items_cumplimiento
    ADD CONSTRAINT items_cumplimiento_documento_evidencia_id_fkey FOREIGN KEY (documento_evidencia_id) REFERENCES documentos(id);

ALTER TABLE ONLY public.items_cumplimiento
    ADD CONSTRAINT items_cumplimiento_estandar_id_fkey FOREIGN KEY (estandar_id) REFERENCES estandares_0312(id);

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id);

ALTER TABLE ONLY public.logs_actividad
    ADD CONSTRAINT logs_actividad_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

ALTER TABLE ONLY public.pila_records
    ADD CONSTRAINT pila_records_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id);

ALTER TABLE ONLY public.inventario_equipos
    ADD CONSTRAINT inventario_equipos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES empresas_cliente(id) ON DELETE CASCADE;


-- Indexes (non-primary-key, non-unique-constraint)

CREATE INDEX idx_ciiu_riesgos ON public.ciiu_riesgos_tipicos USING btree (ciiu_codigo);
CREATE INDEX idx_trabajadores_empresa ON public.trabajadores USING btree (empresa_id);
CREATE INDEX idx_examenes_empresa ON public.examenes_medicos USING btree (empresa_id);
CREATE INDEX idx_examenes_trabajador ON public.examenes_medicos USING btree (trabajador_id);
CREATE INDEX idx_riesgos_matriz ON public.riesgos_matriz USING btree (matriz_id);
CREATE INDEX idx_comites_empresa ON public.comites USING btree (empresa_id);
CREATE INDEX idx_actas_comite ON public.actas_comite USING btree (comite_id);
CREATE INDEX idx_documentos_empresa_tipo ON public.documentos USING btree (empresa_id, tipo);
CREATE INDEX idx_documentos_estado ON public.documentos USING btree (estado);
CREATE INDEX idx_documentos_periodo ON public.documentos USING btree (periodo_anio, periodo_mes);
CREATE INDEX idx_items_cumplimiento ON public.items_cumplimiento USING btree (cumplimiento_id);
CREATE INDEX idx_items_cumplimiento_cumplimiento ON public.items_cumplimiento USING btree (cumplimiento_id);
CREATE INDEX idx_items_cumplimiento_estandar ON public.items_cumplimiento USING btree (estandar_id);
CREATE INDEX idx_logs_created ON public.logs_actividad USING btree (created_at);
CREATE INDEX idx_logs_empresa ON public.logs_actividad USING btree (empresa_id);
CREATE INDEX idx_pila_records_empresa_id ON public.pila_records USING btree (empresa_id);
CREATE INDEX idx_pila_records_estado ON public.pila_records USING btree (estado);
CREATE INDEX idx_pila_records_periodo ON public.pila_records USING btree (periodo);
CREATE INDEX idx_inventario_equipos_empresa ON public.inventario_equipos USING btree (empresa_id);
CREATE INDEX idx_inventario_equipos_tipo ON public.inventario_equipos USING btree (tipo);
CREATE INDEX idx_inventario_equipos_vencimiento ON public.inventario_equipos USING btree (fecha_vencimiento);


-- Row Level Security

ALTER TABLE public.ciiu_codigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_peligro_gtc45 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estandares_0312 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ciiu_riesgos_tipicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.examenes_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recomendaciones_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrices_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riesgos_matriz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrantes_comite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actas_comite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntos_acta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencia_comite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenazas_vulnerabilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cumplimiento_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items_cumplimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pila_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventario_equipos ENABLE ROW LEVEL SECURITY;


-- RLS Policies

CREATE POLICY "auth_full_access" ON public.actas_comite
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.amenazas_vulnerabilidad
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.asistencia_comite
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "public_read" ON public.categorias_peligro_gtc45
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "public_read" ON public.ciiu_codigos
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "public_read" ON public.ciiu_riesgos_tipicos
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "auth_full_access" ON public.comites
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.configuracion_sistema
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.cumplimiento_empresa
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.documentos
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.empresas_cliente
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "public_read" ON public.estandares_0312
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "auth_full_access" ON public.examenes_medicos
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.integrantes_comite
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.inventario_equipos
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access" ON public.items_cumplimiento
    AS PERMISSIVE
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "auth_full_access" ON public.logs_actividad
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.matrices_riesgo
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "Allow all for authenticated" ON public.pila_records
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "auth_full_access" ON public.planes_emergencia
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.puntos_acta
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.recomendaciones_medicas
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.riesgos_matriz
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.templates_documento
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.trabajadores
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));

CREATE POLICY "auth_full_access" ON public.usuarios
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.role() = 'authenticated'::text))
    WITH CHECK ((auth.role() = 'authenticated'::text));
