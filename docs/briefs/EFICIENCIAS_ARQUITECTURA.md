# Catálogo de eficiencias arquitectónicas

Patrones para minimizar costo, complejidad y mantenimiento. Cuando
Claude Code detecte una brecha en los pilares P3, P4 o P10, debe
cruzar contra este catálogo y anotar la referencia (Ej: "Ver A1").

NO usar como excusa para refactor masivo. Solo aplicar donde sume.

═══════════════════════════════════════════════════════════════════
A. FALLBACKS ESCALONADOS — barato local → escalar a API solo si falla
═══════════════════════════════════════════════════════════════════

A1. PDF de texto antes que OCR
    pdf-parse (gratis) primero. OCR solo si no hay capa de texto.
    El Q&A dice que 98% de exámenes son PDF digital, así que el
    OCR procesa el 2%, no el 100%.

A2. Extracción estructurada antes que LLM
    Regex + parsing por zonas + schemas Zod para datos conocidos
    (PILA, exámenes con estructura estándar). LLM solo si falla.

A3. LLM en cascada
    Modelo barato primero (claude-haiku, gpt-4o-mini). Si el output
    no pasa validación con schema Zod, reintentar con el modelo
    grande. Loguear costo estimado por llamada.

A4. Duplicados en 3 niveles
    1) SHA-256 del archivo (exactos)
    2) Hash del texto normalizado (re-encodings)
    3) Embeddings + cosine (semánticos, solo si los anteriores pasan)

A5. Transcripción de audio
    whisper.cpp o faster-whisper local para audios < 5 min.
    Whisper API solo para audios largos o ruido extremo.

A6. Email y WhatsApp en tier free primero
    Resend free (3000/mes), WhatsApp Cloud API directo (1000/mes
    gratis). Pasar a Wati/SendGrid solo si se superan límites.

═══════════════════════════════════════════════════════════════════
B. USAR LO QUE SUPABASE YA INCLUYE — no agregar servicios externos
═══════════════════════════════════════════════════════════════════

B1. pg_cron para todos los jobs programados
    Recordatorios PILA, bitácora mensual, resumen semanal, etc.
    Sin Inngest, sin Trigger.dev, sin n8n.

B2. Supabase Realtime para el dashboard
    Suscribirse a cambios de tablas en vez de polling o websockets.

B3. Postgres full-text search
    Para buscar documentos, trabajadores, empresas. Sin Algolia
    hasta 100k+ documentos.

B4. Supabase Storage transformations
    Previews y thumbnails. Sin Cloudinary.

B5. Supabase Auth + magic links
    Cubre el onboarding del pilar P9. Sin Auth0.

B6. supabase gen types typescript
    Tipos del schema generados, no mantenidos a mano.

═══════════════════════════════════════════════════════════════════
C. LÓGICA EN LA BASE DE DATOS — menos código, más SQL
═══════════════════════════════════════════════════════════════════

C1. Motor de cumplimiento como Postgres function
    Cálculo del 7 vs 21 estándares vive en una function. Respeta
    RLS, no necesita fetch, se dispara con triggers.

C2. Triggers para estado derivado
    Cuando un documento pasa a "validado", trigger actualiza el
    porcentaje. No depende de que la app se acuerde.

C3. Materialized views para agregaciones del dashboard
    Histórico mensual se materializa una vez al día con cron, no
    se recalcula en cada visita.

C4. JSONB para configuración flexible
    Standards (7 vs 21) como JSONB, no dos tablas separadas.

C5. Outbox pattern para procesamiento confiable
    Escribir el "evento a procesar" en tabla outbox dentro de la
    misma transacción. Edge Function lo procesa cada minuto.
    Idempotente por diseño. Resuelve P10 sin código complicado.

C6. ON CONFLICT para idempotencia natural
    INSERT ... ON CONFLICT DO NOTHING / DO UPDATE en vez de
    chequear-y-luego-insertar. Atómico, sin races.

═══════════════════════════════════════════════════════════════════
D. ABSTRACCIONES UNIFICADORAS — menos código, misma cobertura
═══════════════════════════════════════════════════════════════════

D1. Una tabla "documents" con type discriminador
    En vez de pila_docs, medical_exams, risk_matrices separadas:
    una tabla, columna type, JSONB de metadata específica. El
    dashboard se vuelve una sola query.

D2. Una abstracción Notification
    Email, WhatsApp e in-app son el mismo concepto con canal
    distinto. Una tabla notifications, un Edge Function que
    despacha. Agregar SMS o push es un caso, no un sistema.

D3. Interfaz ComplianceContributor
    Todo lo que suma puntos al dashboard implementa la misma
    interfaz. El motor no sabe el tipo, sabe "esto suma X puntos
    al estándar Y".

D4. Plantillas como data, no como código
    Plantillas de actas, correos, WhatsApp, headers de documentos
    en tabla. Admin edita, código solo renderiza. Cumple P7.

═══════════════════════════════════════════════════════════════════
E. FRONTEND — ya hay buen stack, solo dos cosas
═══════════════════════════════════════════════════════════════════

E1. React Query única fuente de verdad para datos del servidor
    Ya está en package.json. Sin Zustand, sin Redux. useState
    para estado local de UI.

E2. Lazy loading de módulos pesados
    Reproductor de audio (M5), viewer PDF (M2), editor matrices
    (M3) cargan solo cuando se visitan. React.lazy + Vite.

═══════════════════════════════════════════════════════════════════
F. ANTI-PATRONES — NO hacer en lo que queda del concurso
═══════════════════════════════════════════════════════════════════

- No Redis. Postgres + cache de React Query alcanza.
- No microservicios. Un Edge Function por dominio.
- No GraphQL. Supabase ya da queries tipadas selectivas.
- No Docker en desarrollo. supabase start local si hace falta.
- No reinventar lo que Postgres ya hace nativo.
