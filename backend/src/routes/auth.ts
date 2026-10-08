import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../types';
import {
  loginSchema,
  registerSchema,
  validate,
} from '../validators/authValidator';

export const authRouter = Router();

const DEFAULT_TENANT_ID = 'TN-4092';
const DEFAULT_TENANT_NAME = 'Apollo Health Network';

function defaultTitleForRole(role: UserRole): string {
  switch (role) {
    case 'Patient / Consumer':
      return 'Patient';
    case 'Lead Ops Admin':
      return 'Operations Administrator';
    case 'Prescribing Physician':
      return 'Medical Practitioner';
    case 'Formulary Director':
      return 'Pharmacy & Therapeutics Lead';
    case 'Clinical Pharmacist':
    default:
      return 'Healthcare Practitioner';
  }
}

// POST /api/auth/register
authRouter.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        name: string;
        email: string;
        password: string;
        confirmPassword: string;
        role?: UserRole;
        title?: string;
        licenseNumber?: string;
        department?: string;
        phone?: string;
        tenantId?: string;
        tenantName?: string;
      };

      const normalizedEmail = body.email.trim().toLowerCase();
      const role: UserRole = body.role || 'Clinical Pharmacist';
      const title = body.title || defaultTitleForRole(role);
      const tenantId = body.tenantId || DEFAULT_TENANT_ID;
      const tenantName = body.tenantName || DEFAULT_TENANT_NAME;

      const existingUser = await db.getUserByEmail(normalizedEmail);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with that email already exists',
          error: 'An account with that email already exists',
        });
        return;
      }

      const newUser = await db.createUser({
        name: body.name.trim(),
        email: normalizedEmail,
        password: body.password,
        role,
        title,
        licenseNumber: body.licenseNumber || undefined,
        tenantId,
        tenantName,
        department: body.department || undefined,
        phone: body.phone || undefined,
      });

      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: newUser,
        token,
      });
    } catch (err: any) {
      const msg = err?.message || 'Registration failed';
      const isDuplicate = /already exists/i.test(msg);
      const status = isDuplicate ? 409 : 400;
      res.status(status).json({
        success: false,
        message: isDuplicate ? 'An account with that email already exists' : msg,
        error: msg,
      });
    }
  }
);

// POST /api/auth/login
authRouter.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const body = req.body as { email: string; password: string };
      const normalizedEmail = body.email.trim().toLowerCase();

      const user = await db.getUserByEmail(normalizedEmail);

      // Always hash-compare in constant time style; never create users on login.
      let isMatch = false;
      if (user && user.passwordHash) {
        isMatch = bcrypt.compareSync(body.password, user.passwordHash);
      }

      if (!user || !isMatch) {
        // Generic message — no account enumeration.
        res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: 'Invalid email or password',
        });
        return;
      }

      const { passwordHash: _p, ...safeUser } = user;

      try {
        await db.addAuditLog({
          action: 'USER_SESSION_AUTHENTICATED',
          actor: safeUser.name,
          role: safeUser.role,
          targetEntity: `Encrypted JWT session initiated for partition ${safeUser.tenantName}`,
          tenantId: safeUser.tenantId,
          tenantName: safeUser.tenantName,
          status: 'Audited',
        });
      } catch {
        // Non-fatal — login still succeeds even if audit log write fails.
      }

      const token = generateToken(safeUser);

      res.json({
        success: true,
        message: 'Signed in successfully',
        user: safeUser,
        token,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: 'Login failed',
      });
    }
  }
);

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
        error: 'Not authenticated',
      });
      return;
    }

    const user = await db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found',
        error: 'User account not found',
      });
      return;
    }

    const { passwordHash: _p, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user session',
      error: 'Failed to fetch user session',
    });
  }
});

// POST /api/auth/logout
// Bearer tokens are stateless — client is responsible for discarding the token.
// Future work: add a jti blacklist for true server-side revocation.
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully. Client session token has been invalidated locally.',
  });
});
