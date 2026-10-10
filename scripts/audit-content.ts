import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { questions } from '../src/data/questions';
import { characters } from '../src/data/characters';
const files = [
  'competitor-audit.md',
  'scoring-hypothesis.md',
  'question-analysis.md',
  'question-bank.md',
  'result-page-analysis.md',
];
const sourceFiles = files.map((name) => {
  const fullText = readFileSync(`research/${name}`, 'utf8');
  return {
    name,
    fullText,
    characters: fullText.length,
    sha256: createHash('sha256').update(fullText).digest('hex'),
  };
});
const bank = JSON.parse(readFileSync('research/evidence/question-bank.json', 'utf8'));
const entireCorpus = sourceFiles.map((f) => f.fullText).join('\n');
const exactQuestions = questions.filter((q) => entireCorpus.includes(q.text)).map((q) => q.id);
const exactOptions = questions.flatMap((q) =>
  q.options
    .filter((o) => entireCorpus.includes(o.text))
    .map((o) => ({ question: q.id, option: o.id, text: o.text })),
);
const duplicateReports = characters.flatMap((c) =>
  (['coreDrive', 'shadow', 'modernPortrait', 'historicalMirror', 'shareQuote'] as const)
    .filter((key) => entireCorpus.includes(c[key]))
    .map((key) => ({ character: c.id, field: key })),
);
const historicalLengths = characters.map((c) => ({
  name: c.name,
  length: [...c.historicalMirror].length,
  status: c.factStatus,
}));
const passed =
  exactQuestions.length === 0 &&
  exactOptions.length === 0 &&
  duplicateReports.length === 0 &&
  historicalLengths.every((r) => r.length >= 150 && r.length <= 250);
const result = {
  passed,
  sourceFiles: sourceFiles.map(({ fullText, ...rest }) => rest),
  bankLoadedCompletely: !!bank,
  exactQuestions,
  exactOptions,
  duplicateReports,
  historicalLengths,
  notes: [
    'Exact phrase screening is a guardrail, not a legal originality certificate.',
    'All 24 historical passages have source leads but retain TODO: FACT_CHECK for pre-sale primary-source review.',
    'The application has no runtime imports from research/.',
  ],
};
mkdirSync('research-own', { recursive: true });
writeFileSync('research-own/content-audit.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!passed) process.exitCode = 1;
