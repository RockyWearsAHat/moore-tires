import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';

/**
 * Strict request sanitization middleware.
 * - Rejects bodies larger than 1MB
 * - Strips any __proto__ or constructor.prototype pollution attempts
 * - Validates Content-Type header for POST/PATCH/PUT
 */
export function strictSanitize(req: Request, _res: Response, next: NextFunction): void {
  // Reject oversized payloads
  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > 1_048_576) {
    throw AppError.badRequest('Request body too large (max 1MB)');
  }

  // Validate Content-Type for mutation requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body !== undefined) {
    const ct = req.headers['content-type'] || '';
    if (req.body && Object.keys(req.body).length > 0 && !ct.includes('application/json') && !ct.includes('multipart/form-data')) {
      throw AppError.badRequest('Content-Type must be application/json');
    }
  }

  // Prototype pollution guard
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  next();
}

/** Recursively strip prototype pollution keys from an object. */
function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      delete obj[key];
      continue;
    }
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      sanitizeObject(obj[key] as Record<string, unknown>);
    }
  }
}
