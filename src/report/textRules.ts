import { rankDimensions } from '../scoring/normalize';
import type { PersonalityVector, DimensionKey } from '../types';

export interface NarrativeTone {
  title: string;
  text: string;
}
type NarrativeBand = 'outward' | 'situational' | 'reserved';

// Scores select passages internally. Never interpolate them into narrative copy.
const dimensionNarratives: Record<DimensionKey, Record<NarrativeBand, NarrativeTone>> = {
  decision: {
    outward: {
      title: '在意的事，总想亲手推一把',
      text: '面对悬而未决的事，你很难一直站在一旁等消息。哪怕还没有十足把握，也想先做一点什么。别人看到的是你迈出的那一步，你心里想的却是：这件事值得有人认真对待。',
    },
    situational: {
      title: '等心里有了回声，再迈步',
      text: '你未必每次都抢先开口，但碰到真正牵动自己的事，也不愿一直等下去。你需要一点时间确认：这一步，是出于自己的心意，还是被周围的声音催着走。',
    },
    reserved: {
      title: '把决定留到看清之后',
      text: '众人催促的时候，你仍想再看一眼。你更愿意让事情慢慢显出轮廓，再决定是否投入。有些路，晚一点动身，反而能走得更安心。',
    },
  },
  insight: {
    outward: {
      title: '总想多问一句，后来呢',
      text: '一句轻巧的结论，往往还不能让你释然。你会惦记它背后的缘由，也会想这件事再往后走，会把人带到哪里。很多时候，你还在想着的，恰好是谈话结束后无人再追问的那一段。',
    },
    situational: {
      title: '从眼前，慢慢看到远处',
      text: '你愿意听一个解释，也会回头看看它是否说得通。比起一开始就替事情定性，你更习惯让细节慢慢聚拢，再形成自己的理解。',
    },
    reserved: {
      title: '先照看眼前真实的事',
      text: '比起绕很远的推演，你更想知道此刻究竟发生了什么。眼前的人需要什么、手边的事怎样处理，这些具体的问题，更容易让你愿意投入。',
    },
  },
  exploration: {
    outward: {
      title: '心里总留着一条岔路',
      text: '熟悉的路当然安稳，但陌生的街巷、没试过的办法，总会让你多看一眼。你想亲自走近那些还说不清的可能，看看生活能否在这里换一种展开。',
    },
    situational: {
      title: '先推开一扇小窗',
      text: '你对新鲜事物有好奇，也珍惜熟悉的生活。遇到心动的可能，你更愿意先靠近一点，试过之后，再决定要不要走得更远。',
    },
    reserved: {
      title: '熟悉的路，也值得细走',
      text: '你未必急着追赶每一种新鲜。已经用得顺手的方法、相处自在的人、走过许多遍的路，都有让你愿意停留的理由。安心本身，也是你认真选择的生活感受。',
    },
  },
  empathy: {
    outward: {
      title: '记得话语背后，还有一个人',
      text: '一场谈话过后，让你惦记的可能不只是结论，还有某个人没能说完的话。你愿意多听片刻，想知道对方为什么如此在意。对你来说，彼此能够听懂，是一件有分量的事。',
    },
    situational: {
      title: '靠近别人，也听一听自己',
      text: '你会留心身边人的感受，也需要独处时那份松弛。愿意陪伴的时候，你希望好好在场；需要退开的时候，也想让关系容得下这段安静。',
    },
    reserved: {
      title: '关心，也可以落在实处',
      text: '面对他人的难处，你往往先想到事情该怎样解决。许多话还没组织好，你可能已经在确认时间、寻找办法。你的回应更愿意落在具体的一件事上。',
    },
  },
  expression: {
    outward: {
      title: '心里的波澜，要有回声',
      text: '有些经历若只是过去了，你会觉得可惜。一句话、一张照片、一件亲手做出的东西，都可以替你留住那个瞬间。你希望有人看见的，也包括你曾怎样认真地感受过。',
    },
    situational: {
      title: '只把真正在意的，说给懂的人',
      text: '你未必随时想表达，但遇到触动自己的事，也会想为它留下一点痕迹。也许只是发给某个人的一段话，或只写给自己看的几行字，已经足够郑重。',
    },
    reserved: {
      title: '有些心意，留在日常里',
      text: '经历一件事之后，你未必急着讲述。比起整理成漂亮的话，你可能更愿意让它安静地留下来，成为下一次选择、一次照顾，或只有自己明白的小习惯。',
    },
  },
  organization: {
    outward: {
      title: '愿望落地前，你已开始准备',
      text: '约好要一起做的事，你常常会继续想：谁来同行，何时出发，还缺什么。那些看起来琐碎的安排，在你心里与愿望连在一起。你想让一次说好的约定，真的成为大家共同经历过的事。',
    },
    situational: {
      title: '有个方向，也留一点余地',
      text: '你喜欢心里大致有数，又不想让安排填满所有空隙。重要的部分先约定好，剩下的留给当天的心情与变化，这样的节奏更让你自在。',
    },
    reserved: {
      title: '给生活留一段即兴',
      text: '比起把每个环节都预先排好，你更愿意到了现场再感受。计划突然转弯时，你也想保留重新商量的余地，让人和事情按当下的需要调整。',
    },
  },
  autonomy: {
    outward: {
      title: '热闹之外，有自己的方向',
      text: '一个选择再受欢迎，你也会问自己：我真的想要吗？你在意能否亲口说出愿意，也在意是否还有转身的自由。过上自己认得出的生活，会让你感到踏实。',
    },
    situational: {
      title: '在人群里，听清自己的心意',
      text: '别人的期待会进入你的考虑，但你也想给自己的感受留个位置。许多决定是在来回商量中慢慢清楚的：哪里可以迁就，哪里仍需要认真说出自己的想法。',
    },
    reserved: {
      title: '同行的约定，也是你的选择',
      text: '当一件事与重要的人有关，你愿意把彼此的安排一起考虑。一个共同商量出的决定，常比独自坚持某种方式更让你安心。你珍惜的是往前走时，身边还有熟悉的人。',
    },
  },
  resilience: {
    outward: {
      title: '认真过的事，不轻易放下',
      text: '最初的热闹过去之后，你往往还惦记着那个约定。遇到反复，你想再试一个办法；暂时停住，你也希望有一天把它接回来。那份牵挂，常常比一时的兴奋留得更久。',
    },
    situational: {
      title: '一边坚持，一边照看自己',
      text: '你愿意给在意的事一些耐心，也会问自己还能走多远。停下来歇一歇、换一种做法，有时正是你让一段投入继续下去的方式。',
    },
    reserved: {
      title: '走到岔口，也允许转身',
      text: '当事情的代价变了，你愿意重新想一想原来的约定。比起为了证明坚持而继续，你更在意今天的自己是否仍愿意。松开一些东西，也能给新的生活腾出位置。',
    },
  },
};

