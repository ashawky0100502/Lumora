export function resolvePlaybackBounds(duration, audioFull, trimStart, trimEnd) {
  if (!Number.isFinite(duration) || duration <= 0) {
    return { start: 0, end: null };
  }

  if (audioFull) {
    return { start: 0, end: null };
  }

  const start = (Math.max(0, Math.min(100, Number(trimStart) || 0)) / 100) * duration;
  const end = (Math.max(0, Math.min(100, Number(trimEnd) || 100)) / 100) * duration;

  return {
    start: Number.isFinite(start) ? start : 0,
    end: Number.isFinite(end) ? end : null,
  };
}
