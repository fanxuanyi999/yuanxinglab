import { useState, type CSSProperties } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  Bookmarks,
  Intersect,
  Feather,
} from '@phosphor-icons/react';
import { characters, characterById } from '../../data/characters';
import { characterVisuals } from '../../data/characterVisuals';
import { Portrait } from '../../components/Portrait';
import { Brand } from '../../components/Brand';
import type { TestSession } from '../../types';

const featuredIds = ['li-bai', 'xin-qiji', 'li-qingzhao', 'zhuge-liang', 'wu-zetian', 'su-shi'];
const galleryCharacters = [
  ...featuredIds.map((id) => characterById[id]),
  ...characters.filter((c) => !featuredIds.includes(c.id)),
];

export function Landing({
  onStart,
  onResume,
  session,
  warning,
}: {
  onStart: () => void;
  onResume: () => void;
  session: TestSession | null;
  warning: string;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <main className="landing page-enter">
      <header className="site-header">
        <Brand />
        <a className="text-link" href="#about">
          关于这次探索 <ArrowUpRight size={15} />
        </a>
      </header>
      <section className="landing-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-seal" aria-hidden="true">
              相逢
            </span>{' '}
            一次关于自己的文化漫游
          </p>
          <h1>
            找到你的
            <br />
            <span>历史人格原型</span>
          </h1>
          <p className="hero-intro">
            如果与你相似的灵魂，
            <br />
            曾在千年前，活过另一种人生。
          </p>
          <div className="test-facts">
            <span>
              <b>30</b> 道情境选择
            </span>
            <span>
              <b>24</b> 位历史原型
            </span>
            <span>
              约 <b>5</b> 分钟
            </span>
          </div>
          <button className="button primary start-button" onClick={session ? onResume : onStart}>
            {session
              ? session.stage === 'result'
                ? '回到我的原型报告'
                : `继续上次的探索 ${Object.keys(session.answers).length}/30`
              : '开始寻找我的历史原型'}
            <ArrowRight size={21} />
          </button>
          {session && (
            <button className="text-button new-test" onClick={onStart}>
              开启一次新的探索
            </button>
          )}
          {warning && (
            <p className="notice" role="status">
              {warning}
            </p>
          )}
        </div>
        <div className="hero-stage" aria-label="李白、李清照、辛弃疾的人物意象">
          <div className="stage-sun" aria-hidden="true" />
          <span className="stage-inscription" aria-hidden="true">
            千年之外
            <br />
            你我之间
          </span>
          <div className="stage-figure stage-left">
            <Portrait character={characterById['li-qingzhao']} />
          </div>
          <div className="stage-figure stage-right">
            <Portrait character={characterById['xin-qiji']} />
          </div>
          <div className="stage-figure stage-center">
            <Portrait character={characterById['li-bai']} />
          </div>
        </div>
      </section>
      <section id="about" className="about-section">
        <div className="section-heading">
          <div>
            <h2>你会遇见怎样的自己？</h2>
          </div>
          <p>
            你相似的不是 TA 的经历，
            <br />
            而是 TA 处理世界的方式。
          </p>
        </div>
        <div className="about-features">
          <article>
            <Intersect size={28} weight="light" />
            <span className="feature-number">01</span>
            <h3>一位主原型，一面隐藏的你</h3>
            <p>从处理事情的习惯出发，看看两个人物如何映照你的不同侧面。</p>
          </article>
          <article>
            <Bookmarks size={28} weight="light" />
            <span className="feature-number">02</span>
            <h3>一份可以慢慢读的自我侧写</h3>
            <p>优势、关系、影子与成长线索。也看看那些不容易说清的部分。</p>
          </article>
          <article>
            <Feather size={28} weight="light" />
            <span className="feature-number">03</span>
            <h3>一张属于你的文化人物卡</h3>
            <p>把这次相遇，存成一张可以珍藏、也可以分享的海报。</p>
          </article>
        </div>
      </section>
      <section id="characters" className="names-section">
        <div className="section-heading">
          <div>
            <h2>千年之外，谁与你相似？</h2>
          </div>
          <p>
            无需历史知识。不按性别匹配。
            <br />
            让你自己的选择，带你找到答案。
          </p>
        </div>
        <div id="character-gallery" className="character-gallery">
          {(expanded ? galleryCharacters : galleryCharacters.slice(0, 6)).map((c) => {
            const v = characterVisuals[c.id];
            return (
              <article
                className="character-tile"
                key={c.id}
                style={
                  {
                    '--tile-top': v.top,
                    '--tile-bottom': v.bottom,
                    '--tile-light': v.light,
                    '--tile-glow': v.glow,
                  } as CSSProperties
                }
              >
                <div className="tile-art">
                  <Portrait character={c} />
                  <h3 data-length={c.name.length}>{c.name}</h3>
                  <span>{c.era}</span>
                </div>
                <p>{c.archetypeTitle}</p>
              </article>
            );
          })}
        </div>
        <button
          className="gallery-toggle text-button"
          aria-controls="character-gallery"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起人物长卷' : '展开全部 24 位历史人物'}
          <ArrowDown size={17} style={{ transform: expanded ? 'rotate(180deg)' : undefined }} />
        </button>
      </section>
      <footer className="landing-footer">
        <span>人生原型实验室</span>
        <p>用于自我探索与娱乐体验。答题记录保存在当前浏览器。</p>
      </footer>
    </main>
  );
}
