import { test } from 'node:test';
import assert from 'node:assert/strict';
import { characters } from '../src/data/characters';
import { questions } from '../src/data/questions';
import { sampleQuestions, createSession } from '../src/data/sampler';
import { scoreTest, calculateCharacterMatch } from '../src/scoring/matcher';
import { normalizeAnswers } from '../src/scoring/normalize';
import { distanceToCloseness } from '../src/scoring/distance';
import { validateSession } from '../src/store/session';
import { DIMENSION_KEYS } from '../src/types';
import { vectorFromArray } from '../src/data/dimensions';
import { reportGenerator } from '../src/report/reportGenerator';
test('72 distinct scenes; four signed, multi-dimension options; exact content mix', () => {
  assert.equal(questions.length, 72);
  assert.equal(new Set(questions.map((q) => q.text)).size, 72);
  assert.equal(questions.filter((q) => q.category === 'modern').length, 44);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    for (const o of q.options) {
      assert.equal(Object.keys(o.weights).length, 3);
      assert.ok(Object.values(o.weights).some((n) => n < 0));
    }
  }
});
test('sampling: 30 unique, 18 modern + 12 historical, every focus 3–4, no repeated neighbors', () => {
  for (let seed = 0; seed < 1000; seed++) {
    const qs = sampleQuestions(seed);
    assert.equal(qs.length, 30);
    assert.equal(new Set(qs.map((q) => q.id)).size, 30);
    assert.equal(qs.filter((q) => q.category === 'modern').length, 18);
    for (const d of DIMENSION_KEYS)
      assert.ok([3, 4].includes(qs.filter((q) => q.focus === d).length));
    for (let i = 1; i < 30; i++) assert.notEqual(qs[i].focus, qs[i - 1].focus);
    assert.deepEqual(sampleQuestions(seed), qs);
  }
});
test('all 24 characters have unique vectors and own text, no gender filter', () => {
  assert.equal(characters.length, 24);
  assert.equal(new Set(characters.map((c) => JSON.stringify(c.vector))).size, 24);
  for (const field of [
    'archetypeTitle',
    'coreDrive',
    'shadow',
    'modernPortrait',
    'historicalMirror',
  ] as const)
    assert.equal(new Set(characters.map((c) => c[field])).size, 24);
  for (const c of characters)
    assert.equal(calculateCharacterMatch(c.vector).primary.character.id, c.id);
});
test('normalization uses per-round theoretical bounds, not personal extrema', () => {
  const qs = sampleQuestions(5),
    answers = Object.fromEntries(qs.map((q) => [q.id, 'b']));
  const r = normalizeAnswers(qs, answers);
  for (const d of DIMENSION_KEYS)
    assert.equal(
      r.vector[d],
      ((r.raw[d] - r.theoreticalMin[d]) / (r.theoreticalMax[d] - r.theoreticalMin[d])) * 100,
    );
  assert.ok(Math.min(...Object.values(r.vector)) > 0);
  assert.ok(Math.max(...Object.values(r.vector)) < 100);
  assert.throws(() => normalizeAnswers(qs, {}));
});
test('same answers deterministic; changing a prior answer recomputes without accumulation', () => {
  const qs = sampleQuestions(88),
    a = Object.fromEntries(qs.map((q) => [q.id, 'a']));
  const before = scoreTest(qs, a);
  const edited = { ...a, [qs[0].id]: 'd' };
  assert.notDeepEqual(scoreTest(qs, edited).vector, before.vector);
  assert.deepEqual(scoreTest(qs, a), before);
  assert.notEqual(before.primary.character.id, before.secondary.character.id);
});
test('distance mapping has no artificially high floor', () => {
  assert.equal(distanceToCloseness(0), 100);
  assert.ok(distanceToCloseness(0.5) < 5);
  assert.ok(distanceToCloseness(0.2) < distanceToCloseness(0.1));
});
test('session validates IDs, partial progress, model version and completed answers', () => {
  const s = createSession(10);
  assert.ok(validateSession(s));
  assert.equal(validateSession({ ...s, stage: 'result' }), false);
  assert.equal(validateSession({ ...s, currentIndex: 8 }), false);
  assert.equal(validateSession({ ...s, modelVersion: 'old' }), false);
  assert.equal(
    validateSession({ ...s, questionIds: s.questionIds.map(() => s.questionIds[0]) }),
    false,
  );
  assert.equal(validateSession({ ...s, answers: { [s.questionIds[0]]: 'wrong' } }), false);
});
test('flat profile does not invent exceptional talents; dynamic text changes', () => {
  const qs = sampleQuestions(17),
    answers = Object.fromEntries(qs.map((q) => [q.id, 'a']));
  const flat = calculateCharacterMatch(vectorFromArray([50, 50, 50, 50, 50, 50, 50, 50]));
  const report = reportGenerator.generate({ match: flat, questions: qs, answers });
  assert.match(report.undertones[0].text, /不同的人与事/);
  assert.ok(!report.why.includes('达到本模型'));
  assert.equal(report.answerEvidence.length, 3);
  assert.equal(report.advice.length, 3);
});

test('all character accent colors have readable contrast on their own and app paper', () => {
  const luminance = (hex: string) => {
    const rgb = hex
      .slice(1)
      .match(/../g)!
      .map((n) => parseInt(n, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  for (const c of characters)
    for (const bg of [c.theme.paper, '#f5f4eb']) {
      const a = luminance(c.theme.accent),
        b = luminance(bg);
      assert.ok((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5, c.name);
    }
});