export const combinationContent: [DimensionKey, DimensionKey, NarrativeTone][] = [
  [
    'expression',
    'decision',
    {
      title: '把热望，写进也走进生活',
      text: '有些事让你想开口，也让你想动身。为一个念头认真写下几句话之后，你还会惦记自己能做些什么。你期待心中的波澜，最终在真实生活里留下一点回声。',
    },
  ],
  [
    'exploration',
    'organization',
    {
      title: '心向远方，也记得收拾行囊',
      text: '一个新念头让你心动时，你会开始想怎么抵达。找同行的人，看看手边的条件，把出发前的小事逐一安顿。远方因此有了日期，也有了可以迈出的第一步。',
    },
  ],
  [
    'exploration',
    'expression',
    {
      title: '走过的风景，要留下自己的笔迹',
      text: '陌生的街巷和意外的相遇，常会在你心里多停留一会儿。你想亲自经历，也想把那一刻重新说出来，让别人看见你眼中的世界是什么模样。',
    },
  ],
  [
    'insight',
    'organization',
    {
      title: '想得长远，也照看细处',
      text: '听到一个愿望时，你会想到它往后的样子，也会想到眼下缺少的环节。你愿意把散落的线索一件件接起来，好让重要的事情不会只停在某次谈话里。',
    },
  ],
  [
    'empathy',
    'resilience',
    {
      title: '把陪伴，放进长一点的时间',
      text: '热闹散去后，你还可能想起那个需要被听见的人。你珍惜日复一日的联系，愿意给一段关系留出耐心。那些没有大事发生的普通日子，也值得好好相待。',
    },
  ],
  [
    'decision',
    'autonomy',
    {
      title: '心意定了，就想亲自走一程',
      text: '面对众多建议，你仍想确认自己究竟愿意什么。一旦心里有了答案，你便想亲自试一试。那条路或许并不轻松，但走在上面，你知道这一步由自己选择。',
    },
  ],
  [
    'insight',
    'exploration',
    {
      title: '旧问题里，藏着另一条路',
      text: '一句“一直都是这样”，常会让你再多问几句。你想知道事情为什么如此，也想看看换一种办法会怎样。那些还没有被试过的走法，会让你愿意多花一些心思。',
    },
  ],
  [
    'organization',
    'resilience',
    {
      title: '让一句答应，有后来',
      text: '认真答应过的事，你会替它留出时间，也会记着下一步该怎样接续。你珍惜一个愿望被慢慢做成的过程，尤其在最初的热情散去之后。',
    },
  ],
  [
    'expression',
    'autonomy',
    {
      title: '留下属于自己的笔法',
      text: '同样一段经历，你希望用自己认得出的语言说出来。流行的答案可以参考，但真正让你满意的，仍是那句话有没有贴近自己的感受。',
    },
  ],
  [
    'empathy',
    'expression',
    {
      title: '把那些细小的在意，好好说出来',
      text: '一句话里的迟疑、一次相处后的余温，都可能让你想了很久。你希望找到贴切的表达，让那些很轻却很真实的感受，也能被人郑重地接住。',
    },
  ],
  [
    'insight',
    'empathy',
    {
      title: '听懂一个人，也读懂他的处境',
      text: '听到一段经历，你会想知道那个人当时站在哪里，又有哪些不得不面对的选择。你愿意把故事听长一点，让理解慢慢越过最初的印象。',
    },
  ],
  [
    'decision',
    'resilience',
    {
      title: '愿意出发，也惦记着走完',
      text: '你愿意为在意的事情迈出第一步，之后也常常记挂着它的进展。遇见阻碍时，你想先找一个还能继续的办法，让最初的心意有机会走到后来。',
    },
  ],
];

