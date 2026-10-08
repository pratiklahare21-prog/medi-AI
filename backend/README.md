# medi AI — Backend (Node.js + Express + Prisma + MongoDB)

> **RESTful API server for multi-tenant clinical operations and patient discovery platform**

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18.0.0+ (v20+ recommended)
- npm v9.0.0+
- MongoDB Atlas account (or local MongoDB)

### Install Dependencies
```bash
npm install
```

### Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```

Configure the following variables:
```bash
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_secure_jwt_secret
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/medi-ai
NODE_ENV=development
```

### Database Setup

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Push Schema to MongoDB (for development)
```bash
npm run db:push
```

#### Run Migrations (for production)
```bash
npm run db:migrate
```

#### Seed Initial Data
```bash
npm run db:seed
```

#### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### Development Server
```bash
npm run dev
```
Server starts at: **http://localhost:3001**

Health check: **http://localhost:3001/api/health**

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Prisma schema (MongoDB models)
│   └── seed.ts              # Database seeding script
├── src/
│   ├── data/                # Seed data files
│   ├── db/                  # Database utilities
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── sanitize.ts      # Input sanitization
│   │   └── tenant.ts        # Multi-tenant RLS
│   ├── routes/              # API route controllers
│   │   ├── ai.ts            # AI features (OCR, recommendations)
│   │   ├── auditLogs.ts     # Audit trail endpoints
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── catalog.ts       # Medicine catalog CRUD
│   │   ├── disputes.ts      # Dispute triage workflow
│   │   ├── feeds.ts         # Pricing feeds monitoring
│   │   ├── priceAlerts.ts   # Price drop alerts
│   │   ├── priceTrends.ts   # Historical price analytics
│   │   └── tenants.ts       # Multi-tenant management
│   ├── index.ts             # Express server entrypoint
│   └── types.ts             # TypeScript domain models
├── .env.example             # Environment template
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — User login (JWT token)
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Current user info

### Medicine Catalog (`/api/catalog`)
- `GET /api/catalog` — List all medicines (with filters)
- `POST /api/catalog` — Create medicine entry
- `GET /api/catalog/:id` — Get medicine details
- `GET /api/catalog/:id/generics` — Get generic alternatives
- `POST /api/catalog/:id/link-generic` — Link generic equivalent
- `PATCH /api/catalog/:id/toggle-rx` — Toggle prescription requirement

### AI Features (`/api/ai`)
- `POST /api/ai/ocr` — Prescription OCR (Gemini Vision)
- `POST /api/ai/recommend` — Clinical recommendations
- `POST /api/ai/search` — Natural language search
- `POST /api/ai/triage-dispute` — Automated dispute triage

### Price Alerts (`/api/price-alerts`)
- `GET /api/price-alerts` — List user's alerts
- `POST /api/price-alerts` — Create price alert
- `PUT /api/price-alerts/:id` — Update alert
- `DELETE /api/price-alerts/:id` — Delete alert
- `POST /api/price-alerts/:id/pause` — Pause alert
- `POST /api/price-alerts/:id/resume` — Resume alert
- `POST /api/price-alerts/:id/simulate-drop` — Simulate price drop

### Pricing Feeds (`/api/feeds`)
- `GET /api/feeds` — List all pricing feeds
- `POST /api/feeds/:id/retry` — Retry failed feed sync

### Disputes (`/api/disputes`)
- `GET /api/disputes` — List accuracy disputes
- `POST /api/disputes/:id/resolve` — Resolve dispute

### Audit Logs (`/api/audit-logs`)
- `GET /api/audit-logs` — List audit trail (HMAC-signed)
- `POST /api/audit-logs` — Create audit entry
- `GET /api/audit-logs/verify` — Verify HMAC integrity

### Price Trends (`/api/price-trends`)
- `GET /api/price-trends/:medicineId` — Get historical price data

### Tenants (`/api/tenants`)
- `GET /api/tenants` — List all tenants (admin only)

---

## 🔐 Security Features

### Authentication & Authorization
- **JWT Bearer tokens** with configurable expiry
- **bcrypt password hashing** (10 rounds)
- Role-based access control (RBAC)
- Multi-tenant row-level security (RLS)

### Rate Limiting
- Auth endpoints: **20 requests / 15 minutes**
- AI endpoints: **30 requests / minute**
- Global: **300 requests / minute**

