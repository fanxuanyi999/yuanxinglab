import { dimensions } from '../data/dimensions';
import type { PersonalityVector } from '../types';
export function Radar({ vector }: { vector: PersonalityVector }) {
  const point = (i: number, r: number) => [
    180 + Math.sin((i * Math.PI) / 4) * r,
    180 - Math.cos((i * Math.PI) / 4) * r,
  ];
  return (
    <div className="radar-wrap">
      <svg
        className="radar"
        viewBox="0 0 360 360"
        role="img"
        aria-label="你的八维人格轮廓，详细数值可点击本节标题旁的说明按钮查看"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1" opacity=".16">
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <polygon
              key={r}
              points={dimensions.map((_, i) => point(i, 112 * r).join(',')).join(' ')}
            />
          ))}
          {dimensions.map((d, i) => (
            <line key={d.key} x1="180" y1="180" x2={point(i, 112)[0]} y2={point(i, 112)[1]} />
          ))}
        </g>
        <polygon
          points={dimensions
            .map((d, i) => point(i, (112 * vector[d.key]) / 100).join(','))
            .join(' ')}
          fill="var(--accent)"
          fillOpacity=".15"
          stroke="var(--accent)"
          strokeWidth="2"
        />
        {dimensions.map((d, i) => {
          const [x, y] = point(i, 145),
            p = point(i, (112 * vector[d.key]) / 100);
          return (
            <g key={d.key}>
              <circle cx={p[0]} cy={p[1]} r="3" fill="var(--accent)" />
              <text x={x} y={y + 4} textAnchor="middle" className="radar-label">
                {d.short}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DimensionValues({ vector }: { vector: PersonalityVector }) {
  return (
    <dl className="dimension-list">
      {dimensions.map((d) => (
        <div key={d.key}>
          <dt>{d.name}</dt>
          <dd>
            {Math.round(vector[d.key])}
            <small>/100</small>
          </dd>
        </div>
      ))}
    </dl>
  );
}
