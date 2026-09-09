import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { tenantContext } from './middleware/tenant';
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
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    tenantRLS: 'Enforced (Active Partition)',
    uptime: process.uptime()
  });
});

// Mount modular route handlers
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/feeds', feedsRouter);
app.use('/api/disputes', disputesRouter);
app.use('/api/audit-logs', auditLogsRouter);
app.use('/api/tenants', tenantsRouter);
app.use('/api/price-alerts', priceAlertsRouter);
app.use('/api/price-trends', priceTrendsRouter);
app.use('/api/ai', aiRouter);

// 404 Handler for unknown API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Endpoint '${req.originalUrl}' not found`
  });
});

// Global error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 SastaRx Backend API listening on http://${HOST}:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Multi-Tenant RLS: ACTIVE (DISHA / HIPAA Partition Mode)`);
});

export default app;
