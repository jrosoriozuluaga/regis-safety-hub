# Regis SG-SST Platform Architecture

## System Overview

Regis SG-SST is an occupational health and safety management platform built for Regis Colombia. It automates SG-SST compliance tracking for small and medium companies (1-50 workers, risk levels I-III) under Colombian Resolution 0312/2019.

---

## System Components

| Component | Technology | Deployment |
|---|---|---|
| Frontend | React 18 + TypeScript + Vite | Vercel (regis-safety-hub.vercel.app) |
| Database | PostgreSQL (Supabase) | Supabase Cloud (us-east-1) |
| Auth | Supabase Auth | Supabase Cloud |
| File Storage | Supabase Storage (bucket: `documentos`) | Supabase Cloud |
| Edge Functions | Deno runtime (7 functions) | Supabase Cloud |
| Workflow Automation | n8n (4 PILA workflows) | Self-hosted at n8n.john-osorio.lat |
| AI - Document Analysis | Anthropic Claude | API |
| AI - Audio Transcription | OpenAI Whisper | API |
| Email | Resend | API (via Edge Functions) |
| WhatsApp | Twilio | API (via Edge Functions) |

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph "User Layer"
        Browser["User Browser"]
        Mobile["Mobile (WhatsApp)"]
    end

    subgraph "Frontend - Vercel"
        SPA["React SPA<br/>(Vite + TypeScript)"]
    end

    subgraph "Supabase Platform"
        Auth["Supabase Auth<br/>(JWT)"]
        DB["PostgreSQL DB<br/>(26 tables, RLS enabled)"]
        Storage["Supabase Storage<br/>(bucket: documentos)"]

        subgraph "Edge Functions (Deno)"
            EF1["send-pila-reminder"]
            EF2["send-whatsapp-reminder"]
            EF3["generate-bitacora"]
            EF4["weekly-summary"]
            EF5["transcribe-audio"]
            EF6["process-exam-pdf"]
            EF7["generate-acta"]
        end
    end

    subgraph "Workflow Automation"
        N8N["n8n<br/>(n8n.john-osorio.lat)"]
    end

    subgraph "External APIs"
        Claude["Anthropic Claude<br/>(Document AI)"]
        Whisper["OpenAI Whisper<br/>(Audio)"]
        Resend["Resend<br/>(Email)"]
        Twilio["Twilio<br/>(WhatsApp)"]
    end

    Browser --> SPA
    SPA --> Auth
    SPA --> DB
    SPA --> Storage
    SPA --> EF5
    SPA --> EF6
    SPA --> EF7

    EF1 --> Resend
    EF2 --> Twilio
    EF5 --> Whisper
    EF5 --> Claude
    EF6 --> Claude
    EF7 --> Claude

    N8N --> DB
    N8N --> EF1
    N8N --> EF2
    N8N -->|"Email triggers<br/>& sends"| Resend

    Twilio --> Mobile
    Resend --> Browser
```

---

## 2. PILA Flow (End-to-End)

The PILA module handles monthly social security payment tracking. It automates the request, collection, reminder, and validation cycle for each company.

```mermaid
sequenceDiagram
    participant Cron as n8n Cron (16th)
    participant N8N as n8n Workflows
    participant Email as Email (Resend)
    participant Contact as Company Contact
    participant Upload as /upload-pila (Public)
    participant Storage as Supabase Storage
    participant DB as Supabase DB
    participant Consultant as Consultant
    participant WA as Twilio (WhatsApp)
    participant DailyCron as n8n Daily Cron

    Note over Cron,DB: Monthly Request Phase
    Cron->>N8N: Trigger pila-solicitud-mensual
    N8N->>DB: Query companies with active PILA tracking
    N8N->>Email: Send request email with upload link per company
    Email->>Contact: Email with tokenized upload URL

    Note over Contact,DB: Upload Phase
    Contact->>Upload: Click link, lands on /upload-pila?t=<base64>
    Upload->>Upload: Decode token (empresa_id + periodo)
    Contact->>Upload: Select and upload PILA PDF
    Upload->>Storage: Store PDF at documentos/pila/{empresa_id}/
    Upload->>DB: Update pila_record status to 'cargada'
    Upload->>WA: Notify consultant via WhatsApp

    Note over Consultant,DB: Validation Phase
    Consultant->>DB: Review uploaded document
    Consultant->>DB: Update status to 'validada'
    Consultant->>DB: Approve, status to 'aprobada'

    Note over DailyCron,WA: Reminder & Overdue Phase
    DailyCron->>N8N: Trigger pila-seguimiento-automatico
    N8N->>DB: Query pending/overdue records
    alt Record is pending past due date
        N8N->>Email: Send reminder email
        N8N->>WA: Send WhatsApp reminder
        N8N->>DB: Increment reminder count
    end
    alt Max reminders exceeded
        N8N->>DB: Mark record as 'vencida'
    end
