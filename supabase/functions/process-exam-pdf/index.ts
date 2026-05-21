import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Safely convert Uint8Array to base64 without exceeding call stack (chunked) */
function uint8ToBase64(bytes: Uint8Array): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
  }
  return btoa(binary);
}

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
    const pdfFile = formData.get("pdf") as File;
    const empresaId = formData.get("empresa_id") as string;
    const trabajadorId = formData.get("trabajador_id") as string;

    if (!pdfFile || !empresaId) {
      return new Response(JSON.stringify({ error: "pdf file and empresa_id are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfBase64 = uint8ToBase64(new Uint8Array(pdfBytes));

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    const extractionPrompt = `Eres un especialista en medicina ocupacional en Colombia. Analiza este documento PDF y determina si es un examen médico ocupacional. Luego extrae la información estructurada.

PASO 1: Determina si el documento ES un examen médico ocupacional (certificado de aptitud, concepto médico ocupacional, examen de ingreso/periódico/egreso, formato IPS, EPS, o laboratorio clínico).

PASO 2: Extrae los campos en formato JSON:

{
  "es_examen_medico": true|false,
  "mensaje": "Si no es examen médico, explica qué tipo de documento parece ser. Si sí es, null.",
  "confianza_extraccion": "alta|media|baja",
  "trabajador": {
    "nombre": "nombre completo del trabajador o null si no se identifica",
    "cedula": "número de documento de identidad (solo dígitos) o null",
    "cargo": "cargo o puesto de trabajo o null",
    "area": "área o departamento o null"
  },
  "examen": {
    "tipo_examen": "ingreso|periodico|egreso|null",
    "fecha_examen": "YYYY-MM-DD o null",
    "concepto_aptitud": "apto|apto_con_restricciones|no_apto|null",
    "medico_nombre": "nombre del médico o null"
  },
  "recomendaciones": [
    {
      "tipo": "recomendacion|restriccion",
      "descripcion": "texto de la recomendación o restricción"
    }
  ],
  "hallazgos": {
    "antecedentes_relevantes": "resumen de antecedentes o null",
    "examen_fisico_resumen": "hallazgos principales del examen físico o null",
    "examenes_complementarios": "resultados de exámenes paraclínicos o null"
  }
}

INSTRUCCIONES:
- Si el documento NO es un examen médico ocupacional, establece es_examen_medico=false y deja los demás campos en null.
- Si no puedes identificar con certeza el nombre, cédula o concepto de aptitud, devuelve esos campos como null en vez de inventar valores.
- Para confianza_extraccion: "alta" si nombre + cédula + concepto fueron extraídos, "media" si al menos 2 de 3, "baja" si 1 o menos.
- Para tipo_examen: "ingreso/pre-empleo" -> "ingreso", "periódico/ocupacional" -> "periodico", "egreso/retiro" -> "egreso".
- Para concepto_aptitud: El concepto generalmente dice APTO, APTO CON RESTRICCIONES, NO APTO, o APLAZADO. Mapea: "apto sin restricciones" -> "apto", "apto con restricciones" -> "apto_con_restricciones", "no apto" -> "no_apto". Si dice "aplazado" usa null.
- Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;

    const retryPrompt = `Eres un especialista en medicina ocupacional en Colombia. El documento anterior fue identificado como un posible examen médico pero la extracción inicial fue incompleta.

Revisa el documento con más detalle. Busca específicamente:
- Certificado de aptitud, concepto médico ocupacional
- Formato IPS, EPS, o laboratorio clínico
- El concepto de aptitud generalmente dice: APTO, APTO CON RESTRICCIONES, NO APTO, o APLAZADO
- Nombre y cédula del paciente/trabajador pueden estar en encabezados, tablas, o secciones de datos personales
- La fecha puede estar en formato DD/MM/YYYY o YYYY-MM-DD

Extrae la información en el mismo formato JSON anterior. Si realmente no puedes encontrar un campo, déjalo como null.`;

    let extracted: any = null;
    let usedAI = false;
    const aiErrors: string[] = [];

    /** Helper to call Claude with a given prompt */
    async function callClaude(model: string, prompt: string, pdfData: string, apiKey: string): Promise<{ ok: boolean; data?: any; error?: string }> {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        };
        const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers,
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            messages: [{
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfData } },
                { type: "text", text: prompt },
              ],
            }],
          }),
        });
        if (claudeRes.ok) {
          const claudeData = await claudeRes.json();
          return { ok: true, data: extractJSON(claudeData.content[0].text) };
        }
        const errBody = await claudeRes.text();
        return { ok: false, error: `${model} (${claudeRes.status}): ${errBody.substring(0, 200)}` };
      } catch (e) {
        return { ok: false, error: `${model}: ${e.message}` };
      }
    }

    if (anthropicKey) {
      const MODEL_CASCADE = [
        "claude-sonnet-4-6",
        "claude-haiku-4-5-20251001",
      ];

      for (const model of MODEL_CASCADE) {
        console.log(`Trying model: ${model}`);
        const result = await callClaude(model, extractionPrompt, pdfBase64, anthropicKey);
        if (result.ok && result.data) {
          extracted = result.data;
          usedAI = true;
          console.log(`Success with model: ${model}`);

          // If confidence is low and document is a medical exam, retry with detailed prompt
          if (extracted.es_examen_medico !== false && extracted.confianza_extraccion === "baja") {
            console.log("Low confidence extraction, retrying with detailed prompt...");
            const retryResult = await callClaude(model, retryPrompt, pdfBase64, anthropicKey);
            if (retryResult.ok && retryResult.data) {
              const retryConf = retryResult.data.confianza_extraccion;
              // Use retry result only if it's better
              if (retryConf === "alta" || retryConf === "media") {
                extracted = retryResult.data;
                console.log(`Retry improved confidence to: ${retryConf}`);
              }
            }
          }
          break;
        }
        if (result.error) {
          aiErrors.push(result.error);
          console.error(`Model ${model} failed`);
          if (result.error.includes("(401)")) break;
        }
      }
    }

    // Fallback: basic text extraction
    if (!extracted) {
      console.log("Using fallback extraction");
      const pdfText = new TextDecoder().decode(new Uint8Array(pdfBytes));
      const parenTexts: string[] = [];
      const parenRegex = /\(([^)]{2,})\)/g;
      let match;
      while ((match = parenRegex.exec(pdfText)) !== null) {
        const t = match[1].trim();
        if (t.length > 2 && !/^[\d.]+$/.test(t)) parenTexts.push(t);
      }
      const textChunks: string[] = [];
      const streamRegex = /stream\n([\s\S]*?)\nendstream/g;
      while ((match = streamRegex.exec(pdfText)) !== null) {
        const chunk = match[1].replace(/[^\x20-\x7E\xC0-\xFF\n]/g, " ").trim();
        if (chunk.length > 5) textChunks.push(chunk);
      }
      const allText = [...parenTexts, ...textChunks].join(" ");

      const nombreMatch = allText.match(/(?:nombre|paciente|trabajador)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i);
      const cedulaMatch = allText.match(/(?:c[eé]dula|documento|cc|C\.?C\.?)[:\s#.]*([\d.]+)/i);
      const cargoMatch = allText.match(/(?:cargo|puesto|ocupaci[oó]n)[:\s]+([^\n,;]+)/i);
      const fechaMatch = allText.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);
      const tipoMatch = allText.match(/(?:tipo[:\s]+)?(ingreso|peri[oó]dico|egreso|pre.?empleo|retiro|ocupacional)/i);
      const conceptoMatch = allText.match(/(?:concepto|aptitud)[:\s]+(apto|no apto|apto con restricciones)/i);
      const medicoMatch = allText.match(/(?:m[eé]dico|doctor|dra?\.?)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i);

      let tipoExamen = "periodico";
      if (tipoMatch) { const t = tipoMatch[1].toLowerCase(); if (t.includes("ingreso") || t.includes("empleo")) tipoExamen = "ingreso"; else if (t.includes("egreso") || t.includes("retiro")) tipoExamen = "egreso"; }
      let concepto: string | null = null;
      if (conceptoMatch) { const c = conceptoMatch[1].toLowerCase(); if (c.includes("no apto")) concepto = "no_apto"; else if (c.includes("restriccion")) concepto = "apto_con_restricciones"; else concepto = "apto"; }
      let fecha = new Date().toISOString().split("T")[0];
      if (fechaMatch) { const f = fechaMatch[1]; if (f.includes("/")) { const p = f.split("/"); fecha = `${p[2]}-${p[1]}-${p[0]}`; } else fecha = f; }

      // Calculate confidence for fallback extraction
      const mainFields = [nombreMatch?.[1], cedulaMatch?.[1], concepto].filter(Boolean).length;
      const fallbackConfianza = mainFields >= 3 ? "alta" : mainFields >= 2 ? "media" : "baja";

      extracted = {
        es_examen_medico: mainFields > 0 || allText.length > 50,
        mensaje: mainFields === 0 ? "No se pudo identificar información de examen médico en el documento" : null,
        confianza_extraccion: fallbackConfianza,
        trabajador: { nombre: nombreMatch?.[1] || null, cedula: cedulaMatch?.[1]?.replace(/\./g, "") || null, cargo: cargoMatch?.[1]?.trim() || null, area: null },
        examen: { tipo_examen: tipoExamen, fecha_examen: fecha, concepto_aptitud: concepto, medico_nombre: medicoMatch?.[1] || null },
        recomendaciones: [],
        hallazgos: { antecedentes_relevantes: null, examen_fisico_resumen: allText.length > 10 ? "Datos extraídos del PDF sin IA" : null, examenes_complementarios: null },
        _fallback: true, _raw_text_length: allText.length
      };
    }

    // Save to database — skip if document is not a medical exam
    let savedExamen = null;
    const isExamen = extracted.es_examen_medico !== false;
    if (isExamen && extracted.examen && extracted.trabajador) {
      const validTipos = ["ingreso", "periodico", "egreso"];
      const tipoExamen = validTipos.includes(extracted.examen.tipo_examen) ? extracted.examen.tipo_examen : "periodico";
      const validConceptos = ["apto", "apto_con_restricciones", "no_apto"];
      const concepto = extracted.examen.concepto_aptitud && validConceptos.includes(extracted.examen.concepto_aptitud)
        ? extracted.examen.concepto_aptitud
        : "apto"; // DB column is NOT NULL, default to apto if truly unknown

      let finalTrabajadorId = trabajadorId;
      if (!finalTrabajadorId && extracted.trabajador.cedula) {
        const cedulaClean = extracted.trabajador.cedula.replace(/[.\s]/g, "");
        const { data: w1 } = await supabaseClient.from("trabajadores").select("id").eq("empresa_id", empresaId).eq("cedula", cedulaClean).single();
        if (w1) finalTrabajadorId = w1.id;
        else {
          const { data: w2 } = await supabaseClient.from("trabajadores").select("id").eq("empresa_id", empresaId).eq("cedula", extracted.trabajador.cedula).single();
          if (w2) finalTrabajadorId = w2.id;
          else {
            const { data: nw } = await supabaseClient.from("trabajadores").insert({ empresa_id: empresaId, nombre: extracted.trabajador.nombre || "Sin nombre", cedula: cedulaClean || `temp_${Date.now()}`, cargo: extracted.trabajador.cargo || "Sin cargo", area: extracted.trabajador.area || "General", activo: true }).select().single();
            if (nw) finalTrabajadorId = nw.id;
          }
        }
      }
      if (!finalTrabajadorId) {
        const { data: nw } = await supabaseClient.from("trabajadores").insert({ empresa_id: empresaId, nombre: extracted.trabajador.nombre || pdfFile.name.replace(/\.pdf$/, ""), cedula: `temp_${Date.now()}`, cargo: extracted.trabajador.cargo || "Sin cargo", area: extracted.trabajador.area || "General", activo: true }).select().single();
        if (nw) finalTrabajadorId = nw.id;
      }
      if (finalTrabajadorId) {
        const filePath = `examenes/${empresaId}/${finalTrabajadorId}_${Date.now()}.pdf`;
        let archivoUrl: string | undefined;
        try {
          await supabaseClient.storage.from("documentos").upload(filePath, pdfBytes, { contentType: "application/pdf", upsert: true });
          const { data: urlData } = supabaseClient.storage.from("documentos").getPublicUrl(filePath);
          archivoUrl = urlData.publicUrl;
        } catch (uploadErr) { console.error("Storage upload error:", uploadErr); }

        const { data: examen, error: exErr } = await supabaseClient.from("examenes_medicos").insert({
          trabajador_id: finalTrabajadorId, empresa_id: empresaId, tipo_examen: tipoExamen,
          fecha_examen: extracted.examen.fecha_examen || new Date().toISOString().split("T")[0],
          concepto_aptitud: concepto, medico_nombre: extracted.examen.medico_nombre,
          archivo_url: archivoUrl, procesado_por_ia: usedAI,
          confianza_extraccion: extracted.confianza_extraccion === "alta" ? 0.95 : extracted.confianza_extraccion === "media" ? 0.6 : 0.3,
          texto_extraido_raw: JSON.stringify(extracted),
        }).select().single();
        if (exErr) { console.error("Examen insert error:", exErr); throw new Error("DB insert error: " + exErr.message); }
        if (examen && extracted.recomendaciones?.length) {
          const recs = extracted.recomendaciones.map((r: any) => ({ examen_id: examen.id, tipo: ["recomendacion", "restriccion"].includes(r.tipo) ? r.tipo : "recomendacion", descripcion: r.descripcion, prioridad: "media", estado: "pendiente" }));
          await supabaseClient.from("recomendaciones_medicas").insert(recs);
        }
        savedExamen = examen;
      }
    }

    const notMedical = extracted.es_examen_medico === false;
    let message: string;
    if (notMedical) {
      message = extracted.mensaje || "El documento no parece ser un examen médico ocupacional";
    } else if (usedAI) {
      message = "PDF procesado exitosamente con IA";
    } else {
      message = "PDF procesado con extracción básica (IA no disponible)";
    }

    return new Response(JSON.stringify({
      extracted, examen: savedExamen,
      es_examen_medico: extracted.es_examen_medico ?? true,
      confianza_extraccion: extracted.confianza_extraccion || "baja",
      message,
      ai_used: usedAI, ai_errors: aiErrors.length > 0 ? aiErrors : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
