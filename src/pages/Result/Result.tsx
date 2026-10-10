import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  ArrowUpRight,
  ArrowCounterClockwise,
  ArrowRight,
  DownloadSimple,
  List,
  Check,
} from '@phosphor-icons/react';
import type { TestSession } from '../../types';
import { sessionQuestions } from '../../data/sampler';
import { scoreTest } from '../../scoring/matcher';
import { reportGenerator, DISCLAIMER, CLOSENESS_NOTE } from '../../report/reportGenerator';
import { Brand } from '../../components/Brand';
import { Portrait } from '../../components/Portrait';
import { characterVisuals } from '../../data/characterVisuals';
import { Radar, DimensionValues } from '../../components/Radar';
import { ReportInfo } from '../../components/ReportInfo';
import { ShareDialog } from '../../share/ShareDialog';
import { track } from '../../analytics/analytics';
function Chapter({
  id,
  n,
  title,
  children,
  info,
  className = '',
}: {
  id: string;
  n: string;
  title: string;
  children: ReactNode;
  info?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`report-chapter ${className}`}>
      <div className="chapter-heading">
        <span>{n}</span>
        <h2>{title}</h2>
        {info}
      </div>
      {children}
    </section>
  );
}
export function Result({
  session,
  onRestart,
  onHome,
}: {
  session: TestSession;
  onRestart: () => void;
  onHome: () => void;
}) {
  const [sharing, setSharing] = useState(false),
    bottom = useRef<HTMLDivElement>(null);
  const { match, report } = useMemo(() => {
    const questions = sessionQuestions(session),
      match = scoreTest(questions, session.answers);
    return {
      match,
      report: reportGenerator.generate({ match, questions, answers: session.answers }),
    };
  }, [session]);
  const p = match.primary.character,
    s = match.secondary.character;
  const visual = characterVisuals[p.id];
  const secondaryVisual = characterVisuals[s.id];
  const variables = {
    '--accent': p.theme.accent,
    '--character-paper': p.theme.paper,
    '--character-ink': p.theme.ink,
    '--character-mist': p.theme.mist,
    '--poster-top': visual.top,
    '--poster-bottom': visual.bottom,
    '--poster-light': visual.light,
    '--poster-glow': visual.glow,
  } as CSSProperties;
  useEffect(() => {
    track('result_view', session.id, { primary: p.id, secondary: s.id });
    window.scrollTo(0, 0);
  }, [session.id, p.id, s.id]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track('report_bottom_view', session.id);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (bottom.current) observer.observe(bottom.current);
    return () => observer.disconnect();
  }, [session.id]);
  return (
    <main className="result-page page-enter" style={variables}>
      <header className="result-header">
        <Brand onHome={onHome} />
        <details className="report-toc">
          <summary>
            <List size={19} />
            目录
          </summary>
          <nav>
            {[
              ['why', '为什么是 TA'],
              ['map', '你的性格轮廓'],
              ['shadow', '影子人格'],
              ['secondary', '隐藏历史原型'],
              ['mirror', '历史镜像'],
              ['advice', '给你的建议'],
            ].map(([id, title]) => (
              <a
                href={`#${id}`}
                key={id}
                onClick={(e) => e.currentTarget.closest('details')?.removeAttribute('open')}
              >
                {title}
              </a>
            ))}
          </nav>
        </details>
      </header>
      <section className="result-hero" data-primary={p.id}>
        <div className="result-art">
          <div className="result-report-label">
            <p className="eyebrow">与你相遇的主历史原型</p>
            <ReportInfo title="关于你的这份报告">
              <p>{DISCLAIMER}</p>
              <p>
                {CLOSENESS_NOTE}{' '}
                人物是为本产品设计的文化原型，并不是对历史人物的真实心理测量，也不表示前世或血缘联系。
              </p>
              {match.ranking[1].distance - match.primary.distance < 0.012 && (
                <p>你的选择与多个原型都有相通之处。换一些情境或选择，相遇的人物也可能变化。</p>
              )}
              <p>
                报告中的意象句为原创现代文字，并非历史人物原话。插画为原创抽象人物意象，非历史肖像复原。
              </p>
              <p>答案与记录仅保存在当前浏览器。</p>
            </ReportInfo>
          </div>
          <div className="poster-halo" aria-hidden="true" />
          <Portrait character={p} />
          <p className="encounter-line">{visual.encounter}</p>
          <div className="result-name">
            <span>{p.era}</span>
            <h1 data-length={p.name.length}>{p.name}</h1>
            <p>{p.identity}</p>
          </div>
          {p.name.length < 4 && (
            <span className="poster-seal" aria-hidden="true">
              与你
              <br />
              相逢
            </span>
          )}
        </div>
        <div className="result-intro">
          <p className="intro-kicker">穿过千年，照见你的底色</p>
          <h2>{p.archetypeTitle}</h2>
          <p className="result-subtitle">{p.subtitle}</p>
          <div className="tags">
            {p.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <p className="hero-quote">{p.shareQuote}</p>
          <div className="match-badge">
            <strong>
              {match.primary.closeness}
              <small>%</small>
            </strong>
            <span>原型接近度</span>
          </div>
        </div>
      </section>
      <div className="report-body">
        <div className="report-opening">
          <span>你的个人侧写</span>
          <p>
            把这个名字当作一扇窗，
            <br />
            看看哪些部分与你相遇。
          </p>
        </div>
        <Chapter id="why" n="01" title="为什么是 TA">
          {report.why.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <details className="answer-evidence">
            <summary>
              回看你当时的选择 <ArrowUpRight size={15} />
            </summary>
            {report.answerEvidence.map((e) => (
              <div key={e.question}>
                <p>{e.question}</p>
                <strong>
                  <Check size={15} />
                  {e.answer}
                </strong>
              </div>
            ))}
          </details>
        </Chapter>
        <Chapter
          id="map"
          n="02"
          title="你的性格轮廓"
          info={
            <ReportInfo title="如何阅读你的性格轮廓">
              <p>
                这张图呈现你在八种行为偏好上的答题倾向。数值按这次题目的可得范围计算，不代表能力、优劣或人群排名。
              </p>
              <DimensionValues vector={match.vector} />
            </ReportInfo>
          }
        >
          <p>{report.mapSummary}</p>
          <Radar vector={match.vector} />
        </Chapter>
        <Chapter id="undertones" n="03" title="你的三重底色">
          <div className="undertones">
            {report.undertones.map((tone, i) => (
              <article key={i}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{tone.title}</h3>
                  <p>{tone.text}</p>
                </div>
              </article>
            ))}
          </div>
        </Chapter>
        <Chapter id="drive" n="04" title="你真正不断追求的">
          <p className="large-body">{p.coreDrive}</p>
        </Chapter>
        <Chapter id="strengths" n="05" title="你的优势，怎样发生">
          <div className="strength-list">
            {p.strengths.map((t, i) => (
              <p key={t}>
                <span>{i + 1}</span>你{t}
              </p>
            ))}
          </div>
        </Chapter>
        <Chapter
          id="shadow"
          n="06"
          title="也看看，光背后的你"
          className="shadow-chapter"
          info={
            <ReportInfo title="关于光背后的你">
              <p>
                这里写的是可以留意的行为惯性，不是缺陷判定或心理诊断。你可以结合具体处境，留下有共鸣的部分。
              </p>
            </ReportInfo>
          }
        >
          <p>{p.shadow}</p>
        </Chapter>
        <Chapter id="relationships" n="07" title="关系中的你">
          <p>{p.relationshipStyle}</p>
        </Chapter>
        <Chapter
          id="work"
          n="08"
          title="工作与创造中的你"
          info={
            <ReportInfo title="关于做事方式的解读">
              <p>这里讨论的是做事方式与合作习惯，不是职业推荐或能力评估。</p>
            </ReportInfo>
          }
        >
          <p>{p.workStyle}</p>
        </Chapter>
        <Chapter
          id="secondary"
          n="09"
          title="你的隐藏历史原型"
          info={
            <ReportInfo title="关于你的隐藏历史原型">
              <p>这位人物提供与你的选择相通的另一种文化联想，不意味着你拥有另一种独立人格。</p>
              <p>{CLOSENESS_NOTE}</p>
            </ReportInfo>
          }
        >
          <article
            className="secondary-card"
            style={
              {
                '--secondary-top': secondaryVisual.top,
                '--secondary-bottom': secondaryVisual.bottom,
                '--secondary-light': secondaryVisual.light,
                '--secondary-glow': secondaryVisual.glow,
              } as CSSProperties
            }
          >
            <Portrait character={s} />
            <div>
              <span>另一面的你</span>
              <h3>{s.name}</h3>
              <p>{s.archetypeTitle}</p>
              <b>
                {match.secondary.closeness}% <small>原型接近度</small>
              </b>
            </div>
          </article>
          <p>{report.secondaryExplanation}</p>
        </Chapter>
        <Chapter id="combination" n="10" title="两个人物组成的你">
          <h3 className="pair-title">
            {p.name}
            <span>×</span>
            {s.name}
          </h3>
          {report.combination.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Chapter>
        <Chapter
          id="mirror"
          n="11"
          title="历史里，与你相照的一页"
          info={
            <ReportInfo title="这段历史的出处与解读">
              <p>出处线索：{p.historicalSource}</p>
              {p.factStatus === 'TODO: FACT_CHECK' && <p>这段史料解读仍待逐条校读。</p>}
              <p>{p.historicalMirror}</p>
              <p>{p.modernInterpretation}</p>
              <p>正文将史料线索与对你的现代联想放在一起，性格联想属于本报告的文学表达。</p>
            </ReportInfo>
          }
        >
          <p>{report.historicalReflection}</p>
        </Chapter>
        <Chapter
          id="modern"
          n="12"
          title="穿过历史，回到你的日常"
          info={
            <ReportInfo title="关于这段日常侧写">
              <p>这是借人物原型描绘的当代生活想象，不是对你真实经历的断言，也不是历史事实。</p>
            </ReportInfo>
          }
        >
          <p className="large-body">{report.modernPortrait}</p>
        </Chapter>
        <Chapter id="advice" n="13" title="给此刻的你，三个小建议">
          <ol className="advice-list">
            {report.advice.map((text, i) => (
              <li key={text}>
                <span>{i + 1}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </Chapter>
        <div ref={bottom} className="report-ending">
          <p>
            你比一个名字，
            <br />
            拥有更多可能。
          </p>
          <span>留下有共鸣的部分，把选择权留给自己。</span>
          <button className="text-button" onClick={onRestart}>
            <ArrowCounterClockwise size={18} />
            重新测试
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <div className="result-action-bar">
        <span>
          <b>{p.name}</b> × {s.name}
        </span>
        <button className="button primary" onClick={() => setSharing(true)}>
          <DownloadSimple size={19} />
          制作我的分享卡
        </button>
      </div>
      {sharing && (
        <ShareDialog match={match} sessionId={session.id} onClose={() => setSharing(false)} />
      )}
    </main>
  );
}
