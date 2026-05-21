import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { comite_id, tipo_reunion, lugar, hora_inicio, hora_fin, puntos_json, asistentes_ids, transcripcion } = await req.json();

    if (!comite_id || !tipo_reunion) {
      return new Response(JSON.stringify({ error: "comite_id and tipo_reunion are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: comite, error: comiteErr } = await supabaseClient
      .from("comites").select("*, empresas_cliente(*)").eq("id", comite_id).single();
    if (comiteErr) throw new Error("Comité no encontrado: " + comiteErr.message);

    const empresa = comite.empresas_cliente;

    const { data: integrantes } = await supabaseClient
      .from("integrantes_comite").select("*").eq("comite_id", comite_id).eq("activo", true);

    const asistentes = asistentes_ids?.length
      ? integrantes?.filter((i: any) => asistentes_ids.includes(i.id)) ?? []
      : integrantes ?? [];

    const { data: lastActa } = await supabaseClient
      .from("actas_comite").select("numero_acta").eq("comite_id", comite_id)
      .order("numero_acta", { ascending: false }).limit(1).single();

    const numero_acta = (lastActa?.numero_acta ?? 0) + 1;

    const hoy = new Date();
    const fecha_reunion = hoy.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
    const hay_quorum = asistentes.length >= Math.ceil((integrantes?.length ?? 1) / 2);

    const tipo_comite_nombre = comite.tipo === "copasst" ? "COPASST"
      : comite.tipo === "convivencia" ? "Comité de Convivencia Laboral" : "Vigía de SST";

    // Try AI generation — P3: cheap model first, escalate if result is poor
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    let actaContent = "";
    let usedAI = false;
    let modeloUsado = "";
    const t0 = Date.now();

    if (anthropicKey) {
      let prompt: string;

      if (transcripcion) {
        // Transcription-based prompt (Fireflies or Whisper)
        const isFollowUp = tipo_reunion === "seguimiento";
        prompt = `Eres un especialista en Seguridad y Salud en el Trabajo (SG-SST) en Colombia. Genera el acta de una reunión ${isFollowUp ? "de seguimiento" : tipo_reunion} del ${tipo_comite_nombre} de la empresa ${empresa.razon_social}.

DATOS DE LA REUNIÓN:
- Fecha: ${fecha_reunion}
- Hora: ${hora_inicio || "09:00"} a ${hora_fin || "10:00"}
- Lugar: ${lugar || empresa.ciudad}
- Número de acta: ${numero_acta}
- NIT: ${empresa.nit}

INTEGRANTES DEL COMITÉ:
${JSON.stringify(integrantes?.map((i: any) => ({ nombre: i.nombre, cargo_empresa: i.cargo_empresa, rol_comite: i.rol_comite })), null, 2)}

TRANSCRIPCIÓN DE LA REUNIÓN (con hablantes identificados):
${transcripcion}

INSTRUCCIONES:
1. Genera el acta formal completa basándote en la transcripción.
2. Identifica la verificación de quórum basándote en los participantes.${isFollowUp ? "\n3. Incluye sección de 'Estado de compromisos anteriores' (cumplido / en progreso / pendiente) si se mencionan en la transcripción." : ""}
${isFollowUp ? "4" : "3"}. Organiza por temas, atribuyendo intervenciones a cada hablante.
${isFollowUp ? "5" : "4"}. Incluye sección de acuerdos y compromisos con responsables.
${isFollowUp ? "6" : "5"}. Incluye cierre y sección de firmas al final.

FORMATO: Acta profesional en español colombiano, formato markdown, lista para firmar.`;
      } else {
        // Points-based prompt (original manual flow)
        prompt = `Eres un especialista en Seguridad y Salud en el Trabajo (SG-SST) en Colombia. Genera el acta de una reunión ${tipo_reunion} del ${tipo_comite_nombre} de la empresa ${empresa.razon_social}.\n\nDATOS DE LA REUNIÓN:\n- Fecha: ${fecha_reunion}\n- Hora: ${hora_inicio || "09:00"} a ${hora_fin || "10:00"}\n- Lugar: ${lugar || empresa.ciudad}\n- Número de acta: ${numero_acta}\n- NIT: ${empresa.nit}\n- Ciudad: ${empresa.ciudad}\n\nINTEGRANTES DEL COMITÉ:\n${JSON.stringify(integrantes?.map((i: any) => ({ nombre: i.nombre, cargo_empresa: i.cargo_empresa, rol_comite: i.rol_comite, es_principal: i.es_principal })), null, 2)}\n\nASISTENTES A ESTA REUNIÓN:\n${JSON.stringify(asistentes.map((a: any) => ({ nombre: a.nombre, cargo_empresa: a.cargo_empresa, rol_comite: a.rol_comite })), null, 2)}\n\nPUNTOS TRATADOS:\n${JSON.stringify(puntos_json, null, 2)}\n\nINSTRUCCIONES:\n1. Genera el acta completa con formato estándar colombiano.\n2. Verifica el quórum: se requiere mitad + 1 de los integrantes principales. Hay quórum: ${hay_quorum ? "Sí" : "No"}.\n3. Para cada punto tratado, desarrolla el contenido con redacción formal y técnica.\n4. Si es una reunión ordinaria, incluye temas típicos del ${tipo_comite_nombre}.\n5. Incluye sección de firmas al final.\n\nFORMATO: Responde con el texto completo del acta en markdown.`;
      }

      const CHEAP_MODEL = "claude-haiku-4-5-20251001";
      const PREMIUM_MODEL = "claude-sonnet-4-20250514";

      async function tryModel(model: string): Promise<string | null> {
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey!,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({ model, max_tokens: 4096, messages: [{ role: "user", content: prompt }] }),
          });
          if (res.ok) {
            const data = await res.json();
            return data.content[0].text;
          }
          console.error(`Model ${model} failed: ${res.status}`);
          return null;
        } catch (e) { console.error(`Model ${model} exception:`, e); return null; }
      }

      // Try cheap first
      const cheapResult = await tryModel(CHEAP_MODEL);
      if (cheapResult && cheapResult.length >= 500) {
        actaContent = cheapResult;
        usedAI = true;
        modeloUsado = CHEAP_MODEL;
      } else if (cheapResult && cheapResult.length < 500) {
        // Acta too short — escalate to Sonnet
        console.log("Haiku acta too short, escalating to Sonnet...");
        const premiumResult = await tryModel(PREMIUM_MODEL);
        if (premiumResult) {
          actaContent = premiumResult;
          modeloUsado = PREMIUM_MODEL;
        } else {
          actaContent = cheapResult; // Use short result as fallback
          modeloUsado = CHEAP_MODEL;
        }
        usedAI = true;
      } else {
        // Haiku failed entirely — try Sonnet
        const premiumResult = await tryModel(PREMIUM_MODEL);
        if (premiumResult) {
          actaContent = premiumResult;
          usedAI = true;
          modeloUsado = PREMIUM_MODEL;
        }
      }
    }

    const tiempoProcesamiento = Date.now() - t0;

    // Template-based fallback
    if (!actaContent) {
      console.log("Using template fallback for acta generation");
      const asistentesText = asistentes.map((a: any) => `- ${a.nombre} — ${a.cargo_empresa} (${a.rol_comite})`).join("\n");
      const ausentesArr = integrantes?.filter((i: any) => !asistentes.find((a: any) => a.id === i.id)) ?? [];
      const ausentesText = ausentesArr.length > 0
        ? ausentesArr.map((a: any) => `- ${a.nombre} — ${a.cargo_empresa} (${a.rol_comite})`).join("\n")
        : "- Ninguno";
      const puntosText = (puntos_json || []).map((p: any, i: number) => {
        return `### ${i + 1}. ${p.titulo}\n\nSe presenta y discute el punto relacionado con ${p.titulo.toLowerCase()}. ${p.desarrollo || 'Los asistentes manifiestan su conformidad y se acuerda dar cumplimiento a lo establecido.'}\n\n${p.compromisos?.length ? '**Compromisos:**\n' + p.compromisos.map((c: any) => `- ${c}`).join('\n') : '**Compromiso:** Dar seguimiento en la próxima reunión.'}`;
      }).join("\n\n");

      actaContent = `# ACTA N° ${String(numero_acta).padStart(3, "0")}\n\n## ${tipo_comite_nombre}\n## ${empresa.razon_social}\n\n---\n\n**Fecha:** ${fecha_reunion}\n**Hora:** ${hora_inicio || "09:00"} a ${hora_fin || "10:00"}\n**Lugar:** ${lugar || empresa.ciudad}\n**NIT:** ${empresa.nit}\n**Ciudad:** ${empresa.ciudad}\n**Tipo de reunión:** ${tipo_reunion === "ordinaria" ? "Ordinaria" : "Extraordinaria"}\n\n---\n\n## 1. VERIFICACIÓN DE QUÓRUM\n\nSe verifica la asistencia de los integrantes del ${tipo_comite_nombre}. Se cuenta con la presencia de ${asistentes.length} de ${integrantes?.length || 0} integrantes.\n\n${hay_quorum ? "**Se verifica quórum decisorio. Se da inicio a la reunión.**" : "**No se cuenta con quórum. Sin embargo, se procede a realizar la reunión de carácter informativo.**"}\n\n### Asistentes:\n${asistentesText}\n\n### Ausentes:\n${ausentesText}\n\n---\n\n## 2. ORDEN DEL DÍA\n\n${(puntos_json || []).map((p: any, i: number) => `${i + 1}. ${p.titulo}`).join("\n")}\n\n---\n\n## 3. DESARROLLO\n\n${puntosText}\n\n---\n\n## 4. COMPROMISOS Y TAREAS\n\n| # | Compromiso | Responsable | Plazo |\n|---|-----------|-------------|-------|\n${(puntos_json || []).map((p: any, i: number) => `| ${i + 1} | Seguimiento: ${p.titulo} | ${tipo_comite_nombre} | Próxima reunión |`).join("\n")}\n\n---\n\n## 5. CIERRE\n\nSin más asuntos que tratar, se da por terminada la reunión siendo las ${hora_fin || "10:00"} horas del día ${fecha_reunion}.\n\n---\n\n## FIRMAS\n\n${asistentes.map((a: any) => `\n\n_________________________\n**${a.nombre}**\n${a.cargo_empresa}\n${a.rol_comite}\n`).join("")}\n\n---\n*Acta generada por Regis SG-SST — ${new Date().toLocaleString("es-CO")}*`;
    }

    // Save to database
    const { data: acta, error: actaErr } = await supabaseClient
      .from("actas_comite").insert({
        comite_id,
        numero_acta,
        fecha_reunion: hoy.toISOString().split("T")[0],
        hora_inicio: hora_inicio || "09:00",
        hora_fin: hora_fin || "10:00",
        tipo_reunion,
        lugar: lugar || empresa.ciudad,
        hay_quorum,
        estado: "borrador",
        contenido_generado: actaContent,
      }).select().single();

    if (actaErr) throw new Error("Error saving acta: " + actaErr.message);

    const costoEstimado = modeloUsado.includes("haiku") ? 0.005 : modeloUsado.includes("sonnet") ? 0.01 : 0;

    // Log API cost
    if (modeloUsado) {
      await supabaseClient.from("api_cost_log").insert({
        funcion: "generate-acta",
        modelo: modeloUsado,
        costo_estimado_usd: costoEstimado,
        tiempo_ms: tiempoProcesamiento,
        empresa_id: comite.empresa_id,
        metadata: { acta_length: actaContent.length, numero_acta },
      }).then(() => {}, (e: any) => console.error("Cost log error:", e));
    }

    return new Response(JSON.stringify({
      acta, contenido: actaContent, ai_used: usedAI,
      modelo_usado: modeloUsado || null,
      costo_estimado_usd: costoEstimado,
      tiempo_procesamiento_ms: tiempoProcesamiento,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
