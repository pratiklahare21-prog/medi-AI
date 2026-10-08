# Specification: Production-Ready Authentication, Authorization & Validation System

## Problem

The existing medi AI / SastaRx full-stack application has a basic authentication skeleton, but it contains critical security vulnerabilities and incomplete features:

### Backend Issues
1. **Insecure Login**: Automatically creates a new user on the fly if the email is not found, enabling unauthorized access
2. **Master Password Bypass**: Accepts `Password123!` as a universal password for any existing account
3. **Hardcoded JWT Secret Fallback**: Uses a default secret in source code when env var is missing
4. **Weak Validation**: Password min 6 chars only; no email regex validation; no confirm-password field
5. **Account Enumeration**: Login route silently creates a user, revealing that the email didn't exist
6. **CORS Too Permissive**: `origin: true` accepts any origin with credentials
7. **Tokens in Response Body**: JWT returned in JSON (encourages localStorage storage, XSS risk)
8. **Logout No-Op**: `/api/auth/logout` returns a message but does not invalidate anything server-side-capable
9. **No Request Validation Library**: Manual checks scattered, no Zod/Joi schemas
10. **Inconsistent Error Shape**: Some routes return `{error}`, some `{message}`, no centralized validation errors object
11. **Admin Route Gaps**: `requireRole` middleware exists but may not be wired onto all admin-only endpoints

### Frontend Issues
1. **Dual Auth UIs**: Both `LoginPage.tsx` (simpler, used when `currentUser === null`) and `AuthView.tsx` (tabs + register + demo switcher) exist in parallel, duplicating state and UI
2. **No Auth Provider**: Authentication state and methods (login, register, logout, me) scattered across `App.tsx` and `api.ts` without a Context
3. **Token in localStorage**: JWT stored in `localStorage` (`sastarx_auth_token`), vulnerable to XSS
4. **No Protected Route Wrapper**: Views render unconditionally after `currentUser !== null` check in `App.tsx`; no reusable `<ProtectedRoute>` mechanism
5. **Weak Persistence Check**: On refresh the app trusts `localStorage.sastarx_current_user` blindly without calling `/api/auth/me` to validate the JWT
6. **Validation Minimal**: Register form only checks length ≥ 6 and presence of `@`; no password-strength rules or confirm-password field
7. **Session Expiry Handling**: No global handling of 401 responses → no automatic redirect to login with cleared state
8. **User specifically asked**: "add login page and make ui simple which not working remove it" — indicates non-functional UI must be removed and a simple, working Login page used

## Users

- **Healthcare Practitioners (Pharmacists, Physicians, Formulary Directors, Ops Admins)** who log in to manage catalog, feeds, disputes, and alerts.
- **Patients / Consumers** who log in to the patient portal.
- **Security auditors** expecting OWASP Top-10 baseline controls to be in place.

## Goals

1. **Authentication**: Provide a secure, production-ready login/register/logout/me flow with JWT + HTTP-only cookies or Bearer tokens consistently; enforce persistent sessions via `/api/auth/me` hydration on app mount.
2. **Authorization**: Enforce role-based access on every sensitive backend route using the existing `requireAuth` + `requireRole` middleware pattern and ensure 403 is returned for unauthorized calls.
3. **Validation**: Add backend request validation (Zod schemas + middleware) and symmetric frontend validation (register/login forms with real-time errors, confirm-password, password rules).
4. **UI Simplicity**: Remove or consolidate broken/unused auth UI so a single simple Login + Register page is always shown to unauthenticated users and matches the existing app design (Tailwind, blue/white palette, medi AI branding).
5. **Security Hardening**: Remove auto-user-creation, remove master-password, use env-only JWT secret, tighten CORS via env var, add/strengthen rate limiting, audit log all auth events.
6. **Persistence & Error UX**: On page refresh validate the session via API; on 401 clear client state and route to login; show validation errors inline.

## Non-Goals

- Rewrite the application from scratch.
- Change the view-mode routing architecture (clinical-ops / patient-portal / system-architecture).
- Add social login / OTP / magic links (beyond scope).
- Replace the in-memory DB manager or force Prisma MongoDB usage for this iteration (use whichever already works end-to-end).
- Add backend validation library that conflicts with existing stack (prefer Zod since Express TS is clean; already no validation lib installed so adding Zod is fine).

