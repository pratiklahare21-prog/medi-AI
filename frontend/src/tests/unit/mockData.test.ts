/**
 * Unit tests — mock data integrity
 * Ensures INITIAL_CATALOG, INITIAL_DISPUTES, CHRONIC_PACKS, SAMPLE_OCR
 * all satisfy the TypeScript interface contracts at runtime.
 */

import { describe, it, expect } from 'vitest';
import {
  INITIAL_CATALOG,
  INITIAL_DISPUTES,
  INITIAL_FEEDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_TENANTS,
  CHRONIC_PACKS,
  SAMPLE_OCR_PRESCRIPTIONS,
  INITIAL_PRICE_ALERTS,
  DEFAULT_USERS,
} from '../../data/mockData';

describe('INITIAL_CATALOG integrity', () => {
  it('has at least 6 medicine entries', () => {
    expect(INITIAL_CATALOG.length).toBeGreaterThanOrEqual(6);
  });

  it('every entry has a unique id', () => {
    const ids = INITIAL_CATALOG.map(m => m.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('every entry has positive brandedMrp and lowestGenericPrice', () => {
    INITIAL_CATALOG.forEach(med => {
      expect(med.brandedMrp).toBeGreaterThan(0);
      expect(med.lowestGenericPrice).toBeGreaterThan(0);
    });
  });

  it('lowestGenericPrice is always less than brandedMrp', () => {
    INITIAL_CATALOG.forEach(med => {
      expect(med.lowestGenericPrice).toBeLessThan(med.brandedMrp);
    });
  });

  it('savingsPercent is between 0 and 100 for all medicines', () => {
    INITIAL_CATALOG.forEach(med => {
      expect(med.savingsPercent).toBeGreaterThanOrEqual(0);
      expect(med.savingsPercent).toBeLessThanOrEqual(100);
    });
  });

  it('bioequivalenceConfidence is between 0 and 100', () => {
    INITIAL_CATALOG.forEach(med => {
      expect(med.bioequivalenceConfidence).toBeGreaterThanOrEqual(0);
      expect(med.bioequivalenceConfidence).toBeLessThanOrEqual(100);
    });
  });

  it('all entries have required string fields', () => {
    INITIAL_CATALOG.forEach(med => {
      expect(med.brandName).toBeTruthy();
      expect(med.activeSalt).toBeTruthy();
      expect(med.therapeuticCategory).toBeTruthy();
      expect(med.regulatoryStatus).toBeTruthy();
    });
  });
});

describe('INITIAL_DISPUTES integrity', () => {
  it('has at least 3 disputes', () => {
    expect(INITIAL_DISPUTES.length).toBeGreaterThanOrEqual(3);
  });

  it('every dispute has valid severity', () => {
    const valid = ['Critical', 'Warning', 'Low'];
    INITIAL_DISPUTES.forEach(d => {
      expect(valid).toContain(d.severity);
    });
  });

  it('every dispute has valid status', () => {
    const valid = ['Open', 'Under Review', 'Resolved', 'Dismissed'];
    INITIAL_DISPUTES.forEach(d => {
      expect(valid).toContain(d.status);
    });
  });
});

describe('INITIAL_FEEDS integrity', () => {
  it('has at least 4 feed entries', () => {
    expect(INITIAL_FEEDS.length).toBeGreaterThanOrEqual(4);
  });

  it('every feed has valid status', () => {
    const valid = ['Healthy', 'Syncing', 'Stale', 'Degraded'];
    INITIAL_FEEDS.forEach(f => {
      expect(valid).toContain(f.status);
    });
  });

  it('every feed has positive skusParsed', () => {
    INITIAL_FEEDS.forEach(f => {
      expect(f.skusParsed).toBeGreaterThan(0);
    });
  });
});

describe('INITIAL_AUDIT_LOGS integrity', () => {
  it('every log has HMAC-SHA256 signature', () => {
    INITIAL_AUDIT_LOGS.forEach(log => {
      expect(log.hashSignature).toMatch(/^HMAC-SHA256:/);
    });
  });

  it('every log has valid status', () => {
    const valid = ['Success', 'Flagged', 'Audited'];
    INITIAL_AUDIT_LOGS.forEach(log => {
      expect(valid).toContain(log.status);
    });
  });
});

describe('INITIAL_TENANTS integrity', () => {
  it('has 3 tenants', () => {
    expect(INITIAL_TENANTS.length).toBe(3);
  });

  it('tenant codes match TN-XXXX format', () => {
    INITIAL_TENANTS.forEach(t => {
      expect(t.tenantCode).toMatch(/^TN-\d{4}$/);
    });
  });

  it('all tenants have Active RLS or Standby status', () => {
    INITIAL_TENANTS.forEach(t => {
      expect(['Active RLS', 'Standby']).toContain(t.status);
    });
  });
});

describe('CHRONIC_PACKS integrity', () => {
  it('has at least 3 packs', () => {
    expect(CHRONIC_PACKS.length).toBeGreaterThanOrEqual(3);
  });

  it('estimatedMonthlyPrice is less than originalPrice', () => {
    CHRONIC_PACKS.forEach(pack => {
      expect(pack.estimatedMonthlyPrice).toBeLessThan(pack.originalPrice);
    });
  });

  it('savingsPercent is positive', () => {
    CHRONIC_PACKS.forEach(pack => {
      expect(pack.savingsPercent).toBeGreaterThan(0);
    });
  });

  it('medicines array is non-empty', () => {
    CHRONIC_PACKS.forEach(pack => {
      expect(pack.medicines.length).toBeGreaterThan(0);
    });
  });
});

describe('SAMPLE_OCR_PRESCRIPTIONS integrity', () => {
  it('has at least 3 sample prescriptions', () => {
    expect(SAMPLE_OCR_PRESCRIPTIONS.length).toBeGreaterThanOrEqual(3);
  });

  it('every OCR entry has confidence > 90', () => {
    SAMPLE_OCR_PRESCRIPTIONS.forEach(rx => {
      expect(rx.confidence).toBeGreaterThan(90);
    });
  });

  it('every OCR entry has positive savings', () => {
    SAMPLE_OCR_PRESCRIPTIONS.forEach(rx => {
      expect(rx.savings).toBeGreaterThan(0);
    });
  });

  it('genericPrice is less than originalPrice', () => {
    SAMPLE_OCR_PRESCRIPTIONS.forEach(rx => {
      expect(rx.genericPrice).toBeLessThan(rx.originalPrice);
    });
  });
});

describe('DEFAULT_USERS integrity', () => {
  it('has at least 2 seeded users', () => {
    expect(DEFAULT_USERS.length).toBeGreaterThanOrEqual(2);
  });

  it('every user has a valid role', () => {
    const validRoles = [
      'Lead Ops Admin',
      'Clinical Pharmacist',
      'Prescribing Physician',
      'Formulary Director',
      'Patient / Consumer',
    ];
    DEFAULT_USERS.forEach(u => {
      expect(validRoles).toContain(u.role);
    });
  });

  it('every user has unique email', () => {
    const emails = DEFAULT_USERS.map(u => u.email.toLowerCase());
    const unique = new Set(emails);
    expect(unique.size).toBe(emails.length);
  });
});

describe('INITIAL_PRICE_ALERTS integrity', () => {
  it('has at least 3 alerts', () => {
    expect(INITIAL_PRICE_ALERTS.length).toBeGreaterThanOrEqual(3);
  });

  it('every alert has valid status', () => {
    const valid = ['Active', 'Triggered', 'Paused'];
    INITIAL_PRICE_ALERTS.forEach(a => {
      expect(valid).toContain(a.status);
    });
  });

  it('targetThresholdPrice is positive', () => {
    INITIAL_PRICE_ALERTS.forEach(a => {
      expect(a.targetThresholdPrice).toBeGreaterThan(0);
    });
  });
});
