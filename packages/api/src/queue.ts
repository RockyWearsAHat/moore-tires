import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { type SmsSendPayload, type PushJobAssignedPayload, type PushJobReassignedPayload } from '@moore-tires/shared';

const redisUrl = process.env['REDIS_URL'];

// Redis is optional in development — queues degrade to no-ops
let redis: IORedis | null = null;
if (redisUrl) {
  redis = new IORedis(redisUrl, { maxRetriesPerRequest: null });
} else {
  console.warn('⚠️  REDIS_URL not set — job queues disabled (SMS, push, reminders)');
}

function createQueue<T>(name: string): Queue<T> | null {
  if (!redis) return null;
  return new Queue<T>(name, {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 200 },
    },
  });
}

export { redis };
export const smsQueue = createQueue<SmsSendPayload>('sms:send');
export const pushQueue = createQueue<PushJobAssignedPayload | PushJobReassignedPayload>('push:job');
export const reminderQueue = createQueue<SmsSendPayload>('sms:reminder');