function band(value: number): NarrativeBand {
  return value >= 60 ? 'outward' : value >= 45 ? 'situational' : 'reserved';
}
export function dimensionNarrative(v: PersonalityVector, d: DimensionKey): NarrativeTone {
  return dimensionNarratives[d][band(v[d])];
}
function isEvenProfile(v: PersonalityVector) {
  const values = Object.values(v);
  return Math.max(...values) - Math.min(...values) < 8;
}
function evenNarratives(v: PersonalityVector): NarrativeTone[] {
  const average = Object.values(v).reduce((sum, n) => sum + n, 0) / 8;
  const first: Record<NarrativeBand, NarrativeTone> = {
    outward: {
      title: '许多事情，都想认真回应',
      text: '想做的事、想理解的人、想亲自走一走的路，都能让你愿意投入。生活向你发出不同的邀请时，你常会想：也许这一件，我也可以认真试试。',
    },
    situational: {
      title: '让处境慢慢告诉你答案',
      text: '有时你愿意先行一步，有时也想停下来听听。面对不同的人与事，你会重新寻找合适的回应。眼前发生了什么，比预先选定一种姿态更让你在意。',
    },
    reserved: {
      title: '先找回自己的节奏',
      text: '面对接连而来的邀请，你似乎更想留一点时间给自己。等事情清楚些，等心里有了余地，再决定把注意力放在哪里。此刻的你，也许更珍惜一段不被催促的日常。',
    },
  };
  return [
    first[band(average)],
    {
      title: '不同的心意，可以并肩存在',
      text: '想靠近的时候，你也可能需要一点独处；想出发的时候，也会眷恋熟悉的日子。读到这些不同的心意，你可以让它们先并肩坐一会儿，看看哪一个更像此刻的自己。',
    },
    {
      title: '给还没定下来的自己留白',
      text: '今天愿意的事，过些时候也许会有新的答案。你可以把这次相遇当作一页随手写下的自画像，让后来的经历慢慢补上颜色。',
    },
  ];
}

function findCombination(v: PersonalityVector) {
  const top = rankDimensions(v).slice(0, 3);
  return combinationContent
    .filter(([a, b]) => top.includes(a) && top.includes(b) && v[a] >= 60 && v[b] >= 60)
    .sort(([a, b], [c, d]) => v[c] + v[d] - v[a] - v[b])[0];
}

export function getUndertones(v: PersonalityVector): NarrativeTone[] {
  if (isEvenProfile(v)) return evenNarratives(v);
  const sorted = rankDimensions(v);
  const combined = findCombination(v);
  const used = new Set<DimensionKey>();
  const result: NarrativeTone[] = [];
  if (combined) {
    result.push(combined[2]);
    used.add(combined[0]);
    used.add(combined[1]);
  }
  for (const d of sorted) {
    if (result.length === 3) break;
    if (!used.has(d)) result.push(dimensionNarrative(v, d));
  }
  return result;
}

