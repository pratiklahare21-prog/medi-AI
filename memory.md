# 🧠 Project Memory — medi AI / SastaRx Ops & Discovery Platform

> **Purpose:** Long-term project context for AI assistants. This file is the single source of truth for what the project is, what's been built, what's pending, and how things work. **Update this file whenever project state changes.**

---

## 1. Project Overview

**Name:** medi AI — SastaRx Ops & Discovery Platform  
**Repository:** `medi-AI`  
**Description:** Multi-tenant clinical operations control center and patient generic medicine bioequivalence discovery platform with reliable cost comparisons.

**Core Value Proposition:**
- **For clinical ops teams:** Manage medicine catalogs, monitor pricing feeds, resolve accuracy disputes, and maintain DISHA/HIPAA-compliant audit trails across multiple hospital/pharmacy tenants.
- **For patients:** Discover verified generic alternatives to expensive branded medicines, compare prices, set price drop alerts, and access chronic care packs — all backed by bioequivalence data.

**Deployment Target:** Google AI Studio → Cloud Run  
**Current Version:** `v3.0.0-prod` (displayed in app footer)

---

## 2. Tech Stack

| Layer            | Technology                          | Version    |
|------------------|-------------------------------------|------------|
| **Framework**    | React                               | ^19.0.1    |
| **Language**     | TypeScript                           | ~5.8.2     |
| **Build Tool**   | Vite                                 | ^6.2.3     |
| **Styling**      | Tailwind CSS (Vite plugin)           | ^4.1.14    |
| **Icons**        | Lucide React                         | ^0.546.0   |
|                  | Material Symbols Outlined (Google)   | CDN        |
| **Animation**    | Motion (Framer Motion successor)     | ^12.23.24  |
| **Charts**       | Recharts                             | ^3.10.1    |
| **AI / LLM**     | @google/genai (Gemini API)           | ^2.4.0     |
| **Backend**      | Express                              | ^4.21.2    |
| **Env Config**   | dotenv                               | ^17.2.3    |
| **Package Mgr**  | npm (bun.lock also present)          | —          |
| **Fonts**        | Inter, Plus Jakarta Sans, JetBrains Mono | Google Fonts CDN |

### Dev Dependencies

| Package          | Purpose                              | Version    |
|------------------|--------------------------------------|------------|
| `typescript`     | Type checking                        | ~5.8.2     |
| `@types/node`    | Node.js type definitions             | ^22.14.0   |
| `@types/express` | Express type definitions             | ^4.17.21   |
| `esbuild`        | Fast JS/TS compilation               | ^0.25.0    |
| `tsx`            | TypeScript execution for scripts     | ^4.21.0    |
| `autoprefixer`   | CSS vendor prefixing                 | ^10.4.21   |

### NPM Scripts

| Script    | Command                            | Purpose                    |
|-----------|-------------------------------------|----------------------------|
| `dev`     | `vite --port=3000 --host=0.0.0.0`  | Start dev server           |
| `build`   | `vite build`                        | Production build           |
| `preview` | `vite preview`                      | Preview production build   |
| `clean`   | `rm -rf dist server.js`            | Clean build artifacts      |
| `lint`    | `tsc --noEmit`                      | Type-check without emitting|

---

## 3. Features Completed ✅

### Clinical Ops Mode (`clinical-ops`)

- [x] **Dashboard & Analytics** — KPI cards, feed status overview, quick actions, tenant context display
- [x] **Medicine & Salt Catalog** — Searchable/filterable data table with 6+ medicine entries, expandable generic lists, bioequivalence confidence scores, formulary status badges
- [x] **Bioavailability Modal** — Dissolution curve visualization for medicine bioequivalence data
- [x] **Add Medicine Modal** — Form to register new compound entries into the catalog
- [x] **Link Generic Modal** — Link new generic bioequivalent compounds to existing branded medicines
- [x] **Pricing Feeds & Partners** — Live status monitoring for 4 pricing feed sources (API, catalog, government), retry/resync functionality with simulated recovery
- [x] **Accuracy Reports & Disputes Triage** — Dispute cards with severity levels, SLA timers, resolution workflow
- [x] **Multi-Tenant Config & Audit Logs** — Tenant partition selector, cryptographic audit log viewer (HMAC-SHA256 signed entries)
- [x] **Audit Log Modal** — Full audit trail viewer accessible from header
- [x] **Price Trend Section** — Historical price trend charts with volatility analysis, market event annotations
- [x] **Sidebar Navigation** — Collapsible sidebar with tab navigation, dispute/alert counts, user info

