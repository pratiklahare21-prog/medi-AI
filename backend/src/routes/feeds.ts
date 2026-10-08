import { Router, Response } from 'express';
import { db } from '../db';
import { optionalAuth, requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { UserRole } from '../types';

export const feedsRouter = Router();

const OPS_ADMIN_ROLES: UserRole[] = ['Lead Ops Admin'];

// GET /api/feeds - list pricing feeds
feedsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feeds = await db.getFeeds(req.tenantId);
    res.json({
      success: true,
      data: feeds
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch feeds';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/feeds/:id/retry - trigger feed resync (requires auth & admin role)
feedsRouter.post('/:id/retry', requireAuth, requireRole(OPS_ADMIN_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feed = await db.retryFeed(req.params.id, req.tenantId);
    res.json({
      success: true,
      message: `Resync initiated for feed ${feed.name}`,
      data: feed
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to retry feed';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});
