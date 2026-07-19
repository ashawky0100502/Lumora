export default function AmbientAudio({
  src,
  autoPlay = false,
  loop = true,
  volume = 0.35,
  muted = false,
  className = '',
}) {
  if (!src) return null;

  return (
    <audio className={className} src={src} autoPlay={autoPlay} loop={loop} volume={volume} muted={muted} />
  );
}
