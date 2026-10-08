import dotenv from 'dotenv';
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// Critical startup checks (fail fast)
// ─────────────────────────────────────────────────────────────────────────────
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
{
  const PLACEHOLDER_SECRETS = new Set([
    '',
    'your_secret_here',
    'change_me',
    'medi-ai-sastarx-jwt-secure-key-2026',
  ]);
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || PLACEHOLDER_SECRETS.has(jwtSecret.trim())) {
    console.error(
      '[FATAL] JWT_SECRET environment variable is missing or set to an insecure placeholder.\n' +
        'Set a strong, unique secret in backend/.env before starting the server.\n' +
        'Example:  JWT_SECRET=$(openssl rand -hex 32)'
    );
    process.exit(1);
  }
}

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { tenantContext } from './middleware/tenant';
import { authRateLimiter, aiRateLimiter, generalRateLimiter } from './middleware/rateLimiter';
import { sanitizeBody } from './middleware/sanitize';
import { authRouter } from './routes/auth';
import { catalogRouter } from './routes/catalog';
import { feedsRouter } from './routes/feeds';
import { disputesRouter } from './routes/disputes';
import { auditLogsRouter } from './routes/auditLogs';
import { tenantsRouter } from './routes/tenants';
import { priceAlertsRouter } from './routes/priceAlerts';
import { priceTrendsRouter } from './routes/priceTrends';
import { aiRouter } from './routes/ai';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

// ─────────────────────────────────────────────────────────────────────────────
// CORS — restricted to FRONTEND_URL (credentials allowed)
// ─────────────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    const msg = `The CORS policy for this site does not allow access from Origin: ${origin}. ` +
      `Allowed origins: ${ALLOWED_ORIGINS.join(', ')}. Configure FRONTEND_URL env var.`;
    return callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(express.json());

// Security headers via Helmet (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://generativelanguage.googleapis.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Google Fonts CDN
}));

// Input sanitization on all mutating requests
app.use(sanitizeBody);

// General API rate limiting (safety net)
app.use('/api', generalRateLimiter);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Multi-tenant context middleware
app.use('/api', tenantContext);

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'medi-AI / SastaRx Clinical Ops Backend',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    tenantRLS: 'Enforced (Active Partition)',
    uptime: process.uptime()
  });
});

// Mount modular route handlers
app.use('/api/auth', authRateLimiter, authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/feeds', feedsRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/price-alerts', priceAlertsRouter);
app.use('/api/price-trends', priceTrendsRouter);
app.use('/api/ai', aiRateLimiter, aiRouter);

// 404 Handler for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: `Endpoint '${req.originalUrl}' not found`
  });
});

// Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const rawMessage = err.message || 'Internal Server Error';
  const safeMessage = status < 500 ? rawMessage : 'Internal Server Error';

  // Structured error log (production-safe — no stack traces to client)
  console.error(JSON.stringify({
    level: 'error',
    timestamp: new Date().toISOString(),
    status,
    message: rawMessage,
    path: _req?.originalUrl,
    method: _req?.method,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  }));

  const body: {
    success: false;
    message: string;
    error?: string;
    errors?: Record<string, string>;
  } = {
    success: false,
    message: safeMessage,
    error: safeMessage,
  };

  // Pass through per-field validation errors if middleware attached them
  if (err && typeof err === 'object' && 'errors' in err && typeof err.errors === 'object') {
    body.errors = err.errors as Record<string, string>;
  }

  res.status(status).json(body);
});

export const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 SastaRx Backend API listening on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Multi-Tenant RLS: ACTIVE (DISHA / HIPAA Partition Mode)`);
});

export default app;
