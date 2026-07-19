import { forwardRef } from 'react';
import MusicPlayer from '../../shared/MusicPlayer';

/**
 * ETERNAL VOYAGE — Music Experience.
 *
 * Reuses the project's existing shared `MusicPlayer` (the actual audio
 * element, play/pause logic, and trim-window handling all live there,
 * completely untouched) — nothing new is created here. This file only
 * adds a luxury floating glass panel around it:
 *   - a "now playing" label built from the Builder's own `audioName`
 *     field (already saved by StepMusic.jsx — no invented metadata,
 *     falls back to a plain "♪ Wedding Soundtrack" label when the
 *     Builder hasn't stored a name), and
 *   - a small CSS-only equalizer that comes alive purely by targeting
 *     `MusicPlayer`'s own existing `animate-pulse` class (already only
 *     present on the icon while playing) — no state is read or
 *     duplicated here to know whether audio is playing.
 *
 * Same "no music → render nothing" behavior as `MusicPlayer` itself;
 * guarded here too so no empty panel/label ever renders.
 *
 * Autoplay, trim bounds, and the play()/pause() logic are 100%
 * `MusicPlayer`'s own — this wrapper never touches them. It only
 * forwards a `ref` to it (see `MusicPlayer`'s own doc comment: its
 * imperative `play()` must be called synchronously from a real click
 * handler elsewhere for autoplay-restricted browsers to allow sound —
 * exactly the same contract `Gate.jsx` already fulfills for every
 * other template via `onOpenClick={() => musicRef.current?.play()}`).
 * Eternal Voyage has no Gate, so `EternalVoyage.jsx` wires this same
 * ref to Hero's own opening click instead — no bypassing of browser
 * autoplay rules, no forced autoplay: sound only ever starts as the
 * direct result of a real click, same as everywhere else in the app.
 */
const Music = forwardRef(function Music({ data, theme }, ref) {
  if (!data?.audioUrl) return null;

  const nowPlaying = data?.audioName ? data.audioName.replace(/\.[a-z0-9]+$/i, '') : null;

  return (
    <div className="ev-music">
      <span className="ev-music__label">
        <span className="ev-music__note" aria-hidden="true">♪</span>
        <span className="ev-music__title">{nowPlaying || 'Wedding Soundtrack'}</span>
      </span>
      <MusicPlayer
        ref={ref}
        theme={theme}
        audioUrl={data.audioUrl}
        audioFull={data.audioFull}
        trimStart={data.trimStart}
        trimEnd={data.trimEnd}
        active
      />
    </div>
  );
});

export default Music;
