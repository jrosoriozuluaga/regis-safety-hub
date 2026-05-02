# Regis Colombia — Handoff Notes

This is a frontend-only React + Vite + Tailwind + shadcn/ui shell for the SG-SST dashboard. All data is mocked.

## Where things live

- `src/types/domain.ts` — domain models. Match Supabase tables to these shapes.
- `src/data/*` — mock data (delete once backend is wired).
- `src/services/index.ts` — **the only place pages read/write data**. Replace each function body with a real call (Supabase, REST, etc.) keeping the same signature; nothing else needs to change.
- `src/context/ViewModeContext.tsx` — placeholder for auth/role. Replace with real `useAuth()` and derive role from session.
- `src/components/common/FileDropzone.tsx` — single upload widget; wire to Supabase Storage in `services/index.ts` (`pilaService.upload`, `medicalExamsService.upload`, etc.).
- `src/components/layout/*` — sidebar + header shell.
- `src/pages/*` — one file per module.

## Cleanup checklist when wiring backend

1. Implement real calls in `src/services/index.ts`.
2. Delete `src/data/` and remove its imports from `services/index.ts`.
3. Replace `ViewModeProvider` with real auth + role logic.
4. Add env vars (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

## Design tokens

All colors are HSL CSS variables in `src/index.css`. Tailwind classes (`bg-primary`, `text-success`, `bg-card`, etc.) map to them via `tailwind.config.ts`. Don't hardcode colors in components.

## Authentication (mock)

Frontend-only. All logic is in `src/services/auth.ts` (the single seam to swap for Supabase).

- Session is stored in `localStorage` under `regis.session`.
- Mock accounts live in `src/data/mockUsers.ts`.
- `AuthProvider` (`src/context/AuthContext.tsx`) exposes `{ user, login, logout }`.
- `ProtectedRoute` guards the dashboard routes.
- `ViewModeContext` auto-syncs admin/client view from the user's role.

### Test accounts
| Role   | NIT        | Password    |
|--------|------------|-------------|
| admin  | 900123456  | regis2025   |
| client | 830111222  | cliente2025 |
| client | 901555888  | demo2025    |

### Swap to Supabase later
Replace the bodies of `login` / `logout` / `getCurrentUser` / `requestReset` / `resetPassword`
in `src/services/auth.ts` with `supabase.auth.*` calls. No page or component needs to change.
