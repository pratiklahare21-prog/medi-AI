import { Router, Response } from 'express';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

export const tenantsRouter = Router();

// GET /api/tenants - list all hospital / pharmacy tenants (requires auth)
tenantsRouter.get('/', requireAuth, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const tenants = await db.getTenants();
    res.json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch tenants';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});