```

---

## 3. Medical Exams Flow

The medical exams module uses Claude Vision API to extract structured data from uploaded PDF medical exam reports.

```mermaid
sequenceDiagram
    participant Consultant as Consultant
    participant Frontend as React Frontend
    participant EF as process-exam-pdf<br/>(Edge Function)
    participant Claude as Anthropic Claude<br/>(Vision API)
    participant DB as Supabase DB
    participant Storage as Supabase Storage

    Consultant->>Frontend: Upload medical exam PDF
    Frontend->>Frontend: Convert PDF to base64
    Frontend->>EF: POST /process-exam-pdf<br/>(base64 PDF + empresa_id)
    EF->>Claude: Send PDF as base64 image<br/>with extraction prompt

    Claude-->>EF: Extracted JSON:<br/>nombre, cedula, cargo,<br/>tipo_examen, concepto_aptitud,<br/>restricciones, recomendaciones

    EF->>DB: Query trabajadores by cedula
    alt Worker exists
        EF->>DB: Link to existing trabajador
    else Worker not found
        EF->>DB: Create new trabajador record
    end

    EF->>Storage: Store PDF at<br/>documentos/examenes/{empresa_id}/
    EF->>DB: INSERT examenes_medicos record
    EF->>DB: INSERT recomendaciones_medicas<br/>(one per recommendation)
    EF-->>Frontend: Return extracted data + record IDs

    Frontend->>Consultant: Display extracted info<br/>for review and confirmation
```

---

## 4. Actas / Committee Flow

The committee module manages COPASST and Convivencia committees, including member tracking, quorum validation, AI-generated meeting minutes, and branded PDF export.

```mermaid
sequenceDiagram
    participant Consultant as Consultant
    participant Frontend as React Frontend
    participant DB as Supabase DB
    participant EF as generate-acta<br/>(Edge Function)
    participant Claude as Anthropic Claude
    participant Export as Print/Export

    Note over Consultant,DB: Setup Phase
    Consultant->>Frontend: Create comite<br/>(COPASST / Convivencia)
    Frontend->>DB: INSERT comites record
    Consultant->>Frontend: Add committee members
    Frontend->>DB: INSERT integrantes_comite records

    Note over Consultant,Claude: Meeting Phase
    Consultant->>Frontend: Create new acta with agenda points
    Frontend->>DB: INSERT actas_comite + puntos_acta

    Consultant->>Frontend: Mark attendance (asistio = true/false)
    Frontend->>DB: UPDATE asistencia_comite
    Frontend->>Frontend: Validate quorum<br/>(>50% members present)

    alt Quorum met
        Consultant->>Frontend: Request AI-generated minutes
        Frontend->>EF: POST /generate-acta<br/>(agenda, attendees, comite type)
        EF->>Claude: Generate formatted meeting minutes<br/>based on agenda and context
        Claude-->>EF: Structured minutes text
        EF-->>Frontend: Return generated acta content
        Frontend->>DB: UPDATE actas_comite with generated content
    else Quorum not met
        Frontend->>Consultant: Warning: quorum not reached
    end

    Note over Consultant,Export: Export Phase
    Consultant->>Frontend: Export acta as PDF
    Frontend->>Export: Generate branded document<br/>(Regis header + logo + footer)
    Export->>Consultant: Print-ready PDF

    Note over Consultant,DB: Tracking Phase
    Consultant->>Frontend: Update firma status
    Frontend->>DB: UPDATE actas_comite.firmada = true
    Consultant->>Frontend: Update archivado status
    Frontend->>DB: UPDATE actas_comite.archivada = true
