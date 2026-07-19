import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import GateNames from './GateNames';

/**
 * Every template's opening animation lives in its own file under gates/,
 * loaded on demand with React.lazy. A guest only ever downloads the code
 * (and any images, like amour's heart.webp) for the ONE template their own
 * invitation uses — adding a 20th template later costs existing guests
 * nothing, since its chunk only gets fetched by guests actually viewing it.
 * Add a template by adding an entry here (+ a file in gates/), nothing
 * else in this component needs to change.
 */
const GATE_VARIANTS = {
  royale: lazy(() => import('./gates/GateRoyale')),
  silk: lazy(() => import('./gates/GateSilk')),
  velvet: lazy(() => import('./gates/GateVelvet')),
  wax: lazy(() => import('./gates/GateWax')),
  midnight: lazy(() => import('./gates/GateMidnight')),
  amour: lazy(() => import('./gates/GateAmour')),
};

export default function Gate({ theme, variant, groom, bride, dateStr, kicker, sub, openLabel, scratchHint, scratchSkip, coverPhoto, onOpen, onOpenClick }) {
  const [opening, setOpening] = useState(false);

  function handleOpen() {
    if (opening) return;
    setOpening(true);
    // Fire this *synchronously* inside the click handler — starting audio
    // playback from a setTimeout callback below would happen too late for
    // browsers (Safari especially) to treat it as user-initiated, which is
    // why the song used to only autoplay sometimes.
    onOpenClick?.();
    const delay = variant === 'royale' ? 1900 : variant === 'velvet' ? 1700 : variant === 'wax' ? 1400 : variant === 'amour' ? 1300 : 1100;
    setTimeout(onOpen, delay);
  }

  const VariantGate = GATE_VARIANTS[variant] || GATE_VARIANTS.midnight;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-6"
      style={{ background: theme.bg }}
      exit={{ opacity: 0, transition: { duration: 0.9, delay: 0.15 } }}
    >
      {coverPhoto && (
        <>
          {/* The couple's own photo (or the template's default), sitting
              behind everything — a themed tint on top keeps the names
              and opening button readable over any photo. */}
          <motion.div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${coverPhoto})` }}
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: opening ? 1.15 : 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: theme.ease }}
          />
          <div className="absolute inset-0 z-0" style={{ background: theme.bg, opacity: 0.82 }} />
        </>
      )}

      {/* Fallback while the variant's own chunk loads (typically only on
          the very first invitation a guest's browser has ever opened for
          this template — cached instantly after that): the same names/
          date guests would see anyway, just without the opening animation
          for a beat. */}
      <Suspense fallback={<GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={sub} />}>
        <VariantGate
          theme={theme}
          groom={groom}
          bride={bride}
          dateStr={dateStr}
          kicker={kicker}
          sub={sub}
          openLabel={openLabel}
          scratchHint={scratchHint}
          scratchSkip={scratchSkip}
          opening={opening}
          handleOpen={handleOpen}
          onFirstTouch={onOpenClick}
        />
      </Suspense>
    </motion.div>
  );
}