export function getOpeningScene(v: PersonalityVector): string {
  if (isEvenProfile(v))
    return '你回应生活的方式，会随着眼前的人与事慢慢变化。有些决定需要时间，有些瞬间又让你想靠近一点；这些细小的来回，也在写下此刻的你。';
  const d = rankDimensions(v)[0];
  return openingScenes[d][band(v[d])];
}

const openingScenes: Record<DimensionKey, Record<NarrativeBand, string>> = {
  decision: {
    outward:
      '一件事情迟迟没人接手时，你往往已经在想，自己能不能先做一点。那份想让事情向前的心意，常比十足的把握更早到来。',
    situational:
      '有人催你拿主意时，你会先确认自己的心意。等到真正愿意的那一刻，你也想试着把选择变成行动。',
    reserved:
      '面对催促，你想多留一点看清事情的时间。比起立刻表态，你更在意自己后来能否安心地认领这个决定。',
  },
  insight: {
    outward:
      '一次谈话结束之后，你可能还在想着其中没有说透的部分。那件事为什么发生，后来会怎样，都让你愿意再往深处走一点。',
    situational:
      '遇到一个解释时，你愿意听，也会回到细节里看看。你的理解，常在这样一次次对照中慢慢清楚。',
    reserved:
      '比起先把事情想得很远，你更想知道眼前的人需要什么、今天能够处理什么。具体的生活，是你理解自己的入口。',
  },
  exploration: {
    outward:
      '面对一个没试过的念头，你容易生出亲自走近的好奇。哪怕只是换条路回家，你也想知道，熟悉之外还藏着怎样的风景。',
    situational:
      '新的可能会让你心动，但你也愿意先试一小步。生活往哪里展开，你想在亲自经历之后慢慢决定。',
    reserved:
      '你会记得熟悉的路为什么让自己安心。一种用得顺手的方法、一处愿意再去的地方，都有被你认真留下的理由。',
  },
  empathy: {
    outward:
      '散场之后，你可能还记得某个人没说完的话。你想知道他为何如此在意，也希望下一次见面，彼此能再听懂一点。',
    situational:
      '你愿意走近重要的人，也想给彼此留些自在的空隙。相处舒服时，你才更容易说出心里的话。',
    reserved:
      '有人遇到难处时，你常先想到能帮他做些什么。把眼前的问题安顿好，是你比较习惯给出的回应。',
  },
  expression: {
    outward:
      '一个瞬间打动你之后，你常想把它留下。写几行字、拍一张照，或认真说给某个人听，都是你让内心的波澜有处安放的方式。',
    situational:
      '遇到真正触动自己的事，你才想慢慢开口。你在意的是那句话是否贴近心意，也是否有人愿意认真接住。',
    reserved:
      '你有些感受更愿意留在日常里。未必说得很多，却可能在下一次选择、一次具体的照顾中留下痕迹。',
  },
  organization: {
    outward:
      '一个愿望刚被说出口，你可能已经想到谁能同行、何时开始。你愿意做些出发前的准备，让那幅想象过的画面有机会真的发生。',
    situational:
      '你喜欢重要的事情有个大致安排，也希望当天还留得下临时的心动。有方向而不被填满，会让你更自在。',
    reserved:
      '比起把一切预先排好，你更想到了现场再感受。人和事情有了变化时，你也希望大家还可以重新商量。',
  },
  autonomy: {
    outward:
      '一个选择被很多人称赞时，你仍会问自己是不是真的愿意。你想在回望时认出，这条路上有哪些脚步出自自己的心意。',
    situational:
      '别人的建议你会认真听，也会留一点时间问问自己。你想找到一个既能相处、又不委屈心意的位置。',
    reserved:
      '重要的人会进入你的考虑。一份彼此商量好的约定，常让你觉得向前走时身边有人，心里也更安稳。',
  },
  resilience: {
    outward:
      '最初的兴奋淡下去后，你可能仍惦记着那件答应过的事。再找一个办法、过些时候接回来，都是你让心意延续的方式。',
    situational:
      '你想让投入继续，也会留意自己是否还有余力。歇一歇、调整做法，有时能让你更愿意重新开始。',
    reserved:
      '当处境已经改变，你愿意再看看原来的约定。你更想让今天的投入仍然出于愿意，也给新的生活留些余地。',
  },
};

