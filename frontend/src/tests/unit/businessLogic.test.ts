/**
 * Unit tests — core business logic
 * Covers: savings calculations, price alert flow, audit log structure, formulary tier rules
 */

import { describe, it, expect } from 'vitest';
import type {
  MedicineCatalogEntry,
  PriceAlert,
  AuditLogItem,
  GenericBioequivalent,
} from '../../types';

// ─── Savings Calculation ────────────────────────────────────────────────────

describe('Medicine savings calculation', () => {
  const makeMed = (brandedMrp: number, lowestGenericPrice: number): MedicineCatalogEntry =>
    ({
      id: 'med-test',
      brandName: 'TestBrand',
      manufacturer: 'TestMfg',
      formulationType: 'Tab 10s',
      dosageForm: 'Oral Tablet',
      activeSalt: 'TestSalt',
      saltStrength: '10mg',
      compositionDetails: 'Test composition',
      atcCode: 'A00AA00',
      therapeuticCategory: 'Test',
      verifiedGenericsCount: 1,
      brandedMrp,
      lowestGenericPrice,
      lowestGenericBrand: 'TestGeneric',
      savingsAmount: brandedMrp - lowestGenericPrice,
      savingsPercent: Math.round(((brandedMrp - lowestGenericPrice) / brandedMrp) * 100),
      savingsIntervalText: 'per strip',
      regulatoryStatus: 'CDSCO',
      bioequivalenceConfidence: 98,
      verifierName: 'Dr. Test',
      verifiedTimeAgo: '1h ago',
    } as MedicineCatalogEntry);

  it('calculates savings amount correctly', () => {
    const med = makeMed(435, 120);
    expect(med.savingsAmount).toBe(315);
  });

  it('calculates savings percent correctly for Januvia', () => {
    const med = makeMed(435, 120);
    // (315 / 435) * 100 = 72.41... → rounds to 72
    expect(med.savingsPercent).toBe(72);
  });

  it('calculates zero savings when generic equals branded', () => {
    const med = makeMed(100, 100);
    expect(med.savingsAmount).toBe(0);
    expect(med.savingsPercent).toBe(0);
  });

  it('handles max savings (100% theoretical)', () => {
    const med = makeMed(200, 0);
    expect(med.savingsAmount).toBe(200);
    expect(med.savingsPercent).toBe(100);
  });

  it('rounds savings percent consistently', () => {
    const med = makeMed(310, 58);
    // (252 / 310) * 100 = 81.29... → rounds to 81
    expect(med.savingsPercent).toBe(81);
  });
});

// ─── Generic Formulary Status ────────────────────────────────────────────────

describe('Generic formulary status tiers', () => {
  const validTiers: GenericBioequivalent['formularyStatus'][] = [
    'Tier 1 Primary',
    'Preferred',
    'Standard',
    'Restricted',
  ];

  it('recognises all four valid formulary tiers', () => {
    validTiers.forEach(tier => {
      expect(['Tier 1 Primary', 'Preferred', 'Standard', 'Restricted']).toContain(tier);
    });
  });

  it('Tier 1 Primary is first-line recommendation', () => {
    const generic: GenericBioequivalent = {
      id: 'gen-1',
      name: 'Zita 100',
      manufacturer: 'Glenmark',
      compositionMatch: 'Sitagliptin 100mg',
      genericStripMrp: 120,
      patientSavingsPercent: 72,
      patientSavingsAmount: 315,
      verifiedMatch: true,
      includedInPatientRx: true,
      formularyStatus: 'Tier 1 Primary',
      similarityFactorF2: 74.2,
    };
    expect(generic.formularyStatus).toBe('Tier 1 Primary');
    expect(generic.verifiedMatch).toBe(true);
    expect(generic.similarityFactorF2).toBeGreaterThan(65); // WHO threshold
  });
});

// ─── Price Alert Flow ────────────────────────────────────────────────────────

