/**
 * Job service — unit tests for state machine enforcement and input validation.
 *
 * The DB-dependent functions (scheduleJob, updateJobStatus, etc.) require
 * integration tests with MongoDB. These tests cover the pure state machine logic
 * extracted from the shared package, which job.service.ts depends on.
 *
 * Naming convention: Unit_Scenario_ExpectedOutcome
 */
import { describe, it, expect } from 'vitest';
import { JOB_STATUS_TRANSITIONS, ScheduleJobSchema, type JobStatus } from '@moore-tires/shared';

/**
 * Mirrors the guard used in updateJobStatus.
 * Extracted here so we can unit-test the transition logic without hitting MongoDB.
 */
function isValidTransition(current: JobStatus, next: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[current].includes(next);
}

// ─── State machine transitions ────────────────────────────────────────────────

describe('JobStatusTransitions', () => {
  it('Transition_ScheduledToEnRoute_IsValid', () => {
    expect(isValidTransition('SCHEDULED', 'EN_ROUTE')).toBe(true);
  });

  it('Transition_ScheduledToCancelled_IsValid', () => {
    expect(isValidTransition('SCHEDULED', 'CANCELLED')).toBe(true);
  });

  it('Transition_EnRouteToInProgress_IsValid', () => {
    expect(isValidTransition('EN_ROUTE', 'IN_PROGRESS')).toBe(true);
  });

  it('Transition_EnRouteToCancelled_IsValid', () => {
    expect(isValidTransition('EN_ROUTE', 'CANCELLED')).toBe(true);
  });

  it('Transition_InProgressToComplete_IsValid', () => {
    expect(isValidTransition('IN_PROGRESS', 'COMPLETE')).toBe(true);
  });

  it('Transition_InProgressToCancelled_IsValid', () => {
    expect(isValidTransition('IN_PROGRESS', 'CANCELLED')).toBe(true);
  });

  it('Transition_CompleteToAnything_IsInvalid', () => {
    const allStatuses: JobStatus[] = ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];
    for (const next of allStatuses) {
      expect(isValidTransition('COMPLETE', next)).toBe(false);
    }
  });

  it('Transition_CancelledToAnything_IsInvalid', () => {
    const allStatuses: JobStatus[] = ['SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED'];
    for (const next of allStatuses) {
      expect(isValidTransition('CANCELLED', next)).toBe(false);
    }
  });

  it('Transition_ScheduledBackToScheduled_IsInvalid', () => {
    expect(isValidTransition('SCHEDULED', 'SCHEDULED')).toBe(false);
  });

  it('Transition_EnRouteBackToScheduled_IsInvalid', () => {
    expect(isValidTransition('EN_ROUTE', 'SCHEDULED')).toBe(false);
  });

  it('Transition_SkipAhead_ScheduledToComplete_IsInvalid', () => {
    // Must go SCHEDULED → EN_ROUTE → IN_PROGRESS → COMPLETE
    expect(isValidTransition('SCHEDULED', 'COMPLETE')).toBe(false);
  });

  it('Transition_SkipAhead_ScheduledToInProgress_IsInvalid', () => {
    expect(isValidTransition('SCHEDULED', 'IN_PROGRESS')).toBe(false);
  });
});

// ─── ScheduleJobSchema — slot duration validation ─────────────────────────────
// These validate the schema constraints that precede the DB transaction.

describe('ScheduleJobSchema_SlotConstraints', () => {
  it('Slot_ValidOneHourSlot_ParsesSuccessfully', () => {
    const result = ScheduleJobSchema.safeParse({
      serviceRequestId: 'sr_abc',
      technicianId: 'tech_xyz',
      startsAt: '2025-07-01T08:00:00.000Z',
      endsAt: '2025-07-01T09:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('Slot_EndsAtBeforeStartsAt_FailsDatetimeValidation', () => {
    // Zod validates the format only; temporal order is enforced in the service.
    // Both must be valid ISO datetimes.
    const result = ScheduleJobSchema.safeParse({
      serviceRequestId: 'sr_abc',
      technicianId: 'tech_xyz',
      startsAt: '2025-07-01T10:00:00.000Z',
      endsAt: '2025-07-01T08:00:00.000Z', // valid ISO, time logic enforced in service
    });
    expect(result.success).toBe(true); // schema passes; service layer rejects the order
  });

  it('Slot_NonIsoStartsAt_FailsValidation', () => {
    const result = ScheduleJobSchema.safeParse({
      serviceRequestId: 'sr_abc',
      technicianId: 'tech_xyz',
      startsAt: 'tomorrow',
      endsAt: '2025-07-01T09:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('Slot_MissingEndsAt_FailsValidation', () => {
    const result = ScheduleJobSchema.safeParse({
      serviceRequestId: 'sr_abc',
      technicianId: 'tech_xyz',
      startsAt: '2025-07-01T08:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });
});
