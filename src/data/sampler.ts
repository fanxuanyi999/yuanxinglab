import { DIMENSION_KEYS, type Question, type TestSession } from '../types';
import { questions, questionById } from './questions';
import { MODEL_VERSION } from './dimensions';
import { seededRandom, shuffle } from '../utils/random';
export function sampleQuestions(seed: number): Question[] {
  const rng = seededRandom(seed),
    extraDimensions = shuffle(DIMENSION_KEYS, rng).slice(0, 6);
  const extraCategories = shuffle(
    ['modern', 'modern', 'historical', 'historical', 'historical', 'historical'] as const,
    rng,
  );
  const queues = Object.fromEntries(
    DIMENSION_KEYS.map((d) => {
      const modern = shuffle(
        questions.filter((q) => q.focus === d && q.category === 'modern'),
        rng,
      );
      const historical = shuffle(
        questions.filter((q) => q.focus === d && q.category === 'historical'),
        rng,
      );
      const picked = [...modern.slice(0, 2), historical[0]];
      const e = extraDimensions.indexOf(d);
      if (e >= 0) picked.push(extraCategories[e] === 'modern' ? modern[2] : historical[1]);
      return [d, shuffle(picked, rng)];
    }),
  ) as Record<(typeof DIMENSION_KEYS)[number], Question[]>;
  const selected: Question[] = [];
  for (let round = 0; round < 4; round++)
    for (const d of shuffle(DIMENSION_KEYS, rng))
      if (queues[d][round]) selected.push(queues[d][round]);
  // Repair rare boundary repeats while retaining the exact sample and quotas.
  for (let i = 1; i < selected.length; i++)
    if (selected[i].focus === selected[i - 1].focus) {
      const j = selected.findIndex(
        (q, j) =>
          j > i &&
          q.focus !== selected[i - 1].focus &&
          selected[j - 1].focus !== selected[i].focus &&
          (j === selected.length - 1 || selected[j + 1].focus !== selected[i].focus),
      );
      if (j >= 0) [selected[i], selected[j]] = [selected[j], selected[i]];
    }
  return selected;
}
export function createSession(
  seed: number = crypto.getRandomValues(new Uint32Array(1))[0],
): TestSession {
  const selected = sampleQuestions(seed),
    rng = seededRandom(seed ^ 0x1234abcd);
  return {
    version: 1,
    modelVersion: MODEL_VERSION,
    id:
      typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `session-${Date.now()}-${seed}`,
    seed,
    questionIds: selected.map((q) => q.id),
    optionOrders: Object.fromEntries(
      selected.map((q) => [
        q.id,
        shuffle(
          q.options.map((o) => o.id),
          rng,
        ),
      ]),
    ),
    answers: {},
    currentIndex: 0,
    stage: 'test',
    createdAt: new Date().toISOString(),
  };
}
export const sessionQuestions = (session: TestSession) =>
  session.questionIds.map((id) => questionById[id]);
