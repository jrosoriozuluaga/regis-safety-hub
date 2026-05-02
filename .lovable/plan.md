# Login + Recovery (Frontend Mock)

Adds a branded authentication shell to the Regis Colombia dashboard. No real backend — credentials are validated against mock data, but the structure is built to swap in Supabase later by editing one file (`src/services/auth.ts`).

## What gets built

### 1. New pages
- `/login` — NIT + password form, "Forgot password?" link, Regis navy branding, logo, "Recordarme" checkbox.
- `/forgot-password` — Two-field form (NIT + email). On submit shows a success card: "If the NIT and email match, you'll receive a reset link." (mock — no email sent).
- `/reset-password` — Placeholder page reachable via the success state, with new password + confirm fields. Mock submit returns to login with a toast.

### 2. Session + profile layer
- New type `UserProfile { nit, companyName, contactEmail, role: 'admin' | 'client' }` in `src/types/domain.ts`.
- New mock file `src/data/mockUsers.ts` — 2-3 seeded accounts (one admin, one client) with NIT, password, email, company name.
- New `src/services/auth.ts` exposing: `login(nit, password)`, `logout()`, `requestReset(nit, email)`, `resetPassword(token, newPassword)`, `getCurrentUser()`. All read/write to `localStorage` under `regis.session`.
- New `src/context/AuthContext.tsx` providing `{ user, login, logout, loading }`.

### 3. Wire-in
- `src/App.tsx`: wrap routes in `AuthProvider`. Add public routes `/login`, `/forgot-password`, `/reset-password`. Wrap the `AppLayout` route group in a `ProtectedRoute` component that redirects unauthenticated users to `/login`.
- `ViewModeContext`: initialize `mode` from `user.role` on login (admin → admin view, client → client view). Manual toggle still works.
- `AppHeader`: show logged-in company name + a "Cerrar sesión" item in the user dropdown that calls `logout()` and redirects to `/login`.

## Design
- Centered card on a slate background, navy header bar with the Regis logo.
- Inputs use existing Shadcn `Input` / `Label` / `Button`. Primary button uses navy; success states use bright green.
- Spanish copy throughout ("NIT de la empresa", "Contraseña", "¿Olvidaste tu contraseña?", "Ingresar").
- Zod validation: NIT required (digits only, 9–10 chars), password min 6, email format on recovery.

## Technical details
- `ProtectedRoute` reads `useAuth()`; while `loading`, renders a spinner; if no user, `<Navigate to="/login" replace />`.
- `auth.ts` is the single seam for future Supabase wiring — swap localStorage calls for `supabase.auth.signInWithPassword` etc. without touching pages.
- Mock seed accounts will be documented in `README-handoff.md` so you can log in immediately.

## Files
- New: `src/pages/Login.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/context/AuthContext.tsx`, `src/services/auth.ts`, `src/data/mockUsers.ts`
- Edited: `src/App.tsx`, `src/types/domain.ts`, `src/context/ViewModeContext.tsx`, `src/components/layout/AppHeader.tsx`, `README-handoff.md`
