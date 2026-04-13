import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload, UserRole } from '@moore-tires/shared';
import { AppError } from '../errors.js';

/**
 * Augment Express Request to carry the authenticated user's JWT payload.
 * Available after requireAuth middleware runs.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Validates the JWT access token from the Authorization header.
 * Attaches the decoded payload to req.user.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

/**
 * Requires the authenticated user to have one of the specified roles.
 * Must be used after requireAuth.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('You do not have permission to access this resource');
    }
    next();
  };
}

/**
 * Helper to extract the authenticated user from the request.
 * Throws 401 if not authenticated.
 */
export function getAuthUser(req: Request): JwtPayload {
  if (!req.user) {
    throw AppError.unauthorized();
  }
  return req.user;
}
