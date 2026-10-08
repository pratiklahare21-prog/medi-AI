# Implementation Tasks — Production Auth System

Every task lists: **Goal**, **Files changed/created**, **Dependencies**, **Priority**, **Test Requirements (rule/rubric)**.

Status legend: `pending` → `in_progress` → `completed` (with Completion Evidence).

---

## Task 1: Add Zod + Harden Backend Auth Middleware & Boot Checks

**Goal**: Install Zod, create validators, and ensure the JWT secret is required at boot; tighten the existing `auth.ts` middleware.

**Files**:
- Modify: `backend/package.json` (add zod dependency)
- Create: `backend/src/validators/authValidator.ts` (Zod schemas: registerSchema, loginSchema, plus validate() Express middleware)
- Modify: `backend/src/middleware/auth.ts` — remove hardcoded fallback JWT_SECRET; throw on startup if missing; add token expiry to config from env; add `requireRole` export re-export if needed
- Modify: `backend/src/index.ts` — add startup check for JWT_SECRET present and non-default; update CORS to read FRONTEND_URL from env and reject missing
- Modify: `backend/.env.example` — add `FRONTEND_URL`, clarify `JWT_SECRET` (no default placeholder value in example), add `JWT_EXPIRES_IN`
- Modify: `backend/src/middleware/rateLimiter.ts` — inspect current values, ensure `authRateLimiter` caps login/register at ~5 req/15 min per IP

**Dependencies**: None — atomic first step (installs Zod).

**Priority**: High

**Test Requirements**:
- **rule TR-1.1**: Running the backend without JWT_SECRET in env logs an error and exits (or throws during startup import).
- **rule TR-1.2**: A request `POST /api/auth/register` with `password=weak` and invalid email reaches the validator and returns 400 with `{ success:false, message:"Validation failed", errors: { email: "...", password: "..." } }`.
- **rule TR-1.3**: CORS — When backend runs with `FRONTEND_URL=http://localhost:3000`, a request with `Origin: http://evil.com` and `credentials: include` is rejected (no `Access-Control-Allow-Origin` header for that origin).

**Completion Evidence**: zod package installed; validators file created; middleware updated; startup checks in place.

---

## Task 2: Rewrite Backend Auth Routes Securely

**Goal**: Fix the broken `auth.ts` route: remove auto-create-on-login, remove master password, add validators, add proper status codes/messages, enforce 401 "Invalid email or password" uniformly.

**Files**:
- Modify: `backend/src/routes/auth.ts` — rewrite register/login/me/logout handlers:
  1. `/register` — validate with `validate(registerSchema)` → bcrypt hash (rounds from env or 12) → check duplicate email via db.getUserByEmail (return 409) → db.createUser → sign token → 201
  2. `/login` — validate with `validate(loginSchema)` → normalized email lookup → if !user → 401 generic; else bcrypt.compareSync → if no match → 401 generic; else → sign token → 200 with user (no passwordHash) + token
  3. `/me` — existing requireAuth + db lookup, keep and ensure it strips passwordHash
  4. `/logout` — keep simple 200 + message (bearer tokens are stateless, client discards token). Add optional token blacklist in-memory Set using jti if time permits; otherwise ensure docs say client-side discard.
- Modify (if needed): `backend/src/db/index.ts` `createUser` — add rounds param if needed (bcrypt.hashSync uses 10, bump to 12).

**Dependencies**: Task 1 (validators & middleware ready).

**Priority**: High

**Test Requirements**:
- **rule TR-2.1**: `POST /api/auth/login` with email `nobody@test.com` / any password → **401** `{ success: false, message: "Invalid email or password" }`. No user record created in db.users array.
- **rule TR-2.2**: `POST /api/auth/login` with an existing user's email but wrong password → **401** same generic message (NOT email-specific error).
- **rule TR-2.3**: Same email registered twice → second call returns **409** with `message: "An account with that email already exists"`.
- **rule TR-2.4**: New valid registration via API returns **201**, response.user has NO `passwordHash` field.
- **rule TR-2.5**: After successful login, calling `GET /api/auth/me` with the returned Bearer token returns 200 and the user's safe fields.

**Completion Evidence**: All TR-2.x rules pass via manual curl or tests; routes file uses validator middleware; no "auto-create user" logic left; no "Password123!" master-password check left.

---

## Task 3: Apply Auth + Role Middleware to All Backend Sensitive Routes

**Goal**: Protect mutating endpoints and admin-only reads with `requireAuth` / `requireRole` consistently.

**Files inspect and modify if needed**:
- `backend/src/routes/catalog.ts` — POST catalog, POST generics, PATCH Rx toggle → requireAuth (currently optionalAuth on some writes; switch POST/PATCH/DELETE to requireAuth)
- `backend/src/routes/feeds.ts` — POST retry → requireAuth
- `backend/src/routes/disputes.ts` — POST resolve → requireAuth
- `backend/src/routes/auditLogs.ts` — GET logs (admin only: requireRole Lead Ops Admin or Formulary Director), POST createAuditLog (requireAuth)
- `backend/src/routes/tenants.ts` — GET tenants (requireAuth)
- `backend/src/routes/priceAlerts.ts` — ALL endpoints requireAuth (alerts are user-specific)
- `backend/src/routes/priceTrends.ts` — check, may stay public read
- `backend/src/routes/ai.ts` — OCR/recommend/search/triage → requireAuth (cost-bearing APIs)

