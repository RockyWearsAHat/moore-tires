import { Router } from 'express';
import {
  ScheduleJobSchema,
  UpdateJobStatusSchema,
  ReassignJobSchema,
} from '@moore-tires/shared';
import {
  scheduleJob,
  updateJobStatus,
  reassignJob,
  getTechnicianJobs,
  getTodayJobsForDispatch,
} from '../services/job.service.js';
import { AppError } from '../errors.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const jobsRouter: Router = Router();

// All job routes require a valid JWT.
jobsRouter.use(requireAuth);

/**
 * POST /api/v1/jobs
 * Auth: admin | district_manager — schedules a job from a pending service request.
 */
jobsRouter.post(
  '/',
  requireRole('admin', 'district_manager'),
  async (req, res, next) => {
    try {
      const result = ScheduleJobSchema.safeParse(req.body);
      if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

      const scheduledById = req.user?.userId ?? '';
      const job = await scheduleJob(result.data, scheduledById);
      res.status(201).json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/jobs/today
 * Auth: admin | district_manager — returns all jobs for today's dispatch board.
 */
jobsRouter.get(
  '/today',
  requireRole('admin', 'district_manager'),
  async (_req, res, next) => {
    try {
      const data = await getTodayJobsForDispatch();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/v1/jobs/:id/status
 * Auth: any authenticated user (technicians update their own jobs).
 */
jobsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const result = UpdateJobStatusSchema.safeParse(req.body);
    if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

    const requesterId = req.user?.userId ?? '';
    const job = await updateJobStatus(req.params['id'] ?? '', result.data, requesterId);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/jobs/:id/assign
 * Auth: admin | district_manager — reassigns job to a different technician.
 */
jobsRouter.patch(
  '/:id/assign',
  requireRole('admin', 'district_manager'),
  async (req, res, next) => {
    try {
      const result = ReassignJobSchema.safeParse(req.body);
      if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

      const requesterId = req.user?.userId ?? '';
      const rawId = req.params['id'];
      const jobId = Array.isArray(rawId) ? (rawId[0] ?? '') : (rawId ?? '');
      const job = await reassignJob(jobId, result.data, requesterId);
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/jobs/technician/:technicianId
 * Auth: any authenticated user — returns jobs assigned to the technician.
 */
jobsRouter.get('/technician/:technicianId', async (req, res, next) => {
  try {
    const data = await getTechnicianJobs(req.params['technicianId'] ?? '');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
