import { DIMENSION_KEYS, type PersonalityVector } from '../types';
export const MODEL_VERSION = 'original-1.0';
export const dimensions = [
  {
    key: 'decision',
    name: '行动决断',
    short: '决断',
    description: '信息尚不完整时，你形成判断并采取行动的倾向。',
    high: '把模糊局面转成可以开始的一步',
    low: '为决定留出等待和再看一眼的空间',
    advice: '重大决定前，写下一个足以改变你判断的新证据。',
  },
  {
    key: 'insight',
    name: '系统洞察',
    short: '洞察',
    description: '你寻找规律、关联与长期影响的倾向。',
    high: '把眼前问题放回更大的因果网络',
    low: '先回应眼前可见的事实与需要',
    advice: '给分析设一个截止点，用小行动检验推断。',
  },
  {
    key: 'exploration',
    name: '创新探索',
    short: '探索',
    description: '你走向陌生路径、试验新方法的倾向。',
    high: '为尚未被证明的可能性留一扇门',
    low: '优先使用经过验证的路径',
    advice: '给新尝试设置成本上限，也留一条可回退的路。',
  },
  {
    key: 'empathy',
    name: '共情联结',
    short: '联结',
    description: '你留意他人感受、立场与关系变化的倾向。',
    high: '在不同的立场之间寻找可以靠近的地方',
    low: '先厘清事情本身，再处理关系感受',
    advice: '理解别人之前，先确认自己是否还有余力。',
  },
  {
    key: 'expression',
    name: '表达创造',
    short: '表达',
    description: '你将体验转成文字、作品和表达的倾向。',
    high: '让经历有可以被看见和分享的形状',
    low: '让体验安静地留在行动和生活里',
    advice: '有些感受可以先不整理成作品，直接说出来也很好。',
  },
  {
    key: 'organization',
    name: '组织掌控',
    short: '组织',
    description: '你安排资源、建立秩序和协调运行的倾向。',
    high: '让人、资源和时间形成可持续的配合',
    low: '为临场反应和个人节奏保留弹性',
    advice: '明确一件可以交给别人决定的事，不必守住每个细节。',
  },
  {
    key: 'autonomy',
    name: '自主边界',
    short: '自主',
    description: '你保留个人判断与选择空间的倾向。',
    high: '在外部期待中辨认自己的选择',
    low: '愿意让共同约定影响个人安排',
    advice: '把边界说成具体约定，让别人知道怎样与你合作。',
  },
  {
    key: 'resilience',
    name: '责任韧性',
    short: '韧性',
    description: '你面对代价、承担承诺并持续投入的倾向。',
    high: '在困难与反复中继续照看重要的事',
    low: '当代价改变时重新协商承诺',
    advice: '把坚持和硬撑分开，恢复时间也应写进计划。',
  },
] as const;
export const dimensionByKey = Object.fromEntries(dimensions.map((d) => [d.key, d])) as Record<
  (typeof DIMENSION_KEYS)[number],
  (typeof dimensions)[number]
>;
export const vectorFromArray = (values: readonly number[]): PersonalityVector =>
  Object.fromEntries(DIMENSION_KEYS.map((key, i) => [key, values[i]])) as PersonalityVector;
export const emptyVector = () => vectorFromArray(DIMENSION_KEYS.map(() => 0));
