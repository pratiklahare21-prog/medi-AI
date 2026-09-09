# 📝 Changelog

> **Purpose:** Chronological history of all project changes. AI assistants must update this file after every meaningful change. Follows [Keep a Changelog](https://keepachangelog.com/) format.

---

## Versioning

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR** — Breaking changes to the data model, auth flow, or tenant architecture
- **MINOR** — New features, views, or components
- **PATCH** — Bug fixes, UI tweaks, refactors

---

## [Unreleased]

_Changes that are in development but not yet tagged._

---

## [5.0.0] — 2026-09-09

### Added

**5.1 — Internationalization (i18n)**
- `i18next` + `react-i18next` dependency for multi-language support
- `src/i18n/index.ts` — i18n configuration with localStorage persistence
- `src/i18n/locales/en.json` — English translations for app, header, tenant, sidebar, dashboard, catalog, patient_portal, common sections
- `src/i18n/locales/hi.json` — Hindi (हिंदी) translations for all UI sections
- `src/i18n/locales/mr.json` — Marathi (मराठी) translations for all UI sections
- `src/components/LanguageSelector.tsx` — Language dropdown with flag icons, integrated into Header
- Language preference persisted to `localStorage` key `medi-ai-language`

**5.2 — Progressive Web App (PWA)**
- `vite-plugin-pwa` dependency and configuration in `vite.config.ts`
- Web app manifest with theme color `#0F172A`, background `#F8FAFC`, standalone display mode
- PWA icons: `pwa-192x192.png`, `pwa-512x512.png` (placeholder assets)
- Service worker with Workbox runtime caching:
  - **CacheFirst** for Google Fonts (1 year TTL)
  - **NetworkFirst** for `/api/catalog/*` (1 day TTL, offline catalog access)
  - **StaleWhileRevalidate** for `/api/price-trends/*` (6 hour TTL)
- PWA meta tags in `index.html`: `theme-color`, `apple-mobile-web-app-capable`, `apple-touch-icon`
- Auto-update registration, installable on mobile/desktop

**5.3 — Advanced Features**
- `src/components/MedicineComparisonView.tsx` — Side-by-side branded vs generic comparison tool:
  - Dual-column layout (branded blue, generic green)
  - Detailed bioequivalence data: f₂ similarity factor, composition match, verified status
  - Pricing breakdown: MRP vs generic price, savings calculator
  - Formulary status badges (Tier 1 Primary, Preferred, Standard, Restricted)
  - Patient savings summary card with monthly projections
  - Export PDF Report and Share buttons (placeholder)
- `src/components/SavingsDashboardView.tsx` — Comprehensive savings analytics:
  - 4 KPI cards: Cumulative Savings (₹55,200 6-month demo), Avg Savings/Medicine, Medicines Covered, Patient Adoption (87.4%)
  - **Recharts visualizations**: Monthly trend line chart (branded vs generic vs savings), category pie chart
  - Top 10 highest-saving generics table with branded MRP, lowest generic, savings %, category
  - Time range selector (Last 6 Months, Last 12 Months, YTD, All Time)

**5.4 — Partner & Admin Portals**
- `src/components/SuperAdminView.tsx` — Multi-tenant super admin control panel:
  - **Tenants Tab**: Full tenant management table (name, code, schema, region, environment, status), Add New Tenant modal (placeholder)
  - **Users Tab**: User administration table (name, email, role, tenant, joined date), role-based badges, CRUD actions (Edit, Reset Password, Deactivate)
  - **System Config Tab**: API configuration (Gemini API key, rate limits), Database config (PostgreSQL connection, pool size), Security settings (2FA, HMAC verification, RLS), System health metrics (uptime 99.97%, response time 24ms, 148 active sessions)
  - Purple gradient header with "All Systems Operational" badge
  - Access control warning for non-admin roles

**5.5 — Routing & Integration**
- 3 new `OpsNavigationTab` values in `types.ts`: `medicine-comparison`, `savings-dashboard`, `super-admin-panel`
- App.tsx routing: All 3 views lazy-loaded with `React.lazy`, wrapped in `ErrorBoundary` + `Suspense` with `ViewLoader`
- Sidebar.tsx: New "Phase 5 Features" section with 3 nav items (Medicine Comparison, Savings Dashboard, Super Admin Panel with purple Admin badge)
- Views accessible via Clinical Ops sidebar navigation

### Changed
- `package.json` version bumped to `5.0.0`
- Header now includes LanguageSelector between notifications and profile dropdown
- Main layout supports new Phase 5 views in clinical-ops mode

---

## [4.0.0] — 2026-09-09

### Added

**4.1 — Testing**
- `vitest.config.ts` — Vitest configuration with jsdom environment, React plugin, 80%/80%/70% coverage thresholds, and coverage exclusions
- `src/tests/setup.ts` — Global test setup: localStorage mock, fetch mock, console.warn suppression
- `src/tests/unit/businessLogic.test.ts` — 22 unit tests covering: savings calculation, formulary status tiers, price alert lifecycle (Active → Triggered → Paused), audit log tamper-evident structure and HMAC format, bioequivalence f2 thresholds, multi-tenant data isolation
- `src/tests/unit/security.test.ts` — 18 unit tests covering: input sanitization (HTML stripping, truncation), email validation, password policy, JWT format, HMAC-SHA256 pattern, rate limit config values, tenant ID injection protection
- `src/tests/unit/mockData.test.ts` — 30+ integrity tests validating all 9 mock data exports against TypeScript interface contracts at runtime
- `src/tests/unit/apiService.test.ts` — 12 tests covering token management, request header construction, fallback data shapes, and endpoint URL patterns
- `npm run test`, `npm run test:coverage`, `npm run test:watch`, `npm run test:ui` scripts

**4.2 — Security**
- `src/server/middleware/rateLimiter.ts` — `authRateLimiter` (20 req/15min), `aiRateLimiter` (30 req/min), `generalRateLimiter` (300 req/min); all skipped in `NODE_ENV=test`
- `src/server/middleware/sanitize.ts` — `sanitizeBody` middleware strips HTML tags, `javascript:` URIs, inline event handlers from all incoming JSON bodies; prototype pollution protection; `sanitizeInput` helper for individual field use
- `helmet.js` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-DNS-Prefetch-Control applied globally
- Rate limiters mounted: auth endpoints `authRateLimiter`, AI endpoints `aiRateLimiter`, all `/api/*` `generalRateLimiter`
- Structured JSON error logger in global Express error handler; stack traces suppressed in production

**4.3 — Performance**
- `React.lazy` + `Suspense` code-splitting for all 7 main views: DashboardView, CatalogView, PricingFeedsView, DisputesTriageView, MultiTenantConfigView, PatientPortalView, ArchitectureView
- Lazy loading for AddMedicineModal, LinkGenericModal, AiDisputeModal
- `ViewLoader` skeleton component for consistent loading states

**4.4 — Compliance**
- `GET /api/audit-logs/verify` — HMAC-SHA256 integrity verifier; recomputes expected signatures for all logs, reports `verified`/`tampered` counts and `tamperedIds`; `integrityStatus: CLEAN | COMPROMISED`; cites DISHA §7 / HIPAA §164.312(b)
- `src/components/LegalModal.tsx` — Privacy Policy and Terms of Service modal with DISHA/HIPAA/GDPR/CDSCO references, data retention policies, AI processing disclosure
- `src/components/CookieConsentBanner.tsx` — GDPR Art.13 / DISHA §8 compliant consent banner; Essential Only vs Accept All; links to Privacy Policy and Terms via custom DOM events
- `.env.example` — updated with all required keys, NODE_ENV, FIREBASE_PROJECT_ID documentation

**4.5 — CI/CD**
- `.github/workflows/ci.yml` — 5-job GitHub Actions pipeline: Lint+TypeCheck → Test+Coverage → Build → Deploy Staging (develop) → Deploy Production (main + release gate); concurrency cancel-in-progress; coverage artifact upload; `.env.example` key validation step
- `Dockerfile` — multi-stage (node:22-alpine builder + runner); non-root `sastarx` user; port 8080 for Cloud Run; production deps only in runner stage

**4.6 — Error Handling**
- `src/components/ErrorBoundary.tsx` — React class component catching all render errors per subtree; recovery card with Try Again / Reload; structured JSON error log in `componentDidCatch`; dev-only stack trace display; compliance error ID footer
- All 7 main views and 3 heavy modals wrapped with `<ErrorBoundary context="...">` in `App.tsx`
- `CookieConsentBanner` and `LegalModal` mounted in `App.tsx`

### Changed
- `src/server/index.ts` — helmet + sanitizeBody + rate limiters wired; structured JSON error handler replaces console.error
- `src/App.tsx` — all imports converted to `React.lazy`; Suspense wrappers added; ErrorBoundary wraps every view; legalModal state + window event listeners for privacy/terms; CookieConsentBanner and LegalModal added to render tree
- `package.json` — name updated to `medi-ai-sastarx`; version `3.0.0`; added helmet, express-rate-limit, vitest, @vitest/coverage-v8, @testing-library/* and jsdom; test scripts added
- `decisions.md` — DEC-013 added documenting all Phase 4 architectural decisions
- `.env.example` — expanded with NODE_ENV and FIREBASE_PROJECT_ID

---

## [3.0.0] — 2026-09-09

### Added
- **Prescription Vision AI Scanner (PatientPortalView)** — Full OCR pipeline with three demo presets (cardio, diabetic, gastric), real file upload (JPEG/PNG/PDF), Gemini 2.5 Flash Vision multimodal extraction when `GEMINI_API_KEY` is configured, and intelligent fallback to curated clinical sample data when offline
- **OCR Results Table** — Columns: detected brand, active salt + strength, dosage instructions, bioequivalent generic, brand MRP, generic price, savings (₹ + %), confidence badge; inline row editing for brand name and dosage corrections
- **OCR Cart Action** — "Add All Generics to Cart" with live totals (branded total → generic total → savings %) and "Scan Another" reset flow
- **AI Clinical Regimen Recommender (PatientPortalView)** — Three-field form (diagnosis, current medications, price sensitivity); calls `POST /api/ai/recommend`; renders summary panel, colour-coded drug-interaction safety card (Safe / Moderate Precaution / High Warning with evidence bullets), and per-medicine recommendation cards
- **Recommendation Cards** — Show f2 dissolution score, bioequivalence %, branded vs generic strip price, monthly savings, formulary tier, clinical rationale, and individual "Add to Cart" button
- **AI Natural Language Search (PatientPortalView)** — Dedicated purple "AI Search" button and Enter-key handler; calls `POST /api/ai/search`; renders result banner with parsed-intent badges (category + max-price ceiling) and Gemini explanation text
- **Gemini AI Dispute Auto-Triage** — `AiDisputeModal` wired end-to-end: "Gemini AI Auto-Triage & Evidence" button in `DisputesTriageView` header and per-dispute detail panel opens modal; modal fetches `POST /api/ai/triage-dispute`, displays anomaly score, AI confidence %, recommended clinical resolution, regulatory impact, and evidence trail; "Apply AI Recommendation" writes the resolution and commits an audit log entry
- **DEC-012 implemented** — All four Gemini AI endpoints (`/api/ai/ocr`, `/api/ai/recommend`, `/api/ai/search`, `/api/ai/triage-dispute`) fully operational with dual-mode execution (live Gemini 2.5 Flash ↔ deterministic fallback engine)

### Changed
- `PatientPortalView.tsx` — Complete rewrite fixing all broken field references (`prescribedBrand` → `extractedName`, `medicinesIncluded` → `medicines`, `brandedMrp/genericPrice` → `originalPrice/estimatedMonthlyPrice`, etc.); added AI Recommendations section; added AI search button and NL result banner; added Gemini branding badge on scanner section
- `App.tsx` — Imports and mounts `AiDisputeModal`; adds `aiTriageDispute` state; passes `onOpenAiTriage` to `DisputesTriageView`; version bumped to `v3.0.0-prod` in footer
- `src/server/index.ts` — Version bumped to `3.0.0`

### Fixed
- `handleRunSampleOcr` was undefined — now correctly calls `handleRunOcrPreset('cardio')`
- OCR results table used wrong field names from an old interface design — corrected to match `OCRDetectedMedicine` type
- `ChronicPack` cards used `medicinesIncluded`, `brandedMrp`, `savingsAmount` — corrected to `medicines`, `originalPrice`, computed savings
- `DisputesTriageView` had `onOpenAiTriage` prop typed but `App.tsx` never passed it or rendered `AiDisputeModal` — now fully wired

---

## [2.5.0] — 2026-09-09

### Added
- **TypeScript Express REST API (`src/server/index.ts`)** — High-performance backend on port 3001 serving all platform endpoints with CORS, request logging, and unified error handling
- **PostgreSQL Multi-Tenant Schema (`src/server/db/schema.sql`)** — Complete DDL for 8 tables with native PostgreSQL Row-Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) and tenant isolation policies (`app.current_tenant`)
- **Database Manager & Seeds (`src/server/db/index.ts`, `src/server/db/seeds.ts`)** — Dual-driver relational database adapter with pre-hashed BCrypt credentials, HMAC-SHA256 audit logging, and zero-config local development support
- **Dual-Mode Authentication & RBAC (`src/server/middleware/auth.ts`)** — Signed JWT tokens (`generateToken`, `verifyToken`), Bearer auth verification, and role-based access control middleware (`requireRole`)
- **Tenant Context Middleware (`src/server/middleware/tenant.ts`)** — Automatic partition scoping via `x-tenant-id` header and user session claims
- **Modular REST Routers (`src/server/routes/`)**:
  - `/api/auth` — Login, registration, token verification (`/me`), and logout
  - `/api/catalog` — Medicine catalog listing, search, additions, generic linking, and formulary status toggling
  - `/api/feeds` — Partner pricing feeds monitoring and manual scraper retry
  - `/api/disputes` — Accuracy disputes triage and clinical resolution
  - `/api/audit-logs` — Tamper-evident HMAC-SHA256 signed audit trails
  - `/api/tenants` — Hospital and pharmacy tenant partition listing
  - `/api/price-alerts` — Full price alert CRUD, pause/resume, and price drop simulation
  - `/api/price-trends` — Time-series pricing data and volatility metrics
  - `/api/health` — Service health and RLS partition status monitor
- **Frontend API Service Client (`src/services/api.ts`)** — Typed client connecting the React UI to backend endpoints with offline resilience
- **Vite Proxy Configuration (`vite.config.ts`)** — Automatic reverse proxy forwarding `/api/*` to `http://localhost:3001`
- **Architectural Decisions (DEC-009, DEC-010, DEC-011)** — Formally documented database RLS strategy, REST API architecture, and dual-mode auth

### Changed
- `App.tsx` — Hydrates state from backend API endpoints on mount and persists all mutations with optimistic UI updates
- `AuthView.tsx` — Connected to backend `api.login` and `api.register` with JWT token persistence
- `rules.md` — Updated folder structure to incorporate `src/server/` and `src/services/`
- `package.json` — Added `cors`, `jsonwebtoken`, `bcryptjs`, types, and `"server"` / `"server:watch"` scripts

---

## [2.4.0] — 2026-09-08

### Added
- **AuthView component** — Full authentication screen with login, registration, and guest access
- **User registration flow** — New users can register with role selection (5 clinical roles), license number, department, and phone
- **Guest mode** — "Continue as Guest" option providing read-only Clinical Pharmacist access
- **Session persistence** — User session stored in `localStorage` (`sastarx_current_user`, `sastarx_registered_users`)
- **Role-based view routing** — Patient/Consumer role auto-routes to Patient Portal; clinical roles route to Clinical Ops
- **Logout functionality** — Clear session, audit log entry, redirect to auth screen
- **DEFAULT_USERS** constant in mock data — Pre-seeded user accounts for demo purposes

### Changed
- `App.tsx` — Major refactor to integrate authentication state, user management, and session handling
- Header component — Added user profile display, logout action, and auth screen trigger

### Fixed
- N/A

---

## [2.3.0] — 2026-09-08

### Added
- **Price Alerts System** — Full CRUD for threshold-based price drop alerts
- **SetPriceAlertModal** — Configure new alerts or edit existing with target price, notification channel, and recipient
- **PriceAlertsDrawer** — Slide-out panel to manage all alerts (pause/resume, delete, simulate price drops)
- **Price drop simulation** — Test alert triggering by simulating market price changes
- **Alert status management** — Active → Triggered → Paused lifecycle with audit logging
- **INITIAL_PRICE_ALERTS** — Pre-seeded price alert mock data

### Changed
- `CatalogView` — Added "Set Alert" action button per medicine row
- `Header` — Added price alerts notification indicator with count badge
- `Sidebar` — Added price alerts count display

---

## [2.2.0] — 2026-09-08

### Added
- **PriceTrendSection** — Historical price trend visualization with Recharts
  - Line charts for branded MRP, lowest generic, average generic, Jan Aushadhi government price
  - Volatility index overlay
  - Market event annotations (API shortages, government policy changes)
- **priceTrendsData.ts** — 12-month time-series mock data for price trends and volatility summaries
- **MedicineVolatilitySummary** type — Interface for volatility analysis per medicine

---

## [2.1.0] — 2026-09-08

### Added
- **PatientPortalView** — Full patient-facing discovery portal
  - Medicine search with generic alternative comparison
  - Chronic Care Packs (Diabetes, Hypertension, Thyroid, Cardiac bundles)
  - Cart system with savings calculation
  - Safety & Help section
- **ChronicPack** type and `CHRONIC_PACKS` mock data
- **OCRDetectedMedicine** type for future prescription scanning

### Changed
- `App.tsx` — Added cart state management and patient portal routing

---

## [2.0.0] — 2026-09-08

### Added
- **Multi-tenant architecture** — Tenant partitions with schema isolation
  - 3 default tenants: Apollo Hospitals, Tata Health, SastaRx Direct
  - Tenant switching in header and config view
  - Schema/region/environment metadata per tenant
- **MultiTenantConfigView** — Tenant configuration panel with partition details
- **AuditLogModal** — Full audit trail viewer with HMAC-SHA256 hash signatures
- **Cryptographic audit logging** — `logAction()` helper generating tamper-evident log entries
- **Header** — Global navigation bar with tenant selector, search, anomaly alerts
- **Sidebar** — Clinical Ops navigation with tab routing and contextual counts
- **Footer** — Status bar showing CDSCO sync, schema, RLS enforcement, version

### Changed
- Elevated from single-tenant to multi-tenant data model across all components

---

## [1.2.0] — 2026-09-08

### Added
- **DisputesTriageView** — Accuracy dispute management with severity tiers (Critical, Warning, Low), SLA timers, and resolution actions
- **AccuracyDisputeItem** type with full dispute metadata
- **INITIAL_DISPUTES** mock data — 3 pre-seeded disputes

---

## [1.1.0] — 2026-09-08

### Added
- **PricingFeedsView** — Partner feed monitoring dashboard
  - 4 feed sources: 1mg Realtime API, PharmEasy Catalog, Jan Aushadhi Govt Feed, SastaRx In-House
  - Status indicators: Healthy, Syncing, Stale, Degraded
  - Retry/resync with simulated recovery (2-second delay)
- **PricingPartnerFeed** type with SLA and performance metrics

---

## [1.0.0] — 2026-09-08

### Added
- **DashboardView** — Clinical operations dashboard with KPI overview
- **CatalogView** — Medicine & Salt catalog with searchable/filterable data table
  - Expandable generic equivalents list per medicine
  - Bioequivalence confidence scores and formulary status badges
  - Toggle generic inclusion in patient Rx
- **BioavailabilityModal** — Dissolution curve visualization
- **AddMedicineModal** — Form for registering new medicines
- **LinkGenericModal** — Form for linking generic compounds to branded medicines
- **ArchitectureView** — System architecture visualization
- **Type system** — 12+ interfaces in `types.ts` covering all domain entities
- **Mock data layer** — `mockData.ts` with 6 medicine entries, 4 feeds, 3 tenants, audit logs
- **Custom typography** — 8 font utility classes (display, headline, body, code, label, table)
- **Responsive design** — Mobile/tablet/desktop layouts
- **SEO optimization** — Open Graph, Twitter Card, meta tags

---

## [0.0.0] — 2026-09-08

### Added
- Initial project scaffold via Vite + React + TypeScript template
- Tailwind CSS v4 configuration via `@tailwindcss/vite` plugin
- TypeScript configuration (`tsconfig.json`) with bundler module resolution
- Vite configuration with React plugin, path aliases, and HMR controls
- `.env.example` with `GEMINI_API_KEY` and `APP_URL` placeholders
- `.gitignore` for node_modules, build artifacts, and env files
- Google Fonts integration (Inter, Plus Jakarta Sans, JetBrains Mono, Material Symbols)

---

## Summary Statistics

| Metric                    | Value     |
|---------------------------|-----------|
| Total versions released   | 6         |
| Components                | 18        |
| TypeScript interfaces     | 14+       |
| Mock data files           | 2         |
| Lines of TypeScript       | ~9,000+   |
| npm dependencies          | 13        |
| npm devDependencies       | 7         |
| AI endpoints (Phase 3)    | 4         |
| Gemini model              | gemini-2.5-flash (vision + text) |
