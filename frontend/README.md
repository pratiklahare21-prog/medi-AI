# medi AI — Frontend (React + Vite + Tailwind CSS)

> **Multi-tenant clinical operations control center and patient generic medicine discovery platform**

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18.0.0+ (v20+ recommended)
- npm v9.0.0+

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Key configuration:
- `VITE_BACKEND_URL` — Backend API URL (default: `http://localhost:3001`)
- `VITE_APP_TITLE` — Application title

### Development Server
```bash
npm run dev
```
Access the app at: **http://localhost:3000**

The development server includes:
- Hot Module Replacement (HMR)
- Automatic proxy for `/api` requests to backend
- PWA service worker (in dev mode)

### Production Build
```bash
npm run build
```
Output: `dist/` directory with optimized static assets

### Preview Production Build
```bash
npm run preview
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Interactive UI
```bash
npm run test:ui
```

---

## 📁 Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── pwa-192x192.png      # PWA icon (192x192)
│   ├── pwa-512x512.png      # PWA icon (512x512)
│   └── assets/              # Other public assets
├── src/
│   ├── components/          # 25+ UI components
│   │   ├── Header.tsx       # Global navigation header
│   │   ├── Sidebar.tsx      # Clinical ops sidebar
│   │   ├── *View.tsx        # Main view components
│   │   ├── *Modal.tsx       # Modal dialog components
│   │   └── *Drawer.tsx      # Drawer panel components
│   ├── data/                # Mock data & datasets
│   │   ├── mockData.ts      # Demo catalog data
│   │   └── priceTrendsData.ts  # Historical price trends
│   ├── i18n/                # Internationalization
│   │   ├── index.ts         # i18next configuration
│   │   └── locales/         # Translation files (en, hi, mr)
│   ├── services/            # API client layer
│   │   └── api.ts           # Backend API service
│   ├── tests/               # Vitest test suite
│   │   ├── setup.ts         # Test environment setup
│   │   └── unit/            # Unit tests
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # React DOM entrypoint
│   ├── index.css            # Tailwind CSS & design tokens
│   └── types.ts             # TypeScript interfaces
├── .env.example             # Environment template
├── index.html               # HTML entrypoint
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite bundler config
└── vitest.config.ts         # Vitest test runner config
```

---

## 🌐 Features

### Clinical Operations Suite
- Real-time dashboard with KPI tracking
- Medicine & salt catalog (98.6% bioequivalence accuracy)
- Pricing feed monitoring (4 sources)
- Accuracy dispute triage
- Medicine comparison tool
- Savings analytics dashboard
- Super admin panel

### Patient Discovery Portal
- AI-powered prescription OCR
- Generic medicine search
- Natural language AI search
- Clinical recommendations
- Price drop alerts
- Shopping cart with savings

### Progressive Web App (PWA)
- Installable on mobile/desktop
- Offline catalog access
- Service worker caching
- Push notification support (future)

### Internationalization (i18n)
- English (en)
- Hindi (हिंदी) — hi
- Marathi (मराठी) — mr
- Language selector in header
- Persistent preference

---

## 🔧 Technology Stack

| Layer            | Technology                    | Version    |
|------------------|-------------------------------|------------|
| Framework        | React                         | ^19.0.1    |
| Build Tool       | Vite                          | ^6.2.3     |
| Language         | TypeScript                    | ~5.8.2     |
| Styling          | Tailwind CSS v4               | ^4.1.14    |
| Icons            | Lucide React                  | ^0.546.0   |
| Animation        | Motion (Framer Motion)        | ^12.23.24  |
| Charts           | Recharts                      | ^3.10.1    |
| i18n             | i18next + react-i18next       | ^26.4.2    |
| PWA              | vite-plugin-pwa               | ^1.1.0     |
| Testing          | Vitest + React Testing Library| ^3.2.4     |

---

## 🔌 API Communication

The frontend communicates with the backend via REST API:

**Development:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Vite proxy: All `/api/*` requests → `http://localhost:3001`

**Production:**
- Configure `VITE_BACKEND_URL` to point to deployed backend
- Or use reverse proxy (NGINX/Caddy/Cloud Run)

---

## 📝 NPM Scripts

| Script            | Description                                    |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start development server (port 3000)           |
| `npm run build`   | Production build → `dist/`                     |
| `npm run preview` | Preview production build                       |
| `npm run lint`    | TypeScript type checking                       |
| `npm test`        | Run unit tests                                 |
| `npm run test:watch` | Run tests in watch mode                     |
| `npm run test:coverage` | Generate coverage report                 |
| `npm run test:ui` | Open Vitest interactive UI                     |

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel / Netlify**: Auto-deploy from Git
- **Cloud Run**: Use root Dockerfile (builds both tiers)
- **Static Hosting**: Upload `dist/` folder
- **Docker**: Multi-stage build in root

### Environment Variables (Production)
```bash
VITE_BACKEND_URL=https://your-backend.com
VITE_APP_TITLE=medi AI - SastaRx
```

---

## 🤝 Contributing

1. Follow component naming conventions (`*View.tsx`, `*Modal.tsx`)
2. Maintain TypeScript strict mode compliance
3. Write tests for new features
4. Update i18n locale files for UI changes
5. Keep components under 500 lines (split if larger)

---

## 📄 License

Private — Proprietary healthcare software

---

**Built with ❤️ for improving healthcare accessibility in India**
