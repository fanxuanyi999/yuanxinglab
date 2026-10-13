import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Landing } from '../pages/Landing/Landing';
import { Access } from '../pages/Access/Access';
import { Test } from '../pages/Test/Test';
import { Generating } from '../pages/Generating/Generating';
import { createSession } from '../data/sampler';
import { readSession, saveSession } from '../store/session';
import { accessRequired, accessProvider } from '../access/AccessProvider';
import { track } from '../analytics/analytics';
import type { TestSession } from '../types';
const Result = lazy(() => import('../pages/Result/Result').then(module => ({ default: module.Result })));
export function App() {
  const [initial] = useState(readSession),
    [session, setSession] = useState<TestSession | null>(initial.session),
    [view, setView] = useState<'landing' | 'access' | 'session'>(
      initial.session ? 'session' : 'landing',
    ),
    [warning, setWarning] = useState(initial.warning),
    [unlocked, setUnlocked] = useState(!accessRequired),
    [checking, setChecking] = useState(accessRequired),
    [pendingStart, setPendingStart] = useState(false);
  useEffect(() => {
    // Old fulfillment URLs no longer grant access or prefill the manual form.
    const url = new URL(window.location.href);
    if (new URLSearchParams(url.hash.slice(1)).has('code')) url.hash = '';
    url.searchParams.delete('code');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    if (!accessRequired) return;
    let active = true;
    accessProvider.session().then((valid) => {
      if (!active) return;
      setUnlocked(valid);
    })
      .catch(() => { /* Remain locked; the manual form allows retry. */ })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (session && !saveSession(session))
      setWarning('此浏览器无法保存记录，请保持页面打开直到完成。');
  }, [session]);
  useEffect(() => {
    if (view === 'landing') track('landing_view', session?.id);
  }, [view]);
  const start = useCallback(() => {
    const next = createSession();
    setSession(next);
    setView('session');
    track('test_start', next.id);
    window.scrollTo(0, 0);
  }, []);
  const requestStart = () => {
    if (unlocked) start();
    else { setPendingStart(true); setView('access'); }
  };
  const restart = () => {
    track('restart_test', session?.id);
    start();
  };
  const showResult = useCallback(() => setSession((s) => (s ? { ...s, stage: 'result' } : s)), []);
  const finish = useCallback(
    () =>
      setSession((s) => {
        if (!s || s.questionIds.some((id) => !s.answers[id])) return s;
        track('test_complete', s.id);
        return { ...s, stage: 'generating' };
      }),
    [],
  );
  const home = () => {
    setPendingStart(false);
    setView('landing');
    window.scrollTo(0, 0);
  };
  if (checking && view !== 'landing') return <main className="narrow-page" role="status">正在打开你的探索…</main>;
  if (view === 'access' || (view === 'session' && !unlocked))
    return (
      <Access
        onHome={home}
        onVerified={() => {
          setUnlocked(true);
          if (pendingStart || !session) start();
          else setView('session');
          setPendingStart(false);
        }}
      />
    );
  if (view === 'landing' || !session)
    return (
      <Landing
        onStart={requestStart}
        onResume={() => setView('session')}
        session={session}
        warning={warning}
      />
    );
  if (session.stage === 'generating') return <Generating onComplete={showResult} />;
  if (session.stage === 'result')
    return <Suspense fallback={<main className="narrow-page" role="status">正在打开你的原型报告…</main>}>
      <Result session={session} onRestart={restart} onHome={home} />
    </Suspense>;
  return (
    <Test
      session={session}
      warning={warning}
      onHome={home}
      onAnswer={(id, option) => {
        setSession((s) => (s ? { ...s, answers: { ...s.answers, [id]: option } } : s));
        track('question_answer', session.id, { questionId: id, index: session.currentIndex });
      }}
      onMove={(index) =>
        setSession((s) => (s ? { ...s, currentIndex: Math.min(29, Math.max(0, index)) } : s))
      }
      onFinish={finish}
    />
  );
}
