import { useEffect, useState } from 'react';
export function Generating({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setStep(1), 750),
      b = setTimeout(() => setStep(2), 1600),
      c = setTimeout(onComplete, 2600);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [onComplete]);
  return (
    <main className="generating-page" aria-live="polite">
      <div className="coordinate-orbit" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>逢</span>
      </div>
      <p className="eyebrow">每一种选择，都在描绘你</p>
      <h1>{['翻开属于你的篇章', '循着你留下的线索', '与你相逢的名字，即将揭晓'][step]}</h1>
      <p>让散落的线索，慢慢汇成一个名字。</p>
      <div className="generation-steps" aria-label={`生成进度 ${step + 1}/3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={step >= i ? 'done' : ''} />
        ))}
      </div>
    </main>
  );
}
