import { forwardRef } from 'react';

function CardOrnament({ theme }) {
  const rgb = theme.accentRgb;

  if (theme.ornament === 'corners') {
    // Royale — a small gilt diamond mark at each corner, like a wax-sealed envelope flap.
    const corners = [
      { top: -6, left: -6 },
      { top: -6, right: -6 },
      { bottom: -6, left: -6 },
      { bottom: -6, right: -6 },
    ];
    return (
      <>
        {corners.map((pos, i) => (
          <span
            key={i}
            className="pointer-events-none absolute h-3 w-3 rotate-45"
            style={{ ...pos, background: theme.accent, opacity: 0.55, boxShadow: `0 0 8px rgba(${rgb},0.4)` }}
          />
        ))}
      </>
    );
  }

  if (theme.ornament === 'leaf') {
    // Silk — a soft botanical flourish resting on the top edge.
    return (
      <span
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[1.1rem]"
        style={{ color: theme.accent, opacity: 0.75 }}
      >
        ❀
      </span>
    );
  }

  if (theme.ornament === 'brackets') {
    // Velvet — sharp theatre-stage corner brackets instead of a full frame.
    const bracket = (style) => (
      <span
        className="pointer-events-none absolute h-4 w-4 border-current"
        style={{ color: theme.accent, opacity: 0.6, ...style }}
      />
    );
    return (
      <>
        {bracket({ top: -1, left: -1, borderTop: '1.5px solid', borderLeft: '1.5px solid' })}
        {bracket({ bottom: -1, right: -1, borderBottom: '1.5px solid', borderRight: '1.5px solid' })}
      </>
    );
  }

  if (theme.ornament === 'seal') {
    // Wax — a small waxy dot sitting on the top edge like a broken letter seal.
    return (
      <span
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full"
        style={{ background: `radial-gradient(circle at 35% 30%, ${theme.accentSoft}, ${theme.accent} 75%)`, boxShadow: '0 2px 6px rgba(0,0,0,0.35)' }}
      />
    );
  }

  // Midnight — the original subtle inset border plus a tiny star at the top.
  return (
    <>
      <div className="pointer-events-none absolute inset-[7px] rounded-[13px] border" style={{ borderColor: `rgba(${rgb},0.14)` }} />
      <span
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[0.9rem]"
        style={{ color: theme.accent, opacity: 0.8 }}
      >
        ✧
      </span>
    </>
  );
}

export function GuestCard({ theme, children, className = '', style }) {
  const isDashed = theme.ornament === 'seal';
  return (
    <div
      className={`relative p-6 sm:p-8 ${className}`}
      style={{
        background: theme.surface,
        border: `${theme.cardBorderWidth || '1px'} ${isDashed ? 'dashed' : 'solid'} ${theme.surfaceBorder}`,
        borderRadius: theme.radius || '16px',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        boxShadow: theme.ornament === 'brackets' ? '0 40px 90px -30px rgba(0,0,0,0.65)' : '0 30px 80px -30px rgba(0,0,0,0.45)',
        ...style,
      }}
    >
      <CardOrnament theme={theme} />
      {children}
    </div>
  );
}

export function SectionHeading({ theme, kicker, title }) {
  return (
    <div className="mb-8 text-center">
      {kicker && (
        <div
          className="mb-3 text-[0.68rem] uppercase"
          style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.4em' }}
        >
          {kicker}
        </div>
      )}
      <div className="relative inline-block px-6">
        <h2
          className="text-[1.6rem] sm:text-[1.9rem]"
          style={{ color: theme.ink, fontFamily: theme.displayFont, letterSpacing: '0.03em' }}
        >
          {title}
        </h2>
      </div>
      <div className="mt-2.5 flex items-center justify-center gap-3">
        <span className="h-px w-8" style={{ background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb},0.6))` }} />
        <span className="text-[0.75rem]" style={{ color: theme.accent, opacity: 0.85 }}>
          {theme.divider || '◆'}
        </span>
        <span className="h-px w-8" style={{ background: `linear-gradient(90deg, rgba(${theme.accentRgb},0.6), transparent)` }} />
      </div>
    </div>
  );
}

export const GuestInput = forwardRef(function GuestInput({ theme, as = 'input', className = '', style, ...props }, ref) {
  const Comp = as;
  const inputRadius = theme.ornament === 'brackets' || theme.ornament === 'seal' ? '4px' : '12px';
  return (
    <Comp
      ref={ref}
      className={`w-full border px-4 py-3 text-[0.9rem] outline-none transition-colors duration-300 ${className}`}
      style={{
        borderRadius: inputRadius,
        background: 'rgba(0,0,0,0.04)',
        borderColor: `rgba(${theme.accentRgb},0.28)`,
        color: theme.ink,
        fontFamily: theme.uiFont,
        ...style,
      }}
      {...props}
    />
  );
});

export function GuestButton({ theme, children, className = '', style, ...props }) {
  const buttonRadius = theme.ornament === 'brackets' || theme.ornament === 'seal' ? '4px' : '9999px';
  return (
    <button
      type="button"
      className={`px-7 py-3 text-[0.82rem] font-medium transition-transform duration-300 active:scale-95 disabled:opacity-50 ${className}`}
      style={{
        borderRadius: buttonRadius,
        background: `linear-gradient(120deg, ${theme.accent}, ${theme.accentSoft} 50%, ${theme.accent})`,
        color: theme.id === 'velvet' || theme.id === 'midnight' ? '#1a1206' : '#fff',
        fontFamily: theme.uiFont,
        letterSpacing: '0.03em',
        boxShadow: `0 10px 26px -6px rgba(${theme.accentRgb},0.45)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
