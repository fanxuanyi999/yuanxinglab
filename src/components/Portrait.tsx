import type { HistoricalCharacter } from '../types';
import { characterVisuals } from '../data/characterVisuals';
export function Portrait({
  character,
  className = '',
}: {
  character: HistoricalCharacter;
  className?: string;
}) {
  return (
    <img
      className={`portrait ${className}`}
      src={character.image}
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
