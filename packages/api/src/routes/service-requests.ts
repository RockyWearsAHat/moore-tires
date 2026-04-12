import { Router } from 'express';
import { CreateServiceRequestSchema } from '@moore-tires/shared';
import {
  createServiceRequest,
  listServiceRequests,
  getServiceRequestById,
} from '../services/service-request.service.js';
import { intakeRateLimit } from '../middleware/rate-limit.js';
import { AppError } from '../errors.js';

export const serviceRequestsRouter: Router = Router();

/**
 * POST /api/v1/service-requests
 * Public — creates a new service request and enqueues SMS confirmation.
 */
serviceRequestsRouter.post('/', intakeRateLimit, async (req, res, next) => {
  try {
    const result = CreateServiceRequestSchema.safeParse(req.body);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    const serviceRequest = await createServiceRequest(result.data);
    res.status(201).json({ success: true, data: serviceRequest });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/service-requests
 * Auth: manager — lists service requests, optionally filtered by ?status=
 */
serviceRequestsRouter.get('/', async (req, res, next) => {
  try {
    const status = typeof req.query['status'] === 'string' ? req.query['status'] : undefined;
    const data = await listServiceRequests(status);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/service-requests/:id
 * Auth: manager
 */
serviceRequestsRouter.get('/:id', async (req, res, next) => {
  try {
    const data = await getServiceRequestById(req.params['id'] ?? '');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