---

## Functional Requirements (FR)

### FR-1 Authentication Endpoints

- `POST /api/auth/register` accepts `{ name, email, password, confirmPassword, role?, title?, licenseNumber?, department?, phone? }`.
  - Validates all fields.
  - Normalizes email (trim + lowercase).
  - Hashes password with bcrypt (salt rounds ≥ 10).
  - Rejects duplicate emails with 409.
  - Returns 201 + `{ success: true, user: safeUser, token?: string }` — OR sets HTTP-only cookie and omits token from body (choose one approach consistently; Bearer + localStorage currently used so keep Bearer for compatibility while documenting risk, or switch fully to cookies; for minimal frontend breakage keep Bearer **and** add option for future cookie mode).
  - Writes audit log `NEW_USER_REGISTERED`.
- `POST /api/auth/login` accepts `{ email, password }`.
  - Looks up the user; if not found **or** password mismatch, both cases return **401 with generic "Invalid email or password"** (no enumeration).
  - **Must not** auto-create accounts or accept master passwords.
  - Signs JWT with `JWT_SECRET` from env; throw on boot if secret missing / still default placeholder.
  - Writes audit log `USER_SESSION_AUTHENTICATED`.
  - Returns `{ success: true, user: safeUser, token }`.
- `GET /api/auth/me` uses `requireAuth`.
  - Looks up user by ID in token.
  - Returns safe user fields (no passwordHash).
  - Returns 401 if token invalid / user deleted.
- `POST /api/auth/logout` optionally invalidates a token-blacklist (in-memory set for this stack), clears cookie if used, and returns 200.
  - Client is responsible for discarding token.

### FR-2 Reusable Auth & Role Middleware

- `requireAuth`: reads `Authorization: Bearer <token>` header, verifies JWT signature + expiry, attaches `req.user` and `req.tenantId`. Returns 401 with consistent body on failure.
- `requireRole(roles: UserRole[])`: stacked after `requireAuth`; returns 403 if user's role not in allowed list.
- Apply `requireAuth` to write endpoints and admin-only read endpoints; `optionalAuth` may stay on catalog GETs that currently work for guests.

### FR-3 Input / Request Validation

- Add Zod as backend validation library.
- Create `backend/src/validators/authValidator.ts` exporting:
  - `registerSchema` — name (min 2 chars), email (Zod email), password (min 8, 1 upper, 1 lower, 1 number, 1 symbol), confirmPassword (refine equal), role (enum UserRole), licenseNumber optional, etc.
  - `loginSchema` — email + password required.
- Create `validate(schema)` middleware that runs safeParse and returns 400 with `{ success:false, message:"Validation failed", errors: { field: msg } }` on failure.
- Wire validator middleware to the register/login endpoints.
- Frontend validates login/register forms submit with same rules (real-time per-field error messages).

### FR-4 Frontend Auth Provider

- Add `frontend/src/context/AuthContext.tsx` exporting `AuthProvider`, `useAuth()` hook with:
  - `currentUser: UserAccount | null`
  - `loading: boolean` (true while `/api/auth/me` runs on boot)
  - `login(email, password) => Promise<void>`
  - `register(data) => Promise<void>`
  - `logout() => Promise<void>`
  - `error: string | null` and `clearError()`
- On app mount, if a token exists, call `/api/auth/me` to populate `currentUser`; on 401 clear token + set user null.
- Global 401 interceptor in `api.ts` request helper → auto logout on consistent auth failure (not a single 404, etc).

### FR-5 Frontend Login/Register UI (Simplified)

- **Remove the conflicting/confusing auth UI state** in `App.tsx` that renders `LoginPage` on null user AND has an `isAuthScreenOpen` rendering `AuthView`.
- Keep a single **simple** auth screen in the login flow showing `LoginPage` component, but update `LoginPage` to include:
  - Login tab / Register tab toggle (or two stacked views with toggle link) so registration is reachable without a second screen.
  - Fields:
    - Login: Email, Password
    - Register: Full Name, Email, Password, Confirm Password, Role dropdown (same options as existing), optional Department/Phone/LicenseNo fields
  - Per-field errors from frontend validation; after submission also show backend errors.
  - Loading button spinner; disable button while loading.
  - No "Demo Credentials" block with hardcoded passwords printed on UI (security hazard — the user asked for simple UI, remove it).
  - No "Quick Demo Login" 8-user grid on login page; it's demo-specific and leaks user identifiers.
  - Guest option can remain if existing code relies on it, but mark it Read-Only mode.
