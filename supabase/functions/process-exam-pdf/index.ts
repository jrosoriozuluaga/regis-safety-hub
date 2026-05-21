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
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    
    const extractionPrompt = `Eres un especialista en medicina ocupacional en Colombia. Analiza este documento PDF de un examen médico ocupacional y extrae la información estructurada.

EXTRAE los siguientes campos en formato JSON:

{
  "trabajador": {
    "nombre": "nombre completo del trabajador",
    "cedula": "número de documento de identidad (solo dígitos)",
    "cargo": "cargo o puesto de trabajo",
    "area": "área o departamento"
  },
  "examen": {
    "tipo_examen": "ingreso|periodico|egreso",
    "fecha_examen": "YYYY-MM-DD",
    "concepto_aptitud": "apto|apto_con_restricciones|no_apto",
    "medico_nombre": "nombre del médico que realiza el examen"
  },
  "recomendaciones": [
    {
      "tipo": "recomendacion|restriccion",
      "descripcion": "texto de la recomendación o restricción"
    }
  ],
  "hallazgos": {
    "antecedentes_relevantes": "resumen de antecedentes",
    "examen_fisico_resumen": "hallazgos principales del examen físico",
    "examenes_complementarios": "resultados de exámenes paraclínicos"
  }
}

INSTRUCCIONES:
- Extrae SOLO la información que aparece en el documento.
- Si un campo no está disponible, usa null.
- Para tipo_examen: "ingreso/pre-empleo" -> "ingreso", "periódico/ocupacional" -> "periodico", "egreso/retiro" -> "egreso".
- Para concepto_aptitud: "apto sin restricciones" -> "apto", "apto con restricciones" -> "apto_con_restricciones", "no apto" -> "no_apto".
- Responde ÚNICAMENTE con el JSON válido, sin texto adicional.`;

    let extracted: any = null;
    let usedAI = false;
    const aiErrors: string[] = [];

    if (anthropicKey) {
      const MODEL_CASCADE = [
        { model: "claude-sonnet-4-6", beta: null },
        { model: "claude-haiku-4-5-20251001", beta: null },
      ];
      
      for (const { model, beta } of MODEL_CASCADE) {
        console.log(`Trying model: ${model}`);
        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          };
          if (beta) headers["anthropic-beta"] = beta;

          const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers,
            body: JSON.stringify({
              model,
              max_tokens: 4096,
              messages: [{
                role: "user",
                content: [
                  { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfBase64 } },
                  { type: "text", text: extractionPrompt },
                ],
              }],
            }),
          });

          if (claudeRes.ok) {
            const claudeData = await claudeRes.json();
            let jsonText = claudeData.content[0].text.trim();
            if (jsonText.startsWith("```")) {
              jsonText = jsonText.replace(/^```(?:json)?\\n?/, "").replace(/\\n?```$/, "");
            }
            extracted = JSON.parse(jsonText);
            usedAI = true;
            console.log(`Success with model: ${model}`);
            break;
          }

          const errBody = await claudeRes.text();
          aiErrors.push(`${model} (${claudeRes.status}): ${errBody.substring(0, 200)}`);
          console.error(`Model ${model} failed (${claudeRes.status})`);
          if (claudeRes.status === 401) break; // Auth error, stop trying
          continue; // Try next model on 404, 400, 529, etc.
        } catch (e) {
          aiErrors.push(`${model}: ${e.message}`);
          console.error(`Model ${model} exception:`, e.message);
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
      let concepto = "apto";
      if (conceptoMatch) { const c = conceptoMatch[1].toLowerCase(); if (c.includes("no apto")) concepto = "no_apto"; else if (c.includes("restriccion")) concepto = "apto_con_restricciones"; }
      let fecha = new Date().toISOString().split("T")[0];
      if (fechaMatch) { const f = fechaMatch[1]; if (f.includes("/")) { const p = f.split("/"); fecha = `${p[2]}-${p[1]}-${p[0]}`; } else fecha = f; }

      extracted = {
        trabajador: { nombre: nombreMatch?.[1] || pdfFile.name.replace(/^examen_/, "").replace(/_/g, " ").replace(/\.[^.]+$/, "").replace(/\s+\w+$/, ""), cedula: cedulaMatch?.[1]?.replace(/\./g, "") || null, cargo: cargoMatch?.[1]?.trim() || null, area: null },
        examen: { tipo_examen: tipoExamen, fecha_examen: fecha, concepto_aptitud: concepto, medico_nombre: medicoMatch?.[1] || null },
        recomendaciones: [],
        hallazgos: { antecedentes_relevantes: null, examen_fisico_resumen: allText.length > 10 ? "Datos extraídos del PDF sin IA" : null, examenes_complementarios: null },
        _fallback: true, _raw_text_length: allText.length
      };
    }

    // Save to database
    let savedExamen = null;
    if (extracted.examen && extracted.trabajador) {
      const validTipos = ["ingreso", "periodico", "egreso"];
      const tipoExamen = validTipos.includes(extracted.examen.tipo_examen) ? extracted.examen.tipo_examen : "periodico";
      const validConceptos = ["apto", "apto_con_restricciones", "no_apto"];
      const concepto = validConceptos.includes(extracted.examen.concepto_aptitud) ? extracted.examen.concepto_aptitud : "apto";

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
          archivo_url: archivoUrl, procesado_por_ia: usedAI, texto_extraido_raw: JSON.stringify(extracted),
        }).select().single();
        if (exErr) { console.error("Examen insert error:", exErr); throw new Error("DB insert error: " + exErr.message); }
        if (examen && extracted.recomendaciones?.length) {
          const recs = extracted.recomendaciones.map((r: any) => ({ examen_id: examen.id, tipo: ["recomendacion", "restriccion"].includes(r.tipo) ? r.tipo : "recomendacion", descripcion: r.descripcion, prioridad: "media", estado: "pendiente" }));
          await supabaseClient.from("recomendaciones_medicas").insert(recs);
        }
        savedExamen = examen;
      }
    }

    return new Response(JSON.stringify({
      extracted, examen: savedExamen,
      message: usedAI ? "PDF procesado exitosamente con IA" : "PDF procesado con extracción básica (IA no disponible)",
      ai_used: usedAI, ai_errors: aiErrors.length > 0 ? aiErrors : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
