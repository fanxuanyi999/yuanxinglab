import type { HistoricalCharacter } from '../types';
import { useEffect, useRef, useState } from 'react';
import { characterVisuals } from '../data/characterVisuals';
export function Portrait({
  character,
  className = '',
  eager = false,
  priority = false,
}: {
  character: HistoricalCharacter;
  className?: string;
  eager?: boolean;
  priority?: boolean;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(eager);
  useEffect(() => {
    if (eager || visible) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: '240px' });
    if (imageRef.current) observer.observe(imageRef.current);
    return () => observer.disconnect();
  }, [eager, visible]);
  return (
    <img
      ref={imageRef}
      className={`portrait ${className}`}
      src={eager || visible ? character.image : undefined}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      alt={`${character.name}的人物意象：${characterVisuals[character.id].motif}`}
      width="800"
      height="1120"
      decoding="async"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden';
      }}
    />
  );
}
