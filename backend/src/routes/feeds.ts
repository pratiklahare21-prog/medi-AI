import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

export const feedsRouter = Router();

// GET /api/feeds - list pricing feeds
feedsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feeds = await db.getFeeds(req.tenantId);
    res.json({
      success: true,
      data: feeds
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch feeds' });
  }
});

// POST /api/feeds/:id/retry - trigger feed resync
feedsRouter.post('/:id/retry', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feed = await db.retryFeed(req.params.id, req.tenantId);
    res.json({
      success: true,
      message: `Resync initiated for feed ${feed.name}`,
      data: feed
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to retry feed' });
  }
});
