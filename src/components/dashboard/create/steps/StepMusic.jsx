import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Field, StepHeading, StepActions, stepMotion } from '../ui';
import { sfxClick } from '../../../../lib/sfx';
import MusicPickerModal from '../../MusicPickerModal';

export default function StepMusic({ data, update, audioFile, setAudioFile, onNext, onBack, onSkip, session }) {
  const isDemo = session?.type === 'demo';
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleFile(file) {
    if (!file) return;
    // Revoke the previous object URL (if any) before replacing it, so we
    // don't leak a blob URL every time a new file is chosen.
    if (data.audioUrl && data.audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(data.audioUrl);
      } catch (e) {
        /* already revoked or invalid — nothing to clean up */
      }
    }
    const url = URL.createObjectURL(file);
    setPlaying(false);
    setAudioFile(file);
    update({ audioUrl: url, audioName: file.name });
  }

  function handlePickFromLibrary(track) {
    setPlaying(false);
    setAudioFile(null); // already hosted — no need to re-upload at publish time
    update({ audioUrl: track.url, audioName: track.name });
  }

  // trimStart/trimEnd are stored as 0-100 percentages of the track's total
  // duration (see the range inputs below) — same convention the guest-facing
  // MusicPlayer.jsx uses. Preview needs to resolve them to actual seconds,
  // which requires the audio's metadata (duration) to be loaded first.
  function startPlaybackFromTrim() {
    const el = audioRef.current;
    if (!el) return;
    if (!data.audioFull && el.duration) {
      const startSec = (Math.max(0, Math.min(100, data.trimStart)) / 100) * el.duration;
      el.currentTime = startSec;
    } else {
      el.currentTime = 0;
    }
    el.play();
    setPlaying(true);
  }

  function togglePreview() {
    const el = audioRef.current;
    if (!el || !data.audioUrl) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }
    sfxClick();
    // readyState 1 (HAVE_METADATA) or higher means el.duration is already
    // known; otherwise wait for it so the trim-start seek doesn't land on 0.
    if (el.readyState >= 1) {
      startPlaybackFromTrim();
    } else {
      el.addEventListener('loadedmetadata', startPlaybackFromTrim, { once: true });
    }
  }

  // While previewing a trimmed clip, stop (and loop back to the start
  // point) once playback reaches the selected End marker — otherwise the
  // preview button only ever controlled play/pause and the trim selection
  // had no real effect on what you heard.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    function onTimeUpdate() {
      if (data.audioFull || !el.duration) return;
      const endSec = (Math.max(0, Math.min(100, data.trimEnd)) / 100) * el.duration;
      if (endSec && el.currentTime >= endSec) {
        el.pause();
        setPlaying(false);
        el.currentTime = (Math.max(0, Math.min(100, data.trimStart)) / 100) * el.duration;
      }
    }
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => el.removeEventListener('timeupdate', onTimeUpdate);
  }, [data.audioFull, data.trimStart, data.trimEnd]);

  function handleRemoveAudio() {
    const el = audioRef.current;
    if (el) el.pause();
    if (data.audioUrl && data.audioUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(data.audioUrl);
      } catch (e) {
        /* already revoked or invalid — nothing to clean up */
      }
    }
    setPlaying(false);
    setAudioFile(null);
    update({ audioUrl: '', audioName: '', audioFull: true, trimStart: 0, trimEnd: 100 });
  }

  const hasAudio = Boolean(data.audioUrl);

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Invitation Song" sub="حطي رابط مباشر لأغنية أونلاين، أو ارفعي ملف من جهازك — وحددي هل تشتغل كاملة ولا جزء معين" />

      <Field
        label="Direct song link (online)"
        value={audioFile ? '' : data.audioUrl}
        onChange={(v) => {
          setAudioFile(null);
          update({ audioUrl: v, audioName: '' });
        }}
        placeholder="https://example.com/song.mp3"
        hint="Must be a direct link to an audio file (ends in .mp3 / .wav / .m4a) — not a YouTube or Spotify page link."
      />

      <div className="my-4 text-center text-[0.8rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
        — or —
      </div>

      <label
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors hover:border-[var(--gold)]"
        style={{ borderColor: 'rgba(212,175,55,0.3)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7" style={{ color: 'var(--gold-soft)' }}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
          {audioFile ? audioFile.name : 'Tap to upload an audio file from your device'}
        </span>
        <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>

      {!isDemo && (
        <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setPickerOpen(true)}>
          اختر من مكتبة الأغاني
        </button>
      )}

      {hasAudio && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
          <audio ref={audioRef} src={data.audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
          <div className="flex items-center justify-between">
            <span className="text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
              {data.audioName || 'Online link'}
            </span>
            <label className="flex items-center gap-2 text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
              <input type="checkbox" checked={data.audioFull} onChange={(e) => update({ audioFull: e.target.checked })} />
              Use full song
            </label>
          </div>

          {!data.audioFull && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="w-14 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
                  Start
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.trimStart}
                  onChange={(e) => update({ trimStart: Number(e.target.value) })}
                  className="flex-1 accent-[var(--gold)]"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
                  End
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={data.trimEnd}
                  onChange={(e) => update({ trimEnd: Number(e.target.value) })}
                  className="flex-1 accent-[var(--gold)]"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2.5">
            <button type="button" className="btn-ghost" onClick={togglePreview}>
              {playing ? '⏸ Pause' : '▶ Preview'}
            </button>
            <button
              type="button"
              onClick={handleRemoveAudio}
              aria-label="Remove song"
              title="Remove song"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.9rem] transition-colors"
              style={{ background: 'rgba(220,90,90,0.1)', border: '1px solid rgba(220,90,90,0.3)', color: '#e08a8a' }}
            >
              🗑
            </button>
          </div>
        </motion.div>
      )}

      <StepActions onBack={onBack} onNext={onNext} onSkip={onSkip} />

      {!isDemo && <MusicPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={handlePickFromLibrary} />}
    </motion.div>
  );
}
