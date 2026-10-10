export const DIMENSION_KEYS = [
  'decision',
  'insight',
  'exploration',
  'empathy',
  'expression',
  'organization',
  'autonomy',
  'resilience',
] as const;
export type DimensionKey = (typeof DIMENSION_KEYS)[number];
export type PersonalityVector = Record<DimensionKey, number>;
export interface QuestionOption {
  id: string;
  text: string;
  weights: Partial<PersonalityVector>;
}
export interface Question {
  id: string;
  category: 'modern' | 'historical';
  focus: DimensionKey;
  text: string;
  options: QuestionOption[];
}
export interface CharacterTheme {
  accent: string;
  paper: string;
  ink: string;
  mist: string;
}
export interface HistoricalCharacter {
  id: string;
  name: string;
  era: string;
  identity: string;
  vector: PersonalityVector;
  archetypeTitle: string;
  subtitle: string;
  tags: string[];
  coreDrive: string;
  strengths: string[];
  shadow: string;
  relationshipStyle: string;
  workStyle: string;
  modernPortrait: string;
  growthAdvice: string;
  historicalMirror: string;
  historicalSource: string;
  factStatus: 'reviewed' | 'TODO: FACT_CHECK';
  modernInterpretation: string;
  shareQuote: string;
  dominantDimensions: DimensionKey[];
  image: string;
  theme: CharacterTheme;
}
export interface TestSession {
  version: 1;
  modelVersion: string;
  id: string;
  seed: number;
  questionIds: string[];
  optionOrders: Record<string, string[]>;
  answers: Record<string, string>;
  currentIndex: number;
  stage: 'test' | 'generating' | 'result';
  createdAt: string;
}
export interface Match {
  character: HistoricalCharacter;
  distance: number;
  closeness: number;
}
export interface MatchResult {
  vector: PersonalityVector;
  primary: Match;
  secondary: Match;
  ranking: Match[];
  secondaryDimension: DimensionKey;
  secondaryIsDistinct: boolean;
}
