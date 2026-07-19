import { useState } from 'react';

function Star({ fill, size, onClick, onMouseEnter, interactive }) {
  // fill: 0 (empty) to 1 (full) — supports fractional fill for averages
  // like 4.8 by clipping a solid star with a width percentage.
  const id = `star-clip-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <span
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        display: 'inline-flex',
        cursor: interactive ? 'pointer' : 'default',
        lineHeight: 0,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width={24 * fill} height="24" />
          </clipPath>
        </defs>
        <path
          d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.54L12 17.6l-5.88 3.1 1.12-6.54L2.48 9.52l6.58-.96L12 2.6Z"
          fill="none"
          stroke="rgba(212,175,55,0.55)"
          strokeWidth="1.3"
        />
        <path
          d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.54L12 17.6l-5.88 3.1 1.12-6.54L2.48 9.52l6.58-.96L12 2.6Z"
          fill="var(--gold-soft, #D4AF37)"
          clipPath={`url(#${id})`}
        />
      </svg>
    </span>
  );
}

// Read-only mode: pass `average`. Shows fractional-fill stars, e.g. 4.8.
// Interactive mode: pass `value` + `onRate`. Shows hover preview and calls
// onRate(1-5) on click.
export default function StarRating({ average = 0, value = 0, onRate, size = 15, interactive = false }) {
  const [hover, setHover] = useState(0);
  const display = interactive ? hover || value : average;

  return (
    <div className="inline-flex items-center gap-[1px]" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, display - (i - 1)));
        return (
          <Star
            key={i}
            size={size}
            fill={fill}
            interactive={interactive}
            onMouseEnter={interactive ? () => setHover(i) : undefined}
            onClick={interactive ? () => onRate?.(i) : undefined}
          />
        );
      })}
    </div>
  );
}