### Patient Portal Mode (`patient-portal`)

- [x] **Search & Compare** — Medicine search with generic alternative discovery
- [x] **Chronic Care Packs** — Pre-configured medicine bundles for chronic conditions (Diabetes, Hypertension, Thyroid, Cardiac)
- [x] **Price Alerts** — Set threshold-based price drop alerts per medicine, multiple notification channels (In-App, SMS/WhatsApp, Email)
- [x] **Price Alerts Drawer** — Manage all active alerts, pause/resume, delete, simulate price drops
- [x] **Set Price Alert Modal** — Configure new alerts or edit existing ones with threshold pricing
- [x] **Cart System** — Add generics to cart with running savings calculation
- [x] **Safety & Help** — Patient safety information section

### System Architecture View (`system-architecture`)

- [x] **Architecture View** — Visual representation of the multi-tenant SaaS system architecture

### Authentication & Authorization

- [x] **Login Flow** — Email/password authentication against registered user list
- [x] **Registration Flow** — New user registration with role selection, license number, department, phone
- [x] **Guest Mode** — "Continue as Guest" for read-only clinical pharmacist access
- [x] **Session Persistence** — localStorage-based session with hydration on mount
- [x] **Role-Based View Routing** — Patients auto-routed to Patient Portal; clinical roles to Ops
- [x] **Logout** — Clear session, redirect to auth screen, audit log entry

### Cross-Cutting

- [x] **Global Search** — Header search bar with auto-routing to catalog view
- [x] **Tenant Switching** — Switch between 3 tenants (Apollo Hospitals, Tata Health, SastaRx Direct)
- [x] **Cryptographic Audit Logging** — All state-mutating actions logged with HMAC-SHA256 signatures
- [x] **Responsive Design** — Mobile/tablet/desktop layouts via Tailwind responsive utilities
- [x] **Custom Typography System** — 8 font utility classes for consistent typography
- [x] **SEO Meta Tags** — Open Graph, Twitter Card, favicon, meta description
- [x] **Footer Status Bar** — CDSCO sync status, schema display, RLS enforcement, version number

### AI-Powered Features (Phase 3)

- [x] **Prescription OCR Scanner** — File upload + demo presets (cardio/diabetic/gastric) → Gemini Vision 2.5 Flash → medicine detection table with confidence scores, inline editing, savings calculation, add-all-to-cart
- [x] **AI Clinical Regimen Recommender** — Diagnosis + current medications + price sensitivity → generic regimen with drug-drug interaction safety check (colour-coded Safe/Warning/Critical), f2 scores, monthly savings, individual add-to-cart per card
- [x] **AI Natural Language Search** — NL intent parser in Patient Portal: price ceiling detection (`under ₹100`), therapeutic category recognition, Gemini explanation banner with parsed-intent badges
- [x] **AI Dispute Auto-Triage** — `AiDisputeModal` fully wired: anomaly score, AI confidence %, recommended clinical resolution, regulatory impact, evidence trail, one-click "Apply AI Recommendation"

---

## 4. Pending Features 🔲

### High Priority

- [x] **Backend API Layer** — Express REST API + PostgreSQL RLS schema complete (Phase 2)
- [x] **Prescription OCR Scanner** — Camera/file upload → Gemini Vision → medicine extraction with confidence scores, inline editing, add-all-to-cart
- [x] **AI Clinical Regimen Recommender** — Condition + current medications → bioequivalent generic regimen with drug-drug interaction safety check, f2 scores, monthly savings
- [x] **AI Natural Language Search** — NL intent parsing (price ceiling + therapeutic category) with Gemini explanation banner
- [x] **AI Dispute Auto-Triage** — `AiDisputeModal` with anomaly score, confidence %, evidence trail, one-click apply resolution
- [ ] **Firebase Authentication** — Replace localStorage auth with Firebase Auth
- [ ] **Database Schema Migration** — Connect live PostgreSQL instance with seeded RLS policies
- [ ] **Real-Time Pricing Feeds** — WebSocket/polling integration with pharmacy APIs

