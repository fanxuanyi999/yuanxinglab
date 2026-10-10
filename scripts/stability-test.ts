import { mkdirSync, writeFileSync } from 'node:fs';
import { sampleQuestions } from '../src/data/sampler';
import { characters } from '../src/data/characters';
import { scoreTest } from '../src/scoring/matcher';
import { calculateDistance } from '../src/scoring/distance';
import { seededRandom, shuffle } from '../src/utils/random';
import { DIMENSION_KEYS } from '../src/types';
const seed = 4010910,
  rng = seededRandom(seed),
  count = 10000;
const experiments = [1, 2].map((changes) => {
  let same = 0,
    continuity = 0,
    extreme = 0,
    totalShift = 0,
    maxShift = 0;
  const examples: unknown[] = [];
  for (let i = 0; i < count; i++) {
    const qs = sampleQuestions(Math.floor(rng() * 0xffffffff));
    const answers = Object.fromEntries(qs.map((q) => [q.id, q.options[Math.floor(rng() * 4)].id]));
    const before = scoreTest(qs, answers);
    const edited = { ...answers };
    for (const q of shuffle(qs, rng).slice(0, changes)) {
      const alternatives = q.options.filter((o) => o.id !== answers[q.id]);
      edited[q.id] = alternatives[Math.floor(rng() * 3)].id;
    }
    const after = scoreTest(qs, edited),
      shift = calculateDistance(before.vector, after.vector),
      portraitShift = calculateDistance(
        before.primary.character.vector,
        after.primary.character.vector,
      );
    same += Number(before.primary.character.id === after.primary.character.id);
    const prior = [before.primary.character.id, before.secondary.character.id],
      next = [after.primary.character.id, after.secondary.character.id];
    continuity += Number(prior.some((id) => next.includes(id)));
    extreme += Number(portraitShift > 0.18);
    totalShift += shift;
    maxShift = Math.max(maxShift, shift);
    if (before.primary.character.id !== after.primary.character.id && examples.length < 5)
      examples.push({
        before: before.primary.character.name,
        after: after.primary.character.name,
        previousSecondary: before.secondary.character.name,
        newSecondary: after.secondary.character.name,
        portraitShift,
        vectorShift: shift,
      });
  }
  return {
    changes,
    count,
    primaryUnchanged: same / count,
    primarySecondaryOverlap: continuity / count,
    extremePortraitJump: extreme / count,
    meanVectorShift: totalShift / count,
    maxVectorShift: maxShift,
    examples,
  };
});
// Same continuous preference, independent draws: deterministic option preference.
const personas = characters.map((c) => {
  const hits: Record<string, number> = {};
  let overlaps = 0;
  const names: string[] = [];
  for (let i = 0; i < 100; i++) {
    const qs = sampleQuestions(Math.floor(rng() * 0xffffffff));
    const answers = Object.fromEntries(
      qs.map((q) => {
        const best = [...q.options].sort(
          (a, b) =>
            DIMENSION_KEYS.reduce(
              (sum, d) => sum + ((b.weights[d] ?? 0) - (a.weights[d] ?? 0)) * (c.vector[d] - 50),
              0,
            ) || a.id.localeCompare(b.id),
        );
        return [q.id, best[0].id];
      }),
    );
    const match = scoreTest(qs, answers);
    hits[match.primary.character.name] = (hits[match.primary.character.name] ?? 0) + 1;
    overlaps += Number([match.primary.character.id, match.secondary.character.id].includes(c.id));
    names.push(match.primary.character.name);
  }
  const [mode, n] = Object.entries(hits).sort((a, b) => b[1] - a[1])[0];
  return {
    persona: c.name,
    draws: 100,
    mostFrequent: mode,
    modeRate: n / 100,
    targetInPair: overlaps / 100,
    distribution: hits,
  };
});
// Operational thresholds, defined before execution; not clinical reliability claims.
const passed =
  experiments[0].extremePortraitJump < 0.05 &&
  experiments[1].extremePortraitJump < 0.1 &&
  experiments[0].primarySecondaryOverlap >= 0.65;
const report = {
  seed,
  passed,
  definition:
    'Extreme = distance between old and new primary character vectors > 0.18; pair continuity = any overlap in the two labels',
  experiments,
  personas,
};
mkdirSync('research-own', { recursive: true });
writeFileSync('research-own/stability.json', JSON.stringify(report, null, 2));
writeFileSync(
  'research-own/stability-report.md',
  `# 原创模型稳定性报告\n\n种子 ${seed}。每组先随机抽题及作答，再保持题组不变，随机改变 1 或 2 个答案。每种实验 ${count} 组。\n\n| 修改答案 | 主原型不变 | 主/隐藏至少一个延续 | 极端人物跳变 | 平均画像变化 |\n|---|---:|---:|---:|---:|\n${experiments.map((e) => `| ${e.changes} | ${(e.primaryUnchanged * 100).toFixed(2)}% | ${(e.primarySecondaryOverlap * 100).toFixed(2)}% | ${(e.extremePortraitJump * 100).toFixed(2)}% | ${e.meanVectorShift.toFixed(4)} |`).join('\n')}\n\n预设工程阈值：一题极端跳变 <5%，两题 <10%；一题主/隐藏延续 ≥65%。极端指两个主人物向量 RMS 距离 >0.18。本次 **${passed ? '通过' : '未通过'}**。相同题目及选项确定性另有单元测试。\n\n## 同倾向重新抽题\n\n另用每个人物的连续向量作为虚拟偏好，按选项权重与偏好内积选择，每人独立抽题 100 次。此实验检查抽题变化，不是针对真实人的重测信度。\n\n| 虚拟倾向 | 最常见主人物 | 众数比例 | 目标在主/隐藏中 |\n|---|---|---:|---:|\n${personas.map((p) => `| ${p.persona} | ${p.mostFrequent} | ${(p.modeRate * 100).toFixed(0)}% | ${(p.targetInPair * 100).toFixed(0)}% |`).join('\n')}\n\n相邻人物之间仍可能因一两题换位；产品会提示接近的主原型，不把标签描述为固定身份。隐藏原型也不是第二种心理人格。阈值为本项目预设工程检查，不是科学效度标准。完整变动样例与分布见 stability.json。\n`,
);
console.log(JSON.stringify({ passed, experiments, personas }, null, 2));
if (!passed) process.exitCode = 1;
