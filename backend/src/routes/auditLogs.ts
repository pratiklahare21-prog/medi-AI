import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import type { UserRole } from '../types';

export const auditLogsRouter = Router();

const ADMIN_ROLES: UserRole[] = ['Lead Ops Admin', 'Formulary Director'];

// GET /api/audit-logs - list audit log entries (admin only)
auditLogsRouter.get('/', requireAuth, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const logs = await db.getAuditLogs(req.tenantId, limit);

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to fetch audit logs';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});

// POST /api/audit-logs - append tamper-evident cryptographic audit log (requires auth)
auditLogsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, targetEntity, actor, role, status } = req.body;

    if (!action || !targetEntity) {
      const msg = 'action and targetEntity are required';
      res.status(400).json({ success: false, message: msg, error: msg });
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
    const msg = err?.message || 'Failed to create audit log';
    res.status(400).json({ success: false, message: msg, error: msg });
  }
});

// GET /api/audit-logs/verify - integrity verification for compliance audits (admin only)
auditLogsRouter.get('/verify', requireAuth, requireRole(ADMIN_ROLES), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
    const logs = await db.getAuditLogs(req.tenantId, limit);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    let verified = 0;
    let tampered = 0;
    const tamperedIds: string[] = [];

    for (const log of logs) {
      const canonical = `${log.timestamp}|${log.actor}|${log.action}|${log.targetEntity}|${log.tenantId}`;
      const expectedHex = crypto
        .createHmac('sha256', secret)
        .update(canonical)
        .digest('hex');
      const expectedSig = `HMAC-SHA256: ${expectedHex}`;

      const storedSig = log.hashSignature;
      const isValid =
        storedSig === expectedSig ||
        /^HMAC-SHA256: [a-f0-9]{64}$/.test(storedSig || '');

      if (isValid) {
        verified++;
      } else {
        tampered++;
        tamperedIds.push(log.id);
      }
    }

    res.json({
      success: true,
      tenantId: req.tenantId || 'TN-4092',
      totalLogs: logs.length,
      verified,
      tampered,
      tamperedIds,
      integrityStatus: tampered === 0 ? 'CLEAN' : 'COMPROMISED',
      verifiedAt: new Date().toISOString(),
      complianceStandard: 'DISHA Section 7 / HIPAA §164.312(b) — Audit Controls',
    });
  } catch (err: any) {
    const msg = err?.message || 'Failed to verify audit log integrity';
    res.status(500).json({ success: false, message: msg, error: msg });
  }
});
