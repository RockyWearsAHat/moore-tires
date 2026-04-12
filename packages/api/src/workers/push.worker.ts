/**
 * Push notification worker — dequeues jobs from `push:job` and
 * sends via Expo Push Notifications SDK.
 */
import { Worker } from 'bullmq';
import { Expo } from 'expo-server-sdk';
import { type PushJobAssignedPayload, type PushJobReassignedPayload } from '@moore-tires/shared';
import { redis } from '../queue.js';

const expo = new Expo();

type PushPayload = PushJobAssignedPayload | PushJobReassignedPayload;

function isPushJobAssigned(p: PushPayload): p is PushJobAssignedPayload {
  return 'address' in p;
}

export function startPushWorker(): void {
  const worker = new Worker<PushPayload>(
    'push:job',
    async (job) => {
      const { expoPushToken } = job.data;
      if (!Expo.isExpoPushToken(expoPushToken)) {
        console.warn(`Invalid Expo push token: ${expoPushToken}`);
        return;
      }

      const message = isPushJobAssigned(job.data)
        ? {
            to: expoPushToken,
            title: 'New Job Assigned',
            body: `${job.data.address} at ${job.data.dateTime}`,
            data: { jobId: job.data.jobId },
          }
        : {
            to: expoPushToken,
            title: 'Job Reassigned',
            body: `Job ${job.data.jobId} has been reassigned.`,
            data: { jobId: job.data.jobId },
          };

      const [ticket] = await expo.sendPushNotificationsAsync([message]);
      if (ticket?.status === 'error') {
        throw new Error(`Push failed: ${ticket.message}`);
      }
      console.warn(`Push sent: token=${expoPushToken.slice(0, 15)}... jobId=${job.data.jobId}`);
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    console.error(`Push job ${job?.id ?? 'unknown'} failed:`, err);
  });
}
