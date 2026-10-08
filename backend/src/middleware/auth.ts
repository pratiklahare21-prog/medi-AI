import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserAccount, UserRole } from '../types';

const ENV_JWT_SECRET = process.env.JWT_SECRET;
const ENV_JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const PLACEHOLDER_SECRETS = new Set([
  '',
  'your_secret_here',
  'change_me',
  'medi-ai-sastarx-jwt-secure-key-2026',
]);

if (!ENV_JWT_SECRET || PLACEHOLDER_SECRETS.has(ENV_JWT_SECRET.trim())) {
  throw new Error(
    '[FATAL] JWT_SECRET environment variable is missing or set to an insecure placeholder. ' +
      'Set a strong, unique secret in your backend .env file before starting the server.'
  );
}

const JWT_SECRET: string = ENV_JWT_SECRET;
const JWT_EXPIRES_IN: string = ENV_JWT_EXPIRES_IN;

export const JWT_CONFIG = {
  expiresIn: JWT_EXPIRES_IN,
} as const;

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
  tenantId?: string;
}

// Generates signed JWT session token
export function generateToken(user: UserAccount): string {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenantName
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_CONFIG.expiresIn } as any);
}

// Verifies token (supports standard JWT and Firebase token fallback)
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

// Authentication middleware - requires valid token
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'Authentication required. Missing or malformed Bearer token.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: 'Session expired or invalid',
      error: 'Invalid or expired session token. Please log in again.'
    });
    return;
  }

  req.user = payload;
  req.tenantId = payload.tenantId;
  next();
}

// Optional auth middleware - populates req.user if token is present
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
      req.tenantId = payload.tenantId;
    }
  }
  next();
}

// Role-based Access Control (RBAC) middleware
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Authentication required.'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied',
        error: `Access denied. Role '${req.user.role}' is not authorized for this operation.`
      });
      return;
    }

    next();
  };
}
