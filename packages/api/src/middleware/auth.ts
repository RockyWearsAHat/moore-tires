import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@moore-tires/db';
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
 * Zero-trust auth middleware.
 * 1. Validates the JWT access token from the Authorization header.
 * 2. Verifies the user still exists AND is active in the database.
 * 3. Attaches the decoded payload to req.user.
 *
 * A revoked/deactivated user is rejected even if they hold a valid JWT.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or invalid authorization header');
  }

  const token = authHeader.slice(7);
  if (!token || token.length > 2048) {
    throw AppError.unauthorized('Malformed token');
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    // Zero-trust: verify user is still active in DB on every request
    User.findById(payload.userId)
      .select('isActive role')
      .lean()
      .then((dbUser) => {
        if (!dbUser || !dbUser.isActive) {
          return next(AppError.unauthorized('Account is deactivated or does not exist'));
        }
        // Ensure the role in JWT matches DB (prevents stale tokens after role change)
        if (dbUser.role !== payload.role) {
          return next(AppError.unauthorized('Token role mismatch — please re-authenticate'));
        }
        req.user = payload;
        next();
      })
      .catch(() => next(AppError.unauthorized('Authentication verification failed')));
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
