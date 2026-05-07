export type UserRole = "admin" | "consultor" | "cliente";

export type UserProfile = {
  id: string;
  nit: string;
  companyName: string;
  contactEmail: string;
  role: UserRole;
  empresa_id?: string;
};

export type Empresa = {
  id: string;
  razon_social: string;
  nit: string;
  ciiu_codigo: string;
  ciudad: string;
  departamento?: string;
  direccion: string;
  num_trabajadores: number;
  nivel_riesgo_arl: number;
  capitulo_0312: string;
  nombre_contacto: string;
  email_contacto: string;
  telefono?: string;
  consultor_id?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type PilaStatus = "cargada" | "pendiente" | "vencida";
export type PilaRecord = {
  id: string;
  empresa_id: string;
  empresa_razon_social?: string;
  periodo: string;
  estado: PilaStatus;
  archivo_url?: string;
  fecha_carga?: string;
  created_at: string;
};

export type Trabajador = {
  id: string;
  empresa_id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  area: string;
  fecha_ingreso?: string;
  fecha_egreso?: string;
  activo: boolean;
};

export type ExamenMedico = {
  id: string;
  trabajador_id: string;
  empresa_id: string;
  trabajador_nombre?: string;
  trabajador_documento?: string;
  tipo_examen: "ingreso" | "periodico" | "retiro" | "post_incapacidad";
  fecha_examen: string;
  concepto_aptitud: "apto" | "apto_con_restricciones" | "no_apto" | "aplazado";
  medico_nombre?: string;
  archivo_url?: string;
  procesado_por_ia?: boolean;
  created_at: string;
};

export type RecomendacionMedica = {
  id: string;
  examen_id: string;
  tipo: "recomendacion" | "restriccion";
  descripcion: string;
  fecha_vencimiento?: string;
  estado: "activa" | "cumplida" | "vencida";
};

export type MatrizRiesgo = {
  id: string;
  empresa_id: string;
  empresa_razon_social?: string;
  nombre: string;
  estado: "borrador" | "aprobada" | "vigente" | "archivada";
  fecha_elaboracion: string;
  elaborado_por?: string;
  created_at: string;
};

export type RiesgoMatriz = {
  id: string;
  matriz_id: string;
  proceso?: string;
  zona?: string;
  actividad?: string;
  tarea?: string;
  es_rutinaria?: boolean;
  categoria_peligro: string;
  descripcion_peligro: string;
  fuente_peligro: string;
  efectos_posibles: string;
  control_fuente?: string;
  control_medio?: string;
  control_individuo?: string;
  nivel_deficiencia: number;
  nivel_exposicion: number;
  nivel_consecuencia: number;
  aceptabilidad: "aceptable" | "mejorable" | "no_aceptable" | "no_aceptable_si";
  medida_eliminacion?: string;
  medida_sustitucion?: string;
  medida_ingenieria?: string;
  medida_administrativa?: string;
  medida_epp?: string;
  num_expuestos?: number;
  created_at?: string;
};

export type Comite = {
  id: string;
  empresa_id: string;
  tipo: "vigia" | "copasst" | "convivencia";
  fecha_inicio_periodo: string;
  fecha_fin_periodo: string;
  activo: boolean;
  created_at: string;
};

export type IntegranteComite = {
  id: string;
  comite_id: string;
  nombre: string;
  cedula: string;
  cargo_empresa: string;
  rol_comite: string;
  es_principal: boolean;
  email?: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
};

export type ActaComite = {
  id: string;
  comite_id: string;
  numero_acta: number;
  fecha_reunion: string;
  hora_inicio: string;
  hora_fin?: string;
  tipo_reunion: "ordinaria" | "extraordinaria";
  lugar: string;
  hay_quorum: boolean;
  estado: "borrador" | "aprobada" | "firmada";
  contenido_generado?: string;
  created_at: string;
};

export type PlanEmergencia = {
  id: string;
  empresa_id: string;
  empresa_razon_social?: string;
  audio_url?: string;
  transcripcion?: string;
  analisis_json?: Record<string, unknown>;
  documento_url?: string;
  estado: "borrador" | "en_revision" | "aprobado";
  created_at: string;
};

export type CumplimientoEmpresa = {
  id: string;
  empresa_id: string;
  anio: number;
  puntaje_total: number;
  puntaje_planear: number;
  puntaje_hacer: number;
  puntaje_verificar: number;
  puntaje_actuar: number;
  fecha_evaluacion: string;
  updated_at: string;
};

export type ItemCumplimiento = {
  id: string;
  cumplimiento_id: string;
  estandar_id: string;
  cumple: boolean;
  observacion?: string;
  evidencia_url?: string;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
};

export type PendingAction = {
  id: string;
  title: string;
  due: string;
  priority: "high" | "medium" | "low";
};
