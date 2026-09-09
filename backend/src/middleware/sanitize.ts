/**
 * Input Sanitization Middleware
 * Strips HTML tags, trims whitespace, and enforces max string length
 * on all incoming req.body string fields to prevent XSS and injection attacks.
 */

import { Request, Response, NextFunction } from 'express';

const MAX_STRING_LENGTH = 1000;
const MAX_BODY_DEPTH = 5;

/**
 * Recursively sanitize a value:
 * - Strings: strip HTML, trim, enforce max length
 * - Objects/Arrays: sanitize each field recursively (up to MAX_BODY_DEPTH)
 */
export function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > MAX_BODY_DEPTH) return value;

  if (typeof value === 'string') {
    return value
      .replace(/<[^>]*>/g, '')          // strip HTML tags
      .replace(/javascript:/gi, '')      // strip javascript: URIs
      .replace(/on\w+\s*=/gi, '')        // strip inline event handlers
      .trim()
      .slice(0, MAX_STRING_LENGTH);
  }

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, depth + 1));
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Protect against prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      sanitized[key] = sanitizeValue(val, depth + 1);
    }
    return sanitized;
  }

  return value;
}

/**
 * Express middleware: sanitize req.body on every mutating request
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  next();
}

/**
 * Standalone helper — use in route handlers for individual field validation
 */
export function sanitizeInput(input: string): string {
  return sanitizeValue(input) as string;
}
