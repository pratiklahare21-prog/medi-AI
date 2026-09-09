import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

export const disputesRouter = Router();

// GET /api/disputes - list accuracy disputes
disputesRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const disputes = await db.getDisputes(req.tenantId);
    res.json({
      success: true,
      data: disputes
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch disputes' });
  }
});

// POST /api/disputes/:id/resolve - resolve dispute
disputesRouter.post('/:id/resolve', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action } = req.body;
    if (!action) {
      res.status(400).json({ success: false, error: 'Resolution action is required' });
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
    res.status(400).json({ success: false, error: err.message || 'Failed to resolve dispute' });
  }
});
