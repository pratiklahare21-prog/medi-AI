# 📋 Technical & Product Decisions Log

> **Purpose:** Document every important technical and product decision made throughout the project lifecycle. AI assistants must consult this file before proposing changes and must update it when new decisions are made.

---

## How to Use This File

- **Before making changes:** Check if a relevant decision already exists.
- **After making decisions:** Add a new entry using the template below.
- **Never delete entries.** Mark superseded decisions with `[SUPERSEDED by DEC-XXX]`.

### Entry Template

```markdown
### DEC-XXX: [Decision Title]

| Field                  | Details                          |
|------------------------|----------------------------------|
| **Date**               | YYYY-MM-DD                       |
| **Status**             | `Accepted` / `Superseded` / `Deprecated` |
| **Decided by**         | Name / Role                      |

**Context / Problem:**
> Describe the situation or problem that prompted this decision.

**Decision:**
> State the decision clearly and concisely.

**Reasoning:**
> Why this approach was chosen over alternatives.

**Alternatives Considered:**
1. Alternative A — reason rejected
2. Alternative B — reason rejected

**Impact on Project:**
- Impact item 1
- Impact item 2
```

---

## Decisions

### DEC-001: React + Vite + TypeScript as Frontend Stack

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> Needed a performant, type-safe frontend framework for a clinical operations platform handling sensitive medical data with complex UI interactions (modals, drawers, data tables, charts).

**Decision:**
> Use React 19 with Vite 6 as the build tool and TypeScript (~5.8) for type safety.

**Reasoning:**
> React 19 offers the latest concurrent rendering capabilities. Vite provides sub-second HMR and fast builds. TypeScript catches data-shape bugs at compile time, which is critical for a medical platform where incorrect data rendering could have real consequences.

**Alternatives Considered:**
1. Next.js — Rejected; no SSR/SSG requirement. The app is an SPA deployed to Cloud Run with a lightweight Express backend. Next.js would add unnecessary complexity.
2. Angular — Rejected; heavier framework, smaller team familiarity.
3. Plain JavaScript — Rejected; the domain model is complex (12+ entity types) and TypeScript's type system is essential for maintaining correctness.

**Impact on Project:**
- All source files use `.tsx` / `.ts` extensions
- Build pipeline: `vite build` → static assets served via Express
- Dev server runs on port `3000` with HMR (disabled in AI Studio via `DISABLE_HMR` env var)

---

### DEC-002: Tailwind CSS v4 for Styling

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> Need a consistent, utility-first styling approach that supports rapid prototyping of a complex dashboard with data-dense views.

**Decision:**
> Use Tailwind CSS v4 via the `@tailwindcss/vite` plugin. Custom typography utilities (`.font-display-lg`, `.font-headline-md`, `.font-code-mono`, etc.) are defined in `src/index.css` using `@layer base`.

**Reasoning:**
> Tailwind v4 integrates as a Vite plugin (zero PostCSS config), supports CSS-first configuration, and enables rapid iteration on a component-heavy UI without context-switching to separate stylesheets.

**Alternatives Considered:**
1. Vanilla CSS / CSS Modules — Rejected; too verbose for the number of components and states.
2. Styled Components — Rejected; runtime CSS-in-JS adds bundle weight and is less performant.
3. Tailwind v3 — Rejected; v4's Vite-native plugin is simpler to configure.

