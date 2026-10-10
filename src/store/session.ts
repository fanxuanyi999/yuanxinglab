import { MODEL_VERSION } from '../data/dimensions';
import { questionById } from '../data/questions';
import type { TestSession } from '../types';
export const STORAGE_KEY = 'archetype-lab:session:v1';
export function validateSession(value: unknown): value is TestSession {
  if (!value || typeof value !== 'object') return false;
  const s = value as TestSession;
  if (
    s.version !== 1 ||
    s.modelVersion !== MODEL_VERSION ||
    typeof s.id !== 'string' ||
    !Number.isInteger(s.seed) ||
    !Array.isArray(s.questionIds) ||
    s.questionIds.length !== 30 ||
    new Set(s.questionIds).size !== 30 ||
    !Number.isInteger(s.currentIndex) ||
    s.currentIndex < 0 ||
    s.currentIndex > 29 ||
    !['test', 'generating', 'result'].includes(s.stage) ||
    !s.answers ||
    !s.optionOrders
  )
    return false;
  for (const id of s.questionIds) {
    const q = questionById[id],
      order = s.optionOrders[id];
    if (
      !q ||
      !Array.isArray(order) ||
      order.length !== 4 ||
      new Set(order).size !== 4 ||
      order.some((id) => !q.options.some((o) => o.id === id))
    )
      return false;
    if (s.answers[id] !== undefined && !q.options.some((o) => o.id === s.answers[id])) return false;
  }
  if (Object.keys(s.answers).some((id) => !s.questionIds.includes(id))) return false;
  if (s.stage !== 'test' && s.questionIds.some((id) => !s.answers[id])) return false;
  if (s.questionIds.slice(0, s.currentIndex).some((id) => !s.answers[id])) return false;
  return true;
}
export function readSession(): { session: TestSession | null; warning: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { session: null, warning: '' };
    const value = JSON.parse(raw);
    if (validateSession(value)) return { session: value, warning: '' };
    return { session: null, warning: '旧记录与当前版本不兼容，请重新开始。' };
  } catch {
    return { session: null, warning: '浏览器暂时无法读取记录，你仍可以开始体验。' };
  }
}
export function saveSession(session: TestSession): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}
