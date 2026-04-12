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

export const jobsRouter = Router();

/**
 * POST /api/v1/jobs
 * Auth: manager — schedules a job from a pending service request.
 */
jobsRouter.post('/', async (req, res, next) => {
  try {
    const result = ScheduleJobSchema.safeParse(req.body);
    if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

    // TODO: replace with Clerk-authenticated user id
    const scheduledById = (req.headers['x-user-id'] as string | undefined) ?? 'system';
    const job = await scheduleJob(result.data, scheduledById);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/jobs/today
 * Auth: manager/dispatcher — returns all jobs for today's dispatch board.
 */
jobsRouter.get('/today', async (_req, res, next) => {
  try {
    const data = await getTodayJobsForDispatch();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/jobs/:id/status
 * Auth: tech|manager — transitions job status via the state machine.
 */
jobsRouter.patch('/:id/status', async (req, res, next) => {
  try {
    const result = UpdateJobStatusSchema.safeParse(req.body);
    if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

    const requesterId = (req.headers['x-user-id'] as string | undefined) ?? 'system';
    const job = await updateJobStatus(req.params['id'] ?? '', result.data, requesterId);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/jobs/:id/assign
 * Auth: manager — reassigns job to a different technician.
 */
jobsRouter.patch('/:id/assign', async (req, res, next) => {
  try {
    const result = ReassignJobSchema.safeParse(req.body);
    if (!result.success) throw AppError.badRequest('Validation failed', result.error.flatten());

    const requesterId = (req.headers['x-user-id'] as string | undefined) ?? 'system';
    const job = await reassignJob(req.params['id'] ?? '', result.data, requesterId);
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/technicians/:id/jobs
 * Auth: tech — returns jobs assigned to the technician.
 */
jobsRouter.get('/technician/:technicianId', async (req, res, next) => {
  try {
    const data = await getTechnicianJobs(req.params['technicianId'] ?? '');
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});