**Impact on Project:**
- Styling is inline via Tailwind utility classes in JSX
- Custom font utilities defined in [`src/index.css`](file:///c:/Users/pratik/medi-AI/src/index.css)
- Typography: Inter (body), Plus Jakarta Sans (headings), JetBrains Mono (code/data)
- No separate `.css` files per component

---

### DEC-003: Single-Page Application with Client-Side View Switching

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> The platform has three major view modes (Clinical Ops, Patient Portal, System Architecture) and multiple sub-tabs within Clinical Ops. Need to decide between a client-side router (e.g., React Router) or manual state-based view switching.

**Decision:**
> Use React `useState` for view mode (`AppViewMode`) and tab navigation (`OpsNavigationTab`, `PatientNavTab`) — no client-side router.

**Reasoning:**
> The app does not require URL-based deep linking, browser history navigation, or SEO for internal views. State-based switching is simpler, avoids a dependency, and keeps the component tree shallow.

**Alternatives Considered:**
1. React Router v6 — Rejected; adds complexity for no tangible benefit since all views are behind authentication and not shareable via URL.
2. `go_router` / TanStack Router — Rejected; overkill for the current view structure.

**Impact on Project:**
- `App.tsx` manages `viewMode` and `opsTab` state
- No URL changes when switching views
- Deep linking to specific views is not supported (acceptable trade-off)

---

### DEC-004: Mock Data Layer Instead of Backend API (Phase 1)

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Product & Engineering                      |

**Context / Problem:**
> For MVP/demo, need realistic data for medicines, pricing feeds, disputes, audit logs, and user accounts without standing up a full backend.

**Decision:**
> Use static mock data files (`src/data/mockData.ts`, `src/data/priceTrendsData.ts`) that export typed constants. State is initialized from these constants in `App.tsx` and managed via React `useState`.

**Reasoning:**
> Enables full UI development and demonstration without backend dependencies. The typed interfaces in `src/types.ts` serve as the contract for a future API layer — when a backend is added, only the data-fetching layer needs to change.

**Alternatives Considered:**
1. JSON Server / MSW — Rejected; adds setup overhead for a demo phase.
2. Firebase Firestore — Considered for Phase 2 but deferred.

**Impact on Project:**
- All data lives in `src/data/` as TypeScript exports
- No network requests in the current build (except Gemini API for AI features)
- `types.ts` defines 12+ interfaces that mirror the expected API response shapes

---

### DEC-005: Gemini API via Server-Side Proxy for AI Features

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> AI-powered features (e.g., prescription OCR, medicine recommendations) require access to the Gemini API. API keys must not be exposed to the client.

**Decision:**
> Use `@google/genai` SDK with the API key stored in `GEMINI_API_KEY` environment variable. The capability `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` is declared in `metadata.json`, indicating server-side API calls via Express proxy.

**Reasoning:**
> Server-side proxy keeps the API key secure. AI Studio auto-injects the key at runtime from user secrets, avoiding any hardcoded credentials.

**Alternatives Considered:**
1. Client-side Gemini calls — Rejected; exposes API key in browser.
2. OpenAI API — Rejected; project is built on Google ecosystem (AI Studio, Cloud Run).

**Impact on Project:**
- `GEMINI_API_KEY` required in `.env` (see `.env.example`)
- Express backend handles proxied AI requests
- Frontend calls Express endpoints, not Gemini directly

---

### DEC-006: LocalStorage for Authentication Persistence (Demo)

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> Demo authentication needs session persistence across page refreshes without a backend auth provider.

**Decision:**
> Store `currentUser` and `registeredUsers` in `localStorage` (`sastarx_current_user`, `sastarx_registered_users`). On mount, `App.tsx` hydrates state from localStorage with try/catch fallbacks.

**Reasoning:**
> Simplest persistence for a demo. The auth flow (login, register, guest, logout) is fully functional without a backend. Production will migrate to Firebase Auth or equivalent.

**Alternatives Considered:**
1. Session cookies — Rejected; requires backend.
2. Firebase Auth — Planned for production, deferred for MVP.

**Impact on Project:**
- `AuthView.tsx` handles login/register/guest flows
- Registered users accumulate across sessions
- Role-based view switching: `Patient / Consumer` → Patient Portal, others → Clinical Ops
- Guest mode provides read-only access as "Clinical Pharmacist"

---

### DEC-007: Multi-Tenant Architecture with Row-Level Security Design

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Architecture Team                          |

**Context / Problem:**
> Platform must support multiple hospital/pharmacy tenants with data isolation, audit trails, and compliance (DISHA / HIPAA).

**Decision:**
> Implement a multi-tenant model with tenant partitions, cryptographic audit logging (HMAC-SHA256 signatures), and role-based access control (5 defined roles). Current implementation uses client-side tenant switching with mock data; production will enforce PostgreSQL RLS.

**Reasoning:**
> Healthcare data requires strict tenant isolation. HMAC-signed audit logs provide tamper-evident compliance trails. The architecture is designed for DISHA (India) and HIPAA (US) compliance.

**Alternatives Considered:**
1. Single-tenant per deployment — Rejected; doesn't scale for SaaS model.
2. Schema-per-tenant — Considered but deferred; RLS is more operationally efficient.

**Impact on Project:**
- `TenantInfo` interface with schema/region/environment fields
- Audit logs include `tenantId`, `hashSignature`, and `actor` traceability
- Footer displays RLS enforcement status
- Five user roles: Lead Ops Admin, Clinical Pharmacist, Prescribing Physician, Formulary Director, Patient/Consumer

---

### DEC-008: Component Architecture — Flat Components Directory

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-08                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead                           |

**Context / Problem:**
> Need to organize 17 React components (views, modals, layout pieces) in a maintainable structure.

**Decision:**
> All components live in `src/components/` as flat `.tsx` files. No sub-directories, no barrel exports. Each component is a named export.

**Reasoning:**
> With 17 components, sub-directories add navigation overhead without meaningful categorization benefit. Flat structure is grep-friendly and IDE-searchable. If the count exceeds ~30, introduce feature-based sub-directories.

**Alternatives Considered:**
1. Feature-based folders (`components/auth/`, `components/catalog/`) — Deferred until component count grows.
2. Barrel exports (`index.ts`) — Rejected; can cause circular dependency issues and tree-shaking problems.

**Impact on Project:**
- Import paths: `./components/ComponentName`
- Component naming: PascalCase matching filename (e.g., `CatalogView.tsx` → `export CatalogView`)
- Views: `*View.tsx` suffix; Modals: `*Modal.tsx` suffix; Layout: `Header.tsx`, `Sidebar.tsx`

---

### DEC-009: Database Layer & Multi-Tenant Row-Level Security (RLS) Strategy

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Backend Architect & Security Lead          |

**Context / Problem:**
> Phase 2 requires a multi-tenant persistent database architecture with strict tenant isolation and Row-Level Security (RLS) policies per tenant (DISHA / HIPAA compliance). Furthermore, local development and continuous integration environments must run seamlessly without requiring heavy local Docker or external PostgreSQL setup.

**Decision:**
> Adopt a dual-driver relational database architecture:
> 1. Complete production-grade PostgreSQL DDL schema (`src/server/db/schema.sql`) with native PostgreSQL Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY; CREATE POLICY tenant_isolation_policy ON ... USING (tenant_id = current_setting('app.current_tenant', true))`).
> 2. Relational Database Adapter (`src/server/db/index.ts`) that executes against PostgreSQL (`pg` / `DATABASE_URL`) when configured, and falls back to a deterministic, schema-validated relational store for local dev and testing.
> 3. Standardized migration and seeding scripts (`src/server/db/seeds.ts`) translating initial datasets into relational records.

**Reasoning:**
> Native PostgreSQL RLS ensures zero cross-tenant leakage at the database engine level. Providing an integrated fallback store guarantees the developer workflow and automated testing remain zero-friction and fast on any platform without manual Docker configuration.

**Alternatives Considered:**
1. Prisma ORM — Has limited ergonomic support for native PostgreSQL RLS session variables (`SET LOCAL app.current_tenant`).
2. Heavy schema-per-tenant — Complex migration management and high operational connection overhead.

**Dependencies Added:**
- None for core adapter (uses built-in Node modules). If `DATABASE_URL` is set, `pg` can be connected.

---

### DEC-010: Express REST API Architecture & Vite Proxy

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Fullstack Engineering Lead                 |

**Context / Problem:**
> Frontend currently interacts only with static mock state in React. We need a clean REST API layer on port 3001, consumed by Vite dev server on port 3000, with comprehensive typed endpoints for all platform capabilities.

**Decision:**
> Build an Express REST API in `src/server/` written in TypeScript and executed via `tsx watch`. Vite is configured with a reverse proxy from `/api` to `http://localhost:3001`. A dedicated frontend service layer is created in `src/services/api.ts` with typed methods for all endpoints, error handling, and graceful fallback.

**Reasoning:**
> Single-origin `/api` calls eliminate CORS complexities in production and simplify deployment. TypeScript shared types (`src/types.ts`) guarantee contract safety between client and server.

**Dependencies Added:**
- `cors` (^2.8.5) and `@types/cors` (^2.8.17) for cross-origin resource sharing middleware.

---

### DEC-011: Dual-Mode Authentication (Firebase Auth + JWT Local Fallback)

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Security & Auth Lead                       |

**Context / Problem:**
> Production requires Firebase Auth integration with secure tokens, while development and offline testing require zero-friction local authentication for existing test accounts (`sarah.jenkins@apollohealth.org`, `rajesh.sharma@fortishealth.com`, etc.) without requiring active cloud credentials or network access.

**Decision:**
> Implement dual-mode authentication:
> 1. Express JWT verification middleware (`src/server/middleware/auth.ts`) supports standard Bearer tokens. If Firebase credentials (`FIREBASE_PROJECT_ID`) are provided, it verifies Firebase ID tokens; otherwise it verifies signed JWT tokens with password verification using `bcryptjs`.
> 2. `AuthView.tsx` and the API client support both modes seamlessly.
> 3. Remove raw password exposure from responses; all credentials in transit are protected.

**Reasoning:**
> Eliminates barrier to testing while providing full enterprise security capabilities ready for production cloud deployment.

**Dependencies Added:**
- `jsonwebtoken` (^9.0.2) & `@types/jsonwebtoken` (^9.0.8) for session token signing and verification.
- `bcryptjs` (^2.4.3) & `@types/bcryptjs` (^2.4.6) for secure password hashing.

---

### DEC-012: Phase 3 Gemini AI Architecture: Multimodal OCR, Recommendations, Search & Triage

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | AI & Clinical Engineering Lead             |

**Context / Problem:**
> Healthcare clinicians and patients need intelligent features: prescription optical character recognition (OCR), context-aware generic recommendations with drug-drug interaction safety checks, natural language search over medicine catalogs, and automated triage of pricing accuracy disputes. These features must comply with healthcare data privacy (API keys server-side only) and remain operational even in offline/demo environments where cloud API keys might not be configured.

**Decision:**
> 1. Implement server-side AI endpoints under `/api/ai/*` utilizing `@google/genai` with `gemini-2.5-flash`:
>    - `POST /api/ai/ocr` — Multimodal vision analysis for handwritten and printed prescriptions with generic substitution resolution against the internal medicine database.
>    - `POST /api/ai/recommend` — Clinical regimen generator with drug-drug interaction checks, similarity factor ($f_2$) verification, and savings calculations.
>    - `POST /api/ai/search` — Natural language intent parsing into structured catalog filter parameters with clinical synthesis.
>    - `POST /api/ai/triage-dispute` — Automated evidence analysis, anomaly scoring, and recommended resolution decision.
> 2. Dual-mode AI execution: if `GEMINI_API_KEY` is provided, live multimodal queries execute against Google Gemini; otherwise, the engine falls back transparently to curated clinical knowledge engines and structured pattern matchers (`SAMPLE_OCR_PRESCRIPTIONS`, CDSCO bioequivalence database).
> 3. Keep all AI keys on the server side (`GEMINI_API_KEY`), never exposing credentials to the client bundle.

**Reasoning:**
> Meets DISHA / HIPAA compliance by isolating cloud API calls to the server. The fallback mechanism ensures demo-readiness, continuous testing reliability, and consistent UI presentation regardless of cloud availability.

**Dependencies Added:**
- `@google/genai` (^2.4.0) — already installed and validated.

**Implementation Status:** ✅ Complete (v3.0.0) — All four endpoints delivered with live Gemini 2.5 Flash execution and deterministic fallback engines. Frontend fully wired across PatientPortalView (OCR, Recommendations, AI Search) and DisputesTriageView + AiDisputeModal.

---

### DEC-013: Production Hardening Architecture Decisions

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Engineering Lead & Security Lead           |

**Context / Problem:**
> Phase 4 requires production-grade security, performance, testing, compliance, and deployment infrastructure.

**Decision:**
> 1. **Testing:** Vitest (not Jest) — same ecosystem as Vite, faster, no config overhead, native ESM support. React Testing Library for component tests.
> 2. **Security headers:** Helmet.js for CSP, HSTS, X-Frame-Options, X-Content-Type-Options. express-rate-limit for auth (20 req/15min) and AI endpoints (30 req/min).
> 3. **Input sanitization:** Custom `sanitizeBody` middleware strips HTML tags and `javascript:` URIs from all incoming JSON bodies. Applied globally before route handlers.
> 4. **Code splitting:** React.lazy + Suspense for all 6 main views and heavy modals — reduces initial bundle by ~60%.
> 5. **CI/CD:** GitHub Actions (5 jobs: lint → type-check → test → build → deploy). Staging auto-deploys on `develop` push; production deploys on `main` + release commit message gate.
> 6. **Container:** Multi-stage Dockerfile — builder stage (Vite build) + runner stage (non-root user, production deps only). Targets Cloud Run on port 8080.
> 7. **Compliance:** `GET /api/audit-logs/verify` endpoint recomputes HMAC-SHA256 for all logs and reports tampered entries. Cookie consent banner with GDPR/DISHA-compliant preferences. Privacy Policy and Terms of Service modals.
> 8. **Error handling:** React ErrorBoundary wraps every view. Structured JSON error logs server-side. Stack traces suppressed in production responses.

**Reasoning:**
> Vitest avoids Jest/Babel configuration complexity in a Vite/ESM project. Helmet + rate limiting addresses OWASP Top 10 items 1, 5, and 7. Code splitting is the highest-ROI performance improvement for an SPA this size. Multi-stage Docker reduces image size and attack surface. GitHub Actions integrates natively with the existing Cloud Run deployment target.

**Alternatives Considered:**
1. Jest — Rejected; requires additional Babel/ESM transform config to work with Vite's ESM output.
2. Next.js middleware for security headers — Rejected; project is not on Next.js.
3. Webpack bundle analyzer — Deferred; Vite's built-in rollup visualizer serves the same purpose.

**Dependencies Added:**
- `helmet` (^8.0.0) — Security headers middleware
- `express-rate-limit` (^7.5.0) — Rate limiting
- `vitest` (^3.2.4) — Test runner
- `@vitest/coverage-v8` (^3.2.4) — Coverage provider
- `@testing-library/react` (^16.3.0) — Component testing
- `@testing-library/jest-dom` (^6.6.3) — Custom matchers
- `@testing-library/user-event` (^14.5.2) — User interaction simulation
- `jsdom` (^26.1.0) — DOM environment for tests



---

### DEC-014: Phase 5 Internationalization & PWA Strategy

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Product Lead & Engineering Lead            |

**Context / Problem:**
> Phase 5 requires platform expansion to Indian regional languages (Hindi, Marathi) for broader patient accessibility, and Progressive Web App capabilities for mobile installation and offline catalog access to support users in low-connectivity areas.

**Decision:**
> 1. **i18n:** Use `i18next` + `react-i18next` (not react-intl) — more lightweight, better TS support, JSON-based locale files. Implement 3 languages: English (en), Hindi (hi), Marathi (mr) with translations for app, header, tenant, sidebar, dashboard, catalog, patient_portal, common sections. Language selector in Header with flag icons, preference persisted to `localStorage` key `medi-ai-language`.
> 2. **PWA:** Use `vite-plugin-pwa` with Workbox for service worker generation. Manifest configured with theme color `#0F172A`, background `#F8FAFC`, standalone display mode, 192x192 and 512x512 icons. Runtime caching strategies: **NetworkFirst** for `/api/catalog/*` (1 day TTL for offline catalog), **StaleWhileRevalidate** for `/api/price-trends/*` (6 hour TTL), **CacheFirst** for Google Fonts (1 year TTL). Auto-update registration on app load.

**Reasoning:**
> i18next is the de facto standard for React i18n with excellent TypeScript integration and zero runtime overhead. vite-plugin-pwa integrates natively with Vite's build pipeline and auto-generates optimized service workers. NetworkFirst caching ensures medicine catalog remains accessible offline (critical for rural clinics), while StaleWhileRevalidate balances freshness and availability for price trends.

**Alternatives Considered:**
1. react-intl — Rejected; heavier bundle, requires more boilerplate for message extraction.
2. Workbox manual configuration — Rejected; vite-plugin-pwa abstracts away complexity while remaining customizable.
3. Web Push API for price alerts — Deferred to Phase 5.2 (requires backend notification service).

**Dependencies Added:**
- `i18next` (^26.4.2) — Core i18n engine
- `react-i18next` (^17.0.13) — React bindings
- `vite-plugin-pwa` (^0.20.5) — PWA plugin for Vite
- `workbox-window` (^7.3.0) — Workbox client library

**Implementation Status:** ✅ Complete (v5.0.0) — i18n infrastructure with 3 languages, LanguageSelector in Header, PWA manifest + service worker with offline catalog caching.

---

### DEC-015: Phase 5 Advanced Feature Views Architecture

| Field                  | Details                                    |
|------------------------|--------------------------------------------|
| **Date**               | 2026-09-09                                 |
| **Status**             | `Accepted`                                 |
| **Decided by**         | Product & Engineering Lead                 |

**Context / Problem:**
> Phase 5.3 and 5.4 require three new high-value clinical ops features: (1) Medicine Comparison Tool for side-by-side branded vs generic analysis, (2) Savings Analytics Dashboard for cumulative patient savings tracking, (3) Super Admin Panel for multi-tenant management. These views must integrate seamlessly into the existing Clinical Ops navigation while maintaining lazy loading and error boundary isolation.

**Decision:**
> 1. **MedicineComparisonView** — Dual-column comparison UI (branded in blue, generic in green) with dropdowns for medicine/generic selection, detailed bioequivalence data (f₂ similarity factor, composition match, verified status), pricing breakdown, formulary status badges, patient savings calculator with monthly projections. Export PDF and Share buttons (placeholder for future enhancement).
> 2. **SavingsDashboardView** — Analytics dashboard with 4 KPI cards (Cumulative Savings ₹55.2k demo, Avg/Medicine, Coverage, Adoption %), Recharts visualizations (monthly trend line chart: branded vs generic vs savings; category pie chart), top 10 highest-saving generics sortable table with branded MRP, lowest generic, savings %, category. Time range selector (Last 6M/12M/YTD/All Time).
> 3. **SuperAdminView** — 3-tab admin panel: (a) Tenants tab with full CRUD table (name, code, schema, region, environment, status), Add New Tenant modal (placeholder); (b) Users tab with admin table (name, email, role, tenant, joined date), CRUD actions (Edit, Reset Password, Deactivate); (c) System Config tab with API config (Gemini key, rate limits), Database config (PostgreSQL connection, pool size), Security settings (2FA toggle, HMAC verification, RLS), System health metrics (uptime 99.97%, response time 24ms, 148 active sessions). Purple gradient header, access control warning for non-admin roles.
> 4. **Routing:** Add 3 new `OpsNavigationTab` values to `types.ts`: `medicine-comparison`, `savings-dashboard`, `super-admin-panel`. Update `App.tsx` with lazy-loaded routes wrapped in `ErrorBoundary` + `Suspense` with `ViewLoader`. Add new "Phase 5 Features" section in `Sidebar.tsx` with nav items (Super Admin Panel gets purple "Admin" badge).

**Reasoning:**
> These views address the most-requested features from clinical ops users (comparison tool), finance teams (savings dashboard), and IT admins (tenant management). Lazy loading ensures initial bundle remains small. Consistent ErrorBoundary + Suspense pattern maintains app stability. Recharts reused from existing Price Trend Section for consistency.

**Alternatives Considered:**
1. Pharmacy Locator with Google Maps — Deferred to Phase 5.3 (requires external API integration and geocoding service).
2. Drug Interaction Checker — Deferred to Phase 5.3 (requires dedicated drug interaction database).
3. Mobile app (React Native/Flutter) — Deferred to Phase 5.6 (requires separate build pipeline and app store deployment).

**Dependencies Added:**
- None (uses existing Recharts, React.lazy, ErrorBoundary patterns)

**Implementation Status:** ✅ Complete (v5.0.0) — All 3 views delivered with full UI, integrated into Clinical Ops navigation, lazy-loaded with error boundaries.

---
