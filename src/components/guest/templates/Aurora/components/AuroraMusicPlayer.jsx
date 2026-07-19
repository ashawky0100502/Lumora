import { useEffect, useMemo, useRef, useState } from 'react';
import { resolvePlaybackBounds } from '../lib/musicPlayback';

function firstValue(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    return value;
  }
  return undefined;
}

function asBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on', 'y'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', 'n'].includes(normalized)) return false;
  }
  return null;
}

function normalizeVolume(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.max(0, Math.min(1, parsed));
}

function normalizePercent(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.max(0, Math.min(100, parsed));
}

function resolveMusicConfig(data) {
  return {
    audioUrl: typeof data?.music?.audioUrl === 'string' ? data.music.audioUrl.trim() : data?.music?.audioUrl,
    title: typeof data?.music?.title === 'string' ? data.music.title.trim() : data?.music?.title,
    autoplay: asBoolean(data?.music?.autoplay) ?? true,
    loop: asBoolean(data?.music?.loop) ?? true,
    volume: normalizeVolume(data?.music?.volume) ?? 0.7,
    audioFull: asBoolean(data?.music?.audioFull) ?? true,
    trimStart: normalizePercent(data?.music?.trimStart) ?? 0,
    trimEnd: normalizePercent(data?.music?.trimEnd) ?? 100,
  };
}

export default function AuroraMusicPlayer({ data = {}, startPlayback = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [ready, setReady] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const boundsRef = useRef({ start: 0, end: null });
  const music = useMemo(() => resolveMusicConfig(data), [data]);
  const audioUrl = music.audioUrl;

  useEffect(() => {
    const stored = window.localStorage.getItem('aurora-music-volume');
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setVolume(Math.max(0, Math.min(1, parsed)));
      }
    }
  }, []);

  useEffect(() => {
    setPlaying(false);
    setPlaybackBlocked(false);
    setReady(false);
    boundsRef.current = { start: 0, end: null };

    if (!audioUrl) return undefined;

    const el = audioRef.current;
    if (!el) return undefined;

    const updateBounds = () => {
      const nextBounds = resolvePlaybackBounds(el.duration, music.audioFull, music.trimStart, music.trimEnd);
      boundsRef.current = nextBounds;
      if (el.currentTime !== nextBounds.start) {
        el.currentTime = nextBounds.start;
      }
    };

    const handleTimeUpdate = () => {
      const { start, end } = boundsRef.current;
      if (!music.audioFull && end && el.currentTime >= end) {
        if (music.loop) {
          el.currentTime = start;
          if (playing) {
            el.play().catch(() => {
              setPlaying(false);
              setPlaybackBlocked(true);
            });
          }
        } else {
          el.pause();
          setPlaying(false);
        }
      }
    };

    const handleEnded = () => {
      if (music.loop) {
        const nextStart = music.audioFull ? 0 : boundsRef.current.start;
        el.currentTime = nextStart;
        el.play().catch(() => {
          setPlaying(false);
          setPlaybackBlocked(true);
        });
      } else {
        setPlaying(false);
      }
    };

    el.src = audioUrl;
    el.load();
    el.loop = false;
    el.volume = muted ? 0 : volume;
    el.muted = muted;

    el.addEventListener('loadedmetadata', updateBounds);
    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('ended', handleEnded);

    if (el.readyState >= 2) {
      updateBounds();
    }

    setReady(true);

    if (startPlayback && music.autoplay) {
      attemptPlayback();
    }

    return () => {
      el.removeEventListener('loadedmetadata', updateBounds);
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, startPlayback, music.autoplay, music.audioFull, music.loop, music.trimStart, music.trimEnd, muted, volume]);

  useEffect(() => {
    if (!audioUrl) return;
    const el = audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : volume;
    el.muted = muted;
  }, [audioUrl, muted, volume]);

  function attemptPlayback() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;

    const { start } = boundsRef.current;
    if (!music.audioFull && Number.isFinite(start)) {
      el.currentTime = start;
    }

    el.play()
      .then(() => {
        setPlaying(true);
        setPlaybackBlocked(false);
      })
      .catch(() => {
        setPlaying(false);
        setPlaybackBlocked(true);
      });
  }

  function togglePlayback() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;

    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }

    attemptPlayback();
  }

  function toggleMute() {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    const nextMuted = !muted;
    el.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) {
      el.volume = volume;
    }
  }

  function handleVolumeChange(event) {
    const nextVolume = Number(event.target.value);
    setVolume(nextVolume);
    window.localStorage.setItem('aurora-music-volume', String(nextVolume));
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    el.volume = nextVolume;
    if (muted) {
      el.muted = false;
      setMuted(false);
    }
  }

  if (!audioUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: 'max(16px, env(safe-area-inset-right))',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      <audio ref={audioRef} preload="metadata" playsInline />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          padding: '8px 10px',
          borderRadius: '999px',
          background: 'rgba(16, 16, 24, 0.78)',
          border: '1px solid rgba(255,255,255,0.18)',
          color: '#f7e5b0',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 18px 48px rgba(0, 0, 0, 0.24)',
        }}
      >
        {music.title ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={music.title}
          >
            {music.title}
          </span>
        ) : null}
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? 'Pause music' : playbackBlocked ? 'Play music' : 'Play music'}
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: '#f7e5b0',
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.1)',
            color: '#f7e5b0',
            width: '40px',
            height: '40px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
          }}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <line x1="16" y1="9" x2="21" y2="15" />
              <line x1="21" y1="9" x2="16" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              <path d="M15.5 9a4 4 0 0 1 0 6" />
              <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={handleVolumeChange}
          aria-label="Music volume"
          style={{ width: '90px', accentColor: '#f7e5b0' }}
        />
      </div>
    </div>
  );
}
