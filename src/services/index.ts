import { supabase } from "@/lib/supabase";
import type {
  Empresa,
  PilaRecord,
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

  listAll: async (): Promise<Empresa[]> => {
    const { data, error } = await supabase
      .from("empresas_cliente")
      .select("*")
      .order("razon_social");
    if (error) throw error;
    return data ?? [];
  },

  create: async (empresa: Partial<Empresa>): Promise<Empresa> => {
    const { data, error } = await supabase
      .from("empresas_cliente")
      .insert(empresa)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Empresa>): Promise<Empresa> => {
    const { data, error } = await supabase
      .from("empresas_cliente")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("empresas_cliente")
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  activate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("empresas_cliente")
      .update({ activo: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
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

// ── PILA Service ──────────────────────────────

function getPastPeriods(count: number): string[] {
  const periods: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    periods.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return periods;
}

function isOverdue(periodo: string, diaSolicitud: number = 16): boolean {
  const [y, m] = periodo.split("-").map(Number);
  const deadline = new Date(y, m, diaSolicitud);
  return new Date() > deadline;
}

export type PilaConfig = {
  dia_solicitud: number;
  dias_recordatorio: number;
  max_recordatorios: number;
  dia_escalamiento: number;
  n8n_webhook_base_url: string | null;
};

export const pilaService = {
  /** Load PILA config values from configuracion_sistema */
  loadConfig: async (): Promise<PilaConfig> => {
    const { data } = await supabase
      .from("configuracion_sistema")
      .select("clave, valor")
      .in("clave", [
        "pila_dia_solicitud",
        "pila_dias_recordatorio",
        "pila_max_recordatorios",
        "pila_dia_escalamiento",
        "n8n_webhook_base_url",
      ]);
    const cfg: Record<string, string> = {};
    (data ?? []).forEach((r: any) => { cfg[r.clave] = r.valor; });
    return {
      dia_solicitud: parseInt(cfg.pila_dia_solicitud || "16", 10),
      dias_recordatorio: parseInt(cfg.pila_dias_recordatorio || "3", 10),
      max_recordatorios: parseInt(cfg.pila_max_recordatorios || "3", 10),
      dia_escalamiento: parseInt(cfg.pila_dia_escalamiento || "25", 10),
      n8n_webhook_base_url: cfg.n8n_webhook_base_url || null,
    };
  },

  /** List PILA records, optionally filtered by empresa */
  listRecords: async (empresaId?: string): Promise<PilaRecord[]> => {
    let query = supabase
      .from("pila_records")
      .select("*, empresas_cliente(razon_social)")
      .order("periodo", { ascending: false });
    if (empresaId && empresaId !== "all") query = query.eq("empresa_id", empresaId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      ...r,
      empresa_razon_social: r.empresas_cliente?.razon_social,
    }));
  },

  /** Sync periods: create missing records for last N months, mark overdue */
  syncPeriods: async (
    empresas: Empresa[],
    selectedId?: string,
    config?: PilaConfig,
    userId?: string,
  ): Promise<{ created: number; overdue: number }> => {
    const diaSolicitud = config?.dia_solicitud ?? 16;
    const targetEmpresas = selectedId && selectedId !== "all"
      ? empresas.filter(e => e.id === selectedId)
      : empresas;
    const periods = getPastPeriods(6);
    let created = 0;
    let markedOverdue = 0;

    for (const emp of targetEmpresas) {
      for (const periodo of periods) {
        const { data: existing } = await supabase
          .from("pila_records")
          .select("id, estado")
          .eq("empresa_id", emp.id)
          .eq("periodo", periodo)
          .maybeSingle();

        if (!existing) {
          const estado = isOverdue(periodo, diaSolicitud) ? "vencida" : "pendiente";
          await supabase.from("pila_records").insert({
            empresa_id: emp.id,
            periodo,
            estado,
            fecha_solicitud: new Date().toISOString(),
          });
          created++;
          if (estado === "vencida") markedOverdue++;
        } else if (existing.estado === "pendiente" && isOverdue(periodo, diaSolicitud)) {
          await supabase.from("pila_records").update({ estado: "vencida" }).eq("id", existing.id);
          markedOverdue++;
        }
      }
    }

    // Log activity
    await logsService.log({
      tipo: "sincronizacion",
      modulo: "pila",
      descripcion: `Sincronización PILA: ${created} periodos creados, ${markedOverdue} marcados vencidos`,
      usuario_id: userId ?? null,
      metadata: { created, overdue: markedOverdue, empresas: targetEmpresas.length },
    });

    return { created, overdue: markedOverdue };
  },

  /** Upload a PILA file for a specific empresa + periodo */
  uploadFile: async (
    empresaId: string,
    periodo: string,
    file: File,
    userId?: string,
  ): Promise<PilaRecord> => {
    const filePath = `pila/${empresaId}/${periodo}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("documentos")
      .upload(filePath, file, { upsert: true });

    let archivoUrl: string | undefined;
    if (!uploadError) {
      const { data: urlData } = await supabase.storage.from("documentos").createSignedUrl(filePath, 31536000);
      archivoUrl = urlData?.signedUrl;
    }

    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from("pila_records")
      .select("id")
      .eq("empresa_id", empresaId)
      .eq("periodo", periodo)
      .maybeSingle();

    let record: PilaRecord;
    if (existing) {
      const { data, error } = await supabase
        .from("pila_records")
        .update({ estado: "cargada", fecha_carga: now, archivo_url: archivoUrl, intentos_notificacion: 0 })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      record = data;
    } else {
      const { data, error } = await supabase
        .from("pila_records")
        .insert({ empresa_id: empresaId, periodo, estado: "cargada", fecha_carga: now, archivo_url: archivoUrl })
        .select()
        .single();
      if (error) throw error;
      record = data;
    }

    await logsService.log({
      tipo: "carga_archivo",
      modulo: "pila",
      descripcion: `PILA cargada: ${file.name} — periodo ${periodo}`,
      empresa_id: empresaId,
      usuario_id: userId ?? null,
      metadata: { periodo, filename: file.name, archivo_url: archivoUrl },
    });

    return record;
  },

  /** Send reminder via n8n webhook (primary) or Edge Function (fallback) */
  sendReminder: async (
    record: PilaRecord,
    empresa: Empresa,
    config?: PilaConfig,
    userId?: string,
  ): Promise<{ success: boolean; escalated?: boolean }> => {
    const webhookUrl = config?.n8n_webhook_base_url;
    const diasRecordatorio = config?.dias_recordatorio ?? 3;
    const maxRecordatorios = config?.max_recordatorios ?? 3;
    const intentos = (record.intentos_solicitud || 0) + 1;
    const escalated = intentos > maxRecordatorios;

    const email = empresa.email_contacto_pila || empresa.email_contacto;
    const nombre = empresa.nombre_contacto_pila || empresa.nombre_contacto;

    // Generate public upload link for the client
    const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
    const token = btoa(JSON.stringify({ e: empresa.id, p: record.periodo, n: empresa.razon_social, exp }));
    const uploadLink = `${window.location.origin}/upload-pila?t=${token}`;

    if (webhookUrl) {
      const response = await fetch(`${webhookUrl}/pila-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa_id: empresa.id,
          empresa_nombre: empresa.razon_social,
          empresa_nit: empresa.nit,
          email,
          nombre_contacto: nombre,
          periodo: record.periodo,
          estado: record.estado,
          intento: intentos,
          escalado: escalated,
          upload_link: uploadLink,
        }),
      });
      if (!response.ok) throw new Error("Error en webhook n8n");
    } else {
      const { error } = await supabase.functions.invoke("send-pila-reminder", {
        body: {
          empresa_id: empresa.id,
          empresa_nombre: empresa.razon_social,
          email,
          nombre_contacto: nombre,
          periodo: record.periodo,
          estado: record.estado,
          intento: intentos,
          upload_link: uploadLink,
        },
      });
      if (error) throw error;
    }

    // Track reminder attempt
    const proximoRecordatorio = new Date(Date.now() + diasRecordatorio * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("pila_records").update({
      intentos_solicitud: intentos,
      proximo_recordatorio: proximoRecordatorio,
    }).eq("id", record.id);

    await logsService.log({
      tipo: escalated ? "escalamiento" : "recordatorio",
      modulo: "pila",
      descripcion: `Recordatorio PILA ${escalated ? "(ESCALADO) " : ""}enviado a ${email} — intento ${intentos}`,
      empresa_id: empresa.id,
      usuario_id: userId ?? null,
      metadata: { periodo: record.periodo, intento: intentos, email, escalado: escalated },
    });

    return { success: true, escalated };
  },

  /** Send WhatsApp reminder via Twilio Edge Function */
  sendWhatsAppReminder: async (
    record: PilaRecord,
    empresa: Empresa,
    uploadLink?: string,
    userId?: string,
  ): Promise<{ success: boolean; automated: boolean }> => {
    const phone = empresa.whatsapp_contacto_pila || (empresa as any).telefono;
    if (!phone) throw new Error("No hay número de WhatsApp registrado");

    const { data, error } = await supabase.functions.invoke("send-whatsapp-reminder", {
      body: {
        phone,
        nombre_contacto: empresa.nombre_contacto_pila || empresa.nombre_contacto,
        empresa_id: empresa.id,
        empresa_nombre: empresa.razon_social,
        modulo: "pila",
        periodo: record.periodo,
        intento: (record.intentos_solicitud || 0) + 1,
        upload_link: uploadLink,
      },
    });

    if (error) throw error;
    return { success: data?.success ?? false, automated: !!data?.sid };
  },

  /** Calculate PILA stats from records */
  getStats: (records: PilaRecord[]) => {
    const total = records.length;
    const cargadas = records.filter(r => r.estado === "cargada").length;
    const validadas = records.filter(r => r.estado === "validada").length;
    const aprobadas = records.filter(r => r.estado === "aprobada").length;
    const pendientes = records.filter(r => r.estado === "pendiente").length;
    const vencidas = records.filter(r => r.estado === "vencida").length;
    // Compliance % only counts aprobadas (analyst-reviewed)
    const pct = total > 0 ? Math.round((aprobadas / total) * 100) : 0;
    // "En proceso" = cargadas + validadas (uploaded but not yet approved)
    const enProceso = cargadas + validadas;
    return { total, cargadas, validadas, aprobadas, pendientes, vencidas, pct, enProceso };
  },

  /** Validate a PILA record (analyst review) */
  validateRecord: async (recordId: string, userId?: string, empresaId?: string, periodo?: string): Promise<void> => {
    const { error } = await supabase.from("pila_records").update({
      estado: "validada",
      validado_por: userId,
      fecha_validacion: new Date().toISOString(),
    }).eq("id", recordId);
    if (error) throw error;
    await logsService.log({
      tipo: "validacion",
      modulo: "pila",
      descripcion: `Planilla PILA validada — periodo ${periodo || ""}`,
      empresa_id: empresaId,
      usuario_id: userId,
      metadata: { pila_record_id: recordId, periodo },
    });
  },

  /** Approve a PILA record (final approval, grants compliance points) */
  approveRecord: async (recordId: string, userId?: string, empresaId?: string, periodo?: string): Promise<void> => {
    const { error } = await supabase.from("pila_records").update({
      estado: "aprobada",
      aprobado_por: userId,
      fecha_aprobacion: new Date().toISOString(),
    }).eq("id", recordId);
    if (error) throw error;
    await logsService.log({
      tipo: "aprobacion",
      modulo: "pila",
      descripcion: `Planilla PILA aprobada — periodo ${periodo || ""} — puntos de cumplimiento otorgados`,
      empresa_id: empresaId,
      usuario_id: userId,
      metadata: { pila_record_id: recordId, periodo },
    });
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

  create: async (empresaId: string): Promise<MatrizRiesgo> => {
    const { data, error } = await supabase
      .from("matrices_riesgo")
      .insert({ empresa_id: empresaId, version: 1, estado: "borrador", fecha_elaboracion: new Date().toISOString().split("T")[0] })
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

  updateRiesgo: async (riesgoId: string, updates: Partial<RiesgoMatriz>): Promise<RiesgoMatriz> => {
    const { data, error } = await supabase
      .from("riesgos_matriz")
      .update(updates)
      .eq("id", riesgoId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  insertRiesgo: async (riesgo: Partial<RiesgoMatriz> & { matriz_id: string }): Promise<RiesgoMatriz> => {
    const { data, error } = await supabase
      .from("riesgos_matriz")
      .insert(riesgo)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteRiesgo: async (riesgoId: string): Promise<void> => {
    const { error } = await supabase.from("riesgos_matriz").delete().eq("id", riesgoId);
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

  insertAsistencia: async (records: { acta_id: string; integrante_id: string; presente: boolean }[]): Promise<void> => {
    if (records.length === 0) return;
    const { error } = await supabase.from("asistencia_comite").insert(records);
    if (error) throw error;
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

  listAllByEmpresa: async (empresaId: string): Promise<Trabajador[]> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  create: async (trabajador: Partial<Trabajador>): Promise<Trabajador> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .insert(trabajador)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Trabajador>): Promise<Trabajador> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("trabajadores")
      .update({ activo: false, fecha_egreso: new Date().toISOString().split("T")[0] })
      .eq("id", id);
    if (error) throw error;
  },

  activate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("trabajadores")
      .update({ activo: true, fecha_egreso: null })
      .eq("id", id);
    if (error) throw error;
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

export type Usuario = {
  id: string;
  auth_user_id: string | null;
  email: string;
  nombre: string;
  rol: "admin" | "consultor" | "cliente";
  empresa_id: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  razon_social?: string;
};

export const usuariosService = {
  list: async (): Promise<Usuario[]> => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*, empresas_cliente!usuarios_empresa_id_fkey(razon_social)")
      .order("nombre");
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      ...row,
      razon_social: row.empresas_cliente?.razon_social || null,
    }));
  },

  create: async (usuario: Partial<Usuario>): Promise<Usuario> => {
    const { data, error } = await supabase
      .from("usuarios")
      .insert(usuario)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Usuario>): Promise<Usuario> => {
    const { data, error } = await supabase
      .from("usuarios")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deactivate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("usuarios")
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  activate: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("usuarios")
      .update({ activo: true, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};

export type AlertItem = {
  id: string;
  tipo: "pila_vencida" | "pila_pendiente" | "examen_restriccion" | "cumplimiento_bajo";
  titulo: string;
  descripcion: string;
  empresa_id?: string;
  empresa_nombre?: string;
  fecha: string;
  severidad: "alta" | "media" | "baja";
};

export const notificationsService = {
  list: async (): Promise<Notification[]> => {
    return [];
  },
  pendingActions: async (): Promise<PendingAction[]> => {
    return [];
  },
};

export const alertsService = {
  getAlerts: async (): Promise<AlertItem[]> => {
    const alerts: AlertItem[] = [];

    // 1. PILAs vencidas
    const { data: pilasVencidas } = await supabase
      .from("pila_records")
      .select("id, periodo, empresa_id, empresas_cliente(razon_social)")
      .eq("estado", "vencida");
    (pilasVencidas ?? []).forEach((p: any) => {
      alerts.push({
        id: `pila-v-${p.id}`,
        tipo: "pila_vencida",
        titulo: `PILA vencida: ${p.periodo}`,
        descripcion: `${p.empresas_cliente?.razon_social ?? "Empresa"} — Periodo ${p.periodo} sin entregar`,
        empresa_id: p.empresa_id,
        empresa_nombre: p.empresas_cliente?.razon_social,
        fecha: new Date().toISOString(),
        severidad: "alta",
      });
    });

    // 2. PILAs pendientes
    const { data: pilasPendientes } = await supabase
      .from("pila_records")
      .select("id, periodo, empresa_id, empresas_cliente(razon_social)")
      .eq("estado", "pendiente");
    (pilasPendientes ?? []).forEach((p: any) => {
      alerts.push({
        id: `pila-p-${p.id}`,
        tipo: "pila_pendiente",
        titulo: `PILA pendiente: ${p.periodo}`,
        descripcion: `${p.empresas_cliente?.razon_social ?? "Empresa"} — Periodo ${p.periodo} aún pendiente`,
        empresa_id: p.empresa_id,
        empresa_nombre: p.empresas_cliente?.razon_social,
        fecha: new Date().toISOString(),
        severidad: "media",
      });
    });

    // 3. Exámenes con restricciones
    const { data: examenesRestr } = await supabase
      .from("examenes_medicos")
      .select("id, empresa_id, trabajador_id, concepto_aptitud, fecha_examen, trabajadores(nombre), empresas_cliente(razon_social)")
      .eq("concepto_aptitud", "apto_con_restricciones")
      .order("fecha_examen", { ascending: false })
      .limit(20);
    (examenesRestr ?? []).forEach((e: any) => {
      alerts.push({
        id: `exam-r-${e.id}`,
        tipo: "examen_restriccion",
        titulo: `Examen con restricciones`,
        descripcion: `${e.trabajadores?.nombre ?? "Trabajador"} (${e.empresas_cliente?.razon_social ?? ""}) — Apto con restricciones`,
        empresa_id: e.empresa_id,
        empresa_nombre: e.empresas_cliente?.razon_social,
        fecha: e.fecha_examen,
        severidad: "media",
      });
    });

    // 4. Cumplimiento bajo (<60%)
    const { data: cumplimiento } = await supabase
      .from("cumplimiento_empresa")
      .select("id, empresa_id, puntaje_total, fecha_evaluacion, empresas_cliente(razon_social)")
      .lt("puntaje_total", 60)
      .order("fecha_evaluacion", { ascending: false });
    (cumplimiento ?? []).forEach((c: any) => {
      alerts.push({
        id: `cumpl-${c.id}`,
        tipo: "cumplimiento_bajo",
        titulo: `Cumplimiento bajo: ${c.puntaje_total}%`,
        descripcion: `${c.empresas_cliente?.razon_social ?? "Empresa"} — Puntaje ${c.puntaje_total}% (< 60%)`,
        empresa_id: c.empresa_id,
        empresa_nombre: c.empresas_cliente?.razon_social,
        fecha: c.fecha_evaluacion,
        severidad: c.puntaje_total < 30 ? "alta" : "media",
      });
    });

    // 5. Equipos vencidos o por vencer
    const { data: equiposVencidos } = await supabase
      .from("inventario_equipos")
      .select("id, nombre, tipo, fecha_vencimiento, empresa_id, empresas_cliente(razon_social)")
      .or("estado.eq.vencido,estado.eq.por_vencer");
    (equiposVencidos ?? []).forEach((eq: any) => {
      const isVencido = new Date(eq.fecha_vencimiento) < new Date();
      alerts.push({
        id: `equip-${eq.id}`,
        tipo: isVencido ? "pila_vencida" : "pila_pendiente", // reuse existing types
        titulo: `${isVencido ? "Equipo vencido" : "Equipo por vencer"}: ${eq.nombre}`,
        descripcion: `${eq.empresas_cliente?.razon_social ?? "Empresa"} — ${eq.tipo} vence ${new Date(eq.fecha_vencimiento).toLocaleDateString("es-CO")}`,
        empresa_id: eq.empresa_id,
        empresa_nombre: eq.empresas_cliente?.razon_social,
        fecha: eq.fecha_vencimiento,
        severidad: isVencido ? "alta" : "media",
      });
    });

    // 6. Actas pendientes de firma
    const { data: actasSinFirma } = await supabase
      .from("actas_comite")
      .select("id, numero_acta, comite_id, comites(tipo, empresa_id, empresas_cliente(razon_social))")
      .eq("firmada", false)
      .in("estado", ["borrador", "generada"]);
    (actasSinFirma ?? []).forEach((a: any) => {
      alerts.push({
        id: `acta-f-${a.id}`,
        tipo: "pila_pendiente",
        titulo: `Acta #${a.numero_acta} sin firmar`,
        descripcion: `${a.comites?.empresas_cliente?.razon_social ?? "Empresa"} — Comité ${a.comites?.tipo ?? ""}`,
        empresa_id: a.comites?.empresa_id,
        empresa_nombre: a.comites?.empresas_cliente?.razon_social,
        fecha: new Date().toISOString(),
        severidad: "media",
      });
    });

    // Sort by severity then date
    const sevOrder = { alta: 0, media: 1, baja: 2 };
    alerts.sort((a, b) => sevOrder[a.severidad] - sevOrder[b.severidad]);

    return alerts;
  },
};

export type ConfiguracionSistema = {
  clave: string;
  valor: string;
  descripcion: string | null;
  updated_at: string;
};

export const configuracionService = {
  list: async (): Promise<ConfiguracionSistema[]> => {
    const { data, error } = await supabase
      .from("configuracion_sistema")
      .select("*")
      .order("clave");
    if (error) throw error;
    return data ?? [];
  },

  update: async (clave: string, valor: string): Promise<void> => {
    const { error } = await supabase
      .from("configuracion_sistema")
      .update({ valor, updated_at: new Date().toISOString() })
      .eq("clave", clave);
    if (error) throw error;
  },

  upsert: async (clave: string, valor: string, descripcion?: string): Promise<void> => {
    const { error } = await supabase
      .from("configuracion_sistema")
      .upsert({ clave, valor, descripcion: descripcion ?? null, updated_at: new Date().toISOString() }, { onConflict: "clave" });
    if (error) throw error;
  },
};

export type LogActividad = {
  id: string;
  tipo: string;
  modulo: string | null;
  empresa_id: string | null;
  usuario_id: string | null;
  descripcion: string;
  metadata: Record<string, any> | null;
  created_at: string;
  usuario_nombre?: string;
  empresa_nombre?: string;
};

export const logsService = {
  list: async (options?: { limit?: number; modulo?: string; empresaId?: string }): Promise<LogActividad[]> => {
    let query = supabase
      .from("logs_actividad")
      .select("*, usuarios(nombre), empresas_cliente(razon_social)")
      .order("created_at", { ascending: false })
      .limit(options?.limit ?? 100);

    if (options?.modulo) query = query.eq("modulo", options.modulo);
    if (options?.empresaId) query = query.eq("empresa_id", options.empresaId);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      ...row,
      usuario_nombre: row.usuarios?.nombre ?? null,
      empresa_nombre: row.empresas_cliente?.razon_social ?? null,
    }));
  },

  log: async (entry: {
    tipo: string;
    modulo: string;
    descripcion: string;
    empresa_id?: string | null;
    usuario_id?: string | null;
    metadata?: Record<string, any>;
  }): Promise<void> => {
    const { error } = await supabase.from("logs_actividad").insert({
      tipo: entry.tipo,
      modulo: entry.modulo,
      descripcion: entry.descripcion,
      empresa_id: entry.empresa_id ?? null,
      usuario_id: entry.usuario_id ?? null,
      metadata: entry.metadata ?? null,
    });
    if (error) console.error("Error logging activity:", error);
  },
};

// ── Email Templates ──────────────────────────────
export type PlantillaCorreo = {
  id: string;
  tipo: string;
  nombre: string;
  contenido: string;
  version: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export const templatesService = {
  list: async (): Promise<PlantillaCorreo[]> => {
    const { data, error } = await supabase
      .from("templates_documento")
      .select("*")
      .order("tipo")
      .order("nombre");
    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<PlantillaCorreo | null> => {
    const { data, error } = await supabase
      .from("templates_documento")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  },

  update: async (id: string, updates: Partial<PlantillaCorreo>): Promise<PlantillaCorreo> => {
    const { data, error } = await supabase
      .from("templates_documento")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  create: async (template: Omit<PlantillaCorreo, "id" | "created_at" | "updated_at">): Promise<PlantillaCorreo> => {
    const { data, error } = await supabase
      .from("templates_documento")
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
