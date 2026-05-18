const ENABLE_BOOKING_ENV: unknown = import.meta.env['VITE_ENABLE_SERVICE_BOOKING'];

/**
 * Service booking is intentionally off by default for the wholesale-first rollout.
 * Enable with VITE_ENABLE_SERVICE_BOOKING=true.
 */
export const ENABLE_SERVICE_BOOKING = ENABLE_BOOKING_ENV === 'true' || ENABLE_BOOKING_ENV === '1';
