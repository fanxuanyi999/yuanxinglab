import { mkdirSync, writeFileSync } from 'node:fs';
import { characters } from '../src/data/characters';
import { sampleQuestions } from '../src/data/sampler';
import { scoreTest } from '../src/scoring/matcher';
import { calculateDistance } from '../src/scoring/distance';
import { seededRandom } from '../src/utils/random';
const COUNT = 100_000,
  seed = 20261009,
  rng = seededRandom(seed);
const counts = Object.fromEntries(characters.map((c) => [c.id, 0]));
const witnesses: Record<string, unknown> = {};
const percentages: number[] = [];
for (let i = 0; i < COUNT; i++) {
  const drawSeed = Math.floor(rng() * 0xffffffff),
    qs = sampleQuestions(drawSeed);
  const answers = Object.fromEntries(qs.map((q) => [q.id, q.options[Math.floor(rng() * 4)].id]));
  const result = scoreTest(qs, answers);
  counts[result.primary.character.id]++;
  percentages.push(result.primary.closeness);
  witnesses[result.primary.character.id] ??= {
    seed: drawSeed,
    questionIds: qs.map((q) => q.id),
    answers,
    primary: result.primary.character.id,
    secondary: result.secondary.character.id,
    vector: result.vector,
  };
}
const rows = characters.map((c) => ({
  id: c.id,
  name: c.name,
  hits: counts[c.id],
  rate: counts[c.id] / COUNT,
  nearestDistance: Math.min(
    ...characters.filter((x) => x.id !== c.id).map((x) => calculateDistance(c.vector, x.vector)),
  ),
}));
const passed = rows.every((r) => r.hits > 0 && r.rate < 0.4);
percentages.sort((a, b) => a - b);
const report = {
  seed,
  count: COUNT,
  mode: 'Independent uniform options, a newly stratified 30-question draw each run',
  passed,
  rows,
  closeness: {
    min: percentages[0],
    p10: percentages[10000],
    median: percentages[50000],
    p90: percentages[90000],
    max: percentages.at(-1),
  },
};
mkdirSync('research-own', { recursive: true });
writeFileSync('research-own/reachability.json', JSON.stringify(report, null, 2));
writeFileSync('research-own/result-witnesses.json', JSON.stringify(witnesses, null, 2));
writeFileSync(
  'research-own/reachability-report.md',
  `# 原创模型可达性报告\n\n固定随机种子 ${seed}，每次重新分层抽取 30 题，四个选项独立等概率作答，共 ${COUNT.toLocaleString()} 组。没有改分、强制指定结果或性别过滤。\n\n结果：**${passed ? '通过' : '未通过'}**。24 人均须至少命中一次，任何人物不得超过 40%。相同半径只使中心距离可比，没有按人物配额发放结果。\n\n| 人物 | 命中数 | 比例 | 最近其他人物距离 |\n|---|---:|---:|---:|\n${rows.map((r) => `| ${r.name} | ${r.hits} | ${(r.rate * 100).toFixed(3)}% | ${r.nearestDistance.toFixed(4)} |`).join('\n')}\n\n距离为标准化八维 RMS。接近度分布：${JSON.stringify(report.closeness)}。接近度使用真实距离的指数映射，没有最低高分门槛。\n\n本模拟证明在这些合法题目与答案中存在可达结果，并检查随机输出偏置；**不代表真实用户分布、历史人物的科学人格测量或产品效度**。每个人物的首个合法答案见 result-witnesses.json。\n`,
);
console.log(JSON.stringify(report, null, 2));
if (!passed) process.exitCode = 1;