### Input Sanitization
- HTML tag stripping
- SQL/NoSQL injection prevention
- XSS protection
- Prototype pollution protection

### Security Headers (Helmet.js)
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options

### Audit Trail
- HMAC-SHA256 signed audit logs
- Immutable cryptographic hashing
- Tamper detection endpoint
- DISHA/HIPAA compliance

---

## 🧪 Testing

### Type Checking
```bash
npm run lint
```

### Database Migrations (Production)
```bash
npm run db:migrate
```

---

## 🔧 Technology Stack

| Layer            | Technology           | Version    |
|------------------|----------------------|------------|
| Runtime          | Node.js              | v22+       |
| Framework        | Express              | ^4.21.2    |
| Language         | TypeScript           | ~5.8.2     |
| Database         | MongoDB Atlas        | Latest     |
| ORM              | Prisma               | ^6.19.3    |
| AI/ML            | Google Gemini API    | ^2.4.0     |
| Authentication   | JWT + bcrypt         | ^9.0.3     |
| Security         | Helmet.js            | ^8.0.0     |
| Rate Limiting    | express-rate-limit   | ^7.5.0     |

---

## 📝 NPM Scripts

| Script              | Description                                |
|---------------------|--------------------------------------------|
| `npm run dev`       | Start development server (with tsx watch)  |
| `npm start`         | Start production server                    |
| `npm run build`     | Compile TypeScript to JavaScript           |
| `npm run lint`      | TypeScript type checking                   |
| `npm run db:generate` | Generate Prisma client                   |
| `npm run db:push`   | Push schema to database (dev)              |
| `npm run db:migrate`| Run database migrations (prod)             |
| `npm run db:seed`   | Seed initial data                          |
| `npm run db:studio` | Open Prisma Studio GUI                     |

---

## 🗄️ Database Schema

### Collections
- **tenants** — Hospital/pharmacy organizations
- **users** — Healthcare practitioners & patients
- **medicines** — Branded medicine catalog
- **generic_bioequivalents** — Generic alternatives
- **pricing_feeds** — Partner pricing sources
- **price_alerts** — Patient price drop alerts
- **disputes** — Accuracy dispute reports
- **audit_logs** — Cryptographic audit trail

### Indexes
- `users.email` (unique)
- `medicines.brandName` + `tenantId`
- `tenants.tenantCode` (unique)
- `audit_logs.tenantId` + `timestamp`

---

## 🌍 Environment Variables

| Variable         | Description                              | Required |
|------------------|------------------------------------------|----------|
| `PORT`           | Express server port                      | No (3001)|
| `DATABASE_URL`   | MongoDB connection string                | Yes      |
| `GEMINI_API_KEY` | Google Gemini API key                    | Yes*     |
| `JWT_SECRET`     | Secret for signing JWT tokens            | Yes      |
| `NODE_ENV`       | Runtime environment (dev/prod)           | No       |
| `APP_URL`        | Application base URL                     | No       |

*Required for AI features (OCR, recommendations, search, triage)

---

## 🚢 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
Use root `Dockerfile` which builds both frontend and backend:
```bash
docker build -t medi-ai .
docker run -p 8080:8080 --env-file backend/.env medi-ai
```

### Cloud Run Deployment
```bash
gcloud run deploy medi-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets DATABASE_URL=DATABASE_URL:latest,GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 🔄 Database Migrations

### Development (Schema Push)
```bash
npm run db:push
```

### Production (Migrations)
```bash
npm run db:migrate
```

### Reset Database (⚠️ Destructive)
```bash
npx prisma migrate reset
```

---

## 🐛 Debugging

### Enable Debug Logs
```bash
DEBUG=prisma:* npm run dev
```

### Prisma Studio (Database GUI)
```bash
npm run db:studio
```
Opens at: **http://localhost:5555**

---

## 🤝 Contributing

1. Follow REST API naming conventions
2. Add TypeScript types for all endpoints
3. Write audit log entries for state-changing operations
4. Implement rate limiting for new endpoints
5. Add input sanitization middleware
6. Document new endpoints in this README

---

## 📄 License

Private — Proprietary healthcare software

---

**Built with ❤️ for improving healthcare accessibility in India**
