/**
 * Delivery ETA calculation engine.
 * Estimates delivery timeframe based on distance from the nearest
 * distribution center (Seattle WA default) to the customer's location.
 *
 * Uses great-circle distance (Haversine formula) between coordinates.
 * Shipping speed estimates:
 *  - Same-state: 1–2 business days
 *  - West coast: 2–4 business days
 *  - Cross-country: 4–7 business days
 */
import { DistributionCenter, StoreLocation } from '@moore-tires/db';
import type { DeliveryEstimate, JwtPayload } from '@moore-tires/shared';

// ZIP code → approximate lat/lng center (coarse lookup for ETA purposes)
// In production this would use a geocoding API. For now we use a region-based heuristic.
const ZIP_REGION_MAP: Record<string, { lat: number; lng: number }> = {
  // WA / OR / ID region
  '98': { lat: 47.6, lng: -122.3 },
  '97': { lat: 45.5, lng: -122.7 },
  '83': { lat: 43.6, lng: -116.2 },
  // CA
  '90': { lat: 34.0, lng: -118.2 },
  '91': { lat: 34.0, lng: -118.2 },
  '92': { lat: 33.1, lng: -117.1 },
  '93': { lat: 35.4, lng: -119.0 },
  '94': { lat: 37.8, lng: -122.4 },
  '95': { lat: 37.3, lng: -121.9 },
  '96': { lat: 40.6, lng: -122.4 },
  // Mountain states
  '80': { lat: 39.7, lng: -104.9 },
  '84': { lat: 40.8, lng: -111.9 },
  '85': { lat: 33.4, lng: -112.0 },
  '87': { lat: 35.1, lng: -106.6 },
  '89': { lat: 36.2, lng: -115.1 },
  // TX
  '75': { lat: 32.8, lng: -96.8 },
  '77': { lat: 29.8, lng: -95.4 },
  '78': { lat: 29.4, lng: -98.5 },
  '73': { lat: 35.5, lng: -97.5 },
  // Midwest
  '60': { lat: 41.9, lng: -87.6 },
  '55': { lat: 44.9, lng: -93.3 },
  '48': { lat: 42.3, lng: -83.0 },
  '43': { lat: 39.9, lng: -82.9 },
  '46': { lat: 39.8, lng: -86.2 },
  // East
  '10': { lat: 40.7, lng: -74.0 },
  '19': { lat: 40.0, lng: -75.2 },
  '20': { lat: 38.9, lng: -77.0 },
  '30': { lat: 33.7, lng: -84.4 },
  '32': { lat: 28.5, lng: -81.4 },
  '33': { lat: 25.8, lng: -80.2 },
  '02': { lat: 42.4, lng: -71.1 },
};

// Default distribution center: Seattle, WA
const DEFAULT_CENTER = { lat: 47.6062, lng: -122.3321 };

/** Haversine distance in miles between two coordinates. */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Approximate coordinates for a ZIP code using prefix lookup. */
function zipToCoords(zip: string): { lat: number; lng: number } | null {
  // Try 3-digit, then 2-digit prefix
  const prefix3 = zip.slice(0, 3);
  if (ZIP_REGION_MAP[prefix3]) return ZIP_REGION_MAP[prefix3];
  const prefix2 = zip.slice(0, 2);
  if (ZIP_REGION_MAP[prefix2]) return ZIP_REGION_MAP[prefix2];
  return null;
}

/** Convert distance to estimated business days. */
function distanceToDays(miles: number): { min: number; max: number } {
  if (miles < 150) return { min: 1, max: 2 };
  if (miles < 500) return { min: 2, max: 3 };
  if (miles < 1200) return { min: 3, max: 5 };
  if (miles < 2000) return { min: 4, max: 6 };
  return { min: 5, max: 7 };
}

/** Add business days to a date (skip weekends). */
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

/**
 * Calculate delivery estimate for a given destination ZIP code.
 * Finds the nearest active distribution center or falls back to Seattle default.
 */
export async function calculateDeliveryEstimate(
  destinationZip: string,
  _user?: JwtPayload
): Promise<DeliveryEstimate> {
  const destCoords = zipToCoords(destinationZip);
  if (!destCoords) {
    // Fallback: assume cross-country for unrecognized ZIPs
    const est = addBusinessDays(new Date(), 6);
    return {
      minDays: 5,
      maxDays: 7,
      estimatedDate: est.toISOString().split('T')[0]!,
      distributionCenter: 'WA',
    };
  }

  // Find nearest active distribution center
  const centers = await DistributionCenter.find({ isActive: true }).lean();

  let bestCenter = { name: 'Seattle WA', ...DEFAULT_CENTER };
  let bestDistance = haversineDistance(
    destCoords.lat,
    destCoords.lng,
    DEFAULT_CENTER.lat,
    DEFAULT_CENTER.lng
  );

  for (const center of centers) {
    const d = haversineDistance(
      destCoords.lat,
      destCoords.lng,
      center.coordinates.lat,
      center.coordinates.lng
    );
    if (d < bestDistance) {
      bestDistance = d;
      bestCenter = { name: center.name, ...center.coordinates };
    }
  }

  const { min, max } = distanceToDays(bestDistance);
  const estimatedDate = addBusinessDays(new Date(), max);

  return {
    minDays: min,
    maxDays: max,
    estimatedDate: estimatedDate.toISOString().split('T')[0]!,
    distributionCenter: bestCenter.name,
  };
}

/**
 * Get ETA for a store location (uses the store's coordinates directly).
 */
export async function calculateStoreEta(
  storeLocationId: string
): Promise<DeliveryEstimate> {
  const store = await StoreLocation.findById(storeLocationId).lean();
  if (!store?.coordinates) {
    return {
      minDays: 3,
      maxDays: 5,
      estimatedDate: addBusinessDays(new Date(), 5).toISOString().split('T')[0]!,
      distributionCenter: 'WA',
    };
  }

  const centers = await DistributionCenter.find({ isActive: true }).lean();

  let bestName = 'Seattle WA';
  let bestDistance = haversineDistance(
    store.coordinates.lat,
    store.coordinates.lng,
    DEFAULT_CENTER.lat,
    DEFAULT_CENTER.lng
  );

  for (const center of centers) {
    const d = haversineDistance(
      store.coordinates.lat,
      store.coordinates.lng,
      center.coordinates.lat,
      center.coordinates.lng
    );
    if (d < bestDistance) {
      bestDistance = d;
      bestName = center.name;
    }
  }

  const { min, max } = distanceToDays(bestDistance);

  return {
    minDays: min,
    maxDays: max,
    estimatedDate: addBusinessDays(new Date(), max).toISOString().split('T')[0]!,
    distributionCenter: bestName,
  };
}
