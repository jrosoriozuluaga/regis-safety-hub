<p align="center">
  <h1 align="center">Regis SG-SST</h1>
  <p align="center">
    <strong>AI-Powered Occupational Health & Safety Management Platform</strong>
  </p>
  <p align="center">
    Automating SG-SST compliance for Colombian SMEs under Resolution 0312/2019
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/AI--Powered-Claude%20%2B%20Whisper-D97706?style=flat-square" alt="AI-Powered" />
    <img src="https://img.shields.io/badge/n8n-Workflow%20Automation-EA4B71?style=flat-square&logo=n8n&logoColor=white" alt="n8n" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Edge%20Functions-Deno-000000?style=flat-square&logo=deno&logoColor=white" alt="Edge Functions" />
  </p>
</p>

---

## Overview

**Regis SG-SST** replaces the entirely manual document-tracking and compliance workflow used by [Regis Colombia](https://regiscolombia.com), a consulting firm with 17 years of experience managing occupational health and safety (SG-SST) for 90+ small and medium enterprises.

The platform automates document collection, AI-powered document processing, compliance scoring, committee management, and risk assessment -- ensuring every client company maintains compliance above 90% with Colombian **Resolution 0312 of 2019**.

### The Problem

Colombian companies with 1-50 workers must comply with 7 to 21 regulatory standards depending on their size and risk level. Consultants at Regis previously tracked all of this through spreadsheets, manual emails, and physical document reviews -- a process that does not scale.

### The Solution

A unified platform where documents are requested automatically, processed by AI, scored in real-time, and archived with full audit trails -- reducing consultant workload from hours to minutes per company.

---

## Key Features

| | Feature | Description |
|---|---|---|
| :page_facing_up: | **PILA Automation** | Automated monthly payroll document requests, multi-channel reminders (email + WhatsApp), token-based public upload portal, overdue tracking, and auto-archival |
| :microscope: | **AI Medical Exam Processing** | Upload medical exam PDFs and extract diagnoses, recommendations, and restrictions using Claude AI -- structured into actionable records |
| :bar_chart: | **GTC 45 Risk Matrices** | AI-generated occupational risk matrices following the GTC 45 methodology, pre-populated from CIIU economic activity codes, inline editable, with ARL approval upload |
| :busts_in_silhouette: | **Committee Minutes (Actas)** | Auto-generated COPASST and Convivencia committee meeting minutes with pre-loaded members, agenda items, signature tracking, and **Fireflies.ai + Whisper transcription** for auto-generating minutes from virtual or in-person meetings |
| :rotating_light: | **Emergency Plan Analysis** | Record or upload audio inspections, transcribed via Whisper and analyzed by Claude to produce structured vulnerability assessments |
| :white_check_mark: | **Compliance Dashboard** | Real-time PHVA (Plan-Do-Check-Act) scoring against Resolution 0312 standards, with per-company and per-standard drill-down |
| :wrench: | **Equipment Inventory** | Track safety equipment with expiration dates, automated renewal reminders, and maintenance logs |
| :file_folder: | **Document Management** | Centralized document repository with validation workflow (pending -> uploaded -> validated -> approved) |
| :calendar: | **Monthly Bitacora** | Auto-generated monthly activity reports summarizing all actions taken per company |
| :envelope: | **Email Templates** | Editable email and document templates stored in the database -- no code changes needed when formats change |
| :clipboard: | **Full Activity Logging** | Every user action is recorded with timestamps, user, module, and company for complete audit trails |
| :chart_with_upwards_trend: | **Observability Dashboard** | Operational metrics: activity trends, PILA status heatmap, AI API costs, compliance distribution |
| :eyes: | **Admin/Client Preview** | Toggle between admin and client views with company selector to preview exactly what each client sees |
| :link: | **Digital Attendance** | Token-based public attendance confirmation links for committee meetings -- no login required |
| :arrow_up: | **PILA Escalation** | Automatic escalation to HR leadership after max reminders exceeded |
| :zap: | **AI Cost Optimization** | Haiku-first model cascade with Sonnet fallback -- reduces AI costs by ~70% |
| :1234: | **Table Pagination** | Client-side pagination across all data tables with reusable components |
| :hourglass_flowing_sand: | **Skeleton Loading** | Animated skeleton states for dashboard and data-heavy pages |

---

## Architecture

```
+-------------------+     +------------------------+     +---------------------+
|                   |     |                        |     |                     |
|   React Frontend  +---->+   Supabase Backend     +---->+   AI Services       |
|   (Vite + TS)     |     |                        |     |                     |
|                   |     |  - PostgreSQL (RLS)     |     |  - Claude API       |
|   - shadcn/ui     |     |  - Auth (RBAC)         |     |    (PDF extraction, |
|   - Tailwind CSS  |     |  - Storage (documents) |     |     risk matrices,  |
|   - Radix UI      |     |  - Edge Functions (7)  |     |     meeting minutes,|
|                   |     |                        |     |     vulnerability   |
+-------------------+     +----------+-------------+     |     analysis)       |
                                     |                   |                     |
                                     |                   |  - Whisper API      |
                          +----------v-------------+     |    (audio           |
                          |                        |     |     transcription)  |
                          |   n8n Workflows        |     |                     |
                          |   (self-hosted)         |     +---------------------+
                          |                        |
                          |  - PILA automation     |     +---------------------+
                          |  - Email scheduling    |     |                     |
                          |  - Reminder chains     +---->+   Communication     |
                          |  - Document archival   |     |                     |
                          |                        |     |  - Resend (email)   |
                          +------------------------+     |  - Twilio (WhatsApp)|
                                                         |  - Microsoft 365   |
                                                         +---------------------+
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript, Vite | Single-page application with type safety |
| **UI Framework** | Tailwind CSS, shadcn/ui, Radix UI | Accessible, consistent component library |
| **Backend** | Supabase (PostgreSQL) | Database, authentication, file storage |
| **Serverless** | Supabase Edge Functions (Deno) | AI processing, email/WhatsApp sending, report generation |
| **AI - Text** | Anthropic Claude API | PDF extraction, risk matrix generation, meeting minutes, vulnerability analysis |
| **AI - Audio** | OpenAI Whisper API | Audio transcription for emergency plan inspections and in-person meeting minutes |
| **AI - Meetings** | Fireflies.ai API | Virtual meeting transcription with speaker diarization for committee minutes |
| **Automation** | n8n (self-hosted) | PILA workflow orchestration, scheduled tasks, reminder chains |
| **Email** | Resend API | Transactional email delivery |
| **Messaging** | Twilio | WhatsApp notifications and reminders |
| **Routing** | React Router v6 | Client-side routing with role-based guards |
| **State** | React Context + TanStack Query | Authentication state and server data caching |
| **Charts** | Custom SVG | Compliance circular progress and analytics |
| **Exports** | Custom HTML-to-print | Branded document exports with company headers and footers |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase CLI (for Edge Functions deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/regis-sgsst.git
cd regis-sgsst/regis-safety-hub

# Install dependencies
npm install

# Start the development server (port 8080)
npm run dev
```

The application will be available at `http://localhost:8080`.

### Production Build

```bash
npm run build    # outputs to dist/
```

### Deploy Edge Functions

```bash
supabase functions deploy <function-name> --no-verify-jwt
```

---

## Project Structure

```
regis-sgsst/
├── regis-safety-hub/                # Frontend application
│   ├── src/
│   │   ├── pages/                   # Route pages (1 file per module)
│   │   │   ├── Dashboard.tsx        # Main overview with KPIs
│   │   │   ├── Pila.tsx             # PILA payroll management
│   │   │   ├── MedicalExams.tsx     # AI-powered medical exam processing
│   │   │   ├── RiskMatrices.tsx     # GTC 45 risk matrix generation
│   │   │   ├── Committees.tsx       # COPASST/Convivencia management
│   │   │   ├── EmergencyPlans.tsx   # Audio-based emergency plan analysis
│   │   │   ├── Compliance.tsx       # Resolution 0312 compliance scoring
│   │   │   ├── EquipmentInventory.tsx # Safety equipment tracking
│   │   │   ├── Documents.tsx        # General document management
│   │   │   ├── ActivityLog.tsx      # Audit trail viewer
│   │   │   └── ...                  # Additional pages
│   │   ├── components/
│   │   │   ├── layout/              # Sidebar, header, page structure
│   │   │   ├── dashboard/           # Dashboard-specific widgets
│   │   │   ├── ui/                  # shadcn/ui component library
│   │   │   └── common/              # Shared components
│   │   ├── services/index.ts        # All Supabase service functions
│   │   ├── types/domain.ts          # TypeScript domain type definitions
│   │   ├── lib/                     # Supabase client, utilities, export helpers
│   │   └── context/                 # AuthContext (roles, tenant isolation)
│   └── package.json
├── supabase/
│   └── functions/                   # 7 deployed Edge Functions (Deno)
├── n8n/workflows/                   # 4 PILA automation workflows (JSON)
├── templates/correos/               # Email template files
├── datos-prueba/                    # Test data (PDFs, sample records)
└── docs/                            # Project documentation
```

---

## AI Integrations

### Claude API (Anthropic)

Claude powers four core capabilities across the platform:

- **Medical Exam Processing** (`process-exam-pdf`): Receives scanned or digital medical exam PDFs. Claude extracts patient data, diagnoses, medical restrictions, and recommendations into structured records that consultants can review and approve.

- **Risk Matrix Generation** (`RiskMatrices.tsx`): Given a company's CIIU economic activity code, Claude generates a complete GTC 45 risk matrix with hazard identification, risk assessment, and control measures tailored to the specific industry.

- **Meeting Minutes Generation** (`generate-acta`): From agenda items, attendee lists, and discussion notes -- or from **Fireflies.ai / Whisper transcriptions** with speaker diarization -- Claude produces formal committee meeting minutes (actas) formatted to Colombian regulatory standards for COPASST and Convivencia committees.

- **Emergency Vulnerability Analysis** (`transcribe-audio`): After Whisper transcribes an audio inspection recording, Claude analyzes the transcript to produce a structured vulnerability assessment covering natural, technological, and social threats.

### Whisper API (OpenAI)

- **Audio Transcription** (`transcribe-audio`): Consultants record audio during workplace inspections. The recording is sent to Whisper for transcription, then passed to Claude for vulnerability analysis -- turning a 3-minute voice memo into a professional emergency plan document.

---

## Security

- **Row-Level Security (RLS):** Enabled on every table in the database. Policies enforce that clients can only access their own company's data, consultants see companies assigned to them, and admins have full access.

- **Role-Based Access Control:** Three roles -- `admin`, `consultor`, `cliente` -- with frontend route guards and backend RLS policies enforcing access at every layer.

- **Tenant Isolation:** All queries are filtered by `empresa_id`. Clients are locked to their own company. The company selector is only available to admin and consultant roles.

- **Token-Based Public Upload:** The PILA upload portal uses base64-encoded tokens to allow unauthenticated document submission without exposing internal APIs.

- **Edge Function Security:** Functions that handle AI processing require JWT authentication. Public-facing functions (email, WhatsApp) use `--no-verify-jwt` but validate inputs server-side.

- **Service Role Isolation:** The Supabase service role key is only used within Edge Functions (server-side). The frontend client uses the anon key with RLS enforced.

---

## Modules Overview

| Module | Key Capabilities | AI-Powered |
|--------|-----------------|:----------:|
| **PILA Management** | Auto-request, multi-channel reminders, public upload portal, overdue tracking, period sync, HR escalation | -- |
| **Medical Exams** | PDF upload, AI extraction with non-medical detection and confidence scoring, structured records | Yes |
| **Risk Matrices** | CIIU-based generation, GTC 45 methodology, inline editing, ARL approval upload | Yes |
| **Committees** | COPASST/Convivencia periods, member management, minutes from agenda or Fireflies/Whisper transcription, digital attendance | Yes |
| **Emergency Plans** | Audio recording, transcription, vulnerability analysis, structured reports | Yes |
| **Compliance** | Real-time 0312 scoring, PHVA breakdown, per-standard tracking, chapter auto-selection | -- |
| **Equipment Inventory** | Expiration tracking, renewal reminders, maintenance logs | -- |
| **Documents** | Upload, validation workflow (4-stage), centralized repository | -- |
| **Activity Log** | Full audit trail, filterable by module/company/user/date | -- |
| **Email Templates** | CRUD for email templates, Markdown support, variable substitution | -- |
| **Company Reports** | Exportable compliance reports with branded headers and footers | -- |
| **Workers** | Employee registry per company, linked to medical exams and committees | -- |

---

## Edge Functions

Eight Supabase Edge Functions deployed on Deno runtime:

| Function | Auth | Description |
|----------|:----:|-------------|
| `send-pila-reminder` | Public | Sends PILA reminder emails via Resend API with customizable templates |
| `send-whatsapp-reminder` | Public | Sends WhatsApp reminders via Twilio for companies that prefer messaging |
| `generate-bitacora` | Public | Generates monthly activity reports (bitacora) summarizing all actions per company |
| `weekly-summary` | Public | Produces weekly consultant summaries with pending items across all assigned companies |
| `transcribe-audio` | JWT | Transcribes audio recordings via Whisper, then runs Claude vulnerability analysis |
| `process-exam-pdf` | JWT | Extracts medical exam data from PDFs using Claude with non-medical document detection and confidence scoring |
| `generate-acta` | JWT | Generates formal committee meeting minutes from agenda data or meeting transcriptions (Fireflies/Whisper) |
| `fetch-fireflies-transcripts` | Public | Imports meeting transcriptions from Fireflies.ai with speaker diarization |

---

## Workflow Automation (n8n)

Four self-hosted n8n workflows manage the PILA document lifecycle end-to-end:

1. **Monthly Request** -- Cron trigger on the 16th of each month. Queries all active companies, generates PILA requests, and sends personalized emails with upload links.

2. **Reminder Webhook** -- HTTP-triggered single reminder. Called by the frontend or by the follow-up workflow to send individual email/WhatsApp reminders.

3. **Automated Follow-Up** -- Daily cron. Checks for pending PILA submissions, sends escalating reminders based on configurable intervals, and marks records as overdue when deadlines pass.

4. **Document Reception** -- Email trigger. Receives PILA documents sent by email, matches them to the correct company, uploads to cloud storage, and updates the database record.

---

## Resolution 0312/2019 Compliance Engine

The platform implements the compliance scoring system defined by Colombian Resolution 0312 of 2019:

- **Chapter 1** (7 standards): Companies with 10 or fewer workers, risk levels I-III
- **Chapter 2** (21 standards): Companies with 11-50 workers, risk levels I-III
- The applicable chapter is auto-calculated from each company's worker count and ARL risk level
- Compliance scores are computed in real-time using the PHVA (Plan-Do-Check-Act) cycle
- Points are awarded only when documents reach the "approved" stage in the validation workflow

---

## License

This project was built for the Regis Colombia Automation Competition.

All rights reserved. This software is proprietary to Regis Colombia and its authorized developers.

---

## Credits

Built with modern open-source technologies: [React](https://react.dev), [Supabase](https://supabase.com), [Vite](https://vitejs.dev), [shadcn/ui](https://ui.shadcn.com), [n8n](https://n8n.io), [Tailwind CSS](https://tailwindcss.com), and [Radix UI](https://radix-ui.com).

AI capabilities powered by [Anthropic Claude](https://anthropic.com) and [OpenAI Whisper](https://openai.com).
