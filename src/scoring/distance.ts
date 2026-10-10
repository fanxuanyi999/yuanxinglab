import { DIMENSION_KEYS, type PersonalityVector } from '../types';
export function calculateDistance(a: PersonalityVector, b: PersonalityVector): number {
  return Math.sqrt(
    DIMENSION_KEYS.reduce((s, d) => s + ((a[d] - b[d]) / 100) ** 2, 0) / DIMENSION_KEYS.length,
  );
}
// Smooth distance mapping. No minimum percentage and no random correction.
export const distanceToCloseness = (distance: number) =>
  Math.round(100 * Math.exp(-((distance / 0.22) ** 2)));
