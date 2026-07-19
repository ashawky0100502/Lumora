import { motion } from 'framer-motion';

/**
 * FloralFrame — wraps the invitation message in a hand-drawn-style
 * ornamental frame. The corner artwork changes per template so the frame
 * always matches that template's own visual language (theme.ornament),
 * instead of looking like one generic sticker pasted onto every design:
 *   - amour (roses)     -> a curling rose sprig in each corner
 *   - silk (leaf)        -> a soft botanical leaf spray
 *   - midnight (sparkle) -> art-deco sparkle rays
 *   - velvet (brackets)  -> a fine single-line rose etched into a sharp bracket
 *   - wax (seal)         -> a wax-seal medallion stamped with a sprig
 *   - royale (corners)   -> a classic gilt scroll flourish
 */

function RoseCorner({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 4 C 20 10, 30 22, 28 38 C 26 52, 14 58, 6 54" />
      <path d="M4 4 C 14 20, 26 26, 42 26 C 56 26, 62 16, 58 6" />
      <path d="M28 38 C 34 42, 36 48, 32 54 C 29 58, 24 58, 22 54" strokeWidth="1.1" />
      <path d="M16 16 C 22 14, 26 18, 24 24 C 20 24, 15 22, 16 16 Z" fill={color} fillOpacity="0.55" strokeWidth="1" />
      <path d="M24 34 C 31 33, 34 38, 30 43 C 26 42, 22 39, 24 34 Z" fill={color} fillOpacity="0.55" strokeWidth="1" />
      <path d="M34 12 C 38 7, 44 8, 44 14 C 40 16, 35 16, 34 12 Z" fill={color} fillOpacity="0.55" strokeWidth="1" />
      <g transform="translate(8,8)">
        <circle r="6.4" fill="none" stroke={color} strokeWidth="1.5" />
        <path d="M0 -6.4 C 3.2 -4.8, 3.2 -1.6, 0 0 C -3.2 -1.6, -3.2 -4.8, 0 -6.4 Z" fill={color} fillOpacity="0.85" />
        <path d="M6.4 0 C 4.8 3.2, 1.6 3.2, 0 0 C 1.6 -3.2, 4.8 -3.2, 6.4 0 Z" fill={color} fillOpacity="0.7" />
        <path d="M0 6.4 C -3.2 4.8, -3.2 1.6, 0 0 C 3.2 1.6, 3.2 4.8, 0 6.4 Z" fill={color} fillOpacity="0.55" />
        <path d="M-6.4 0 C -4.8 -3.2, -1.6 -3.2, 0 0 C -1.6 3.2, -4.8 3.2, -6.4 0 Z" fill={color} fillOpacity="0.7" />
      </g>
    </g>
  );
}

function LeafCorner({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <path d="M4 4 C 22 8, 34 20, 32 38" />
      <path d="M12 10 C 18 8, 22 12, 19 18 C 14 18, 10 15, 12 10 Z" fill={color} fillOpacity="0.5" strokeWidth="0.9" />
      <path d="M20 20 C 27 19, 31 24, 27 30 C 22 29, 18 25, 20 20 Z" fill={color} fillOpacity="0.5" strokeWidth="0.9" />
      <path d="M4 4 C 8 16, 6 26, -2 32" opacity="0" />
    </g>
  );
}

function SparkleCorner({ color }) {
  return (
    <g stroke={color} strokeWidth="1.3" strokeLinecap="round">
      <path d="M14 2 L14 26 M2 14 L26 14" strokeWidth="0.9" opacity="0.55" />
      <path d="M14 6 L14 22 M6 14 L22 14" />
      <circle cx="14" cy="14" r="2.1" fill={color} stroke="none" />
    </g>
  );
}

function BracketCorner({ color }) {
  return (
    <g fill="none" stroke={color} strokeLinecap="round">
      <path d="M2 30 L2 2 L30 2" strokeWidth="1.5" />
      {/* a single fine rose line etched into the bracket, kept minimal to match velvet's austere mood */}
      <circle cx="15" cy="15" r="4.4" strokeWidth="0.9" opacity="0.7" />
      <path d="M15 10.6 C16.6 12, 16.6 13.6, 15 15 C13.4 13.6, 13.4 12, 15 10.6 Z" fill={color} fillOpacity="0.5" strokeWidth="0.5" opacity="0.7" />
    </g>
  );
}

