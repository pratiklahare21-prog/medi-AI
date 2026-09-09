/**
 * Rate Limiting Middleware
 * Uses express-rate-limit to protect authentication and AI endpoints
 * from abuse, brute-force attacks, and runaway AI API cost.
 */

import rateLimit from 'express-rate-limit';

/**
 * Auth rate limiter: 20 requests per 15 minutes per IP.
 * Applied to: POST /api/auth/login, POST /api/auth/register
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  },
  skip: (req) => {
    // Skip rate limiting in test environment
    return process.env.NODE_ENV === 'test';
  },
});

/**
 * AI endpoints rate limiter: 30 requests per minute per IP.
 * Applied to: POST /api/ai/ocr, POST /api/ai/recommend, POST /api/ai/search, POST /api/ai/triage-dispute
 * More permissive than auth but still guards against Gemini API cost abuse.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'AI request rate limit exceeded. Maximum 30 requests per minute per IP.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter: 300 requests per minute per IP.
 * Applied globally to /api/* as a safety net.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,         // 1 minute
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Request rate limit exceeded. Please slow down.',
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});
