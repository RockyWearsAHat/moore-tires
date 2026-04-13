/**
 * Service Request service — all business logic for the intake flow.
 *
 * Responsibilities:
 *  1. Upsert Customer record
 *  2. Upsert Vehicle record
 *  3. Enforce duplicate-submission guard (same phone + date within 30 s)
 *  4. Persist ServiceRequest with status PENDING
 *  5. Enqueue SMS confirmation job
 *  6. Emit sr:new Socket.io event
 */
import { type CreateServiceRequestInput, SMS_TEMPLATES } from '@moore-tires/shared';
import { Customer, Vehicle, ServiceRequest } from '@moore-tires/db';
import { AppError } from '../errors.js';
import { smsQueue } from '../queue.js';
import { emitNewServiceRequest } from '../socket.js';

/**
 * Strips HTML/script tags from free-text input to prevent stored XSS (AC-06).
 * Validated inputs must still be sanitized at persistence time.
 */
function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  // ── 1. Upsert Customer ─────────────────────────────────────────────────────
  let customer = await Customer.findOne({ phone: input.phone });
  if (!customer) {
    customer = await Customer.create({
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
    });
  }

  // Reject intake if customer has opted out of SMS
  if (customer.smsOptedOut) {
    throw AppError.badRequest(
      'This phone number has opted out of SMS notifications. Please call us directly.'
    );
  }

  // ── 2. Upsert Vehicle ──────────────────────────────────────────────────────
  const licensePlate = input.licensePlate.toUpperCase();
  let vehicle = await Vehicle.findOne({
    customerId: customer._id,
    licensePlate,
  });
  if (!vehicle) {
    vehicle = await Vehicle.create({
      customerId: customer._id,
      year: input.vehicleYear,
      make: input.vehicleMake,
      model: input.vehicleModel,
      licensePlate,
    });
  }

  // ── 3. Duplicate guard: same phone + date within 30 s (AC-04) ─────────────
  const thirtySecondsAgo = new Date(Date.now() - 30_000);
  const duplicate = await ServiceRequest.findOne({
    customerId: customer._id,
    preferredDate: input.preferredDate,
    createdAt: { $gte: thirtySecondsAgo },
  });
  if (duplicate) {
    throw AppError.conflict('Request already received.');
  }

  // ── 4. Persist ServiceRequest ──────────────────────────────────────────────
  const sanitizedNotes = input.notes ? sanitizeText(input.notes) : undefined;
  const serviceRequest = await ServiceRequest.create({
    customerId: customer._id,
    vehicleId: vehicle._id,
    serviceType: input.serviceType,
    preferredDate: input.preferredDate,
    preferredTimeWindow: input.preferredTimeWindow,
    notes: sanitizedNotes,
    isMobileService: input.isMobileService,
    status: 'PENDING',
  });

  // ── 5. Enqueue SMS confirmation ────────────────────────────────────────────
  const firstName = input.fullName.split(' ')[0] ?? input.fullName;
  await smsQueue?.add('sms:send', {
    to: input.phone,
    templateId: SMS_TEMPLATES.sms_receipt,
    variables: {
      firstName,
      serviceType: input.serviceType,
      preferredDate: input.preferredDate,
    },
  });

  // ── 6. Real-time notification to dashboard ─────────────────────────────────
  emitNewServiceRequest(String(serviceRequest._id));

  return serviceRequest;
}

export async function listServiceRequests(status?: string) {
  const query = status ? { status } : {};
  return ServiceRequest.find(query)
    .populate('customerId', 'fullName phone email')
    .populate('vehicleId', 'year make model licensePlate')
    .sort({ createdAt: -1 })
    .lean();
}

export async function getServiceRequestById(id: string) {
  const sr = await ServiceRequest.findById(id)
    .populate('customerId', 'fullName phone email')
    .populate('vehicleId', 'year make model licensePlate')
    .lean();
  if (!sr) throw AppError.notFound(`Service request ${id} not found`);
  return sr;
}
