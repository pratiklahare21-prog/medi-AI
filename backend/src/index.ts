import dotenv from 'dotenv';
dotenv.config();

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

// Global middleware
app.use(cors({
  origin: true, // Allow dev server and production clients
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
    error: `Endpoint '${req.originalUrl}' not found`
  });
});

// Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Structured error log (production-safe — no stack traces to client)
  console.error(JSON.stringify({
    level: 'error',
    timestamp: new Date().toISOString(),
    status,
    message,
    path: _req?.originalUrl,
    method: _req?.method,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  }));

  res.status(status).json({
    success: false,
    error: status < 500 ? message : 'Internal Server Error',
  });
});

export const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 SastaRx Backend API listening on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Multi-Tenant RLS: ACTIVE (DISHA / HIPAA Partition Mode)`);
});

export default app;