**Dependencies**: Task 2 (middleware exists and exports everything needed).

**Priority**: High

**Test Requirements**:
- **rule TR-3.1**: `POST /api/catalog` without Authorization header → 401.
- **rule TR-3.2**: `GET /api/audit-logs` with Bearer token for role `Clinical Pharmacist` → 403 (admin only). Same call with `Lead Ops Admin` token → 200 + data.
- **rule TR-3.3**: `POST /api/price-alerts` without auth → 401.

**Completion Evidence**: Route files updated; at least one sample call per category (write, admin-read) manually verified with 401/403 when unauthorized.

---

## Task 4: Create Frontend AuthProvider & Update API Service with 401 Handling

**Goal**: Centralize auth state (login, register, logout, currentUser, loading, error) in a React Context. Hook it into app boot to hydrate session via `/api/auth/me`. Add 401 auto-logout interceptor.

**Files**:
- Create: `frontend/src/context/AuthContext.tsx` — `AuthProvider` component, `useAuth()` hook, state fields above, login/register/logout functions that call `api.*` and keep state in sync. On mount: if token in localStorage → call api.getMe() to hydrate currentUser; on 401 clear token + user.
- Modify: `frontend/src/services/api.ts` — add optional 401 callback or global handling via window event so non-auth endpoints returning 401 trigger logout cleanly; keep BASE_URL reading `import.meta.env.VITE_API_URL` (currently uses VITE_BACKEND_URL, align naming).
- Modify: `frontend/.env.example` — change/add `VITE_API_URL=http://localhost:3001`.

**Dependencies**: None after Task 2 (backend auth endpoints exist).

**Priority**: High

**Test Requirements**:
- **rule TR-4.1**: With a valid token in localStorage, on first app load useAuth().loading transitions true→false, and currentUser is populated (null→user) without login screen.
- **rule TR-4.2**: With NO token, useAuth().loading→false, currentUser stays null.
- **rule TR-4.3**: After useAuth().logout() is called: token removed from localStorage, currentUser is null.
- **rule TR-4.4**: A non-auth API call returning 401 (e.g., tampered token) triggers global auto-logout clearing currentUser without throwing hard crashes.

**Completion Evidence**: AuthContext file created; exports typed hook; App.tsx imports provider and wraps tree. api.ts updated.

---

## Task 5: Simplify Frontend Login/Register UI — Single Auth Screen

**Goal**: Remove confusing dual auth UI (LoginPage + AuthView). Consolidate into ONE simple, styled auth screen with Login and Register tabs. Match existing app design. Remove hardcoded demo credentials and demo-user grid. The user explicitly said "which not working remove it".

**Files**:
- Modify heavily: `frontend/src/components/LoginPage.tsx` — upgrade to include:
  - Tab toggle: "Sign In" / "Create Account" (or link at bottom).
  - **Login form**: Email, Password fields, submit with inline validation errors (email valid format, password ≥ 8 chars initially; detailed server errors displayed too).
  - **Register form**: Full name, Email, Password, Confirm Password, Role dropdown (matches UserRole), optional fields: License Number, Department, Phone.
  - Validation rules on submit (min 8, one upper, one lower, one number, one symbol) with per-field red messages.
  - Loading state on submit button (spinner, disabled).
  - Error banner for top-level errors.
  - Remove Demo Credentials block and Quick Demo Login grid entirely.
  - Call `useAuth().login` / `useAuth().register` from context.
  - Keep `bg-[#F8FAFC]` page, `rounded-2xl` card, blue pill logo with `SastaRx` tag matching AuthView design.
