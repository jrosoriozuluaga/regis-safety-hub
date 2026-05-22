import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * weekly-summary: Weekly summary for consultants.
 *
 * Invocation: POST with JSON { enviar_email?: boolean, email_destino?: string }
 *   - Generates a summary of pending tasks across all companies.
 *   - If enviar_email is true and email_destino provided, sends via Resend.
 *
 * Returns: { resumen, stats, empresas_detalle[] }
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const enviarEmail = body.enviar_email ?? false;
    const emailDestino = body.email_destino as string | undefined;

    // Gather stats across all active companies
    const { data: empresas } = await supabase
      .from("empresas_cliente")
      .select("id, razon_social")
      .eq("activo", true);

    const empresasList = empresas ?? [];

    // PILA: pending and overdue
    const { data: pilaRecords } = await supabase
      .from("pila_records")
      .select("empresa_id, estado, periodo");

    const pilaPendientes = (pilaRecords ?? []).filter((r: any) => r.estado === "pendiente").length;
    const pilaVencidas = (pilaRecords ?? []).filter((r: any) => r.estado === "vencida").length;

    // Documents: pending validation
    const { data: docsData } = await supabase
      .from("documentos")
      .select("empresa_id, estado");

    const docsPorValidar = (docsData ?? []).filter((d: any) => d.estado === "cargado").length;
    const docsPorAprobar = (docsData ?? []).filter((d: any) => d.estado === "validado").length;

    // Medical exams pending review
    const { count: examsPendientes } = await supabase
      .from("examenes_medicos")
      .select("id", { count: "exact", head: true })
      .is("concepto_aptitud", null);

    // Equipment expiring soon (30 days)
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: equiposProximos } = await supabase
      .from("inventario_equipos")
      .select("id", { count: "exact", head: true })
      .lte("fecha_vencimiento", in30Days)
      .gte("fecha_vencimiento", new Date().toISOString());

    // Activity last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: actividadSemana } = await supabase
      .from("logs_actividad")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo);

    // Per-empresa detail
    const empresasDetalle = empresasList.map((emp: any) => {
      const empPila = (pilaRecords ?? []).filter((r: any) => r.empresa_id === emp.id);
      const empDocs = (docsData ?? []).filter((d: any) => d.empresa_id === emp.id);
      return {
        empresa: emp.razon_social,
        pila_pendientes: empPila.filter((r: any) => r.estado === "pendiente").length,
        pila_vencidas: empPila.filter((r: any) => r.estado === "vencida").length,
        docs_por_validar: empDocs.filter((d: any) => d.estado === "cargado").length,
        docs_por_aprobar: empDocs.filter((d: any) => d.estado === "validado").length,
      };
    }).filter((e: any) => e.pila_pendientes > 0 || e.pila_vencidas > 0 || e.docs_por_validar > 0 || e.docs_por_aprobar > 0);

    const stats = {
      empresas_activas: empresasList.length,
      pila_pendientes: pilaPendientes,
      pila_vencidas: pilaVencidas,
      docs_por_validar: docsPorValidar,
      docs_por_aprobar: docsPorAprobar,
      exams_pendientes: examsPendientes ?? 0,
      equipos_proximos_vencer: equiposProximos ?? 0,
      actividad_semana: actividadSemana ?? 0,
    };

    // Generate summary text
    const hoy = new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const alertas: string[] = [];
    if (pilaVencidas > 0) alertas.push(`${pilaVencidas} planillas PILA vencidas`);
    if (docsPorValidar > 0) alertas.push(`${docsPorValidar} documentos por validar`);
    if (docsPorAprobar > 0) alertas.push(`${docsPorAprobar} documentos por aprobar`);
    if ((examsPendientes ?? 0) > 0) alertas.push(`${examsPendientes} exámenes médicos pendientes de revisión`);
    if ((equiposProximos ?? 0) > 0) alertas.push(`${equiposProximos} equipos próximos a vencer`);

    const resumen = `# Resumen Semanal SG-SST\n**${hoy}**\n\n## Estado general\n- ${empresasList.length} empresas activas\n- ${actividadSemana ?? 0} acciones registradas esta semana\n- ${pilaPendientes} PILA pendientes, ${pilaVencidas} vencidas\n\n## Alertas\n${alertas.length > 0 ? alertas.map((a) => `- ⚠️ ${a}`).join("\n") : "- ✅ Sin alertas pendientes"}\n\n## Detalle por empresa\n${empresasDetalle.length > 0 ? empresasDetalle.map((e: any) => `- **${e.empresa}**: ${e.pila_vencidas > 0 ? `${e.pila_vencidas} PILA vencidas` : "PILA al día"}${e.docs_por_validar > 0 ? `, ${e.docs_por_validar} docs por validar` : ""}`).join("\n") : "Todas las empresas al día."}`;

    // Send email if requested
    if (enviarEmail && emailDestino) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        try {
          const { data: config } = await supabase
            .from("configuracion_sistema")
            .select("valor")
            .eq("clave", "email_remitente")
            .single();
          const from = config?.valor || "Regis Colombia <notificaciones@regiscolombia.com>";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${resendKey}` },
            body: JSON.stringify({
              from,
              to: [emailDestino],
              subject: `Resumen semanal SG-SST — ${hoy}`,
              html: resumen.replace(/\n/g, "<br>").replace(/^# (.+)/gm, "<h2>$1</h2>").replace(/^## (.+)/gm, "<h3>$1</h3>").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
              text: resumen,
              headers: {
                "List-Unsubscribe": "<mailto:sgsst@regiscolombia.com?subject=unsubscribe>",
              },
            }),
          });
        } catch (e) {
          console.error("Email send error:", e);
        }
      }
    }

    // Log
    await supabase.from("logs_actividad").insert({
      tipo: "generar",
      modulo: "resumen_semanal",
      descripcion: `Resumen semanal generado: ${alertas.length} alertas, ${empresasList.length} empresas`,
      metadata: { stats, alertas_count: alertas.length, email_enviado: enviarEmail },
    });

    return new Response(JSON.stringify({ resumen, stats, empresas_detalle: empresasDetalle }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
