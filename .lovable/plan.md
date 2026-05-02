
# Regis Colombia — SG-SST Dashboard (Frontend Shell)

A modern, enterprise-grade React dashboard UI for an Occupational Health & Safety consulting firm. **Frontend only**, fully populated with mock data, structured so you can export to GitHub and wire a Supabase (or any) backend later with minimal friction.

## Design System

Tokens added to `index.css` and `tailwind.config.ts` (all HSL):

- `--primary` Navy `#3B4B6E` → sidebar bg, primary buttons, headings emphasis
- `--success` Bright Green `#25D366` → success badges, progress, FAB
- `--background` Slate `#F8FAFC` → main content area
- `--card` White → cards
- `--foreground` `#1E293B` (headings), `--muted-foreground` `#475569` (body)
- Status tokens: success (green), warning (amber), destructive (red)
- Subtle card shadow utility, generous spacing, Inter sans-serif

Uploaded `Logo-Regis.png` copied to `src/assets/` and shown in the sidebar header next to a "REGIS COLOMBIA" wordmark (white on navy).

## Layout

```text
┌─────────────────────────────────────────────────────┐
│ Sidebar (navy)  │  Header: view toggle ·            │
│  • Logo         │          notifications · profile  │
│  • Home         ├───────────────────────────────────┤
│  • PILA         │                                   │
│  • Medical      │   Page content (white cards on    │
│  • Risk Matrix  │   light slate background)         │
│  • Committees   │                                   │
│  • Emergency    │                                   │
└─────────────────────────────────────────────────────┘
```

- Built with shadcn `Sidebar` (`collapsible="icon"`, navy themed via sidebar CSS vars).
- Header: shadcn `DropdownMenu` for profile + notifications, a toggle for **Admin View ↔ Client View** stored in a lightweight React Context (`ViewModeProvider`).
- Routing via `react-router-dom`; layout wraps all module routes via `<Outlet />`.

## Pages / Routes

| Route | Module | Key UI |
|---|---|---|
| `/` | Dashboard | Admin: KPI cards (total clients, avg compliance) + companies table with `Progress` bars. Client: large circular progress ring (92%) + "Pending Actions" list |
| `/pila` | PILA | Table (Company, Month, Status) with colored `Badge`s; "Upload PILA" opens `Dialog` with drag-and-drop zone |
| `/medical-exams` | Medical Exams | Split: left dropzone card; right table (Worker, Recommendations, Restrictions) with mock extracted rows |
| `/risk-matrices` | Risk Matrices GTC 45 | CIIU code `Input` + "Generate Matrix" button; list of past matrices with download icon |
| `/committees` | Committee Minutes | Company `Select`, Points Discussed `Textarea`, attendees with `Checkbox`, "Generate Document" button |
| `/emergency-plans` | Emergency Plans | Large mic button (fake recording pulse), upload alternative, mock transcribed plan in `Textarea` |

A floating green WhatsApp-style FAB appears bottom-right on all pages.

## Component Structure (modular, backend-ready)

```text
src/
  components/
    layout/        AppLayout, AppSidebar, AppHeader, ViewModeToggle
    dashboard/     AdminDashboard, ClientDashboard, CircularProgress
    common/        StatusBadge, FileDropzone, PageHeader, WhatsAppFab
  context/         ViewModeContext.tsx
  data/            mockCompanies, mockPila, mockMedicalExams,
                   mockMatrices, mockCommittee, mockNotifications
  services/        companies.ts, pila.ts, medicalExams.ts,
                   matrices.ts, committee.ts, emergency.ts
                   // each exports async functions returning mock data
                   // (e.g. listCompanies(), uploadPila(file))
                   // Swap the body for Supabase calls later — signatures stay.
  types/           domain.ts  // Company, PilaRecord, MedicalExam, etc.
  pages/           Dashboard, Pila, MedicalExams, RiskMatrices,
                   Committees, EmergencyPlans, NotFound
```

### Why this is easy to wire later

- **Service layer indirection**: pages call `services/*` functions, never touch mock arrays directly. Replacing each function body with a Supabase query is a localized change.
- **Typed domain models** in `src/types/domain.ts` give you the exact shape your Supabase tables should match.
- **No hidden state**: all mock data lives in `src/data/`. Deleting that folder + the imports inside `services/` is the cleanup checklist.
- **Auth-ready seams**: `ViewModeContext` is the placeholder for a future `useAuth()` / role check. Header profile dropdown has a stubbed "Sign out" item.
- **File uploads** go through a single `FileDropzone` component with an `onFiles(files)` callback — wire it once to Supabase Storage later.
- A short `README-handoff.md` will document the swap points (services, mock data, env vars to add).

## Mock Data Highlights

- Companies: Nike, Ferrero, Danone, Bavaria, Postobón, Alpina, Crepes & Waffles, Éxito (compliance 62–98%).
- PILA: ~8 rows mixing Pending / Uploaded / Overdue.
- Medical exams: 5 workers with realistic recommendations/restrictions in Spanish.
- Risk matrices: 4 prior CIIU entries with date + download.
- Committee members: 6 pre-loaded names with roles.
- Notifications: 3 sample items in header dropdown.

## Out of Scope

- No backend, auth, file storage, or AI processing — buttons and dropzones are visual stubs with `sonner` toast feedback.
- No Supabase wiring in this pass; structure leaves explicit seams.
