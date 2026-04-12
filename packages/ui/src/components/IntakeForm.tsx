'use client';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateServiceRequestSchema,
  type CreateServiceRequestInput,
} from '@moore-tires/shared';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Select } from './Select.js';

interface IntakeFormProps {
  /** Called on successful form submission with validated data. */
  onSubmit: (data: CreateServiceRequestInput) => Promise<void>;
  /** Controls the submit button loading spinner. */
  isSubmitting?: boolean;
  /** Non-field error from the API (e.g. 409 Conflict). */
  apiError?: string;
}

const SERVICE_TYPE_OPTIONS = [
  { value: 'INSTALL', label: 'Tire Install' },
  { value: 'REPAIR', label: 'Tire Repair' },
  { value: 'INSPECTION', label: 'Inspection' },
  { value: 'ROTATION', label: 'Tire Rotation' },
];

const TIME_WINDOW_OPTIONS = [
  { value: 'MORNING', label: 'Morning (8 AM – 12 PM)' },
  { value: 'AFTERNOON', label: 'Afternoon (12 PM – 5 PM)' },
  { value: 'EVENING', label: 'Evening (5 PM – 8 PM)' },
];

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0]!;
};

/**
 * Service request intake form — shared across the marketing site and mobile app.
 * Validates locally with Zod before calling onSubmit; never makes API calls directly.
 */
export function IntakeForm({ onSubmit, isSubmitting = false, apiError }: IntakeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateServiceRequestInput>({
    resolver: zodResolver(CreateServiceRequestSchema),
    defaultValues: {
      isMobileService: false,
    },
  });

  const currentYear = new Date().getFullYear();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
      aria-label="Service request form"
    >
      {/* ── Contact Info ─────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Your Info
        </legend>
        <Input
          label="Full Name"
          placeholder="Jane Smith"
          required
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Phone Number"
          placeholder="+15558675309"
          type="tel"
          required
          hint="E.164 format — +1 followed by 10 digits"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Email"
          placeholder="jane@example.com"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </fieldset>

      {/* ── Vehicle Info ──────────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Vehicle
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Year"
            placeholder={String(currentYear)}
            type="number"
            min={1900}
            max={currentYear + 1}
            required
            error={errors.vehicleYear?.message}
            {...register('vehicleYear', { valueAsNumber: true })}
          />
          <Input
            label="License Plate"
            placeholder="ABC1234"
            required
            error={errors.licensePlate?.message}
            {...register('licensePlate')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Make"
            placeholder="Honda"
            required
            error={errors.vehicleMake?.message}
            {...register('vehicleMake')}
          />
          <Input
            label="Model"
            placeholder="Civic"
            required
            error={errors.vehicleModel?.message}
            {...register('vehicleModel')}
          />
        </div>
      </fieldset>

      {/* ── Service Details ───────────────────────────────────────── */}
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
          Service
        </legend>
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <Select
              label="Service Type"
              required
              placeholder="Select a service…"
              options={SERVICE_TYPE_OPTIONS}
              error={errors.serviceType?.message}
              {...field}
            />
          )}
        />
        <Input
          label="Preferred Date"
          type="date"
          min={tomorrow()}
          required
          error={errors.preferredDate?.message}
          {...register('preferredDate')}
        />
        <Controller
          name="preferredTimeWindow"
          control={control}
          render={({ field }) => (
            <Select
              label="Preferred Time Window"
              required
              placeholder="Select a time window…"
              options={TIME_WINDOW_OPTIONS}
              error={errors.preferredTimeWindow?.message}
              {...field}
            />
          )}
        />
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-slate-300"
          >
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            maxLength={500}
            placeholder="Anything we should know? Tire size, symptoms, etc."
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100
              placeholder:text-slate-600 hover:border-slate-600 focus:border-transparent
              focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-invalid={errors.notes ? 'true' : undefined}
            {...register('notes')}
          />
          {errors.notes && (
            <p role="alert" className="text-xs text-red-400">
              {errors.notes.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            id="isMobileService"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-orange-500 focus:ring-orange-500"
            {...register('isMobileService')}
          />
          <label htmlFor="isMobileService" className="text-sm text-slate-300">
            I need mobile service (technician comes to me)
          </label>
        </div>
      </fieldset>

      {/* ── API Error ─────────────────────────────────────────────── */}
      {apiError && (
        <div
          role="alert"
          className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          {apiError}
        </div>
      )}

      <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2">
        {isSubmitting ? 'Submitting…' : 'Request Service'}
      </Button>
    </form>
  );
}
