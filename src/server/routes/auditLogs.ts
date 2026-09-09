import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

export const auditLogsRouter = Router();

// GET /api/audit-logs - list audit log entries
auditLogsRouter.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await db.getAuditLogs(req.tenantId, limit);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch audit logs' });
  }
});

// POST /api/audit-logs - append tamper-evident cryptographic audit log
auditLogsRouter.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, targetEntity, actor, role, status } = req.body;

    if (!action || !targetEntity) {
      res.status(400).json({ success: false, error: 'action and targetEntity are required' });
      return;
    }

    const log = await db.addAuditLog({
      action,
      targetEntity,
      actor: actor || req.user?.name || 'System User',
      role: role || req.user?.role || 'Lead Ops Admin',
      tenantId: req.tenantId || 'TN-4092',
      tenantName: req.user?.tenantName || 'Apollo Health Network',
      status: status || 'Audited'
    });

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create audit log' });
  }
});
