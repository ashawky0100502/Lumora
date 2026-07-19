import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

/**
 * GRAND PREMIERE — Hero Music (Phase 5).
 *
 * Builder is the only source of music, per the Phase 5 brief — every
 * value read here comes straight from the real fields verified in
 * `../config/builderFields.js` (`music.audioUrl` / `audioFull` /
 * `trimStart` / `trimEnd`, gated by `sections.music`). If Builder has
 * no track, this renders nothing (`audioUrl` falsy -> `return null`),
 * matching every other section's "no data -> null" rule.
 *
 * Trim handling mirrors the existing shared `guest/shared/MusicPlayer.jsx`
 * exactly (trimStart/trimEnd are 0-100 percentages of the track's real
 * duration, resolved to seconds once metadata loads, looping within
 * that window) — same behavior guests already get on every other
 * template, just re-implemented here instead of reusing that component,
 * because Grand Premiere's timing requirement is different from every
 * other template's: elsewhere, music starts the instant the Gate opens.
 * Here, per the brief, it must start only "naturally, after the Hero
 * finishes appearing" — not the moment the ring box is tapped.
 *
 * That timing creates a real constraint: browsers only allow audio-
 * with-sound to start as a *direct, synchronous* result of a user
 * gesture. The ring-box tap is that gesture, but by design it happens
 * seconds before Hero (and this component) even finishes revealing —
 * far too late to satisfy "direct result of a gesture" on its own.
 * The standard, widely-used fix (the same "unlock" trick browsers'
 * own autoplay-policy docs describe): during the tap, silently
 * `play()` then immediately `pause()` this element — that momentary,
 * gesture-synchronous play is what grants the element playback
 * permission for the rest of the session. The later, un-gestured
 * `play()` call once Hero has settled then succeeds instead of being
 * silently blocked. See `unlock()` below and `index.jsx`'s
 * `onClickCapture` (fires on the same click, before this component
 * itself needs to know anything about the ring box).
 */
const HeroMusic = forwardRef(function HeroMusic({ audioUrl, audioFull, trimStart, trimEnd, reveal }, ref) {
  const audioRef = useRef(null);
  const boundsRef = useRef({ start: 0, end: null });
  const unlockedRef = useRef(false);
  const fadeFrameRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [audible, setAudible] = useState(false);

  // Resolve the trim window in seconds once duration is known — same
  // logic as guest/shared/MusicPlayer.jsx.
  useEffect(() => {
    if (!audioUrl) return undefined;
    const el = audioRef.current;
    if (!el) return undefined;

    function applyBounds() {
      if (!audioFull && el.duration) {
        const start = (Math.max(0, Math.min(100, trimStart ?? 0)) / 100) * el.duration;
        const end = (Math.max(0, Math.min(100, trimEnd ?? 100)) / 100) * el.duration;
        boundsRef.current = { start, end };
        el.currentTime = start;
      }
    }

    function onTimeUpdate() {
      const { start, end } = boundsRef.current;
      if (!audioFull && end && el.currentTime >= end) {
        el.currentTime = start;
      }
    }

    el.addEventListener('loadedmetadata', applyBounds);
    el.addEventListener('timeupdate', onTimeUpdate);
    if (el.readyState >= 1) applyBounds();
    return () => {
      el.removeEventListener('loadedmetadata', applyBounds);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioUrl, audioFull, trimStart, trimEnd]);

  useImperativeHandle(ref, () => ({
    // Must be invoked synchronously from the same click/keypress that
    // opens the ring box — see index.jsx's onClickCapture. Safe to call
    // more than once; only the first call actually touches playback.
    unlock() {
      const el = audioRef.current;
      if (!el || unlockedRef.current || !audioUrl) return;
      unlockedRef.current = true;
      // Silent while it runs — this play()/pause() pair exists purely
      // to register user activation on the element, not to be heard.
      // The real, audible playback (with its own fade-in) happens later
      // in the `reveal` effect below, which resets volume itself.
      el.volume = 0;
      el.play().then(() => el.pause()).catch(() => {
        unlockedRef.current = false;
      });
    },
  }));

  // Once Hero has visibly settled (see index.jsx's HERO_MUSIC_DELAY_MS),
  // start playback for real and fade it in — never at full volume
  // instantly, so it reads as the room's ambience arriving rather than
  // a track being switched on.
  useEffect(() => {
    if (!reveal || !audioUrl) return undefined;
    const el = audioRef.current;
    if (!el) return undefined;

    el.volume = 0;
    let cancelled = false;
    el.play()
      .then(() => {
        if (cancelled) return;
        setAudible(true);
        const FADE_MS = 1600;
        const startedAt = performance.now();
        function tick(now) {
          if (cancelled) return;
          const progress = Math.min(1, (now - startedAt) / FADE_MS);
          el.volume = progress;
          if (progress < 1) {
            fadeFrameRef.current = requestAnimationFrame(tick);
          }
        }
        fadeFrameRef.current = requestAnimationFrame(tick);
      })
      .catch(() => {
        // Blocked despite the earlier unlock (e.g. guest never actually
        // tapped, or an unusually strict browser) — fail silently,
        // same "no forced sound" behavior as every autoplay guard.
      });

    return () => {
      cancelled = true;
      if (fadeFrameRef.current) cancelAnimationFrame(fadeFrameRef.current);
    };
  }, [reveal, audioUrl]);

  function toggleMuted() {
    const el = audioRef.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
  }

  if (!audioUrl) return null;

  return (
    <>
      <audio ref={audioRef} src={audioUrl} loop preload="metadata" />
      <button
        type="button"
        onClick={toggleMuted}
        className="gp-hero__sound"
        data-visible={audible ? 'true' : 'false'}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
      >
        {muted ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <line x1="16" y1="9" x2="21" y2="15" />
            <line x1="21" y1="9" x2="16" y2="15" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
            <path d="M15.5 9a4 4 0 0 1 0 6" />
            <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
          </svg>
        )}
      </button>
    </>
  );
});

export default HeroMusic;
