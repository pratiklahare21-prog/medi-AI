import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getSeedData, DatabaseSeeds } from './seeds';
import {
  TenantInfo,
  MedicineCatalogEntry,
  PricingPartnerFeed,
  AccuracyDisputeItem,
  AuditLogItem,
  UserAccount,
  PriceAlert,
  LinkedGenericCompound
} from '../types';

export interface DbUser extends UserAccount {
  passwordHash: string;
}

class DatabaseManager {
  private data: DatabaseSeeds;
  private isInitialized = false;

  constructor() {
    this.data = getSeedData();
    this.isInitialized = true;
  }

  // --- Tenants ---
  public async getTenants(): Promise<TenantInfo[]> {
    return this.data.tenants;
  }

  public async getTenantByCode(code: string): Promise<TenantInfo | undefined> {
    return this.data.tenants.find(t => t.tenantCode === code || t.id === code);
  }

  // --- Users ---
  public async getUsers(tenantId?: string): Promise<UserAccount[]> {
    let users = this.data.users;
    if (tenantId) {
      users = users.filter(u => u.tenantId === tenantId);
    }
    // Omit passwordHash from public user account representation
    return users.map(({ passwordHash: _p, ...u }) => u);
  }

  public async getUserByEmail(email: string): Promise<DbUser | undefined> {
    const normalized = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === normalized);
  }

  public async getUserById(id: string): Promise<DbUser | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  public async createUser(newUser: Omit<UserAccount, 'id' | 'joinedAt'> & { password: string; joinedAt?: string }): Promise<UserAccount> {
    const existing = await this.getUserByEmail(newUser.email);
    if (existing) {
      throw new Error(`User with email ${newUser.email} already exists`);
    }

    const passwordHash = bcrypt.hashSync(newUser.password, 10);
    const user: DbUser = {
      ...newUser,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      joinedAt: newUser.joinedAt || 'Just now',
      passwordHash
    };

    this.data.users.unshift(user);

    // Auto-log user registration in audit trail
    await this.addAuditLog({
      action: 'NEW_USER_REGISTERED',
      actor: user.name,
      role: user.role,
      targetEntity: `Practitioner account created for ${user.email} (Tenant: ${user.tenantName})`,
      tenantId: user.tenantId,
      tenantName: user.tenantName,
      status: 'Audited'
    });

    const { passwordHash: _p, ...safeUser } = user;
    return safeUser;
  }

  // --- Medicine Catalog ---
  public async getCatalog(tenantId?: string): Promise<MedicineCatalogEntry[]> {
    // Return the catalog with generics list attached
    return this.data.catalog;
  }

  public async getCatalogItem(id: string): Promise<MedicineCatalogEntry | undefined> {
    return this.data.catalog.find(m => m.id === id);
  }

  public async addCatalogItem(item: MedicineCatalogEntry, tenantId?: string): Promise<MedicineCatalogEntry> {
    const newItem = { ...item };
    if (!newItem.id) {
      newItem.id = `med-${Date.now()}`;
    }
    this.data.catalog.unshift(newItem);

    await this.addAuditLog({
      action: 'REGISTER_MEDICINE_ENTRY',
      actor: newItem.verifierName || 'System Admin',
      role: 'Lead Ops Admin',
      targetEntity: `Added brand ${newItem.brandName} (${newItem.activeSalt})`,
      tenantId: tenantId || 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return newItem;
  }

  public async updateCatalogItem(id: string, updates: Partial<MedicineCatalogEntry>): Promise<MedicineCatalogEntry> {
    const index = this.data.catalog.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error(`Medicine ${id} not found`);
    }
    this.data.catalog[index] = { ...this.data.catalog[index], ...updates };
    return this.data.catalog[index];
  }

  public async linkGeneric(medId: string, generic: LinkedGenericCompound, tenantId?: string): Promise<MedicineCatalogEntry> {
    const med = this.data.catalog.find(m => m.id === medId);
    if (!med) {
      throw new Error(`Medicine ${medId} not found`);
    }

    const currentGenerics = med.genericsList || [];
    const newGeneric = {
      ...generic,
      id: generic.id || `gen-${Date.now()}`
    };

    med.genericsList = [...currentGenerics, newGeneric];
    med.verifiedGenericsCount = med.genericsList.length;

    // Recalculate lowest price & savings if applicable
    if (newGeneric.genericStripMrp < med.lowestGenericPrice) {
      med.lowestGenericPrice = newGeneric.genericStripMrp;
      med.lowestGenericBrand = newGeneric.name;
      med.savingsAmount = +(med.brandedMrp - newGeneric.genericStripMrp).toFixed(2);
      med.savingsPercent = Math.round((med.savingsAmount / med.brandedMrp) * 100);
    }

    await this.addAuditLog({
      action: 'LINK_GENERIC_COMPOUND',
      actor: 'System Clinician',
      role: 'Clinical Pharmacist',
      targetEntity: `Linked bioequivalent generic ${newGeneric.name} to ${med.brandName}`,
      tenantId: tenantId || 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return med;
  }

  public async toggleGenericInRx(medId: string, genericId: string): Promise<MedicineCatalogEntry> {
    const med = this.data.catalog.find(m => m.id === medId);
    if (!med || !med.genericsList) {
      throw new Error(`Medicine or generics not found`);
    }

    let nextState = false;
    let genericName = '';
    med.genericsList = med.genericsList.map(g => {
      if (g.id === genericId) {
        nextState = !g.includedInPatientRx;
        genericName = g.name;
        return { ...g, includedInPatientRx: nextState };
      }
      return g;
    });

    await this.addAuditLog({
      action: nextState ? 'ENABLE_FORMULARY_RX' : 'DISABLE_FORMULARY_RX',
      actor: 'Formulary Director',
      role: 'Formulary Director',
      targetEntity: `${genericName} status set to ${nextState ? 'Included' : 'Excluded'} for innovator ${med.brandName}`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return med;
  }

  // --- Pricing Partner Feeds ---
  public async getFeeds(tenantId?: string): Promise<PricingPartnerFeed[]> {
    return this.data.feeds;
  }

  public async updateFeed(id: string, updates: Partial<PricingPartnerFeed>): Promise<PricingPartnerFeed> {
    const feed = this.data.feeds.find(f => f.id === id);
    if (!feed) {
      throw new Error(`Feed ${id} not found`);
    }
    Object.assign(feed, updates);
    return feed;
  }

  public async retryFeed(id: string, tenantId?: string): Promise<PricingPartnerFeed> {
    const feed = this.data.feeds.find(f => f.id === id);
    if (!feed) {
      throw new Error(`Feed ${id} not found`);
    }

    feed.status = 'Syncing';
    feed.syncProgress = 48;
    feed.notes = 'Manual scraper retry triggered. Resolving TLS session...';

    await this.addAuditLog({
      action: 'TRIGGER_FEED_RESYNC',
      actor: 'Automated Feed Monitor',
      role: 'Lead Ops Admin',
      targetEntity: `Forced manual scraper resync for feed ${feed.name}`,
      tenantId: tenantId || 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    // Simulate recovery in memory
    setTimeout(() => {
      feed.status = 'Healthy';
      feed.syncProgress = undefined;
      feed.updatedAgo = 'Just now';
      feed.notes = 'Successfully recovered after forced retry. SKUs parsed and synchronized.';
    }, 1500);

    return feed;
  }

  // --- Accuracy Disputes ---
  public async getDisputes(tenantId?: string): Promise<AccuracyDisputeItem[]> {
    return this.data.disputes;
  }

  public async resolveDispute(id: string, decision: string, actorName = 'Clinical Lead'): Promise<AccuracyDisputeItem> {
    const disputeIndex = this.data.disputes.findIndex(d => d.id === id);
    if (disputeIndex === -1) {
      throw new Error(`Dispute ${id} not found`);
    }

    const [dispute] = this.data.disputes.splice(disputeIndex, 1);
    dispute.status = 'Resolved';

    await this.addAuditLog({
      action: 'RESOLVE_ACCURACY_DISPUTE',
      actor: actorName,
      role: 'Lead Ops Admin',
      targetEntity: `Resolved dispute #${id} (${dispute.title}) with decision: ${decision}`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return dispute;
  }

  // --- Audit Logs ---
  public async getAuditLogs(tenantId?: string, limit = 50): Promise<AuditLogItem[]> {
    let logs = this.data.auditLogs;
    if (tenantId) {
      logs = logs.filter(l => l.tenantId === tenantId);
    }
    return logs.slice(0, limit);
  }

  public async addAuditLog(entry: {
    action: string;
    actor: string;
    role: string;
    targetEntity: string;
    tenantId: string;
    tenantName: string;
    status?: 'Success' | 'Flagged' | 'Audited';
  }): Promise<AuditLogItem> {
    const secret = process.env.HMAC_AUDIT_SECRET || 'medi-ai-sastarx-hmac-secret-2026';
    const timestamp = 'Just now';
    const rawPayload = `${Date.now()}:${entry.actor}:${entry.action}:${entry.tenantId}`;
    const hash = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex').substring(0, 16);

    const log: AuditLogItem = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
      actor: entry.actor,
      role: entry.role,
      action: entry.action,
      targetEntity: entry.targetEntity,
      tenantId: entry.tenantId,
      tenantName: entry.tenantName,
      hashSignature: `HMAC-SHA256: ${hash}`,
      status: entry.status || 'Audited'
    };

    this.data.auditLogs.unshift(log);
    return log;
  }

  // --- Price Alerts ---
  public async getPriceAlerts(tenantId?: string, recipientTarget?: string): Promise<PriceAlert[]> {
    let alerts = this.data.priceAlerts;
    if (recipientTarget) {
      alerts = alerts.filter(a => a.recipientTarget === recipientTarget);
    }
    return alerts;
  }

  public async createPriceAlert(alertData: Omit<PriceAlert, 'id' | 'createdAt'>): Promise<PriceAlert> {
    const newAlert: PriceAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      createdAt: 'Just now'
    };

    this.data.priceAlerts.unshift(newAlert);

    await this.addAuditLog({
      action: 'CREATE_PRICE_ALERT',
      actor: newAlert.recipientTarget,
      role: 'Clinical Pharmacist',
      targetEntity: `Configured price alert for ${newAlert.medicineName} (Threshold: ₹${newAlert.targetThresholdPrice})`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return newAlert;
  }

  public async updatePriceAlert(id: string, updates: Partial<PriceAlert>): Promise<PriceAlert> {
    const alert = this.data.priceAlerts.find(a => a.id === id);
    if (!alert) {
      throw new Error(`Price alert ${id} not found`);
    }

    Object.assign(alert, updates);

    await this.addAuditLog({
      action: 'UPDATE_PRICE_ALERT',
      actor: alert.recipientTarget,
      role: 'Clinical Pharmacist',
      targetEntity: `Updated price alert for ${alert.medicineName} (Status: ${alert.status})`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return alert;
  }

  public async deletePriceAlert(id: string): Promise<boolean> {
    const index = this.data.priceAlerts.findIndex(a => a.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.priceAlerts.splice(index, 1);

    await this.addAuditLog({
      action: 'DELETE_PRICE_ALERT',
      actor: deleted.recipientTarget,
      role: 'Clinical Pharmacist',
      targetEntity: `Removed price alert for ${deleted.medicineName}`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return true;
  }

  public async simulatePriceDrop(id: string, simulatedPrice: number): Promise<{ alert: PriceAlert; catalogUpdated: boolean }> {
    const alert = this.data.priceAlerts.find(a => a.id === id);
    if (!alert) {
      throw new Error(`Price alert ${id} not found`);
    }

    alert.status = 'Triggered';
    alert.triggeredPrice = simulatedPrice;
    alert.triggeredAt = 'Just now';

    let catalogUpdated = false;
    const med = this.data.catalog.find(m => m.id === alert.medicineId);
    if (med) {
      med.lowestGenericPrice = simulatedPrice;
      med.savingsAmount = +(med.brandedMrp - simulatedPrice).toFixed(2);
      med.savingsPercent = Math.round((med.savingsAmount / med.brandedMrp) * 100);
      catalogUpdated = true;
    }

    await this.addAuditLog({
      action: 'TRIGGER_PRICE_ALERT_EVENT',
      actor: 'Price Feed Pipeline',
      role: 'Lead Ops Admin',
      targetEntity: `Market drop alert triggered: ${alert.medicineName} generic price fell to ₹${simulatedPrice}`,
      tenantId: 'TN-4092',
      tenantName: 'Apollo Health Network',
      status: 'Audited'
    });

    return { alert, catalogUpdated };
  }
}

export const db = new DatabaseManager();