- Delete/Deprioritize: `frontend/src/components/AuthView.tsx` — STOP rendering it from App. (Keep file if time for re-use, but don't render it; ideally just remove the import and the isAuthScreenOpen path from App.tsx.)
- Modify: `frontend/src/App.tsx`
  - Wrap tree in `<AuthProvider>`.
  - Delete `isAuthScreenOpen` state and `registeredUsers` in-memory state (no longer needed; api calls + context maintain state).
  - Delete `handleSimpleLogin` local function (replace with context).
  - Delete old localStorage reads for `sastarx_current_user` / `sastarx_registered_users` (use AuthProvider state; token `sastarx_auth_token` still kept in api service).
  - Top-level render: while `auth.loading` → show a minimal loader (same as ViewLoader). Then if `auth.currentUser === null` → render `<LoginPage />`. Else render the main Header+Sidebar+views layout.
  - Wire `handleLogout` → `auth.logout()`.
  - Guest button can stay IF app relies on it for catalog public browsing; else drop to reduce confusion.

**Dependencies**: Task 4 (AuthContext + useAuth exist).

**Priority**: High

**Test Requirements**:
- **rule TR-5.1**: App.tsx renders `<LoginPage>` (only one auth screen) when user is logged out; no `AuthView` mounted.
- **rule TR-5.2**: Register tab: submitting with password `weak` → inline password error shown before submit sends request.
- **rule TR-5.3**: Register tab with `confirmPassword !== password` → inline confirm-password error.
- **rule TR-5.4**: On successful login (via valid credentials), login page disappears, main Dashboard view renders with the user's name in Header.
- **rule TR-5.5**: No hardcoded `admin@medihealth.com / admin123` strings appear anywhere in JSX output or rendered UI.
- **rubric TR-5.6 (AC-12)**: Design match — same visual language as AuthView's rounded 2xl card, blue brand colors, fonts, focus rings. Score 0-2. ≥1 pass.

**Completion Evidence**: New LoginPage.tsx with tabs, validation. App.tsx uses AuthProvider + single auth screen render path. AuthView import removed from App render tree.

---

## Task 6: Wire Protected "Routes" (State-Based) & Refresh-Persistent Session

**Goal**: Ensure the main app shell (Header + views) is only accessible to authenticated users; unauthenticated users bounce to Login. Ensure refresh correctly rehydrates. Add 403 handling (e.g., SuperAdminView gated by role).

**Files**:
- Modify: `frontend/src/App.tsx` — use `currentUser.role` when rendering `<SuperAdminView ... />`. If user opens super-admin tab but is not Lead Ops Admin, show a simple 403 Forbidden inline message (but ideally, the backend return of 403 on its calls is the real guard). This complements backend enforcement per "don't trust frontend".
- Verify: Task 4's AuthProvider getMe-on-mount already handles the refresh-rehydrate case.

**Dependencies**: Task 5 (App uses AuthProvider).

**Priority**: Medium

**Test Requirements**:
- **rule TR-6.1 (AC-6)**: On a browser refresh after valid login: currentUser loads (no login flash), app remains on the main dashboard view.
- **rule TR-6.2**: Tamper with localStorage token (delete or corrupt it) and refresh → login page shown.
- **rule TR-6.3**: Open SuperAdminView via sidebar click with a Clinical Pharmacist user: API calls return 403 (backend enforced) and UI shows graceful message, not a crash.

**Completion Evidence**: All 3 rules passed by manual testing in browser.

---

## Task 7: Update Environment Example Files, Global Error Handler, & README

**Goal**: Document required env vars correctly; add validation-error support to global error middleware; update README with local setup instructions and auth architecture.

**Files**:
- Modify: `backend/src/index.ts` global error handler — detect Zod validation error shape and pass through `errors` map cleanly with 400.
- Modify: `backend/.env.example` — FRONTEND_URL, JWT_SECRET (no value), JWT_EXPIRES_IN=7d, PORT, DATABASE_URL, GEMINI_API_KEY, NODE_ENV.
- Modify: `frontend/.env.example` — VITE_API_URL=http://localhost:3001 and VITE_APP_TITLE.
- Modify: `README.md` at root (or project README) with:
  1. Local setup steps (5 steps, numbered: install backend deps, install frontend deps, configure env vars, start backend, start frontend)
  2. Auth architecture diagram (ascii bullets per spec request, Frontend → Auth API → Backend → AuthMiddleware → RoleMiddleware → Controller → DB)
  3. List of env vars (names only, no real secrets)
- Update: `backend/README.md` if present but prefer the root README.

**Dependencies**: Tasks 1-6 done so values are accurate.

**Priority**: Medium

**Test Requirements**:
- **rule TR-7.1**: Global error handler produces `{ success:false, message, errors }` shape when a Zod validation middleware propagates.
- **rule TR-7.2**: `.env.example` files list all required variables. No real secrets committed anywhere (grep for sk-/mongodb+srv with real passwords not present in example files).

**Completion Evidence**: All 4 files updated; global handler handles validation errors.

---

## Task 8: Final Verification — Manual End-to-End Flows

**Goal**: Execute the 16-step final verification list from the user's requirement and record evidence. Steps:

1. Start backend.
2. Start frontend.
3. Register a new user.
4. Log in.
5. Refresh the browser → confirm persistence.
6. Access a protected page (dashboard ok, then try SuperAdmin).
7. Call protected APIs (e.g., create a price alert).
8. Test unauthorized access (no token → 401; non-admin → 403 on audit logs).
9. Log out.
10. Confirm protected APIs reject logged-out user.
11. Test validation errors (weak password, duplicate email).
12. Test CORS: frontend at localhost:3000 calls backend localhost:3001 — no CORS error in console.
13. Check browser console for errors.
14. Check backend logs for errors.
15. Ensure existing catalog/feeds/disputes/alerts features still work.

Record success of each step. If a step fails, loop back to the specific task.

**Dependencies**: All tasks 1-7 complete.

**Priority**: High (blocking acceptance).

**Test Requirements**:
- **rule TR-8.1**: Every step 3–15 in the above list passes without crashes or console errors.
- **rubric TR-8.2 (AC-11)**: Existing features integrity score. ≥ 1 pass, target 2.

**Completion Evidence**: Step-by-step pass log recorded in task notes.
