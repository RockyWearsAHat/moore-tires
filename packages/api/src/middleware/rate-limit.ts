import rateLimit from 'express-rate-limit';
import type { ApiErrorResponse } from '@moore-tires/shared';

/**
 * 10 requests per minute per IP — applied to the public service-request intake endpoint.
 */
export const intakeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait before submitting again.',
      },
    };
    res.status(429).json(body);
  },
});

/**
 * 5 login/register attempts per 15 minutes per IP.
 */
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(_req, res) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again later.',
      },
    };
    res.status(429).json(body);
  },
});
