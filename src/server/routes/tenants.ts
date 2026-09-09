import { Router, Request, Response } from 'express';
import { db } from '../db';

export const tenantsRouter = Router();

// GET /api/tenants - list all hospital / pharmacy tenants
tenantsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const tenants = await db.getTenants();
    res.json({
      success: true,
      count: tenants.length,
      data: tenants
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch tenants' });
  }
});
