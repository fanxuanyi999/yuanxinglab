import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react';
import { Brand } from '../../components/Brand';
import { questionById } from '../../data/questions';
import type { TestSession } from '../../types';
export function Test({
  session,
  onAnswer,
  onMove,
  onFinish,
  onHome,
  warning,
}: {
  session: TestSession;
  onAnswer: (id: string, option: string) => void;
  onMove: (index: number) => void;
  onFinish: () => void;
  onHome: () => void;
  warning: string;
}) {
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    heading = useRef<HTMLHeadingElement>(null);
  const q = questionById[session.questionIds[session.currentIndex]],
    selected = session.answers[q.id];
  useEffect(() => {
    setPending(false);
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
    return () => clearTimeout(timer.current);
  }, [q.id]);
  const next = () => (session.currentIndex === 29 ? onFinish() : onMove(session.currentIndex + 1));
  function choose(option: string) {
    if (pending) return;
    setPending(true);
    onAnswer(q.id, option);
    timer.current = setTimeout(() => {
      setPending(false);
      next();
    }, 380);
  }
  return (
    <main className="test-page">
      <header className="test-header">
        <Brand onHome={onHome} />
        <span className="step-count">
          <b>{String(session.currentIndex + 1).padStart(2, '0')}</b>
          <span> / 30</span>
        </span>
      </header>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="答题进度"
        aria-valuenow={Object.keys(session.answers).length}
        aria-valuemin={0}
        aria-valuemax={30}
      >
        <span style={{ transform: `scaleX(${Object.keys(session.answers).length / 30})` }} />
      </div>
      <div key={q.id} className="question-content page-enter" data-question-id={q.id}>
        <p className="question-prompt">跟随第一反应，选最接近你的那一项</p>
        <h1 ref={heading} tabIndex={-1}>
          {q.text}
        </h1>
        <div className="answer-options" aria-label="选择你的回答">
          {session.optionOrders[q.id].map((id, i) => {
            const option = q.options.find((o) => o.id === id)!;
            return (
              <button
                key={id}
                data-option-id={id}
                className={`answer-option ${selected === id ? 'selected' : ''}`}
                aria-pressed={selected === id}
                disabled={pending}
                onClick={() => choose(id)}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span>{option.text}</span>
                {selected === id && <Check size={19} weight="bold" />}
              </button>
            );
          })}
        </div>
        <div className="question-navigation">
          <button
            className="text-button"
            disabled={session.currentIndex === 0 || pending}
            onClick={() => onMove(session.currentIndex - 1)}
          >
            <ArrowLeft size={17} />
            上一题
          </button>
          <button className="text-button" disabled={!selected || pending} onClick={next}>
            {session.currentIndex === 29 ? '生成我的报告' : '下一题'}
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="quiet-note" role="status">
          {warning || '已答内容会自动保存，可以随时回来继续。'}
        </p>
      </div>
    </main>
  );
}
