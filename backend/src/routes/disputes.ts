import { Router, Response } from 'express';
import { db } from '../db';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { UserRole } from '../types';

export const disputesRouter = Router();

const DISPUTE_RESOLVER_ROLES: UserRole[] = ['Lead Ops Admin', 'Clinical Pharmacist', 'Formulary Director'];

// GET /api/disputes - list accuracy disputes
disputesRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const disputes = await db.getDisputes(req.tenantId);
    res.json({
      success: true,
      data: disputes
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch disputes';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/disputes/:id/resolve - resolve dispute (requires auth & clinical role)
disputesRouter.post('/:id/resolve', requireAuth, requireRole(DISPUTE_RESOLVER_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action } = req.body;
    if (!action) {
      const msg = 'Resolution action is required';
      res.status(400).json({ success: false, message: msg, error: msg });
      return;
    }

    const actor = req.user?.name || 'Lead Ops Admin';
    const resolved = await db.resolveDispute(req.params.id, action, actor);

    res.json({
      success: true,
      data: resolved,
      message: `Dispute ${req.params.id} resolved with decision: ${action}`
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to resolve dispute';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});