### Medium Priority

- [ ] **Medicine Comparison View** — Side-by-side branded vs. generic comparison
- [ ] **User Profile Management** — Edit profile, change password, preferences
- [ ] **Notification System** — In-app notifications for price alerts, dispute updates
- [ ] **Export Functionality** — Real CSV/JSON export for catalog and audit logs
- [ ] **Pharmacy Locator** — Map integration to find nearby pharmacies with stock

### Low Priority

- [ ] **Dark Mode** — Toggle dark theme support
- [ ] **Internationalization (i18n)** — Hindi, Marathi language support
- [ ] **PWA Support** — Offline capability, install prompt
- [ ] **Unit & Integration Tests** — Jest + React Testing Library test suite
- [ ] **Performance Monitoring** — Web Vitals tracking, error boundary logging
- [ ] **Admin Panel** — Super-admin for managing tenants, users, system config

---

## 5. API Endpoints

> **Current Status:** Fully operational TypeScript Express REST API (`src/server/index.ts`) on port 3001 with Vite reverse proxy configured for `/api/*`. Live endpoints for Auth, Catalog, Generics, Feeds, Disputes, Audit Logs, Tenants, Price Alerts, and Price Trends.

### Active REST API

| Method | Endpoint                              | Purpose                          | Status |
|--------|---------------------------------------|----------------------------------|--------|
| POST   | `/api/auth/login`                     | User authentication & JWT issue  | ✅ Live |
| POST   | `/api/auth/register`                  | New user registration            | ✅ Live |
| GET    | `/api/auth/me`                        | Current authenticated session    | ✅ Live |
| POST   | `/api/auth/logout`                    | Invalidate session token         | ✅ Live |
| GET    | `/api/catalog`                        | List medicine catalog (search)   | ✅ Live |
| POST   | `/api/catalog`                        | Add new medicine                 | ✅ Live |
| GET    | `/api/catalog/:id/generics`           | Get generics for a medicine      | ✅ Live |
| POST   | `/api/catalog/:id/generics`           | Link new generic compound        | ✅ Live |
| PATCH  | `/api/catalog/:medId/generics/:genId` | Toggle generic formulary status  | ✅ Live |
| GET    | `/api/feeds`                          | List pricing partner feeds       | ✅ Live |
| POST   | `/api/feeds/:id/retry`               | Trigger feed scraper resync      | ✅ Live |
| GET    | `/api/disputes`                       | List accuracy disputes           | ✅ Live |
| POST   | `/api/disputes/:id/resolve`           | Resolve a dispute with decision  | ✅ Live |
| GET    | `/api/audit-logs`                     | List HMAC-signed audit logs      | ✅ Live |
| POST   | `/api/audit-logs`                     | Append tamper-evident audit log  | ✅ Live |
| GET    | `/api/tenants`                        | List available hospital tenants  | ✅ Live |
| GET    | `/api/price-alerts`                   | List price drop alerts           | ✅ Live |
| POST   | `/api/price-alerts`                   | Create new price alert           | ✅ Live |
| PATCH  | `/api/price-alerts/:id`               | Update/pause/resume alert        | ✅ Live |
| DELETE | `/api/price-alerts/:id`               | Delete price alert               | ✅ Live |
| POST   | `/api/price-alerts/:id/simulate-drop` | Simulate market generic drop     | ✅ Live |
| GET    | `/api/price-trends`                   | Volatility summaries             | ✅ Live |
| GET    | `/api/price-trends/:medId`            | Historical price trend data      | ✅ Live |
| GET    | `/api/health`                         | Service health & RLS monitor     | ✅ Live |
| POST   | `/api/ai/ocr`                         | Process prescription image       | ✅ Live |
| POST   | `/api/ai/recommend`                   | Get AI medicine recommendations  | ✅ Live |
| POST   | `/api/ai/search`                      | Natural language catalog search  | ✅ Live |
| POST   | `/api/ai/triage-dispute`              | Auto-triage accuracy dispute     | ✅ Live |

### Gemini AI Endpoint

| Variable         | Value                                 |
|------------------|---------------------------------------|
| SDK              | `@google/genai`                       |
| Auth             | `GEMINI_API_KEY` (server-side only)   |
| Capability       | `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API` |

