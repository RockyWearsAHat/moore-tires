/**
 * Route helper utilities — DRY wrappers that reduce boilerplate in route handlers.
 *
 * CS3500 principle: Single Responsibility.
 * Validation, error forwarding, and JSON serialisation are cross-cutting
 * concerns; keeping them here means route files only contain business intent.
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { ZodSchema, ZodTypeAny, z } from 'zod';
import { AppError } from '../errors.js';

/**
 * Wraps a route handler with Zod schema validation on req.body.
 *
 * Parses the request body against `schema`. If validation fails the request is
 * rejected with a 400 AppError containing the field-level errors. On success,
 * `handler` is called with the strongly-typed parsed data.
 *
 * Usage:
 * ```ts
 * router.post('/', withValidation(MySchema, async (data, req, res) => {
 *   const result = await myService.doWork(data);
 *   res.status(201).json({ success: true, data: result });
 * }));
 * ```
 */
export function withValidation<T extends ZodTypeAny>(
  schema: ZodSchema<z.infer<T>>,
  handler: (data: z.infer<T>, req: Request, res: Response) => Promise<void>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        throw AppError.badRequest('Validation failed', result.error.flatten());
      }
      await handler(result.data as z.infer<T>, req, res);
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Wraps a route handler with query-parameter Zod schema validation.
 *
 * Same contract as withValidation but parses req.query instead of req.body.
 */
export function withQueryValidation<T extends ZodTypeAny>(
  schema: ZodSchema<z.infer<T>>,
  handler: (data: z.infer<T>, req: Request, res: Response) => Promise<void>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        throw AppError.badRequest('Invalid query parameters', result.error.flatten());
      }
      await handler(result.data as z.infer<T>, req, res);
    } catch (err) {
      next(err);
    }
  };
}
