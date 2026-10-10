import type { MatchResult, Question } from '../types';
import { dimensionByKey } from '../data/dimensions';
import { rankDimensions } from '../scoring/normalize';
import { getUndertones, getOpeningScene, getPairReflection } from './textRules';
import { characterNarratives, pairPortraits } from './characterNarratives';

export const DISCLAIMER =
  '本测试基于行为偏好与人格原型模型，仅用于自我探索与娱乐体验，不构成心理、职业、医疗或命理判断。';
export const CLOSENESS_NOTE = '接近度表示你的答题画像与该人物原型模型的相似程度，并非心理学概率。';
export interface ReportInput {
  match: MatchResult;
  questions: Question[];
  answers: Record<string, string>;
}
export interface ReportGenerator {
  generate(input: ReportInput): GeneratedReport;
}
export interface GeneratedReport {
  why: string;
  undertones: { title: string; text: string }[];
  secondaryExplanation: string;
  combination: string;
  historicalReflection: string;
  modernPortrait: string;
  advice: string[];
  answerEvidence: { question: string; answer: string }[];
  mapSummary: string;
}
export class RuleBasedReportGenerator implements ReportGenerator {
  generate({ match, questions, answers }: ReportInput): GeneratedReport {
    const { vector, primary, secondary } = match;
    const p = primary.character;
    const s = secondary.character;
    const mainStory = characterNarratives[p.id];
    const sideStory = characterNarratives[s.id];
    const top = rankDimensions(vector).slice(0, 3);
    const answerEvidence = questions
      .map((q) => ({ q, o: q.options.find((o) => o.id === answers[q.id]) }))
      .filter((x) => x.o !== undefined)
      .sort((a, b) => top.reduce((n, d) => n + (b.o!.weights[d] ?? 0) - (a.o!.weights[d] ?? 0), 0))
      .slice(0, 3)
      .map(({ q, o }) => ({ question: q.text, answer: o!.text }));
    const pair =
      vector.expression >= 60 && vector.decision >= 60 && vector.organization >= 55
        ? pairPortraits[`${p.id}:${s.id}`]
        : undefined;
    return {
      why: `${mainStory.encounter}\n\n${getOpeningScene(vector)}`,
      undertones: getUndertones(vector),
      secondaryExplanation: sideStory.hidden,
      combination: `${pair ?? `你与${p.name}相通的，是${mainStory.motif}；与${s.name}相照的，是${sideStory.motif}。这两份心意，一起留在了你的这幅小像里。`}\n\n${getPairReflection(vector)}`,
      historicalReflection: mainStory.mirror,
      modernPortrait: `今天的你，${p.modernPortrait}`,
      advice: [p.growthAdvice, dimensionByKey[top[0]].advice, s.growthAdvice],
      answerEvidence,
      mapSummary:
        '你有向外走的心意，也有向内安放的牵挂。把它们铺在一起，便慢慢勾勒出你回应世界的轮廓。',
    };
  }
}
export const reportGenerator: ReportGenerator = new RuleBasedReportGenerator();
