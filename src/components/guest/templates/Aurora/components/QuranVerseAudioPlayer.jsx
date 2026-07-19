import { useEffect, useRef, useState } from 'react';

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function QuranVerseAudioPlayer({ audioUrl, reciterName = '' }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  };

  if (!audioUrl) return null;

  return (
    <div className="aurora-quran-audio">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      <button type="button" className="aurora-quran-audio__button" onClick={togglePlayback}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div className="aurora-quran-audio__track" aria-hidden="true">
        <span className="aurora-quran-audio__track-fill" style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} />
      </div>
      <div className="aurora-quran-audio__meta">
        <span>{formatTime(currentTime)}</span>
        <span>{reciterName || 'Recitation'}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
