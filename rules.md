# 📐 Project Rules

> **Purpose:** Codified rules that AI assistants and all contributors **must always follow**. These rules ensure consistency, security, and maintainability across the medi-AI / SastaRx platform.

---

## 1. Coding Standards

### General

- [ ] Write **TypeScript** for all source files. No `.js` / `.jsx` files in `src/`.
- [ ] Enable `strict` mode mentally — always type function parameters, return values, and state.
- [ ] No `any` type unless absolutely unavoidable (and then add a `// TODO: remove any` comment).
- [ ] Use **functional components** with hooks. No class components.
- [ ] Prefer `const` over `let`. Never use `var`.
- [ ] Use **named exports** for components: `export function ComponentName()` or `export const ComponentName`.
- [ ] Default export is reserved for `App.tsx` only.

### React Patterns

- [ ] State management: React `useState` and `useReducer`. No Redux unless explicitly approved.
- [ ] Side effects: `useEffect` with proper dependency arrays. No empty deps unless intentional (document why).
- [ ] Memoization: Use `useMemo` / `useCallback` only when profiling shows a performance issue. Don't pre-optimize.
- [ ] Props: Destructure in function signature. Define interfaces for complex prop shapes.

### TypeScript

- [ ] All domain entities must have a corresponding interface in [`src/types.ts`](file:///c:/Users/pratik/medi-AI/src/types.ts).
- [ ] Union types for enums (e.g., `type Status = 'Active' | 'Paused' | 'Triggered'`). No TypeScript `enum`.
- [ ] Use `Omit`, `Pick`, `Partial` for derived types instead of duplicating interfaces.

---

## 2. Folder Structure Rules

```
medi-AI/
├── public/                    # Static assets (images, favicon)
│   └── assets/                # Generated or uploaded assets
├── src/
│   ├── components/            # All React components (flat structure)
│   │   ├── *View.tsx          # Full-page view components
│   │   ├── *Modal.tsx         # Modal/dialog components
│   │   ├── *Drawer.tsx        # Slide-out drawer components
│   │   ├── *Section.tsx       # Reusable page sections
│   │   ├── Header.tsx         # App header (layout)
│   │   └── Sidebar.tsx        # Ops sidebar (layout)
│   ├── data/                  # Mock data and static datasets
│   │   ├── mockData.ts        # Entity mock data
│   │   └── priceTrendsData.ts # Time-series pricing data
│   ├── server/                # Express backend REST API & database
│   │   ├── db/                # Schema DDL, seed data, DB driver
│   │   ├── middleware/        # Auth (JWT/Firebase) & Tenant RLS context
│   │   ├── routes/            # REST endpoint routers
│   │   └── index.ts           # Express server entry point
│   ├── services/              # Frontend API client and service layer
│   │   └── api.ts             # Typed REST API service methods
│   ├── types.ts               # All TypeScript interfaces and type aliases
│   ├── App.tsx                # Root component, state orchestration
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Global styles, Tailwind imports, font utilities
├── .env.example               # Environment variable template
├── index.html                 # HTML shell
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── decisions.md               # Technical decisions log
├── rules.md                   # This file
├── memory.md                  # Project memory / context
└── changelog.md               # Chronological change history
```

### Rules

- [ ] **Never** create files outside the defined structure without updating this document.
- [ ] Components go in `src/components/`. No component files in `src/` root (except `App.tsx`).
- [ ] Data files go in `src/data/`. No mock data in component files.
- [ ] Type definitions go in `src/types.ts`. Do not define interfaces inside component files.
- [ ] Static assets go in `public/assets/`.
- [ ] If component count exceeds 30, refactor into feature-based sub-directories (see DEC-008).

---

## 3. Naming Conventions

| Element            | Convention              | Example                              |
|--------------------|-------------------------|--------------------------------------|
| Files (components) | PascalCase              | `CatalogView.tsx`, `AddMedicineModal.tsx` |
| Files (data)       | camelCase               | `mockData.ts`, `priceTrendsData.ts`  |
| Files (config)     | kebab-case / dot-case   | `vite.config.ts`, `tsconfig.json`    |
| Components         | PascalCase              | `PatientPortalView`, `Header`        |
| Functions          | camelCase               | `handleRetryFeed`, `logAction`       |
| Variables / State  | camelCase               | `currentTenant`, `priceAlerts`       |
| Constants          | SCREAMING_SNAKE_CASE    | `INITIAL_CATALOG`, `DEFAULT_USERS`   |
| Interfaces / Types | PascalCase              | `MedicineCatalogEntry`, `UserRole`   |
| CSS utilities      | kebab-case with prefix  | `.font-display-lg`, `.font-code-mono`|
| Env variables      | SCREAMING_SNAKE_CASE    | `GEMINI_API_KEY`, `APP_URL`          |
| Git branches       | `type/description`      | `feat/price-alerts`, `fix/auth-bug`  |

### Suffix Conventions for Components

| Suffix       | Purpose                        | Example                   |
|--------------|--------------------------------|---------------------------|
| `*View`      | Full-page view component       | `DashboardView.tsx`       |
| `*Modal`     | Overlay dialog                 | `BioavailabilityModal.tsx`|
| `*Drawer`    | Slide-out panel                | `PriceAlertsDrawer.tsx`   |
| `*Section`   | Reusable page section          | `PriceTrendSection.tsx`   |
| (no suffix)  | Layout / utility component     | `Header.tsx`, `Sidebar.tsx`|

---

## 4. UI/UX Consistency Rules

### Design System

- [ ] **Primary font (body):** Inter — weights 300–700.
- [ ] **Heading font:** Plus Jakarta Sans — weights 500–800.
- [ ] **Monospace font:** JetBrains Mono — weights 400–600.
- [ ] **Icon library:** Lucide React (`lucide-react`) and Material Symbols Outlined (Google Fonts).
- [ ] **Animation library:** Motion (`motion` package, formerly Framer Motion).
- [ ] **Charts:** Recharts (`recharts`).

### Color Palette

- [ ] **Background:** `#F8FAFC` (slate-50)
- [ ] **Text primary:** `#0F172A` (slate-900)
- [ ] **Accent / Primary:** Blue spectrum (Tailwind `blue-*`)
- [ ] **Success / Healthy:** Emerald (`emerald-400`, `emerald-500`)
- [ ] **Warning:** Amber (`amber-400`, `amber-500`)
- [ ] **Error / Critical:** Red (`red-500`, `red-600`)
- [ ] **Footer / Dark UI:** `slate-900` background with `slate-400` text

### Layout

- [ ] Fixed header at top (`h-14`, `z-50`).
- [ ] Fixed sidebar on left for Clinical Ops mode (`w-64`, `md:ml-64`).
- [ ] Fixed footer at bottom (`h-8`, `z-40`).
- [ ] Content area scrolls independently.
- [ ] All views must be responsive — test at 320px, 768px, 1024px, 1440px widths.

### Component Patterns

- [ ] Modals use a backdrop overlay with `z-50` or higher.
- [ ] Drawers slide from the right edge.
- [ ] Tables use `font-table-data` class for cell content.
- [ ] Status badges use consistent color mapping (see Color Palette).
- [ ] Hover effects on interactive elements. No dead-click zones.

---

## 5. Git Commit Rules

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

| Type       | Use Case                                          |
|------------|---------------------------------------------------|
| `feat`     | New feature                                       |
| `fix`      | Bug fix                                           |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style`    | Formatting, whitespace, missing semicolons         |
| `docs`     | Documentation only changes                        |
| `chore`    | Build process, dependency updates, tooling        |
| `test`     | Adding or updating tests                          |
| `perf`     | Performance improvement                           |

### Rules

- [ ] Keep subject line under 72 characters.
- [ ] Use imperative mood: "add feature" not "added feature".
- [ ] Reference issue numbers in the body when applicable.
- [ ] One logical change per commit. Don't bundle unrelated changes.
- [ ] **Never** commit `.env` files, API keys, or `node_modules/`.
- [ ] Update `changelog.md` with every meaningful commit.
- [ ] Update `memory.md` when features are completed or project state changes.
- [ ] Update `decisions.md` when architectural decisions are made.

---

## 6. Security & Environment Variable Rules

### Environment Variables

- [ ] All secrets go in `.env` (never committed — excluded by `.gitignore`).
- [ ] `.env.example` must list every required variable with placeholder values.
- [ ] **Required variables:**

| Variable         | Purpose                               | Source                    |
|------------------|---------------------------------------|---------------------------|
| `GEMINI_API_KEY` | Gemini AI API authentication          | AI Studio Secrets Panel   |
| `APP_URL`        | Self-referential app URL              | Cloud Run service URL     |

### Security Rules

- [ ] **Never** hardcode API keys, tokens, passwords, or secrets in source code.
- [ ] **Never** log sensitive data (API keys, patient data, passwords) to console.
- [ ] **Never** expose `GEMINI_API_KEY` to the client bundle. Use server-side proxy only.
- [ ] **Always** use `try/catch` around `localStorage` operations (can throw in private browsing).
- [ ] Audit logs must include `hashSignature` for tamper-evidence.
- [ ] Patient data handling must comply with DISHA (India) and HIPAA (US) requirements.
- [ ] Demo `password` fields in `UserAccount` are for local demo only — never use in production.

---

## 7. Behavioral Rules for AI Assistants

### Must Follow

- [ ] **Never break existing functionality** unless the user explicitly requests it.
- [ ] **Never remove existing code comments** or documentation unless directly related to the change.
- [ ] **Always check `decisions.md`** before proposing architectural changes.
- [ ] **Always update `changelog.md`** after completing any change.
- [ ] **Always update `memory.md`** when completing features or discovering issues.
- [ ] **Always preserve the type system** — don't bypass TypeScript with `any` or `@ts-ignore`.
- [ ] **Always test changes mentally** against the existing component tree before applying.
- [ ] **Ask before deleting** any component, interface, or data file.

### Must Not Do

- [ ] Don't install new npm packages without documenting the decision in `decisions.md`.
- [ ] Don't modify `tsconfig.json` or `vite.config.ts` without explaining why.
- [ ] Don't create new top-level directories without updating the folder structure above.
- [ ] Don't change the authentication flow without explicit approval.
- [ ] Don't modify mock data shapes without updating corresponding interfaces in `types.ts`.
