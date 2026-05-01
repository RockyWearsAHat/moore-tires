/**
 * SMS worker — dequeues jobs from `sms:send` and `sms:reminder`,
 * sends via Twilio, and logs delivery SID.
 * Max 3 retries with exponential backoff (configured on the queue).
 */
import { Worker } from 'bullmq';
import twilio from 'twilio';
import { type SmsSendPayload } from '@moore-tires/shared';
import { redis } from '../queue.js';

const SMS_TEMPLATES: Record<string, (vars: Record<string, string>) => string> = {
  sms_receipt: (v) =>
    `Hi ${v['firstName'] ?? ''}, Moore Tires received your request for ${v['serviceType'] ?? ''} on ${v['preferredDate'] ?? ''}. We'll confirm your appointment time shortly. Questions? Call (555) 867-5309.`,
  sms_confirmed: (v) =>
    `Your appointment is confirmed for ${v['dateTime'] ?? ''}. Technician: ${v['techFirstName'] ?? ''}. Reply STOP to opt out.`,
  sms_reminder_24h: (v) =>
    `Reminder: Your Moore Tires appointment is tomorrow at ${v['dateTime'] ?? ''}. Reply STOP to opt out.`,
  sms_reminder_2h: (v) =>
    `Your Moore Tires technician arrives in ~2 hours (${v['dateTime'] ?? ''}). Reply STOP to opt out.`,
  sms_en_route: (v) =>
    `Your Moore Tires technician ${v['techFirstName'] ?? ''} is on the way! Reply STOP to opt out.`,
  sms_complete: () =>
    `Your Moore Tires service is complete. Thank you for your business! Reply STOP to opt out.`,
};

const twilioClient = twilio(
  process.env['TWILIO_ACCOUNT_SID'],
  process.env['TWILIO_AUTH_TOKEN']
);

function buildMessage(templateId: string, variables: Record<string, string>): string {
  const builder = SMS_TEMPLATES[templateId];
  if (!builder) throw new Error(`Unknown SMS template: ${templateId}`);
  return builder(variables);
}

export function startSmsWorker(): void {
  if (!redis) return;
  const worker = new Worker<SmsSendPayload>(
    'sms:send',
    async (job) => {
      const { to, templateId, variables } = job.data;
      const body = buildMessage(templateId, variables);
      const message = await twilioClient.messages.create({
        to,
        from: process.env['TWILIO_FROM_NUMBER'],
        body,
      });
      console.warn(`SMS delivered: SID=${message.sid} to=${to} template=${templateId}`);
    },
    { connection: redis }
  );

  worker.on('failed', (job, err) => {
    console.error(`SMS job ${job?.id ?? 'unknown'} failed:`, err);
  });

  const reminderWorker = new Worker<SmsSendPayload>(
    'sms:reminder',
    async (job) => {
      const { to, templateId, variables } = job.data;
      if (!to) return; // Guard: reminder enqueued before customer phone was set
      const body = buildMessage(templateId, variables);
      const message = await twilioClient.messages.create({
        to,
        from: process.env['TWILIO_FROM_NUMBER'],
        body,
      });
      console.warn(`Reminder SMS delivered: SID=${message.sid} to=${to}`);
    },
    { connection: redis }
  );

  reminderWorker.on('failed', (job, err) => {
    console.error(`Reminder SMS job ${job?.id ?? 'unknown'} failed:`, err);
  });
}
