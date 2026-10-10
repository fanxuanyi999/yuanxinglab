import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { characters } from '../src/data/characters';
import { questionById } from '../src/data/questions';
import { createSession, sessionQuestions } from '../src/data/sampler';
import { vectorFromArray } from '../src/data/dimensions';
import { calculateCharacterMatch, scoreTest } from '../src/scoring/matcher';
import { reportGenerator, type GeneratedReport } from '../src/report/reportGenerator';
import { characterNarratives } from '../src/report/characterNarratives';
import { getUndertones } from '../src/report/textRules';
import { DIMENSION_KEYS, type PersonalityVector } from '../src/types';

const witnesses = JSON.parse(readFileSync('research-own/result-witnesses.json', 'utf8')) as Record<
  string,
  {
    seed: number;
    questionIds: string[];
    answers: Record<string, string>;
    primary: string;
    secondary: string;
    vector: PersonalityVector;
  }
>;
const technicalCopy =
  /[0-9%]|本轮|阈值|分数|得分|相对靠前|排序|八维距离|误差|模型|本产品|用户|百分位|编辑|校读/;
function checkNarrative(report: GeneratedReport) {
  const passages = [
    report.why,
    report.secondaryExplanation,
    report.combination,
    report.historicalReflection,
    report.modernPortrait,
    report.mapSummary,
    ...report.undertones.map((tone) => tone.text),
  ];
  for (const text of passages.flatMap((text) => text.split('\n\n'))) {
    assert.match(text, /你/, text);
    assert.doesNotMatch(text, technicalCopy);
    assert.doesNotMatch(text, /undefined|NaN|前世就是|天生注定|与生俱来的天赋/);
  }
  assert.equal(report.undertones.length, 3);
  assert.equal(new Set(report.undertones.map((t) => t.title)).size, 3);
  assert.equal(report.advice.length, 3);
  assert.equal(new Set(report.advice).size, 3);
  const opening = report.why.split('\n\n')[1];
  assert.ok(
    report.undertones.every((t) => t.text !== opening),
    'opening must not repeat a whole undertone',
  );
}

test('all 24 saved answer sets retain their matches and produce direct, immersive reports', () => {
  for (const c of characters) {
    assert.ok(characterNarratives[c.id], c.id);
    for (const field of ['workStyle', 'shadow', 'relationshipStyle', 'coreDrive'] as const)
      assert.match(c[field], /你/, c.id + ':' + field);
    const witness = witnesses[c.id];
    const qs = witness.questionIds.map((id) => questionById[id]);
    const match = scoreTest(qs, witness.answers);
    assert.equal(match.primary.character.id, witness.primary);
    assert.equal(match.secondary.character.id, witness.secondary);
    assert.deepEqual(match.vector, witness.vector);
    const report = reportGenerator.generate({ match, questions: qs, answers: witness.answers });
    checkNarrative(report);
    assert.deepEqual(
      report,
      reportGenerator.generate({ match, questions: qs, answers: witness.answers }),
    );
    assert.equal(report.answerEvidence.length, 3);
    for (const evidence of report.answerEvidence) {
      const q = qs.find((q) => q.text === evidence.question)!;
      assert.equal(evidence.answer, q.options.find((o) => o.id === witness.answers[q.id])!.text);
    }
    const restored = createSession(witness.seed);
    restored.answers = witness.answers;
    assert.equal(
      scoreTest(sessionQuestions(restored), restored.answers).primary.character.id,
      c.id,
    );
  }
});

test('all directional character pair compositions speak to the reader without forced opposites', () => {
  let count = 0;
  for (const p of characters)
    for (const s of characters) {
      if (p.id === s.id) continue;
      const match = calculateCharacterMatch(p.vector);
      const report = reportGenerator.generate({
        match: {
          ...match,
          primary: match.ranking.find((m) => m.character.id === p.id)!,
          secondary: match.ranking.find((m) => m.character.id === s.id)!,
        },
        questions: [],
        answers: {},
      });
      checkNarrative(report);
      assert.ok(report.combination.includes(p.name) && report.combination.includes(s.name));
      assert.ok(report.secondaryExplanation.includes(s.name));
      assert.doesNotMatch(report.secondaryExplanation, /截然相反|完全相反|没有完全贴合|设定更接近/);
      count++;
    }
  assert.equal(count, 552);
});

test('even, reserved and boundary profiles get distinct prose without inventing high traits', () => {
  const qs = sessionQuestions(createSession(17));
  const answers = Object.fromEntries(qs.map((q) => [q.id, 'a']));
  for (const level of [0, 30, 44.99, 45, 50, 59.99, 60, 80, 100]) {
    const vector = vectorFromArray(DIMENSION_KEYS.map(() => level));
    const report = reportGenerator.generate({
      match: calculateCharacterMatch(vector),
      questions: qs,
      answers,
    });
    checkNarrative(report);
    if (level < 45) assert.match(report.undertones[0].text, /不被催促/);
    else if (level < 60) assert.match(report.undertones[0].text, /不同的人与事/);
    else assert.match(report.undertones[0].text, /愿意投入/);
  }
  for (const d of DIMENSION_KEYS) {
    const texts = new Set<string>();
    for (const level of [40, 55, 75]) {
      const vector = { ...vectorFromArray(DIMENSION_KEYS.map(() => 20)), [d]: level };
      const report = reportGenerator.generate({
        match: calculateCharacterMatch(vector),
        questions: qs,
        answers,
      });
      checkNarrative(report);
      texts.add(report.why);
    }
    assert.equal(texts.size, 3, d);
  }
  // Similar leading preferences are not an all-round balanced profile.
  const threeStrong = getUndertones(vectorFromArray([75, 75, 75, 25, 25, 25, 25, 25]));
  assert.doesNotMatch(threeStrong[0].title, /处境慢慢|认真回应/);
});
