import { supabase } from "@/lib/supabase";
import type {
  Empresa,
  MatrizRiesgo,
  RiesgoMatriz,
  Comite,
  IntegranteComite,
  ActaComite,
  PlanEmergencia,
  ExamenMedico,
  RecomendacionMedica,
  Trabajador,
  CumplimientoEmpresa,
  Notification,
  PendingAction,
} from "@/types/domain";

export const empresasService = {
  list: async (): Promise<Empresa[]> => {
    const { data, error } = await supabase
      .from("empresas_cliente")
      .select("*")
      .eq("activo", true)
      .order("razon_social");
    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<Empresa | null> => {
    const { data, error } = await supabase
      .from("empresas_cliente")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  compliance: async (): Promise<{ empresa: Empresa; puntaje_total: number }[]> => {
    const { data, error } = await supabase
      .from("cumplimiento_empresa")
      .select("puntaje_total, empresa_id, empresas_cliente(*)")
      .order("fecha_evaluacion", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      empresa: row.empresas_cliente as Empresa,
      puntaje_total: row.puntaje_total,
    }));
  },
};

export const matricesService = {
  listByEmpresa: async (empresaId: string): Promise<MatrizRiesgo[]> => {
    const { data, error } = await supabase
      .from("matrices_riesgo")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  listAll: async (): Promise<MatrizRiesgo[]> => {
    const { data, error } = await supabase
      .from("matrices_riesgo")
      .select("*, empresas_cliente(razon_social)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      ...row,
      empresa_razon_social: row.empresas_cliente?.razon_social,
    }));
  },

  getRiesgos: async (matrizId: string): Promise<RiesgoMatriz[]> => {
    const { data, error } = await supabase
      .from("riesgos_matriz")
      .select("*")
      .eq("matriz_id", matrizId)
      .order("nivel_deficiencia", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  create: async (empresaId: string, nombre: string): Promise<MatrizRiesgo> => {
    const { data, error } = await supabase
      .from("matrices_riesgo")
      .insert({ empresa_id: empresaId, nombre, estado: "borrador", fecha_elaboracion: new Date().toISOString().split("T")[0] })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  insertRiesgos: async (matrizId: string, riesgos: Partial<RiesgoMatriz>[]): Promise<void> => {
    const rows = riesgos.map((r) => ({ ...r, matriz_id: matrizId }));
    const { error } = await supabase.from("riesgos_matriz").insert(rows);
    if (error) throw error;
  },
};

export const riesgosTipicosService = {
  getByCiiu: async (ciiu: string) => {
    const { data, error } = await supabase
      .from("ciiu_riesgos_tipicos")
      .select("*")
      .eq("ciiu_codigo", ciiu);
    if (error) throw error;
    return data ?? [];
  },
};

export const comitesService = {
  listByEmpresa: async (empresaId: string): Promise<Comite[]> => {
    const { data, error } = await supabase
      .from("comites")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  integrantes: async (comiteId: string): Promise<IntegranteComite[]> => {
    const { data, error } = await supabase
      .from("integrantes_comite")
      .select("*")
      .eq("comite_id", comiteId);
    if (error) throw error;
    return data ?? [];
  },

  actas: async (comiteId: string): Promise<ActaComite[]> => {
    const { data, error } = await supabase
      .from("actas_comite")
      .select("*")
      .eq("comite_id", comiteId)
      .order("fecha_reunion", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  createActa: async (acta: Partial<ActaComite>): Promise<ActaComite> => {
    const { data, error } = await supabase
      .from("actas_comite")
      .insert(acta)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const emergenciasService = {
  listByEmpresa: async (empresaId: string): Promise<PlanEmergencia[]> => {
    const { data, error } = await supabase
      .from("planes_emergencia")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  listAll: async (): Promise<PlanEmergencia[]> => {
    const { data, error } = await supabase
      .from("planes_emergencia")
      .select("*, empresas_cliente(razon_social)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      ...row,
      empresa_razon_social: row.empresas_cliente?.razon_social,
    }));
  },

  create: async (plan: Partial<PlanEmergencia>): Promise<PlanEmergencia> => {
    const { data, error } = await supabase
      .from("planes_emergencia")
      .insert(plan)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<PlanEmergencia>): Promise<PlanEmergencia> => {
    const { data, error } = await supabase
      .from("planes_emergencia")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const trabajadoresService = {
  listByEmpresa: async (empresaId: string): Promise<Trabajador[]> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("activo", true)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },
};

export const examenesService = {
  listByEmpresa: async (empresaId: string): Promise<ExamenMedico[]> => {
    const { data, error } = await supabase
      .from("examenes_medicos")
      .select("*, trabajadores(nombre, cedula)")
      .eq("empresa_id", empresaId)
      .order("fecha_examen", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      ...row,
      trabajador_nombre: row.trabajadores?.nombre,
      trabajador_documento: row.trabajadores?.cedula,
    }));
  },

  recomendaciones: async (examenId: string): Promise<RecomendacionMedica[]> => {
    const { data, error } = await supabase
      .from("recomendaciones_medicas")
      .select("*")
      .eq("examen_id", examenId);
    if (error) throw error;
    return data ?? [];
  },
};

export const cumplimientoService = {
  getLatest: async (empresaId: string): Promise<CumplimientoEmpresa | null> => {
    const { data, error } = await supabase
      .from("cumplimiento_empresa")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("fecha_evaluacion", { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data;
  },

  estandares: async () => {
    const { data, error } = await supabase
      .from("estandares_0312")
      .select("*")
      .order("item_codigo");
    if (error) throw error;
    return data ?? [];
  },
};

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    return [];
  },
  pendingActions: async (): Promise<PendingAction[]> => {
    return [];
  },
};