---

## 6. Database Schema Summary

> **Current Status:** PostgreSQL DDL with Row-Level Security (`src/server/db/schema.sql`) and dual-driver relational Database Manager (`src/server/db/index.ts`) active with pre-hashed BCrypt credentials and HMAC-SHA256 audit logging.


### Planned Tables

```
┌─────────────────────────┐    ┌──────────────────────────┐
│       tenants           │    │         users            │
├─────────────────────────┤    ├──────────────────────────┤
│ id (PK)                 │    │ id (PK)                  │
│ name                    │◄───│ tenant_id (FK)           │
│ short_code              │    │ name                     │
│ tenant_code             │    │ email (UNIQUE)           │
│ schema                  │    │ role (ENUM)              │
│ region                  │    │ title                    │
│ environment             │    │ license_number           │
│ status                  │    │ department               │
└─────────────────────────┘    │ phone                    │
                               │ joined_at                │
                               └──────────────────────────┘

┌─────────────────────────┐    ┌──────────────────────────┐
│   medicine_catalog      │    │   generic_equivalents    │
├─────────────────────────┤    ├──────────────────────────┤
│ id (PK)                 │    │ id (PK)                  │
│ brand_name              │◄───│ medicine_id (FK)         │
│ manufacturer            │    │ name                     │
│ active_salt             │    │ manufacturer             │
│ salt_strength           │    │ composition_match        │
│ composition_details     │    │ generic_strip_mrp        │
│ atc_code                │    │ savings_percent          │
│ therapeutic_category    │    │ verified_match           │
│ branded_mrp             │    │ formulary_status (ENUM)  │
│ lowest_generic_price    │    │ similarity_factor_f2     │
│ bioequivalence_conf     │    │ included_in_patient_rx   │
│ regulatory_status       │    └──────────────────────────┘
│ tenant_id (FK, RLS)     │
└─────────────────────────┘

┌─────────────────────────┐    ┌──────────────────────────┐
│    pricing_feeds        │    │   accuracy_disputes      │
├─────────────────────────┤    ├──────────────────────────┤
│ id (PK)                 │    │ id (PK)                  │
│ name                    │    │ title                    │
│ type (ENUM)             │    │ feed_source              │
│ status (ENUM)           │    │ severity (ENUM)          │
│ skus_parsed             │    │ medicine_affected        │
│ avg_response_ms         │    │ status (ENUM)            │
│ error_rate_percent      │    │ sla_remaining            │
│ endpoint_url            │    │ tenant_id (FK, RLS)      │
│ tenant_id (FK, RLS)     │    └──────────────────────────┘
└─────────────────────────┘

┌─────────────────────────┐    ┌──────────────────────────┐
│      audit_logs         │    │      price_alerts        │
├─────────────────────────┤    ├──────────────────────────┤
│ id (PK)                 │    │ id (PK)                  │
│ timestamp               │    │ medicine_id (FK)         │
│ actor                   │    │ user_id (FK)             │
│ role                    │    │ target_threshold_price   │
│ action                  │    │ channel (ENUM)           │
│ target_entity           │    │ status (ENUM)            │
│ tenant_id (FK, RLS)     │    │ triggered_at             │
│ hash_signature          │    │ triggered_price          │
│ status                  │    │ tenant_id (FK, RLS)      │
└─────────────────────────┘    └──────────────────────────┘
```

### Row-Level Security (RLS)

All tenant-scoped tables include `tenant_id` for PostgreSQL RLS policies. Queries are automatically filtered by the authenticated user's tenant context.

---

## 7. Important Business Logic

### Medicine Pricing Model

- **Branded MRP** (`brandedMrp`): Maximum Retail Price of the innovator/branded medicine.
- **Lowest Generic Price** (`lowestGenericPrice`): Cheapest verified generic alternative.
- **Savings Calculation:** `savingsAmount = brandedMrp - lowestGenericPrice`; `savingsPercent = (savingsAmount / brandedMrp) * 100`.
- **Bioequivalence Confidence** (`bioequivalenceConfidence`): 0–100 score indicating generic-to-branded therapeutic equivalence. Based on dissolution similarity factor (f2).

### Formulary Status Tiers

