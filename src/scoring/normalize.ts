import { DIMENSION_KEYS, type PersonalityVector, type Question } from '../types';
import { emptyVector } from '../data/dimensions';
export function normalizeAnswers(questions: Question[], answers: Record<string, string>) {
  const raw = emptyVector(),
    min = emptyVector(),
    max = emptyVector();
  for (const q of questions) {
    const selected = q.options.find((o) => o.id === answers[q.id]);
    if (!selected) throw new Error(`缺少有效回答：${q.id}`);
    for (const d of DIMENSION_KEYS) {
      const weights = q.options.map((o) => o.weights[d] ?? 0);
      raw[d] += selected.weights[d] ?? 0;
      min[d] += Math.min(...weights);
      max[d] += Math.max(...weights);
    }
  }
  const vector = emptyVector();
  for (const d of DIMENSION_KEYS)
    vector[d] =
      max[d] === min[d]
        ? 50
        : Math.max(0, Math.min(100, ((raw[d] - min[d]) / (max[d] - min[d])) * 100));
  return { vector, raw, theoreticalMin: min, theoreticalMax: max };
}
export const rankDimensions = (vector: PersonalityVector) =>
  [...DIMENSION_KEYS].sort((a, b) => vector[b] - vector[a]);
