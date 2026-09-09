# medi AI / SastaRx — Monorepo Architecture

> **Multi-Tenant Clinical Operations Control Center & Patient Generic Medicine Discovery Platform**

---

## 📁 Project Structure

The project is cleanly decoupled into two independent subfolders:

```
medi-AI/
├── frontend/                     # React 19 + Vite + Tailwind CSS Frontend
│   ├── public/                   # Static assets & PWA icons
│   ├── src/                      # Components, Views, Hooks, Data, i18n
│   │   ├── components/           # 25 Modular UI components
│   │   ├── data/                 # Mock catalogs & trend datasets
│   │   ├── i18n/                 # Multi-language localization (EN, HI, MR, etc.)
│   │   ├── services/             # API client (Axios/Fetch layer)
│   │   ├── tests/                # Vitest unit & component test suite
│   │   ├── App.tsx               # Root application view router
│   │   ├── main.tsx              # React DOM entrypoint
│   │   ├── index.css             # Tailwind CSS & design tokens
│   │   └── types.ts              # Frontend TypeScript interfaces
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # HTML entrypoint
│   ├── package.json              # Frontend dependencies & scripts
│   ├── tsconfig.json             # Frontend TypeScript configuration
│   ├── vite.config.ts            # Vite bundler & backend proxy config
│   └── vitest.config.ts          # Vitest unit test runner config
│
├── backend/                      # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/                   # In-memory relational DB & SQL schema
│   │   ├── middleware/           # Auth, Tenant RLS, Rate Limiting, Sanitization
│   │   ├── routes/               # Modular Express API route controllers
│   │   │   ├── ai.ts             # Gemini AI OCR, recommendations & search
│   │   │   ├── auditLogs.ts      # Immutable tamper-evident audit trail
│   │   │   ├── auth.ts           # JWT authentication & registration
│   │   │   ├── catalog.ts        # Medicine catalog & generic equivalency
│   │   │   ├── disputes.ts       # Accuracy dispute triage workflow
│   │   │   ├── feeds.ts          # Pharmacy partner pricing feeds
│   │   │   ├── priceAlerts.ts    # Patient price drop alerts
│   │   │   ├── priceTrends.ts    # 6-month historical price trend analytics
│   │   │   └── tenants.ts        # Multi-tenant hospital/pharmacy config
│   │   ├── data/                 # Database seed data
│   │   ├── types.ts              # Backend domain models & schemas
│   │   └── index.ts              # Express server entrypoint (port 3001)
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies & scripts
│   └── tsconfig.json             # Backend TypeScript configuration
│
├── .gitignore                    # Global git ignore configuration
├── package.json                  # Root orchestration & convenience runner
└── README.md                     # Project documentation & PRD
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0+ (v20+ recommended)
- **npm**: v9.0.0+ (or yarn / pnpm / bun)

---

### 1. Install Dependencies

You can install all dependencies across both frontend and backend using the root helper:

```bash
npm run install:all
```

Or install them individually in their respective directories:

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

---

### 2. Configure Environment Variables

#### Backend (`backend/.env`)
Copy the template and configure your keys:
```bash
cp backend/.env.example backend/.env
```
Key configuration items:
- `PORT=3001` (Backend server port)
- `GEMINI_API_KEY` (Required for AI features: OCR prescription reading, smart search, clinical dispute triage)
- `JWT_SECRET` (Secret key for signing auth tokens)
- `NODE_ENV=development`

#### Frontend (`frontend/.env`)
Copy the template if needed:
```bash
cp frontend/.env.example frontend/.env
```
- `VITE_BACKEND_URL=http://localhost:3001` (Target for Vite reverse proxy)
- `VITE_APP_TITLE=medi AI - SastaRx Ops & Discovery Platform`

---

### 3. Running the Application

#### Option A: Run Both Together (Recommended)
From the project root:
```bash
npm run dev
```
* Backend starts at: `http://localhost:3001` (API & Health Check at `http://localhost:3001/api/health`)
* Frontend starts at: `http://localhost:3000` (Proxies `/api` requests to backend)

#### Option B: Run Individually

**Start the Backend Server:**
```bash
# From root:
npm run dev:backend

# Or from backend folder:
cd backend
npm run dev
```

**Start the Frontend Client:**
```bash
# From root:
npm run dev:frontend

# Or from frontend folder:
cd frontend
npm run dev
```

---

## 🧪 Testing & Code Quality

### Run Unit Tests
```bash
# From root:
npm run test

# Or from frontend:
cd frontend
npm test
npm run test:coverage
```

### Type Checking & Linting
```bash
# From root:
npm run lint

# Or per project:
npm run lint:frontend
npm run lint:backend
```

### Production Build
```bash
# Build both tiers:
npm run build

# Or individually:
npm run build:backend
npm run build:frontend
```

---

## 🔌 API Architecture & Communication

- The frontend communicates with the backend exclusively via REST API calls routed to `/api/*`.
- In local development, the Vite dev server transparently proxies all requests beginning with `/api` to the backend server at `http://localhost:3001`.
- In production, either configure reverse proxy (NGINX/Caddy/Cloud Run) or set `VITE_API_URL` to the public backend endpoint.
- Multi-tenancy is enforced on every request using the `x-tenant-id` header and JWT claims.

---

## 🏥 Product Overview & Core Modules

### 1. Patient Discovery Portal
- **Generic Equivalent Matcher**: Composition-matched generic alternatives with price comparison across listed pharmacies.
- **AI Prescription Scanner**: Multimodal OCR scan of physical prescription slips via Google Gemini API.
- **Bioequivalence Badging**: Therapeutic equivalence validation (CDSCO / US-FDA Orange Book standards).
- **Monthly Savings Calculator**: Family and chronic disease medication cost reduction projections.

### 2. Clinical Ops Control Center
- **Enterprise Medicine Catalog**: Dual-catalog management for branded vs generic medicines.
- **Multi-Partner Pricing Feeds**: Real-time stock and price synchronization from partner pharmacies.
- **Accuracy Dispute Workflow**: AI-assisted clinician triage of reported pricing discrepancies.
- **Multi-Tenant Administration**: Row-level tenant isolation, audit logging, and RBAC permissions.
