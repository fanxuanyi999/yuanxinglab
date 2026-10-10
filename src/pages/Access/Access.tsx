import { useState } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { accessProvider } from '../../access/AccessProvider';
import { Brand } from '../../components/Brand';
export function Access({ onVerified, onHome }: { onVerified: () => void; onHome: () => void }) {
  const [code, setCode] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  return (
    <main className="narrow-page">
      <Brand onHome={onHome} />
      <form
        className="access-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            if (await accessProvider.verify(code)) onVerified();
            else setError('访问码不正确，请核对后再试。');
          } catch {
            setError('暂时无法验证，请稍后重试。');
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="eyebrow">打开你的探索</p>
        <h1>输入访问码</h1>
        <p>使用你收到的访问码，开始这次相遇。</p>
        <label htmlFor="access-code">访问码</label>
        <input
          id="access-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={24}
          aria-describedby="access-error"
          autoFocus
        />
        {error && (
          <p id="access-error" role="alert" className="error">
            {error}
          </p>
        )}
        <button className="button primary" disabled={busy || !code.trim()}>
          {busy ? '正在验证…' : '开始探索'}
          <ArrowRight size={20} />
        </button>
      </form>
    </main>
  );
}
