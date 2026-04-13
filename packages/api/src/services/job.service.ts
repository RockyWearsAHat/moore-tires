/**
 * Job service — scheduling, status transitions, and reassignment.
 */
import mongoose from 'mongoose';
import {
  type ScheduleJobInput,
  type UpdateJobStatusInput,
  type ReassignJobInput,
  JOB_STATUS_TRANSITIONS,
  SMS_TEMPLATES,
} from '@moore-tires/shared';
import { Job, Appointment, ServiceRequest, Technician, Customer } from '@moore-tires/db';
import { AppError } from '../errors.js';
import { pushQueue, smsQueue, reminderQueue } from '../queue.js';
import {
  emitJobStatusChanged,
  emitCalendarUpdated,
} from '../socket.js';

/**
 * Schedules a job: conflict-checks the technician's calendar, creates Job +
 * Appointment in a MongoDB transaction, sends push notification, and enqueues
 * reminders.
 */
export async function scheduleJob(input: ScheduleJobInput, scheduledById: string) {
  const { serviceRequestId, technicianId, startsAt, endsAt } = input;

  const startsAtDate = new Date(startsAt);
  const endsAtDate = new Date(endsAt);

  if (endsAtDate.getTime() - startsAtDate.getTime() < 30 * 60 * 1000) {
    throw AppError.badRequest('Appointment slot must be at least 30 minutes.');
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ── Conflict check within the transaction (AC-07) ──────────────────────
    const overlap = await Appointment.findOne({
      technicianId,
      $or: [
        { startsAt: { $lt: endsAtDate }, endsAt: { $gt: startsAtDate } },
      ],
    }).session(session);

    if (overlap) {
      throw AppError.conflict(
        'Technician already has an appointment during this time slot.'
      );
    }

    // ── Create Job ──────────────────────────────────────────────────────────
    const [job] = await Job.create(
      [
        {
          serviceRequestId,
          technicianId,
          status: 'SCHEDULED',
          scheduledAt: startsAtDate,
        },
      ],
      { session }
    );
    if (!job) throw new AppError('Failed to create job');

    // ── Create Appointment ──────────────────────────────────────────────────
    await Appointment.create(
      [{ jobId: job._id, technicianId, startsAt: startsAtDate, endsAt: endsAtDate }],
      { session }
    );

    // ── Update ServiceRequest status ────────────────────────────────────────
    await ServiceRequest.findByIdAndUpdate(serviceRequestId, {
      status: 'SCHEDULED',
    }).session(session);

    await session.commitTransaction();

    // ── Post-transaction: notifications ────────────────────────────────────
    const technician = await Technician.findById(technicianId).lean();
    if (technician?.expoPushToken) {
      await pushQueue?.add('push:job_assigned', {
        expoPushToken: technician.expoPushToken,
        jobId: String(job._id),
        address: 'See job details',
        dateTime: startsAt,
      });
    }

    // Customer SMS: appointment confirmed
    const sr = await ServiceRequest.findById(serviceRequestId)
      .populate<{ customerId: { phone: string; fullName: string } }>('customerId', 'phone fullName')
      .lean();

    if (sr?.customerId && typeof sr.customerId !== 'string') {
      const firstName = technician?.fullName.split(' ')[0] ?? '';
      await smsQueue?.add('sms:send', {
        to: sr.customerId.phone,
        templateId: SMS_TEMPLATES.sms_confirmed,
        variables: {
          techFirstName: firstName,
          dateTime: startsAt,
        },
      });
    }

    // Reminder jobs — store BullMQ jobId on Appointment for cancellation (AC-18)
    const reminder24h = await reminderQueue?.add(
      'sms:reminder',
      {
        to: sr?.customerId && typeof sr.customerId !== 'string' ? sr.customerId.phone : '',
        templateId: SMS_TEMPLATES.sms_reminder_24h,
        variables: { dateTime: startsAt },
      },
      { delay: Math.max(0, startsAtDate.getTime() - Date.now() - 24 * 60 * 60 * 1000) }
    );
    const reminder2h = await reminderQueue?.add(
      'sms:reminder',
      {
        to: sr?.customerId && typeof sr.customerId !== 'string' ? sr.customerId.phone : '',
        templateId: SMS_TEMPLATES.sms_reminder_2h,
        variables: { dateTime: startsAt },
      },
      { delay: Math.max(0, startsAtDate.getTime() - Date.now() - 2 * 60 * 60 * 1000) }
    );
    if (reminder24h || reminder2h) {
      await Appointment.findOneAndUpdate(
        { jobId: job._id },
        {
          ...(reminder24h && { reminderJobId24h: reminder24h.id }),
          ...(reminder2h && { reminderJobId2h: reminder2h.id }),
        }
      );
    }

    // Real-time broadcast
    const dateStr = startsAt.split('T')[0] ?? startsAt;
    emitCalendarUpdated(dateStr);

    return job;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

/**
 * Updates job status. Guards invalid transitions and terminal-state re-entry (AC-16).
 */
export async function updateJobStatus(
  jobId: string,
  input: UpdateJobStatusInput,
  requesterId: string
) {
  const job = await Job.findById(jobId);
  if (!job) throw AppError.notFound(`Job ${jobId} not found`);

  const allowed = JOB_STATUS_TRANSITIONS[job.status];
  if (!allowed.includes(input.status)) {
    throw AppError.badRequest(
      `Cannot transition from ${job.status} to ${input.status}.`
    );
  }

  job.status = input.status;
  if (input.notes) job.notes = input.notes;
  if (input.status === 'COMPLETE') job.completedAt = new Date();
  await job.save();

  // EN_ROUTE and COMPLETE trigger customer SMS (handled by status worker via queue)
  const sr = await ServiceRequest.findById(job.serviceRequestId)
    .populate<{ customerId: { phone: string; smsOptedOut: boolean } }>(
      'customerId',
      'phone smsOptedOut'
    )
    .lean();

  if (
    sr?.customerId &&
    typeof sr.customerId !== 'string' &&
    !sr.customerId.smsOptedOut
  ) {
    if (input.status === 'EN_ROUTE') {
      const tech = await Technician.findById(job.technicianId).lean();
      const techFirstName = (tech?.fullName ?? '').split(' ')[0] ?? '';
      await smsQueue?.add('sms:send', {
        to: sr.customerId.phone,
        templateId: SMS_TEMPLATES.sms_en_route,
        variables: { techFirstName },
      });
    } else if (input.status === 'COMPLETE') {
      await smsQueue?.add('sms:send', {
        to: sr.customerId.phone,
        templateId: SMS_TEMPLATES.sms_complete,
        variables: {},
      });
    }
  }

  // Real-time broadcast to dispatch board
  emitJobStatusChanged(jobId, input.status, String(job.technicianId));

  return job;
}

/**
 * Reassigns a job to a new technician. Records audit trail fields (AC-15).
 */
export async function reassignJob(
  jobId: string,
  input: ReassignJobInput,
  reassignedById: string
) {
  const job = await Job.findById(jobId);
  if (!job) throw AppError.notFound(`Job ${jobId} not found`);

  if (job.status === 'CANCELLED' || job.status === 'COMPLETE') {
    throw AppError.badRequest(`Cannot reassign a ${job.status} job.`);
  }

  // Audit trail
  job.previousTechnicianId = job.technicianId;
  job.reassignedBy = new mongoose.Types.ObjectId(reassignedById);
  job.reassignedAt = new Date();
  job.technicianId = new mongoose.Types.ObjectId(input.technicianId);
  await job.save();

  // Notify original technician
  const originalTech = await Technician.findById(job.previousTechnicianId).lean();
  if (originalTech?.expoPushToken) {
    await pushQueue?.add('push:job_reassigned', {
      expoPushToken: originalTech.expoPushToken,
      jobId,
    });
  }

  return job;
}

export async function getTechnicianJobs(technicianId: string) {
  return Job.find({ technicianId })
    .populate('serviceRequestId')
    .sort({ scheduledAt: 1 })
    .lean();
}

export async function getTodayJobsForDispatch() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return Job.find({ scheduledAt: { $gte: start, $lte: end } })
    .populate('technicianId', 'fullName capabilities')
    .populate({
      path: 'serviceRequestId',
      populate: [
        { path: 'customerId', select: 'fullName phone' },
        { path: 'vehicleId', select: 'year make model licensePlate' },
      ],
    })
    .sort({ scheduledAt: 1 })
    .lean();
}
