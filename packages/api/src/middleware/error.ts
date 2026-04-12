import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors.js';
import type { ApiErrorResponse } from '@moore-tires/shared';

/**
 * Express global error handler.
 * Must be registered last with 4 parameters (including _next) so Express identifies it as an error handler.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Log unexpected errors server-side; never expose internals to clients
  console.error('Unhandled error:', err);
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  };
  res.status(500).json(body);
}
