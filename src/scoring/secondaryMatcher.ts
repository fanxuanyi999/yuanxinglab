import { DIMENSION_KEYS, type Match, type PersonalityVector } from '../types';
import { calculateDistance } from './distance';
export function selectSecondary(ranking: Match[], user: PersonalityVector) {
  const primary = ranking[0];
  const candidates = ranking.slice(1).filter((m) => m.distance <= primary.distance + 0.045);
  const distinct = candidates.find(
    (m) => calculateDistance(primary.character.vector, m.character.vector) >= 0.095,
  );
  const secondary = distinct ?? ranking[1];
  const secondaryDimension = [...DIMENSION_KEYS].sort((a, b) => {
    const gain = (d: typeof a) =>
      Math.abs(user[d] - primary.character.vector[d]) -
      Math.abs(user[d] - secondary.character.vector[d]);
    return gain(b) - gain(a);
  })[0];
  return { secondary, secondaryDimension, secondaryIsDistinct: !!distinct };
}
