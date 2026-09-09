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