| Tier                | Meaning                                        |
|---------------------|-------------------------------------------------|
| `Tier 1 Primary`    | First-line generic recommendation               |
| `Preferred`         | Approved alternative, clinician's choice         |
| `Standard`          | Available but not preferred                      |
| `Restricted`        | Requires special authorization                   |

### Price Alert Flow

1. User sets a **target threshold price** for a medicine.
2. Alert status: `Active` → system monitors price feeds.
3. When a generic drops below the threshold → status changes to `Triggered`.
4. User can `Pause` / `Resume` / `Delete` alerts.
5. Notification channels: In-App, SMS & WhatsApp, Email Digest.

### Audit Logging

- Every state-mutating action calls `logAction(action, details)` in `App.tsx`.
- Each log entry includes: timestamp, actor, role, target entity, tenant, HMAC-SHA256 hash signature.
- Logs are tamper-evident — hash signatures enable compliance verification.
- Action types: `USER_SESSION_AUTHENTICATED`, `REGISTER_MEDICINE_ENTRY`, `LINK_GENERIC_COMPOUND`, `ENABLE_FORMULARY_RX`, `TRIGGER_FEED_RESYNC`, `RESOLVE_ACCURACY_DISPUTE`, `CREATE_PRICE_ALERT`, `SWITCH_TENANT_PARTITION`, etc.

### Role-Based Access

| Role                     | Default View     | Access Level                     |
|--------------------------|------------------|----------------------------------|
| Lead Ops Admin           | Clinical Ops     | Full access, all tenants         |
| Clinical Pharmacist      | Clinical Ops     | Catalog, feeds, disputes         |
| Prescribing Physician    | Clinical Ops     | Catalog (read), patient portal   |
| Formulary Director       | Clinical Ops     | Catalog management, config       |
| Patient / Consumer       | Patient Portal   | Search, compare, alerts only     |

### Tenant Architecture

- 3 default tenants: Apollo Hospitals Network, Tata Health Consortium, SastaRx Direct-to-Patient
- Each tenant has: `id`, `tenantCode`, `schema` (e.g., `apollo_prod_rls`), `region`, `environment`
- Environments: `Production`, `Staging`, `DR Sandbox`

---

## 8. Known Issues ⚠️

| ID     | Issue                                                    | Severity | Status   |
|--------|----------------------------------------------------------|----------|----------|
| KI-001 | `localStorage` auth is not secure for production         | High     | Known    |
| KI-002 | No input validation on Add Medicine / Register forms     | Medium   | Open     |
| KI-003 | Feed retry simulation always succeeds (no error path)    | Low      | By Design|
| KI-004 | Cart items lost on page refresh (in-memory only)         | Medium   | Open     |
| KI-005 | No error boundaries — unhandled errors crash the app     | Medium   | Open     |
| KI-006 | `password` field stored in plain text on `UserAccount`   | High     | Known (demo only) |
| KI-007 | Sidebar doesn't collapse on mobile (overflow possible)   | Low      | Open     |
| KI-008 | `bun.lock` and `package-lock.json` both present          | Low      | Cosmetic |

---

## 9. Future Roadmap 🗺️

### Phase 1 — MVP Polish (Complete ✅)
- All 17 UI components built with mock data
- AI context files established

### Phase 2 — Backend Integration (Complete ✅)
- Express REST API with dual-driver PostgreSQL/local DB
- JWT + bcrypt dual-mode authentication
- All CRUD endpoints live

### Phase 3 — AI-Powered Features (Complete ✅)
- Prescription OCR with Gemini Vision (+ fallback engine)
- AI Clinical Regimen Recommender with DDI safety checks
- Natural language search with intent parsing
- AI Dispute Auto-Triage with evidence analysis

### Phase 4 — Production Readiness
- PostgreSQL live instance connection + RLS enforcement
- Firebase Auth migration
- Comprehensive test suite (unit + integration + E2E)
- CI/CD pipeline (GitHub Actions → Cloud Run)
- DISHA/HIPAA compliance audit

### Phase 5 — Scale & Expand
- Multi-language support (Hindi, Marathi)
- PWA / mobile app
- Pharmacy partner onboarding portal
- Advanced analytics with ML-driven insights
- Jan Aushadhi government pricing feed integration
