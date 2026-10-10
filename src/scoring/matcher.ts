import { characters } from '../data/characters';
import type { MatchResult, PersonalityVector, Question } from '../types';
import { calculateDistance, distanceToCloseness } from './distance';
import { selectSecondary } from './secondaryMatcher';
import { normalizeAnswers } from './normalize';
export function calculateCharacterMatch(vector: PersonalityVector): MatchResult {
  const ranking = characters
    .map((character) => {
      const distance = calculateDistance(vector, character.vector);
      return { character, distance, closeness: distanceToCloseness(distance) };
    })
    .sort((a, b) => a.distance - b.distance || a.character.id.localeCompare(b.character.id, 'en'));
  return { vector, primary: ranking[0], ranking, ...selectSecondary(ranking, vector) };
}
export const scoreTest = (questions: Question[], answers: Record<string, string>) =>
  calculateCharacterMatch(normalizeAnswers(questions, answers).vector);