```

---

## 5. Component Responsibility Table

### Frontend Layers

| Layer | Location | Responsibility |
|---|---|---|
| Pages | `src/pages/*.tsx` | Route-level components, one per module. Compose UI from components and call services. |
| Layout | `src/components/layout/` | AppSidebar, PageHeader, ProtectedRoute, navigation shell. |
| Dashboard | `src/components/dashboard/` | Dashboard-specific widgets and cards. |
| UI Primitives | `src/components/ui/` | shadcn/ui components (Button, Dialog, Table, etc.). |
| Common | `src/components/common/` | Shared components used across multiple pages. |
| Services | `src/services/index.ts` | All Supabase queries. Single file, organized by domain entity. |
| Types | `src/types/domain.ts` | All TypeScript domain interfaces and types. |
| Auth Context | `src/context/AuthContext.tsx` | Authentication state, role-based access (admin, consultor, cliente). |
| Lib | `src/lib/` | Supabase client init, utilities, export header/footer helpers. |

### Backend (Supabase)

| Component | Responsibility |
|---|---|
| PostgreSQL DB | 26 tables with RLS policies. Stores all domain data. |
| Supabase Auth | JWT-based authentication. Roles: admin, consultor, cliente. |
| Supabase Storage | File storage (PDFs, documents). Bucket: `documentos`. |
| Edge Functions (no-jwt) | Public endpoints: email reminders, WhatsApp, reports. Called by n8n. |
| Edge Functions (jwt) | Protected endpoints: AI-powered document processing. Called by frontend. |

### Workflow Automation (n8n)

| Workflow | Trigger | Responsibility |
|---|---|---|
| pila-solicitud-mensual | Cron (16th of month) | Send initial PILA request emails to all active companies. |
| pila-reminder-webhook | HTTP POST | Send a single reminder email for a specific company/period. |
| pila-seguimiento-automatico | Daily cron | Check overdue records, send reminders, mark as vencida. |
| pila-recepcion-archivo | Email trigger | Receive PILA file via email, match company, upload, update DB. |

---

## 6. Edge Functions Reference

| Function | Auth | External APIs | Input | Output |
|---|---|---|---|---|
| `send-pila-reminder` | no-jwt | Resend | empresa_id, periodo, email | Email sent confirmation |
| `send-whatsapp-reminder` | no-jwt | Twilio | phone, message | WhatsApp message SID |
| `generate-bitacora` | no-jwt | None | empresa_id, month | HTML activity report |
| `weekly-summary` | no-jwt | None | consultant_id | HTML weekly summary |
| `transcribe-audio` | jwt | OpenAI Whisper, Claude | Audio file (base64) | Transcription + vulnerability analysis |
| `process-exam-pdf` | jwt | Claude (Vision) | PDF (base64), empresa_id | Extracted exam data JSON |
| `generate-acta` | jwt | Claude | Agenda, attendees, type | Formatted meeting minutes |

---

## 7. Data Flow Summary

```mermaid
graph LR
    subgraph "Data Sources"
        PDF["PDF Documents"]
        Audio["Audio Recordings"]
        Forms["Web Forms"]
        Email["Incoming Emails"]
    end

    subgraph "Processing"
        ClaudeAI["Claude AI<br/>(extraction, generation)"]
        WhisperAI["Whisper<br/>(transcription)"]
        N8N["n8n<br/>(automation)"]
    end

    subgraph "Storage"
        DB["PostgreSQL<br/>(26 tables)"]
        Files["Supabase Storage<br/>(documentos bucket)"]
    end

    subgraph "Outputs"
        Dashboard["Compliance Dashboard"]
        Reports["Branded PDF Reports"]
        Notifications["Email + WhatsApp<br/>Notifications"]
    end

    PDF --> ClaudeAI
    Audio --> WhisperAI
    Forms --> DB
    Email --> N8N

    ClaudeAI --> DB
    WhisperAI --> ClaudeAI
    N8N --> DB
    N8N --> Files

    DB --> Dashboard
    DB --> Reports
    DB --> Notifications
    Files --> Reports
```

---

## 8. Security Model

- **Authentication:** Supabase Auth with JWT tokens. Three roles: `admin`, `consultor`, `cliente`.
- **Row Level Security (RLS):** Enabled on all tables. Policies enforce role-based data access.
- **Public endpoints:** Edge Functions with `no-verify-jwt` are called by n8n workflows or public upload pages. They validate input but do not require user authentication.
- **Protected endpoints:** Edge Functions requiring JWT verify the token before processing. Used for AI-powered features accessed from the authenticated frontend.
- **Public upload:** The `/upload-pila` page uses a base64-encoded token containing `empresa_id` and `periodo` to allow unauthenticated file uploads for a specific context.
- **Storage:** The `documentos` bucket is currently public. Files are organized by module and empresa_id.

---

## 9. Resolution 0312/2019 Compliance Scope

```mermaid
graph TD
    subgraph "Resolution 0312/2019"
        C1["Chapter 1<br/>7 standards<br/>1-10 workers, Risk I-III"]
        C2["Chapter 2<br/>21 standards<br/>11-50 workers, Risk I-III"]
        C3["Chapter 3<br/>60 standards<br/>50+ workers or Risk IV-V<br/>(OUT OF SCOPE)"]
    end

    subgraph "Auto-Classification"
        Company["empresas_cliente"]
        Company -->|"num_trabajadores +<br/>nivel_riesgo_arl"| Generated["capitulo_0312<br/>(GENERATED column)"]
        Generated --> C1
        Generated --> C2
    end

    subgraph "Compliance Tracking"
        C1 --> Items1["items_cumplimiento<br/>(7 items scored)"]
        C2 --> Items2["items_cumplimiento<br/>(21 items scored)"]
        Items1 --> Score["cumplimiento_empresas<br/>(PHVA scores)"]
        Items2 --> Score
    end
```

---

## 10. Document Validation State Machine

All documents in the platform follow a strict four-stage validation flow required by Regis:

```mermaid
stateDiagram-v2
    [*] --> pendiente: Document requested
    pendiente --> cargado: File uploaded
    cargado --> validado: Analyst reviews & confirms
    validado --> aprobado: Compliance points awarded

    pendiente --> vencido: Past due date (auto)

    note right of pendiente: No file yet
    note right of cargado: File in Storage
    note right of validado: Content verified
    note right of aprobado: Points counted
```
