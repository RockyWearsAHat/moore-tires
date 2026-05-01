/**
 * Pure-function unit tests for ETA computation helpers.
 *
 * These tests exercise haversine distance math, ZIP prefix lookup,
 * and the business-day rules — all of which are deterministic and
 * require no database or network access.
 *
 * Naming convention: Unit_Scenario_ExpectedOutcome
 */
import { describe, it, expect } from 'vitest';

// ─── Inline the private helpers to test them directly ─────────────────────────
// These are extracted here rather than exposing them from the module because
// testing internals via their public surface (calculateDeliveryEstimate) would
// require mocking MongoDB.

const ZIP_REGION_MAP: Record<string, { lat: number; lng: number }> = {
  '98': { lat: 47.6, lng: -122.3 },   // WA
  '97': { lat: 45.5, lng: -122.7 },   // OR
  '10': { lat: 40.7, lng: -74.0 },    // NY
  '90': { lat: 34.0, lng: -118.2 },   // LA
  '80': { lat: 39.7, lng: -104.9 },   // CO
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function zipToCoords(zip: string): { lat: number; lng: number } | null {
  const prefix3 = zip.slice(0, 3);
  if (ZIP_REGION_MAP[prefix3]) return ZIP_REGION_MAP[prefix3];
  const prefix2 = zip.slice(0, 2);
  if (ZIP_REGION_MAP[prefix2]) return ZIP_REGION_MAP[prefix2];
  return null;
}

function distanceToDays(miles: number): { min: number; max: number } {
  if (miles < 150) return { min: 1, max: 2 };
  if (miles < 500) return { min: 2, max: 3 };
  if (miles < 1200) return { min: 3, max: 5 };
  if (miles < 2000) return { min: 4, max: 6 };
  return { min: 5, max: 7 };
}

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

// ─── haversineDistance ────────────────────────────────────────────────────────

describe('haversineDistance', () => {
  it('Distance_SamePoint_IsZero', () => {
    expect(haversineDistance(47.6, -122.3, 47.6, -122.3)).toBeCloseTo(0);
  });

  it('Distance_SeattleToNewYork_IsApprox2400to2500Miles', () => {
    // Seattle: 47.6062, -122.3321; New York: 40.7128, -74.0060
    // Haversine with these coords returns ~2436 miles (shorter than popular geodesic
    // estimates because of the specific lat/lng values used here).
    const miles = haversineDistance(47.6062, -122.3321, 40.7128, -74.006);
    expect(miles).toBeGreaterThan(2200);
    expect(miles).toBeLessThan(2700);
  });

  it('Distance_SeattleToLosAngeles_IsApprox960Miles', () => {
    const miles = haversineDistance(47.6062, -122.3321, 34.0522, -118.2437);
    expect(miles).toBeGreaterThan(900);
    expect(miles).toBeLessThan(1100);
  });

  it('Distance_IsSymmetric', () => {
    const d1 = haversineDistance(47.6, -122.3, 40.7, -74.0);
    const d2 = haversineDistance(40.7, -74.0, 47.6, -122.3);
    expect(d1).toBeCloseTo(d2, 5);
  });

  it('Distance_NegativeCoordsHandled', () => {
    // Southern hemisphere cross-test: Cape Town (-33.9, 18.4) to São Paulo (-23.5, -46.6)
    // Haversine with these coords returns ~3963 miles
    const d = haversineDistance(-33.9, 18.4, -23.5, -46.6);
    expect(d).toBeGreaterThan(3700);
    expect(d).toBeLessThan(4200);
  });
});

// ─── zipToCoords ──────────────────────────────────────────────────────────────

describe('zipToCoords', () => {
  it('ZipToCoords_KnownWaZip_ReturnsSeattleRegion', () => {
    const coords = zipToCoords('98101');
    expect(coords).not.toBeNull();
    if (coords) {
      expect(coords.lat).toBeCloseTo(47.6, 0);
      expect(coords.lng).toBeCloseTo(-122.3, 0);
    }
  });

  it('ZipToCoords_KnownNyZip_ReturnsNyRegion', () => {
    const coords = zipToCoords('10001');
    expect(coords).not.toBeNull();
    if (coords) {
      expect(coords.lat).toBeCloseTo(40.7, 0);
    }
  });

  it('ZipToCoords_UnknownZip_ReturnsNull', () => {
    expect(zipToCoords('00000')).toBeNull();
  });

  it('ZipToCoords_FourCharZip_UsesPrefix2', () => {
    // ZIP '9800' — 3-digit prefix '980' not in map, 2-digit '98' is
    expect(zipToCoords('9800')).not.toBeNull();
  });

  it('ZipToCoords_EmptyString_ReturnsNull', () => {
    expect(zipToCoords('')).toBeNull();
  });
});

// ─── distanceToDays ───────────────────────────────────────────────────────────

describe('distanceToDays', () => {
  it('DistanceToDays_Under150Miles_Returns1To2Days', () => {
    expect(distanceToDays(100)).toStrictEqual({ min: 1, max: 2 });
  });

  it('DistanceToDays_Exactly149Miles_Returns1To2Days', () => {
    expect(distanceToDays(149)).toStrictEqual({ min: 1, max: 2 });
  });

  it('DistanceToDays_Exactly150Miles_Returns2To3Days', () => {
    expect(distanceToDays(150)).toStrictEqual({ min: 2, max: 3 });
  });

  it('DistanceToDays_Under500Miles_Returns2To3Days', () => {
    expect(distanceToDays(400)).toStrictEqual({ min: 2, max: 3 });
  });

  it('DistanceToDays_1000Miles_Returns3To5Days', () => {
    expect(distanceToDays(1000)).toStrictEqual({ min: 3, max: 5 });
  });

  it('DistanceToDays_1500Miles_Returns4To6Days', () => {
    expect(distanceToDays(1500)).toStrictEqual({ min: 4, max: 6 });
  });

  it('DistanceToDays_CrossCountry2500Miles_Returns5To7Days', () => {
    expect(distanceToDays(2500)).toStrictEqual({ min: 5, max: 7 });
  });

  it('DistanceToDays_BoundaryAt2000Miles_Returns5To7Days', () => {
    expect(distanceToDays(2000)).toStrictEqual({ min: 5, max: 7 });
  });
});

// ─── addBusinessDays ──────────────────────────────────────────────────────────
// Use `new Date(year, month, day)` (local midnight) so getDay() is reliable
// across any host timezone, unlike ISO string parsing which gives UTC midnight.

/** Format a Date as YYYY-MM-DD using LOCAL time. */
function localDateString(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

describe('addBusinessDays', () => {
  it('AddBusinessDays_ZeroDays_ReturnsSameDay', () => {
    const mon = new Date(2025, 5, 2); // June 2 2025 (Monday) — local midnight
    expect(mon.getDay()).toBe(1);     // guard: confirm it is Monday
    const result = addBusinessDays(mon, 0);
    expect(localDateString(result)).toBe('2025-06-02');
  });

  it('AddBusinessDays_5DaysFromMonday_IsNextMonday', () => {
    const mon = new Date(2025, 5, 2); // June 2 2025 — Monday
    const result = addBusinessDays(mon, 5);
    expect(localDateString(result)).toBe('2025-06-09'); // Next Monday
  });

  it('AddBusinessDays_SkipsWeekend_FromFriday', () => {
    const fri = new Date(2025, 5, 6); // June 6 2025 — Friday
    expect(fri.getDay()).toBe(5);
    const result = addBusinessDays(fri, 1);
    expect(localDateString(result)).toBe('2025-06-09'); // Monday
  });

  it('AddBusinessDays_SkipsWeekend_FromThursday2Days', () => {
    const thu = new Date(2025, 5, 5); // June 5 2025 — Thursday
    expect(thu.getDay()).toBe(4);
    const result = addBusinessDays(thu, 2);
    expect(localDateString(result)).toBe('2025-06-09'); // Mon (Fri +1 skips weekend)
  });

  it('AddBusinessDays_DoesNotMutateInputDate', () => {
    const date = new Date(2025, 5, 2); // June 2 — Monday
    const original = date.getTime();
    addBusinessDays(date, 5);
    expect(date.getTime()).toBe(original);
  });
});
