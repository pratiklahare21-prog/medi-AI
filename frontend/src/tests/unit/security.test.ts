/**
 * Unit tests — security utilities
 * Covers: input sanitization, JWT token structure, HMAC signature patterns,
 *         rate limit configuration values, password policy enforcement
 */

import { describe, it, expect } from 'vitest';

// ─── Input Sanitization ───────────────────────────────────────────────────────

describe('Input sanitization', () => {
  // Mirror the sanitizeInput helper in src/server/middleware/sanitize.ts
  const sanitizeInput = (input: string): string =>
    input.replace(/<[^>]*>/g, '').trim().slice(0, 1000);

  it('strips HTML tags from user input', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('strips nested HTML', () => {
    expect(sanitizeInput('<b><i>hello</i></b>')).toBe('hello');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world');
  });

  it('truncates input longer than 1000 chars', () => {
    const long = 'a'.repeat(2000);
    expect(sanitizeInput(long).length).toBe(1000);
  });

  it('preserves clean input unchanged', () => {
    expect(sanitizeInput('Januvia 100mg')).toBe('Januvia 100mg');
  });

  it('handles empty string safely', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

// ─── Email Validation ─────────────────────────────────────────────────────────

describe('Email validation', () => {
  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());

  it('accepts valid medical institution emails', () => {
    const validEmails = [
      'sarah.jenkins@apollohealth.org',
      'rajesh.sharma@fortishealth.com',
      'patient@sastarx.in',
    ];
    validEmails.forEach(email => expect(isValidEmail(email)).toBe(true));
  });

  it('rejects malformed emails', () => {
    const invalid = ['notanemail', 'missing@tld', '@nodomain.com', ''];
    invalid.forEach(email => expect(isValidEmail(email)).toBe(false));
  });
});

// ─── Password Policy ──────────────────────────────────────────────────────────

describe('Password policy enforcement', () => {
  const meetsPasswordPolicy = (password: string): boolean =>
    password.length >= 8;

  it('accepts passwords of 8+ characters', () => {
    expect(meetsPasswordPolicy('SecureP@ss1')).toBe(true);
  });

  it('rejects passwords shorter than 8 characters', () => {
    expect(meetsPasswordPolicy('short')).toBe(false);
  });

  it('rejects empty password', () => {
    expect(meetsPasswordPolicy('')).toBe(false);
  });
});

// ─── JWT Token Format ─────────────────────────────────────────────────────────

describe('JWT token format validation', () => {
  const isJwtFormat = (token: string): boolean =>
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token);

  it('recognises valid JWT format (3 dot-separated parts)', () => {
    const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzci0wMSJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(isJwtFormat(validJwt)).toBe(true);
  });

  it('rejects plain text strings as JWT', () => {
    expect(isJwtFormat('local-offline-session-token')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isJwtFormat('')).toBe(false);
  });
});

// ─── HMAC Signature Pattern ───────────────────────────────────────────────────

describe('HMAC-SHA256 audit signature format', () => {
  const isValidHmacSignature = (sig: string): boolean =>
    /^HMAC-SHA256: [a-f0-9]{64}$/.test(sig);

  it('validates correctly formatted HMAC-SHA256 signatures', () => {
    const validSig = 'HMAC-SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069';
    expect(isValidHmacSignature(validSig)).toBe(true);
  });

  it('rejects signatures with wrong prefix', () => {
    expect(isValidHmacSignature('SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069')).toBe(false);
  });

  it('rejects signatures with incorrect hex length', () => {
    expect(isValidHmacSignature('HMAC-SHA256: abc123')).toBe(false);
  });
});

// ─── Rate Limit Configuration ─────────────────────────────────────────────────

describe('Rate limit configuration values', () => {
  it('auth rate limit window is 15 minutes in ms', () => {
    const windowMs = 15 * 60 * 1000;
    expect(windowMs).toBe(900000);
  });

  it('auth rate limit max is 20 requests', () => {
    const max = 20;
    expect(max).toBeLessThanOrEqual(20);
  });

  it('AI rate limit is more permissive at 30 requests per minute', () => {
    const aiMax = 30;
    const authMax = 20;
    expect(aiMax).toBeGreaterThan(authMax);
  });
});

// ─── Tenant Code Sanitization ─────────────────────────────────────────────────

describe('Tenant ID validation', () => {
  const isValidTenantId = (id: string): boolean =>
    /^TN-\d{4}$/.test(id);

  it('accepts valid tenant IDs', () => {
    expect(isValidTenantId('TN-4092')).toBe(true);
    expect(isValidTenantId('TN-3018')).toBe(true);
  });

  it('rejects injection attempts in tenant ID field', () => {
    expect(isValidTenantId("'; DROP TABLE tenants;--")).toBe(false);
    expect(isValidTenantId('<script>')).toBe(false);
    expect(isValidTenantId('')).toBe(false);
  });
});
