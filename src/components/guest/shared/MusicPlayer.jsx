import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';

/**
 * Floating play/pause control for the invitation's song, shown once the
 * gate opens. This was previously missing entirely — StepMusic.jsx /
 * StepReview.jsx already save audioUrl/audioFull/trimStart/trimEnd onto
 * the invitation, but nothing on the guest-facing page ever read them.
 *
 * trimStart/trimEnd are stored as 0-100 percentages of the track's total
 * duration (see StepMusic.jsx's range inputs), so we resolve them to
 * actual seconds once metadata loads.
 *
 * IMPORTANT: browsers only allow audio-with-sound to start as a *direct*
 * result of a user gesture (tap/click) — not from a React effect that
 * fires after a setTimeout or after metadata finishes loading. That delay
 * breaks the "user activation" flag (Safari in particular is strict about
 * this), which is why autoplay used to work sometimes and silently fail
 * other times. To fix this reliably, the parent (Gate's onOpen handler)
 * calls the imperative `play()` exposed below *synchronously*, inside the
 * same click handler that opens the gate — see Gate.jsx's handleOpen.
 */
const MusicPlayer = forwardRef(function MusicPlayer({ theme, audioUrl, audioFull, trimStart, trimEnd, active }, ref) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const boundsRef = useRef({ start: 0, end: null });

  useEffect(() => {
    if (!audioUrl) return;
    const el = audioRef.current;
    if (!el) return;

    function applyBounds() {
      if (!audioFull) {
        boundsRef.current = {
          start: (Math.max(0, Math.min(100, trimStart)) / 100) * el.duration,
          end: (Math.max(0, Math.min(100, trimEnd)) / 100) * el.duration,
        };
        el.currentTime = boundsRef.current.start;
      }
    }

    function onTimeUpdate() {
      const { end } = boundsRef.current;
      if (!audioFull && end && el.currentTime >= end) {
        el.currentTime = boundsRef.current.start;
      }
    }

    el.addEventListener('loadedmetadata', applyBounds);
    el.addEventListener('timeupdate', onTimeUpdate);
    // Metadata may already be cached/loaded by the time this effect runs.
    if (el.readyState >= 1) applyBounds();
    return () => {
      el.removeEventListener('loadedmetadata', applyBounds);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  useImperativeHandle(ref, () => ({
    // Must be invoked synchronously from the same click handler that
    // opened the gate (no setTimeout/await in between), or mobile
    // browsers will silently block the sound.
    play() {
      const el = audioRef.current;
      if (!el) return;
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    },
  }));

  if (!audioUrl) return null;

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="metadata" />
      <motion.button
        type="button"
        onClick={toggle}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        aria-label={playing ? 'Pause music' : 'Play music'}
        className="fixed bottom-6 z-40 flex h-11 w-11 items-center justify-center rounded-full"
        style={{
          insetInlineEnd: '1.5rem',
          background: `rgba(${theme.accentRgb},0.16)`,
          border: `1px solid rgba(${theme.accentRgb},0.4)`,
          color: theme.accent,
          backdropFilter: 'blur(10px)',
        }}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 animate-pulse">
            <rect x="6" y="5" width="4" height="14" />
            <rect x="14" y="5" width="4" height="14" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d="M7 5v14l12-7z" />
          </svg>
        )}
      </motion.button>
    </>
  );
});

export default MusicPlayer;
