import { Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './theme/tokens.css';
import './theme/styles.css';
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App rendering failed', error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <main className="narrow-page error-page">
        <h1>这页暂时没能打开</h1>
        <p>可以刷新重试。若旧记录不兼容，可清除本次答题记录后重新开始。</p>
        <button className="button primary" onClick={() => location.reload()}>
          刷新页面
        </button>
        <button
          className="text-button"
          onClick={() => {
            try {
              localStorage.removeItem('archetype-lab:session:v1');
            } catch {}
            location.reload();
          }}
        >
          清除本次记录并重新开始
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
