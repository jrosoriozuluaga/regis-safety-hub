import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * generate-bitacora: Monthly activity report per company.
 *
 * Invocation: POST with JSON { empresa_id?, mes? (YYYY-MM), enviar_email?: boolean }
 *   - If empresa_id is omitted, generates for ALL active companies.
 *   - If mes is omitted, uses the previous month.
 *   - If enviar_email is true, sends via Resend (requires RESEND_API_KEY secret).
 *
 * Returns: { bitacoras: [{ empresa_id, empresa_nombre, periodo, resumen, actividades_count }] }
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

    // Determine period (default: previous month)
    let mes = body.mes as string | undefined;
    if (!mes) {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    const [anio, mesNum] = mes.split("-").map(Number);
    const inicioMes = new Date(anio, mesNum - 1, 1).toISOString();
    const finMes = new Date(anio, mesNum, 0, 23, 59, 59).toISOString();

    // Get target companies
    let empresas: any[] = [];
    if (body.empresa_id) {
      const { data } = await supabase
        .from("empresas_cliente")
        .select("id, razon_social, contacto_pila_email")
        .eq("id", body.empresa_id)
        .single();
      if (data) empresas = [data];
    } else {
      const { data } = await supabase
        .from("empresas_cliente")
        .select("id, razon_social, contacto_pila_email")
        .eq("activo", true);
      empresas = data ?? [];
    }

    const bitacoras: any[] = [];
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    for (const empresa of empresas) {
      // Query activity logs for this company in the period
      const { data: logs } = await supabase
        .from("logs_actividad")
        .select("tipo, modulo, descripcion, created_at")
        .eq("empresa_id", empresa.id)
        .gte("created_at", inicioMes)
        .lte("created_at", finMes)
        .order("created_at", { ascending: true });

      const actividades = logs ?? [];

      // Group by module
      const porModulo: Record<string, number> = {};
      for (const log of actividades) {
        const m = log.modulo || "general";
        porModulo[m] = (porModulo[m] || 0) + 1;
      }

      // Generate summary with Claude Haiku (cheap)
      let resumen = "";
      if (anthropicKey && actividades.length > 0) {
        try {
          const prompt = `Genera un resumen ejecutivo breve (3-5 párrafos) de las actividades del SG-SST para la empresa "${empresa.razon_social}" durante el mes ${mes}.\n\nActividades registradas (${actividades.length} total):\n${JSON.stringify(porModulo, null, 2)}\n\nDetalle de las últimas 20 actividades:\n${actividades.slice(-20).map((a: any) => `- [${a.modulo}] ${a.descripcion}`).join("\n")}\n\nEl resumen debe ser profesional, en español colombiano, y mencionar los módulos más activos.`;

          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 1024,
              messages: [{ role: "user", content: prompt }],
            }),
          });
          if (res.ok) {
            const data = await res.json();
            resumen = data.content[0].text;
          }
        } catch (e) {
          console.error("Claude error for bitacora:", e);
        }
      }

      if (!resumen) {
        // Template fallback
        const modulosText = Object.entries(porModulo)
          .sort((a, b) => b[1] - a[1])
          .map(([m, c]) => `${m}: ${c} acciones`)
          .join(", ");
        resumen = `Bitácora mensual de actividades SG-SST para ${empresa.razon_social} — periodo ${mes}.\n\nSe registraron ${actividades.length} actividades en total. Desglose por módulo: ${modulosText || "sin actividad registrada"}.`;
      }

      // Send email if requested
      if (enviarEmail && resendKey && empresa.contacto_pila_email) {
        try {
          // Get configured sender
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
              to: [empresa.contacto_pila_email],
              subject: `Bitácora SG-SST — ${empresa.razon_social} — ${mes}`,
              html: `<h2>Bitácora mensual SG-SST</h2><p><strong>${empresa.razon_social}</strong> — Periodo: ${mes}</p><div style="white-space:pre-wrap">${resumen}</div><hr><p style="font-size:11px;color:#888">Generado automáticamente por Regis Colombia SG-SST</p>`,
              text: `Bitácora mensual SG-SST\n${empresa.razon_social} — Periodo: ${mes}\n\n${resumen}\n\nGenerado automáticamente por Regis Colombia SG-SST`,
              headers: {
                "List-Unsubscribe": "<mailto:sgsst@regiscolombia.com?subject=unsubscribe>",
              },
            }),
          });
        } catch (e) {
          console.error("Email send error:", e);
        }
      }

      // Log the generation
      await supabase.from("logs_actividad").insert({
        tipo: "generar",
        modulo: "bitacora",
        descripcion: `Bitácora mensual generada: ${empresa.razon_social} — ${mes} (${actividades.length} actividades)`,
        empresa_id: empresa.id,
        metadata: { periodo: mes, actividades_count: actividades.length, email_enviado: enviarEmail },
      });

      bitacoras.push({
        empresa_id: empresa.id,
        empresa_nombre: empresa.razon_social,
        periodo: mes,
        resumen,
        actividades_count: actividades.length,
        desglose_modulos: porModulo,
      });
    }

    return new Response(JSON.stringify({ bitacoras, periodo: mes }), {
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
