import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { type SmsSendPayload, type PushJobAssignedPayload, type PushJobReassignedPayload } from '@moore-tires/shared';

const redisUrl = process.env['REDIS_URL'];
if (!redisUrl) throw new Error('REDIS_URL environment variable is not set');

export const redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const smsQueue = new Queue<SmsSendPayload>('sms:send', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

export const pushQueue = new Queue<PushJobAssignedPayload | PushJobReassignedPayload>(
  'push:job',
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 500 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  }
);

/** Reminder queue — accepts delayed jobs; jobId is stored on Appointment for cancellation */
export const reminderQueue = new Queue<SmsSendPayload>('sms:reminder', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  },
});
