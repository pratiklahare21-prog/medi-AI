import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

// Multi-tenant isolation middleware - extracts tenant context from headers or auth token
export function tenantContext(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const headerTenant = req.headers['x-tenant-id'];

  if (typeof headerTenant === 'string' && headerTenant.trim()) {
    req.tenantId = headerTenant.trim();
  } else if (req.user?.tenantId) {
    req.tenantId = req.user.tenantId;
  } else {
    // Default fallback tenant for public / unauthenticated queries
    req.tenantId = 'TN-4092';
  }

  next();
}
