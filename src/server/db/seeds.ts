import bcrypt from 'bcryptjs';
import {
  INITIAL_TENANTS,
  INITIAL_CATALOG,
  INITIAL_FEEDS,
  INITIAL_DISPUTES,
  INITIAL_AUDIT_LOGS,
  DEFAULT_USERS,
  INITIAL_PRICE_ALERTS
} from '../../data/mockData';
import { TenantInfo, MedicineCatalogEntry, PricingPartnerFeed, AccuracyDisputeItem, AuditLogItem, UserAccount, PriceAlert } from '../../types';

export interface DatabaseSeeds {
  tenants: TenantInfo[];
  users: Array<UserAccount & { passwordHash: string }>;
  catalog: MedicineCatalogEntry[];
  feeds: PricingPartnerFeed[];
  disputes: AccuracyDisputeItem[];
  auditLogs: AuditLogItem[];
  priceAlerts: PriceAlert[];
}

// Generate secure pre-hashed passwords for default users
export function getSeedData(): DatabaseSeeds {
  const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

  const seededUsers = DEFAULT_USERS.map(user => ({
    ...user,
    passwordHash: defaultPasswordHash
  }));

  return {
    tenants: JSON.parse(JSON.stringify(INITIAL_TENANTS)),
    users: seededUsers,
    catalog: JSON.parse(JSON.stringify(INITIAL_CATALOG)),
    feeds: JSON.parse(JSON.stringify(INITIAL_FEEDS)),
    disputes: JSON.parse(JSON.stringify(INITIAL_DISPUTES)),
    auditLogs: JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS)),
    priceAlerts: JSON.parse(JSON.stringify(INITIAL_PRICE_ALERTS))
  };
}
