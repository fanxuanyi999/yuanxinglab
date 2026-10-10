import { useEffect, useRef, useState } from 'react';
import { X, DownloadSimple, Export } from '@phosphor-icons/react';
import type { MatchResult } from '../types';
import { getShareCardData } from './shareCard';
import { renderShareCard } from './canvasRenderer';
import { track } from '../analytics/analytics';
export function ShareDialog({
  match,
  sessionId,
  onClose,
}: {
  match: MatchResult;
  sessionId: string;
  onClose: () => void;
}) {
  const [image, setImage] = useState(''),
    [error, setError] = useState(''),
    [status, setStatus] = useState(''),
    [attempt, setAttempt] = useState(0);
  const blob = useRef<Blob | null>(null),
    dialog = useRef<HTMLDialogElement>(null),
    downloadRef = useRef<HTMLAnchorElement>(null);
  const mobile =
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.maxTouchPoints > 1;
  useEffect(() => {
    const active = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      active?.focus();
    };
  }, []);
  useEffect(() => {
    let cancelled = false,
      url = '';
    setError('');
    setImage('');
    renderShareCard(getShareCardData(match))
      .then((result) => {
        if (cancelled) return;
        blob.current = result;
        url = URL.createObjectURL(result);
        setImage(url);
        track('share_card_generate', sessionId, { character: match.primary.character.id });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '生成失败，请重试。');
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [match, sessionId, attempt]);
  async function share() {
    if (!blob.current) return;
    const file = new File([blob.current], `历史原型-${match.primary.character.name}.png`, {
      type: 'image/png',
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: '我的历史人格原型' });
        setStatus('已交给系统分享面板。');
        track('share_card_share', sessionId, { character: match.primary.character.id });
        track('share_card_save', sessionId, { method: 'system-share-completed' });
      } catch (e) {
        if ((e as Error).name === 'AbortError') setStatus('已取消分享，你仍可长按下方图片保存。');
        else setStatus('当前浏览器未能打开系统分享，请长按图片保存。');
      }
    } else setStatus('当前浏览器不支持文件分享，请长按图片保存。');
  }
  return (
    <dialog
      ref={dialog}
      className="share-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="share-title"
    >
      <div className="share-dialog-inner">
        <header>
          <div>
            <p className="eyebrow">收藏这次相遇</p>
            <h2 id="share-title">你的文化人物卡</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭分享卡">
            <X size={24} />
          </button>
        </header>
        {image ? (
          <img
            className="share-preview"
            src={image}
            alt={`${match.primary.character.name}历史原型分享卡，可长按保存`}
            width="1080"
            height="1440"
          />
        ) : (
          <div className="share-loading" role="status">
            {error || '正在排版你的分享卡…'}
          </div>
        )}
        {error ? (
          <button className="button primary" onClick={() => setAttempt((a) => a + 1)}>
            重新生成
          </button>
        ) : (
          <div className="share-actions">
            {mobile && (
              <button className="button primary" disabled={!image} onClick={share}>
                <Export size={19} />
                分享或保存图片
              </button>
            )}
            <a
              ref={downloadRef}
              className={`button ${mobile ? 'secondary' : 'primary'} ${!image ? 'disabled' : ''}`}
              href={image || undefined}
              download={`历史原型-${match.primary.character.name}.png`}
              onClick={(e) => {
                if (!image) {
                  e.preventDefault();
                  return;
                }
                setStatus('已请求下载；若没有开始，请长按或右键保存图片。');
                track('share_card_download', sessionId);
                track('share_card_save', sessionId, { method: 'download-requested' });
              }}
            >
              <DownloadSimple size={20} />
              下载高清 PNG
            </a>
          </div>
        )}
        <p className="quiet-note" role="status">
          {status ||
            (mobile
              ? '也可以长按图片保存。在应用内受限时，可用系统浏览器打开。'
              : '1080 × 1440 像素，独立排版，可用于个人分享。')}
        </p>
      </div>
    </dialog>
  );
}