// A different register for the closing portrait, avoiding duplicate paragraphs.
const pairReflections: Record<DimensionKey, Record<NarrativeBand, string>> = {
  decision: {
    outward:
      '你希望在意的事情能有进展，也想为自己的选择留下一个真实的回应。许多念头，到你这里都还会再问一句：我能为它做些什么？',
    situational:
      '你会为值得的事情动身，也愿意给尚未想清的选择一点时间。什么时候前行，什么时候停留，你仍想亲自感受。',
    reserved:
      '你可以慢一点决定往哪里走。在看清路之前，先听听心里真正牵挂的是什么，也是一种与自己相逢的方式。',
  },
  insight: {
    outward:
      '你想读懂眼前的人与事，也想知道它们通向哪里。那些尚未被说完整的经历，会让你愿意停留得更久一些。',
    situational:
      '你会带着自己的疑问慢慢走近生活。眼前的细节与后来才明白的道理，可以在你心里逐渐连起来。',
    reserved:
      '你愿意从眼前能触碰的生活开始理解自己。一件小事里的选择，也能留下比宏大结论更贴身的回声。',
  },
  exploration: {
    outward:
      '你心里仍有想亲自抵达的地方。也许是远方，也许只是另一种过日子的方式；想到它，你就愿意为生活多留一个入口。',
    situational:
      '你眷恋熟悉的日常，也会为一点新鲜心动。离开多远、停留多久，都可以按你觉得自在的节奏来。',
    reserved:
      '你珍惜那些相处久了才有的安心。生活不必时时翻新，认真走过熟悉的日子，也能慢慢认出自己。',
  },
  empathy: {
    outward:
      '你走过一段路，也会记住一路上与谁相遇。被认真听见的片刻、愿意彼此靠近的心意，会在你心里留得很久。',
    situational:
      '你希望与重要的人彼此听懂，也希望相处时可以自在地做自己。亲近与独处，都在这幅小像里有自己的位置。',
    reserved:
      '你更愿意让回应落在能做的事情上。许多未曾说得动听的关心，也可以被一次行动、一份具体的照应接住。',
  },
  expression: {
    outward:
      '你想留下的，既有自己见过的世界，也有自己如何被它触动。那些说出口、写下来、亲手做出的东西，会替你记得曾经怎样认真地活过。',
    situational:
      '你有些心事愿意说出来，有些只想留给懂的人。表达可以很轻，只要贴近你的心意，就有自己的分量。',
    reserved:
      '你可以让感受安静地留在日常里。一个反复珍惜的小习惯、一件认真做完的事，也在慢慢写下你的样子。',
  },
  organization: {
    outward:
      '你向往的画面里，有远处的愿望，也有眼前可以一起做事的人。把小小的约定逐渐变成现实，会让你觉得这段投入有了着落。',
    situational:
      '你希望心里有个方向，也希望日子能容得下意外。把重要的事安顿好，再给临时的心动留一点位置，是你愿意尝试的节奏。',
    reserved:
      '你愿意为途中发生的事情留些空白。计划可以慢慢调整，心意也可以重新商量，让生活在真实相处中展开。',
  },
  autonomy: {
    outward:
      '你希望回望来路时，能认出哪些选择出自自己的心意。别人怎样理解固然会有影响，但你仍想把日子过成自己愿意认领的模样。',
    situational:
      '你在自己的心意与共同的约定之间寻找合适的位置。每一次认真商量，都能让你更清楚什么可以迁就，什么需要留下。',
    reserved:
      '你珍惜与人共同走过的日子，也愿意让彼此的期待进入自己的选择。一份能够相互照应的约定，会让你觉得安心。',
  },
  resilience: {
    outward:
      '你心里有些牵挂，时间过了仍不愿轻轻带过。休息之后还想继续、绕路之后还记得方向，这些时刻都留下了你认真投入的痕迹。',
    situational:
      '你会为值得的事情多留一点耐心，也在学着照看自己的余力。一段投入怎样继续，可以由今天的你重新决定。',
    reserved:
      '你愿意承认心意与处境都可能变化。把不再适合的东西放下之后，你也能为接下来的生活腾出一点轻松的余地。',
  },
};

export function getPairReflection(v: PersonalityVector): string {
  if (isEvenProfile(v))
    return '你可以在不同的处境里认出不同的自己：愿意靠近，也需要独处；想要出发，也珍惜归处。这些心意可以并肩存在，等你用接下来的日子慢慢写出它们的模样。';
  const d = rankDimensions(v)[0];
  return pairReflections[d][band(v[d])];
}
