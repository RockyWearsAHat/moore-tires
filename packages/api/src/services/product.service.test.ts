/**
 * Pure-function unit tests for pricing calculations.
 *
 * getEffectivePrice requires MongoDB so is covered by integration tests.
 * calculateTierPrice is pure and fully testable here.
 *
 * Naming convention: Unit_Scenario_ExpectedOutcome
 */
import { describe, it, expect } from 'vitest';
import { calculateTierPrice } from '@moore-tires/shared';

describe('calculateTierPrice', () => {
  // ── No discount ──────────────────────────────────────────────────────────

  it('TierPrice_ZeroDiscountPercent_ReturnsBasePrice', () => {
    expect(calculateTierPrice(500, 0)).toBe(500);
  });

  // ── Standard discount ────────────────────────────────────────────────────

  it('TierPrice_TenPercentDiscount_Returns90PercentOfBase', () => {
    expect(calculateTierPrice(200, 10)).toBe(180);
  });

  it('TierPrice_FiftyPercentDiscount_ReturnsHalf', () => {
    expect(calculateTierPrice(400, 50)).toBe(200);
  });

  it('TierPrice_HundredPercentDiscount_ReturnsZero', () => {
    expect(calculateTierPrice(100, 100)).toBe(0);
  });

  // ── Rounding behaviour ───────────────────────────────────────────────────

  it('TierPrice_FractionalResult_RoundsToTwoCents', () => {
    // 10.99 * 0.90 = 9.891 → rounds to 9.89
    expect(calculateTierPrice(10.99, 10)).toBe(9.89);
  });

  it('TierPrice_LargePricing_StaysExact', () => {
    // 349.99 * 0.85 = 297.4915 → rounds to 297.49
    expect(calculateTierPrice(349.99, 15)).toBe(297.49);
  });

  // ── Override price ───────────────────────────────────────────────────────

  it('TierPrice_OverrideProvided_IgnoresDiscount', () => {
    expect(calculateTierPrice(200, 50, 99.99)).toBe(99.99);
  });

  it('TierPrice_OverrideProvidedZero_ReturnsZero', () => {
    expect(calculateTierPrice(500, 0, 0)).toBe(0);
  });

  it('TierPrice_OverrideHigherThanBase_ReturnsOverride', () => {
    // Unusual but the function must honour the override value
    expect(calculateTierPrice(100, 10, 150)).toBe(150);
  });

  it('TierPrice_UndefinedOverride_AppliesDiscount', () => {
    expect(calculateTierPrice(100, 20, undefined)).toBe(80);
  });
});