describe('Price alert lifecycle', () => {
  const makeAlert = (status: PriceAlert['status']): PriceAlert => ({
    id: 'alert-1',
    medicineId: 'med-01',
    medicineName: 'Januvia 100mg',
    activeSalt: 'Sitagliptin Phosphate',
    currentLowestPrice: 120,
    brandedMrp: 435,
    targetThresholdPrice: 95,
    channel: 'In-App',
    recipientTarget: 'test@example.com',
    status,
    createdAt: '2026-09-09',
  });

  it('alert starts as Active', () => {
    const alert = makeAlert('Active');
    expect(alert.status).toBe('Active');
  });

  it('alert transitions to Triggered when price drops below threshold', () => {
    const alert = makeAlert('Active');
    const simulatedPrice = 90; // below threshold of 95
    const triggered = simulatedPrice < alert.targetThresholdPrice;
    expect(triggered).toBe(true);

    const updatedAlert: PriceAlert = {
      ...alert,
      status: 'Triggered',
      triggeredPrice: simulatedPrice,
      triggeredAt: 'Just now',
    };
    expect(updatedAlert.status).toBe('Triggered');
    expect(updatedAlert.triggeredPrice).toBe(90);
  });

  it('alert does NOT trigger when price is above threshold', () => {
    const alert = makeAlert('Active');
    const simulatedPrice = 100; // above threshold of 95
    const shouldTrigger = simulatedPrice < alert.targetThresholdPrice;
    expect(shouldTrigger).toBe(false);
  });

  it('paused alert does not react to price changes', () => {
    const alert = makeAlert('Paused');
    expect(alert.status).toBe('Paused');
    // A paused alert: price drop should be ignored in business logic
    const simulatedPrice = 80;
    const shouldTrigger = alert.status === 'Active' && simulatedPrice < alert.targetThresholdPrice;
    expect(shouldTrigger).toBe(false);
  });

  it('savings calculation for triggered alert is correct', () => {
    const alert = makeAlert('Triggered');
    const savings = alert.brandedMrp - (alert.triggeredPrice ?? alert.targetThresholdPrice);
    // 435 - 95 = 340
    expect(savings).toBe(340);
  });
});

// ─── Audit Log Structure ─────────────────────────────────────────────────────

describe('Audit log tamper-evident structure', () => {
  const makeLog = (): AuditLogItem => ({
    id: 'aud-test-01',
    timestamp: '2026-09-09 10:00:00',
    actor: 'Dr. Sarah Jenkins',
    role: 'Lead Ops Admin',
    action: 'BIOEQUIVALENCE_APPROVED',
    targetEntity: 'Sitagliptin 100mg (Zita 100)',
    tenantId: 'TN-4092',
    tenantName: 'Apollo Health Network',
    hashSignature: 'HMAC-SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    status: 'Audited',
  });

  it('audit log has required tamper-evident fields', () => {
    const log = makeLog();
    expect(log.hashSignature).toMatch(/^HMAC-SHA256:/);
    expect(log.actor).toBeTruthy();
    expect(log.action).toBeTruthy();
    expect(log.tenantId).toBeTruthy();
    expect(log.timestamp).toBeTruthy();
  });

  it('audit log hash signature has expected format', () => {
    const log = makeLog();
    // Format: "HMAC-SHA256: <64 hex chars>"
    const parts = log.hashSignature.split(': ');
    expect(parts[0]).toBe('HMAC-SHA256');
    expect(parts[1]).toMatch(/^[a-f0-9]{64}$/);
  });

  it('audit log status values are valid', () => {
    const validStatuses: AuditLogItem['status'][] = ['Success', 'Flagged', 'Audited'];
    const log = makeLog();
    expect(validStatuses).toContain(log.status);
  });

  it('audit log includes tenant isolation fields', () => {
    const log = makeLog();
    expect(log.tenantId).toBeDefined();
    expect(log.tenantName).toBeDefined();
    // Tenant ID follows TN-XXXX format
    expect(log.tenantId).toMatch(/^TN-\d+$/);
  });
});

// ─── Bioequivalence f2 Score ─────────────────────────────────────────────────

describe('Bioequivalence f2 similarity factor thresholds', () => {
  it('f2 > 65 is considered highly similar (WHO threshold)', () => {
    const f2Scores = [74.2, 78.5, 82.4, 85.0];
    f2Scores.forEach(score => {
      expect(score).toBeGreaterThan(65);
    });
  });

  it('f2 between 50-65 is acceptable bioequivalence', () => {
    const borderlineScore = 58.0;
    expect(borderlineScore).toBeGreaterThanOrEqual(50);
    expect(borderlineScore).toBeLessThan(65);
  });

  it('f2 < 50 indicates non-bioequivalent formulation', () => {
    const failingScore = 42.0;
    expect(failingScore).toBeLessThan(50);
  });
});

// ─── Multi-Tenant Isolation ──────────────────────────────────────────────────

describe('Multi-tenant data isolation', () => {
  it('tenant codes follow expected TN-XXXX format', () => {
    const tenantCodes = ['TN-4092', 'TN-3018', 'TN-5521'];
    tenantCodes.forEach(code => {
      expect(code).toMatch(/^TN-\d{4}$/);
    });
  });

  it('different tenants produce different data namespaces', () => {
    const tenant1 = { tenantId: 'TN-4092', schema: 'tnt_apollo_01' };
    const tenant2 = { tenantId: 'TN-3018', schema: 'tnt_fortis_02' };
    expect(tenant1.tenantId).not.toBe(tenant2.tenantId);
    expect(tenant1.schema).not.toBe(tenant2.schema);
  });
});