- Keep visual style: Tailwind, rounded cards, blue `#2563EB` primary, white background `#F8FAFC` page, medi AI logo pill — match `AuthView`'s design language so it integrates visually with the app.

### FR-6 Protected Routes (Frontend UX)

- Add `<ProtectedRoute>` wrapper (or in-app logic equivalent since app uses state-based view switching, not React Router) that:
  - While `loading === true` shows a compact skeleton/spinner matching the existing `ViewLoader`.
  - When `!currentUser` redirects UI to the login screen (via `App` state, no router needed because this app doesn't use React Router).
  - When on login screen and `currentUser` already exists, auto-dismiss login and show the main app.

### FR-7 CORS via Environment Variables

- `FRONTEND_URL` env variable on backend; defaults to `http://localhost:3000` for dev.
- `cors({ origin: FRONTEND_URL, credentials: true })` — never `origin: true` or `*` in production.
- Documented in `.env.example`.

### FR-8 Environment Variables (Updated)

- **Backend**: `PORT`, `DATABASE_URL`, `JWT_SECRET` (required, no default-in-code), `JWT_EXPIRES_IN` (default `7d`), `FRONTEND_URL`, `NODE_ENV`, `GEMINI_API_KEY`.
- **Frontend**: `VITE_API_URL` (points to backend base URL — proxy may work in dev but explicit var helps in production).
- Update both `.env.example` files with placeholders.

### FR-9 Error Responses Consistent Shape

All routes on error should return:
```json
{ "success": false, "message": "Short description", "errors": { "fieldName": "Specific msg" }? }
```
Generic 500s expose no details to the client in production; full error + stack logged server-side only (current global handler mostly does this; tighten to drop raw message for 5xx).

### FR-10 Security Measures

- **Password hashing**: bcrypt ≥ 10 rounds (already used; ensure register/login use it consistently, no master password shortcuts).
- **JWT**: Secret required at boot time; `JWT_EXPIRES_IN` enforced; algorithm HS256 default via jsonwebtoken.
- **CORS**: Specific origin; credentials allowed.
- **Rate limiting**: Existing `authRateLimiter` strengthened: login/register endpoints max 5 attempts / 15 min per IP (current values check existing `rateLimiter.ts` and adjust).
- **Input sanitization**: Existing `sanitizeBody` middleware retained.
- **Helmet**: Already enabled; keep configuration.
- **No secrets in frontend**: No `VITE_JWT_*`, never.
- **Audit logs**: All auth events logged with tenant context.

---

## Non-Functional Requirements (NFR)

- NFR-1 **Backward Compatibility**: Existing catalog, feeds, disputes, audit logs, price alerts, AI routes and views MUST continue to work with the same call signatures and return shape (they may now require auth on writes).
- NFR-2 **Performance**: Session hydration `/api/auth/me` runs once on boot; all other API calls add ~1ms JWT verify overhead — no perceptible slowdown.
- NFR-3 **Type Safety**: TypeScript strict-mode clean for new files (no `any` on exported boundaries).
- NFR-4 **No Breaking UI**: The overall color scheme, font stack, layout structure (Header + Sidebar + Footer) MUST remain identical.
- NFR-5 **Testability**: Validator schemas exported; middleware pure where possible.

---

## Constraints

- Existing stack: Express + TypeScript + bcryptjs + jsonwebtoken on backend; React 19 + TypeScript + Tailwind + Vite on frontend.
- In-memory `DatabaseManager` currently used by routes; Prisma schema exists but may not be connected. Implement against the active DB layer (the `db` singleton) to avoid breaking the working app.
- No React Router — app uses state-based view modes. All "routing" stays state based.
- The user explicitly said: **"Do NOT rewrite the entire application. Do NOT remove or break any existing functionality."** and **"add login page and make ui simple which not working remove it"** — remove any auth component/flow that's duplicated or broken.

## Assumptions

- MongoDB/Prisma setup is optional locally; in-memory DB works for development. The implementation should function identically regardless.
- The `Lead Ops Admin` role is considered super admin.
- Because no router exists, "Protected Route" means a component-level check inside `App.tsx` using values from `AuthProvider`.

## Open Questions (resolved by choosing best-fit)

1. **Cookies vs Bearer tokens?** Current code ships Bearer tokens in JSON body + localStorage. Switching entirely to HTTP-only cookies would be more secure but requires bigger frontend surgery. Decision: **Use Bearer tokens for consistency with existing api.ts**, but document the risk, and add server-side token revocation set (logout adds token jti to blacklist, or compare expiry for stateless). Future work can migrate to cookies. We'll keep JWT `jti` optional and accept "client discards token" logout for simplicity (matches scope).

2. **Which validation library?** Zod — TypeScript-first, no types needed, integrates well with Express middleware.

---

## Acceptance Criteria

### rule AC-1 — Registration Flow
When a user submits a valid registration via the frontend form, the backend returns 201 with success:true, user (no passwordHash), and a token; on duplicate email, returns 409 with generic message; on invalid fields returns 400 with per-field `errors` map.

### rule AC-2 — Login Flow
Submitting correct credentials returns 200 with user + token. Submitting a wrong password OR a non-existent email both return 401 with message **exactly** "Invalid email or password". No user is ever auto-created on login. No master password accepted.

### rule AC-3 — /api/auth/me
A valid Bearer token returns user data (id, name, email, role, tenantId, tenantName). No passwordHash. Missing/invalid/expired token returns 401.

### rule AC-4 — Logout
After frontend calls logout, token is removed from localStorage, currentUser is null, and a subsequent call to `/api/auth/me` returns 401.

### rule AC-5 — Protected API Endpoints
Any sensitive write endpoint (POST/PATCH/DELETE catalog, feeds retry, disputes resolve, audit logs list is read but admin-only) with `requireAuth` returns 401 when auth header missing and 403 when role insufficient. Admin SuperAdminView calls require `Lead Ops Admin` role.

### rule AC-6 — Persistent Session
On page refresh (F5):
1. Token exists in localStorage → `AuthProvider` calls `/api/auth/me` and populates currentUser without showing login.
2. Token missing / invalid → `AuthProvider` sets currentUser null and the login screen is shown.

### rule AC-7 — CORS Configured
Backend rejects requests with Origin header not matching `FRONTEND_URL` when using credentials. Dev default `http://localhost:3000` works.

### rule AC-8 — Environment Variables
On backend boot, if `JWT_SECRET` is empty or equals placeholder default string, server logs a clear error and exits (throws) instead of silently using an insecure value.

### rule AC-9 — Validation
Backend rejects registration with:
- empty name, invalid email, password shorter than 8 chars, password missing uppercase/lowercase/number/symbol, confirmPassword mismatch — all with 400 and specific per-field errors.
Frontend forms disable submit and show inline errors for exactly the same rules before hitting the network.

### rule AC-10 — Simplified Single Auth UI
After the change, `App.tsx` renders exactly ONE auth screen when unauthenticated (the upgraded LoginPage with Register tab toggle). No duplicate LoginPage vs AuthView confusion. The demo credentials panel, quick demo user grid, and any hardcoded passwords in UI are removed.

### rubric AC-11 — Existing Feature Integrity
After all changes, the following work without errors in both frontend UI and backend logs: (score 0-2)
- 2: Dashboard, Catalog (read + add + link generic), Feeds retry, Disputes triage resolve, Audit logs modal, Price alerts create/pause/delete/simulate-drop, Super Admin view openable by admin role only.
- 1: 80% of above work, minor visual glitches on one view.
- 0: Multiple views broken or backend returning 500s on core flows.
Pass threshold: ≥ 1; Target: 2.

### rubric AC-12 — UI Match Existing Design
Score 0-2 on how well the new auth screen matches `AuthView`'s visual style (blue pill logo, rounded-2xl card, text-xs labels, focus:ring-blue-600 inputs, `bg-[#F8FAFC]` page, same font weights).
- 2: Indistinguishable visual language, smooth integration.
- 1: Slight mismatch in colors/spacing but still professional.
- 0: Entirely different look from the rest of the app.
Pass threshold: ≥ 1; Target: 2.
