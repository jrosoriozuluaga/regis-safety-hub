import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Parse JSON from Claude response, stripping markdown fences if present */
function extractJSON(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned.trim());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const planId = formData.get("plan_id") as string;
    const empresaId = formData.get("empresa_id") as string;
    const manualTranscript = formData.get("transcript") as string;

    if (!audioFile && !manualTranscript) {
      return new Response(JSON.stringify({ error: "audio file or transcript text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let transcripcion = manualTranscript || "";
    let whisperUsed = false;

    if (audioFile && !manualTranscript) {
      const openaiKey = Deno.env.get("OPENAI_API_KEY");
      if (openaiKey) {
        try {
          const whisperForm = new FormData();
          whisperForm.append("file", audioFile, audioFile.name || "audio.webm");
          whisperForm.append("model", "whisper-1");
          whisperForm.append("language", "es");
          whisperForm.append("response_format", "text");

          const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { "Authorization": "Bearer " + openaiKey },
            body: whisperForm,
          });

          if (whisperRes.ok) {
            transcripcion = await whisperRes.text();
            whisperUsed = true;
          } else {
            const errText = await whisperRes.text();
            console.error("Whisper API error:", errText);
          }
        } catch (e) {
          console.error("Whisper exception:", e);
        }
      }

      if (!transcripcion) {
        transcripcion = "[Transcripción automática no disponible. Audio cargado para procesamiento manual.]";
      }
    }

    let empresaInfo = "";
    let empresaData: any = null;
    if (empresaId) {
      const { data: empresa } = await supabaseClient
        .from("empresas_cliente").select("*").eq("id", empresaId).single();
      if (empresa) {
        empresaData = empresa;
        empresaInfo = `Empresa: ${empresa.razon_social}, NIT: ${empresa.nit}, Ciudad: ${empresa.ciudad}, CIIU: ${empresa.ciiu_codigo}, Trabajadores: ${empresa.num_trabajadores}, Nivel riesgo ARL: ${empresa.nivel_riesgo_arl}`;
      }
    }

    let analisis_json: any = null;
    let aiUsed = false;
    let modeloUsado = "";
    const t0 = Date.now();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (anthropicKey && transcripcion.length > 50) {
      const analysisPrompt = `Eres un especialista en SG-SST en Colombia. Basado en esta transcripción de audio, genera un análisis de vulnerabilidad JSON.\n\nEMPRESA: ${empresaInfo || "No disponible"}\n\nTRANSCRIPCIÓN:\n${transcripcion}\n\nGenera JSON con: resumen_ejecutivo, amenazas_identificadas[{tipo,amenaza,probabilidad,descripcion}], analisis_vulnerabilidad{personas{nivel,hallazgos[]},recursos{nivel,hallazgos[]},procesos{nivel,hallazgos[]}}, nivel_riesgo_global, recomendaciones[{prioridad,accion,responsable_sugerido,plazo_sugerido}], recursos_emergencia{extintores,botiquines,rutas_evacuacion,punto_encuentro,brigada}. Solo JSON válido.`;

      // P3: Try cheap model first, escalate if needed
      const CHEAP_MODEL = "claude-haiku-4-5-20251001";
      const PREMIUM_MODEL = "claude-sonnet-4-20250514";

      async function tryAnalysis(model: string): Promise<any | null> {
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey!,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({ model, max_tokens: 4096, messages: [{ role: "user", content: analysisPrompt }] }),
          });
          if (res.ok) {
            const data = await res.json();
            return extractJSON(data.content[0].text);
          }
          console.error(`Model ${model} failed: ${res.status}`);
          return null;
        } catch (e) { console.error(`Model ${model} error:`, e); return null; }
      }

      const cheapResult = await tryAnalysis(CHEAP_MODEL);
      if (cheapResult && cheapResult.amenazas_identificadas?.length > 0) {
        analisis_json = cheapResult;
        aiUsed = true;
        modeloUsado = CHEAP_MODEL;
      } else {
        // Haiku failed or produced empty analysis — try Sonnet
        console.log("Escalating analysis to Sonnet...");
        const premiumResult = await tryAnalysis(PREMIUM_MODEL);
        if (premiumResult) {
          analisis_json = premiumResult;
          aiUsed = true;
          modeloUsado = PREMIUM_MODEL;
        } else if (cheapResult) {
          analisis_json = cheapResult;
          aiUsed = true;
          modeloUsado = CHEAP_MODEL;
        }
      }
    }

    const tiempoProcesamiento = Date.now() - t0;
    // Estimate audio duration from file size (~16KB/s for webm)
    const audioDuracionSeg = audioFile ? Math.round(audioFile.size / 16000) : 0;
    const costoWhisper = whisperUsed ? (audioDuracionSeg / 60) * 0.006 : 0;
    const costoClaude = modeloUsado.includes("haiku") ? 0.003 : modeloUsado.includes("sonnet") ? 0.01 : 0;

    if (!analisis_json) {
      console.log("Using template fallback for vulnerability analysis");
      const text = transcripcion.toLowerCase();
      const amenazas = [];
      if (text.includes("sism") || text.includes("temblor")) amenazas.push({ tipo: "natural", amenaza: "Sismo", probabilidad: "media", descripcion: "Riesgo sísmico identificado en la zona" });
      if (text.includes("incendio") || text.includes("fuego") || text.includes("extintor")) amenazas.push({ tipo: "tecnologica", amenaza: "Incendio", probabilidad: "media", descripcion: "Riesgo de incendio identificado" });
      if (text.includes("inundaci") || text.includes("agua") || text.includes("lluvia")) amenazas.push({ tipo: "natural", amenaza: "Inundación", probabilidad: "baja", descripcion: "Riesgo de inundación por lluvias" });
      if (text.includes("caída") || text.includes("resbal") || text.includes("piso")) amenazas.push({ tipo: "tecnologica", amenaza: "Caídas", probabilidad: "media", descripcion: "Riesgo de caídas por condiciones del piso" });
      if (text.includes("eléctric") || text.includes("cable") || text.includes("corto")) amenazas.push({ tipo: "tecnologica", amenaza: "Riesgo eléctrico", probabilidad: "media", descripcion: "Riesgo eléctrico identificado" });
      if (text.includes("robo") || text.includes("seguridad") || text.includes("delincuencia")) amenazas.push({ tipo: "social", amenaza: "Inseguridad", probabilidad: "media", descripcion: "Riesgo de seguridad social" });
      if (amenazas.length === 0) {
        amenazas.push({ tipo: "natural", amenaza: "Sismo", probabilidad: "media", descripcion: "Amenaza sísmica general para Colombia" });
        amenazas.push({ tipo: "tecnologica", amenaza: "Incendio", probabilidad: "media", descripcion: "Riesgo de incendio general" });
      }

      analisis_json = {
        resumen_ejecutivo: `Análisis de vulnerabilidad para ${empresaData?.razon_social || 'la empresa'} basado en inspección de campo. Se identificaron ${amenazas.length} amenazas principales.`,
        amenazas_identificadas: amenazas,
        analisis_vulnerabilidad: {
          personas: { nivel: "medio", hallazgos: ["Se requiere verificar capacitación de brigada", "Evaluar cobertura de primeros auxilios"] },
          recursos: { nivel: "medio", hallazgos: ["Verificar estado de extintores", "Revisar señalización de evacuación"] },
          procesos: { nivel: "medio", hallazgos: ["Actualizar procedimientos de evacuación", "Programar simulacro"] }
        },
        nivel_riesgo_global: "medio",
        recomendaciones: [
          { prioridad: "alta", accion: "Realizar simulacro de evacuación", responsable_sugerido: "Coordinador SST", plazo_sugerido: "corto_plazo" },
          { prioridad: "alta", accion: "Verificar y recargar extintores", responsable_sugerido: "Coordinador SST", plazo_sugerido: "inmediato" },
          { prioridad: "media", accion: "Capacitar brigada de emergencias", responsable_sugerido: "ARL", plazo_sugerido: "mediano_plazo" },
          { prioridad: "media", accion: "Actualizar señalización de rutas de evacuación", responsable_sugerido: "Mantenimiento", plazo_sugerido: "corto_plazo" }
        ],
        recursos_emergencia: {
          extintores: text.includes("extintor") ? "Mencionados en inspección" : "Pendiente verificación",
          botiquines: text.includes("botiqu") ? "Mencionados en inspección" : "Pendiente verificación",
          rutas_evacuacion: text.includes("ruta") || text.includes("evacuaci") ? "Mencionadas en inspección" : "Pendiente verificación",
          punto_encuentro: text.includes("punto") || text.includes("encuentro") ? "Mencionado en inspección" : "Pendiente definición",
          brigada: text.includes("brigada") ? "Mencionada en inspección" : "Pendiente conformación"
        },
        _fallback: true
      };
    }

    let savedPlan = null;
    if (planId) {
      const { data, error } = await supabaseClient
        .from("planes_emergencia").update({
          transcripcion,
          analisis_json,
          estado: "en_revision",
        }).eq("id", planId).select().single();
      if (error) throw new Error("Error updating plan: " + error.message);
      savedPlan = data;
    } else if (empresaId) {
      const { data, error } = await supabaseClient
        .from("planes_emergencia").insert({
          empresa_id: empresaId,
          transcripcion,
          analisis_json,
          estado: "en_revision",
          generado_por_ia: aiUsed,
        }).select().single();
      if (error) throw new Error("Error creating plan: " + error.message);
      savedPlan = data;
    }

    return new Response(JSON.stringify({
      transcripcion,
      analisis_json,
      plan: savedPlan,
      message: whisperUsed ? "Audio transcrito y analizado exitosamente" : "Análisis generado (transcripción manual o fallback)",
      whisper_used: whisperUsed,
      ai_used: aiUsed,
      modelo_usado: modeloUsado || null,
      costo_estimado_usd: +(costoWhisper + costoClaude).toFixed(6),
      tiempo_procesamiento_ms: tiempoProcesamiento,
      audio_duracion_seg: audioDuracionSeg,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
