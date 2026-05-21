import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIREFLIES_ENDPOINT = "https://api.fireflies.ai/graphql";

/**
 * fetch-fireflies-transcripts: Fetch meeting transcripts from Fireflies.ai
 *
 * Actions:
 *   - "list": Returns recent transcripts (title, date, duration, participants)
 *   - "get":  Returns full transcript with speaker diarization (sentences with speaker_name)
 *
 * Requires secret: FIREFLIES_API_KEY
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FIREFLIES_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "FIREFLIES_API_KEY no configurada",
          message: "Configura tu API key de Fireflies en los secrets de Supabase para importar reuniones automáticamente.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "list") {
      const query = `
        query {
          transcripts(limit: 15) {
            id
            title
            date
            duration
            participants
            organizer_email
          }
        }
      `;

      const res = await fetch(FIREFLIES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fireflies API error (${res.status}): ${text}`);
      }

      const data = await res.json();

      if (data.errors) {
        throw new Error(`Fireflies GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      const transcripts = (data.data?.transcripts ?? []).map((t: any) => ({
        id: t.id,
        title: t.title,
        date: t.date ? new Date(Number(t.date)).toISOString() : null,
        duration: t.duration,
        participants: t.participants ?? [],
        organizer_email: t.organizer_email,
      }));

      return new Response(JSON.stringify({ transcripts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      const transcriptId = body.transcript_id as string;
      if (!transcriptId) {
        return new Response(
          JSON.stringify({ error: "transcript_id requerido para action='get'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const query = `
        query($id: String!) {
          transcript(id: $id) {
            id
            title
            date
            duration
            participants
            sentences {
              speaker_name
              text
              start_time
              end_time
            }
            summary {
              overview
              action_items
              keywords
            }
          }
        }
      `;

      const res = await fetch(FIREFLIES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query, variables: { id: transcriptId } }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Fireflies API error (${res.status}): ${text}`);
      }

      const data = await res.json();

      if (data.errors) {
        throw new Error(`Fireflies GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      const t = data.data?.transcript;
      if (!t) {
        return new Response(
          JSON.stringify({ error: "Transcripción no encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build speaker-attributed transcript text
      const transcripcionTexto = (t.sentences ?? [])
        .map((s: any) => `${s.speaker_name || "Desconocido"}: ${s.text}`)
        .join("\n");

      return new Response(
        JSON.stringify({
          transcript: {
            id: t.id,
            title: t.title,
            date: t.date ? new Date(Number(t.date)).toISOString() : null,
            duration: t.duration,
            participants: t.participants ?? [],
            sentences: t.sentences ?? [],
            summary: t.summary ?? {},
            transcripcion_texto: transcripcionTexto,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "action debe ser 'list' o 'get'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