function SealCorner({ color, accentSoft }) {
  // Placed once, top-center — a wax seal medallion stamped with a sprig.
  return (
    <g>
      <circle cx="14" cy="14" r="13" fill={`url(#seal-grad)`} stroke={color} strokeWidth="1" />
      <defs>
        <radialGradient id="seal-grad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={accentSoft} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <g fill="none" stroke="#3a1414" strokeWidth="0.8" opacity="0.55" strokeLinecap="round">
        <path d="M14 7 C 16 10, 16 13, 14 15 C 12 13, 12 10, 14 7 Z" />
        <path d="M14 15 L14 21" />
        <path d="M14 17 C 11 17, 9.5 18.5, 9.5 18.5" />
        <path d="M14 19 C 17 19, 18.5 20.5, 18.5 20.5" />
      </g>
    </g>
  );
}

function ScrollCorner({ color }) {
  return (
    <g fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round">
      <path d="M4 4 L4 22 C4 28, 10 30, 14 26" />
      <path d="M4 4 L22 4 C28 4, 30 10, 26 14" />
      <circle cx="4" cy="4" r="2.2" fill={color} stroke="none" />
      <path d="M12 12 C 15 12, 15 16, 12 16 C 9 16, 9 12, 12 12 Z" fill={color} fillOpacity="0.5" strokeWidth="0.9" />
    </g>
  );
}

export const CORNER_BY_ORNAMENT = {
  roses: RoseCorner,
  leaf: LeafCorner,
  sparkle: SparkleCorner,
  brackets: BracketCorner,
  corners: ScrollCorner,
};

export { SealCorner };

export default function FloralFrame({ theme, children }) {
  const color = theme.accent;
  const Corner = CORNER_BY_ORNAMENT[theme.ornament] || ScrollCorner;
  const isSeal = theme.ornament === 'seal';

  return (
    <div
      className="relative mx-auto mt-4 max-w-xl rounded-[1.5rem] px-8 py-10 sm:px-12 sm:py-11"
      style={{
        border: `1px solid rgba(${theme.accentRgb},0.35)`,
        background: `linear-gradient(180deg, rgba(${theme.accentRgb},0.06), rgba(${theme.accentRgb},0.015))`,
      }}
    >
      {/* inner hairline, echoes the Quran-verse card so the two frames read as a matching pair */}
      <div
        className="pointer-events-none absolute inset-[7px] rounded-[1.15rem] border"
        style={{ borderColor: `rgba(${theme.accentRgb},0.18)` }}
      />

      {isSeal ? (
        <svg
          viewBox="0 0 28 28"
          className="pointer-events-none absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2"
        >
          <SealCorner color={color} accentSoft={theme.accentSoft} />
        </svg>
      ) : (
        <>
          <svg viewBox="0 0 60 60" className="pointer-events-none absolute -left-1 -top-1 h-11 w-11 sm:h-14 sm:w-14">
            <Corner color={color} />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute -right-1 -top-1 h-11 w-11 scale-x-[-1] sm:h-14 sm:w-14"
          >
            <Corner color={color} />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute -bottom-1 -left-1 h-11 w-11 scale-y-[-1] sm:h-14 sm:w-14"
          >
            <Corner color={color} />
          </svg>
          <svg
            viewBox="0 0 60 60"
            className="pointer-events-none absolute -bottom-1 -right-1 h-11 w-11 scale-x-[-1] scale-y-[-1] sm:h-14 sm:w-14"
          >
            <Corner color={color} />
          </svg>
        </>
      )}

      {!isSeal && (
        <div className="relative mb-4 text-center text-[1rem]" style={{ color: theme.accent }}>
          {theme.divider}
        </div>
      )}

      <p
        className="relative whitespace-pre-line text-center text-[1.05rem] italic leading-[1.9] sm:text-[1.15rem]"
        style={{ color: theme.ink, fontFamily: theme.bodyFont }}
      >
        {children}
      </p>

      <div
        className="relative mx-auto mt-5 h-px w-14"
        style={{ background: `linear-gradient(90deg, transparent, rgba(${theme.accentRgb},0.7), transparent)` }}
      />
    </div>
  );
}
