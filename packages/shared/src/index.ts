import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const ServiceTypeSchema = z.enum(['INSTALL', 'REPAIR', 'INSPECTION', 'ROTATION']);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const TimeWindowSchema = z.enum(['MORNING', 'AFTERNOON', 'EVENING']);
export type TimeWindow = z.infer<typeof TimeWindowSchema>;

export const ServiceRequestStatusSchema = z.enum([
  'PENDING',
  'SCHEDULED',
  'CANCELLED',
]);
export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;

export const JobStatusSchema = z.enum([
  'SCHEDULED',
  'EN_ROUTE',
  'IN_PROGRESS',
  'COMPLETE',
  'CANCELLED',
]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

// Valid job status transitions
export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  SCHEDULED: ['EN_ROUTE', 'CANCELLED'],
  EN_ROUTE: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETE', 'CANCELLED'],
  COMPLETE: [],
  CANCELLED: [],
};

// ─── Customer ─────────────────────────────────────────────────────────────────

/** E.164 phone number — e.g. +15558675309 */
const PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +15558675309)');

export const CreateCustomerSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: PhoneSchema,
  email: z.string().email().optional(),
  smsOptedOut: z.boolean().default(false),
});
export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export const CreateVehicleSchema = z.object({
  customerId: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  licensePlate: z.string().min(1).max(20).transform((v) => v.toUpperCase()),
});
export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;

// ─── Service Request ──────────────────────────────────────────────────────────

export const CreateServiceRequestSchema = z.object({
  // Customer info (new customers are created inline)
  fullName: z.string().min(2).max(100),
  phone: PhoneSchema,
  email: z.string().email().optional(),

  // Vehicle info
  vehicleYear: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  vehicleMake: z.string().min(1).max(50),
  vehicleModel: z.string().min(1).max(50),
  licensePlate: z.string().min(1).max(20),

  // Service details
  serviceType: ServiceTypeSchema,
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .refine((d) => new Date(d) > new Date(), 'Preferred date must be in the future'),
  preferredTimeWindow: TimeWindowSchema,
  notes: z.string().max(500).optional(),
  isMobileService: z.boolean().default(false),
});
export type CreateServiceRequestInput = z.infer<typeof CreateServiceRequestSchema>;

// ─── Job / Scheduling ─────────────────────────────────────────────────────────

export const ScheduleJobSchema = z.object({
  serviceRequestId: z.string().min(1),
  technicianId: z.string().min(1),
  /** ISO 8601 datetime — start of the appointment slot */
  startsAt: z.string().datetime(),
  /** ISO 8601 datetime — end of the appointment slot (≥ 30 min after startsAt) */
  endsAt: z.string().datetime(),
});
export type ScheduleJobInput = z.infer<typeof ScheduleJobSchema>;

export const UpdateJobStatusSchema = z.object({
  status: JobStatusSchema,
  notes: z.string().max(1000).optional(),
});
export type UpdateJobStatusInput = z.infer<typeof UpdateJobStatusSchema>;

export const ReassignJobSchema = z.object({
  technicianId: z.string().min(1),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});
export type ReassignJobInput = z.infer<typeof ReassignJobSchema>;

// ─── Technician ───────────────────────────────────────────────────────────────

export const TechnicianCapabilitySchema = z.enum([
  'STANDARD',
  'COMMERCIAL',
  'MOBILE',
  'ALIGNMENT',
]);
export type TechnicianCapability = z.infer<typeof TechnicianCapabilitySchema>;

export const CreateTechnicianSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: PhoneSchema,
  email: z.string().email().optional(),
  capabilities: z.array(TechnicianCapabilitySchema).min(1),
  territory: z.string().optional(),
});
export type CreateTechnicianInput = z.infer<typeof CreateTechnicianSchema>;

// ─── Push Token ───────────────────────────────────────────────────────────────

export const RegisterPushTokenSchema = z.object({
  token: z.string().min(10),
});
export type RegisterPushTokenInput = z.infer<typeof RegisterPushTokenSchema>;

// ─── Twilio Opt-Out Webhook ───────────────────────────────────────────────────

export const TwilioOptOutWebhookSchema = z.object({
  From: PhoneSchema,
  Body: z.string().min(1),
});
export type TwilioOptOutWebhookInput = z.infer<typeof TwilioOptOutWebhookSchema>;

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Socket.io Event Types ────────────────────────────────────────────────────

export interface SocketEvents {
  'sr:new': { serviceRequestId: string };
  'job:status_changed': { jobId: string; status: JobStatus; technicianId: string };
  'calendar:updated': { date: string };
  'dispatch:today': void;
}

// ─── SMS Template IDs ─────────────────────────────────────────────────────────

export const SMS_TEMPLATES = {
  sms_receipt: 'sms_receipt',
  sms_confirmed: 'sms_confirmed',
  sms_reminder_24h: 'sms_reminder_24h',
  sms_reminder_2h: 'sms_reminder_2h',
  sms_en_route: 'sms_en_route',
  sms_complete: 'sms_complete',
} as const;
export type SmsTemplateId = (typeof SMS_TEMPLATES)[keyof typeof SMS_TEMPLATES];

// ─── Queue Job Payloads ───────────────────────────────────────────────────────

export interface SmsSendPayload {
  to: string;
  templateId: SmsTemplateId;
  variables: Record<string, string>;
}

export interface PushJobAssignedPayload {
  expoPushToken: string;
  jobId: string;
  address: string;
  dateTime: string;
}

export interface PushJobReassignedPayload {
  expoPushToken: string;
  jobId: string;
}
