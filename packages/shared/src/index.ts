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
  licensePlate: z.string().min(1).max(20).transform((v) => v.toUpperCase()),

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

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum([
  'admin',
  'district_manager',
  'store_employee',
  'retail_customer',
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const PaymentTermsSchema = z.enum(['PREPAID', 'NET_15', 'NET_30']);
export type PaymentTerms = z.infer<typeof PaymentTermsSchema>;

export const RegisterSchema = z.object({
  email: z.string().email().max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  firstName: z.string().min(1).max(50).trim(),
  lastName: z.string().min(1).max(50).trim(),
  phone: PhoneSchema.optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenRequestInput = z.infer<typeof RefreshTokenRequestSchema>;

export const InviteUserSchema = z
  .object({
    email: z.string().email().max(255),
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    role: UserRoleSchema,
    wholesaleAccountId: z.string().optional(),
    storeLocationId: z.string().optional(),
    phone: PhoneSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'district_manager' && !data.wholesaleAccountId) return false;
      if (data.role === 'store_employee' && (!data.wholesaleAccountId || !data.storeLocationId))
        return false;
      return true;
    },
    {
      message:
        'District managers require wholesaleAccountId; store employees require both wholesaleAccountId and storeLocationId',
    }
  );
export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const CreateWholesaleAccountSchema = z.object({
  companyName: z.string().min(1).max(200).trim(),
  contactEmail: z.string().email().max(255),
  contactPhone: PhoneSchema,
  paymentTerms: PaymentTermsSchema.default('PREPAID'),
  billingAddress: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 or 9 digits'),
  }),
});
export type CreateWholesaleAccountInput = z.infer<typeof CreateWholesaleAccountSchema>;

export const CreateStoreLocationSchema = z.object({
  wholesaleAccountId: z.string().min(1),
  name: z.string().min(1).max(200).trim(),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().min(2).max(2),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP must be 5 or 9 digits'),
  contactPhone: PhoneSchema.optional(),
});
export type CreateStoreLocationInput = z.infer<typeof CreateStoreLocationSchema>;

// ─── Auth Response Types ──────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  wholesaleAccountId?: string;
  storeLocationId?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

/** Payload embedded in JWT access tokens — available on every authenticated request. */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  wholesaleAccountId?: string;
  storeLocationId?: string;
}

// ─── Tire Product ─────────────────────────────────────────────────────────────

export const TireTypeSchema = z.enum([
  'COMMERCIAL',
  'ALL_SEASON',
  'ALL_TERRAIN',
  'HIGHWAY',
  'MUD_TERRAIN',
  'WINTER',
]);
export type TireType = z.infer<typeof TireTypeSchema>;

export const CreateTireProductSchema = z.object({
  brand: z.string().min(1).max(100).trim(),
  tireModel: z.string().min(1).max(100).trim(),
  size: z.object({
    width: z.number().positive(),
    aspectRatio: z.number().min(0),
    rimDiameter: z.number().positive(),
    construction: z.string().default('R'),
  }),
  formattedSize: z.string().min(1).max(50),
  type: TireTypeSchema,
  loadIndex: z.string().max(10).default(''),
  speedRating: z.string().max(5).default(''),
  plyRating: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().url()).default([]),
  specifications: z.record(z.string()).default({}),
  baseRetailPrice: z.number().positive(),
});
export type CreateTireProductInput = z.infer<typeof CreateTireProductSchema>;

export const TireProductSearchSchema = z.object({
  type: TireTypeSchema.optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type TireProductSearchInput = z.infer<typeof TireProductSearchSchema>;

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const CreatePricingTierSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  defaultDiscountPercent: z.number().min(0).max(100),
  description: z.string().max(500).optional(),
});
export type CreatePricingTierInput = z.infer<typeof CreatePricingTierSchema>;

export const CreatePriceOverrideSchema = z.object({
  tierId: z.string().min(1),
  productId: z.string().min(1),
  overridePrice: z.number().min(0),
});
export type CreatePriceOverrideInput = z.infer<typeof CreatePriceOverrideSchema>;

/** Calculate effective price for a product given a tier. */
export function calculateTierPrice(
  baseRetailPrice: number,
  discountPercent: number,
  overridePrice?: number
): number {
  if (overridePrice !== undefined) return overridePrice;
  return Math.round(baseRetailPrice * (1 - discountPercent / 100) * 100) / 100;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export const OrderStatusSchema = z.enum([
  'CART',
  'SUBMITTED',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]);
export type OrderStatusType = z.infer<typeof OrderStatusSchema>;

export const PaymentMethodSchema = z.enum(['CARD', 'ACH', 'INVOICE']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CreateOrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1),
  shippingAddress: z.object({
    street: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    state: z.string().min(2).max(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  }),
  paymentMethod: PaymentMethodSchema.default('CARD'),
  notes: z.string().max(1000).optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
  trackingNumber: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

// ─── Inventory ────────────────────────────────────────────────────────────────

export const InventoryItemSchema = z.object({
  productId: z.string().min(1),
  currentQuantity: z.number().int().min(0),
  reorderThreshold: z.number().int().min(0),
  targetQuantity: z.number().int().min(0),
  autoReorder: z.boolean().default(false),
});

export const InventoryUploadSchema = z.object({
  items: z.array(InventoryItemSchema).min(1),
});
export type InventoryUploadInput = z.infer<typeof InventoryUploadSchema>;

export const UpdateInventoryItemSchema = z.object({
  currentQuantity: z.number().int().min(0).optional(),
  reorderThreshold: z.number().int().min(0).optional(),
  targetQuantity: z.number().int().min(0).optional(),
  autoReorder: z.boolean().optional(),
});
export type UpdateInventoryItemInput = z.infer<typeof UpdateInventoryItemSchema>;

// ─── Delivery ETA ─────────────────────────────────────────────────────────────

export const DeliveryEstimateRequestSchema = z.object({
  zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  distributionCenter: z.string().default('WA'),
});
export type DeliveryEstimateRequest = z.infer<typeof DeliveryEstimateRequestSchema>;

export interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  estimatedDate: string;
  distributionCenter: string;
}

// ─── React Contexts & Components ──────────────────────────────────────────────

export { AuthProvider, useAuth } from './auth-context';
export { ToastProvider, useToast, ToastContainer, type Toast, type ToastType } from './toast-context';
export { ErrorBoundary } from './error-boundary';
