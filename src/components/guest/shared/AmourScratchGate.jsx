import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GateNames from './GateNames';
import heartArt from '../../../assets/amour/heart.webp';

// Fraction of the heart that must be scratched away before the invitation
// finishes revealing itself automatically.
const REVEAL_THRESHOLD = 0.72;
const BRUSH_RADIUS = 30;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// A single flower petal that flies away from the scratch point. Every one
// gets its own random direction/rotation/duration so the heart never sheds
// petals the exact same way twice.
function Petal({ x, y, accent, accentSoft, big, onDone }) {
  const angle = randomBetween(0, 360);
  const distance = big ? randomBetween(140, 320) : randomBetween(40, 130);
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * distance;
  const dy = Math.sin(rad) * distance - randomBetween(20, 90);
  const rotate = randomBetween(-280, 280);
  const size = big ? randomBetween(10, 20) : randomBetween(6, 13);
  const palette = ['#8c1f2e', '#c9a15a', '#e8b4bd', '#f3d9de'];
  const color = palette[Math.floor(Math.random() * palette.length)];
  const duration = big ? randomBetween(1.3, 2.1) : randomBetween(0.9, 1.5);

  return (
    <motion.span
      className="absolute block rounded-[0_100%_0_100%]"
      style={{
        left: x,
        top: y,
        width: size,
        height: size * 1.15,
        background: `linear-gradient(135deg, ${accentSoft || color}, ${accent || color})`,
        boxShadow: '0 0 8px rgba(201,161,90,0.35)',
      }}
      initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{ x: dx, y: dy, opacity: 0, rotate, scale: 0.35 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
    />
  );
}

export default function AmourScratchGate({
  theme,
  groom,
  bride,
  dateStr,
  kicker,
  sub,
  openLabel,
  scratchHint,
  scratchSkip,
  opening,
  handleOpen,
  onFirstTouch,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const revealedRef = useRef(false);
  const touchedRef = useRef(false);
  const petalId = useRef(0);
  const [petals, setPetals] = useState([]);
  const [hintVisible, setHintVisible] = useState(true);
  const [bursting, setBursting] = useState(false);

  // Paint the flower heart artwork onto the canvas, sized to the wrapper.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    const img = new Image();
    img.src = heartArt;
    img.onload = () => {
      const ir = img.width / img.height;
      const cr = width / height;
      let dw, dh, dx, dy;
      if (ir > cr) {
        dh = height;
        dw = height * ir;
        dx = (width - dw) / 2;
        dy = 0;
      } else {
        dw = width;
        dh = width / ir;
        dx = 0;
        dy = (height - dh) / 2;
      }
      ctx.drawImage(img, dx, dy, dw, dh);
    };
  }, []);

  const addPetals = useCallback((x, y, count, big) => {
    setPetals((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        petalId.current += 1;
        next.push({ id: petalId.current, x, y, big });
      }
      return next.slice(-110);
    });
  }, []);

  const triggerFinalBurst = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setBursting(true);
    const wrap = wrapRef.current;
    if (wrap) {
      const { width, height } = wrap.getBoundingClientRect();
      const cx = width / 2;
      const cy = height / 2;
      for (let i = 0; i < 26; i++) {
        setTimeout(() => addPetals(cx + randomBetween(-50, 50), cy + randomBetween(-70, 70), 1, true), i * 18);
      }
    }
    setTimeout(() => handleOpen(), 1250);
  }, [addPetals, handleOpen]);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    if (!width || !height) return;
    const stride = 8;
    let data;
    try {
      data = ctx.getImageData(0, 0, width, height).data;
    } catch {
      return;
    }
    let total = 0;
    let cleared = 0;
    for (let y = 0; y < height; y += stride) {
      for (let x = 0; x < width; x += stride) {
        const idx = (y * width + x) * 4 + 3;
        total += 1;
        if (data[idx] < 40) cleared += 1;
      }
    }
    if (total > 0 && cleared / total >= REVEAL_THRESHOLD) {
      triggerFinalBurst();
    }
  }, [triggerFinalBurst]);

  const scratchAt = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas || revealedRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      const grad = ctx.createRadialGradient(x, y, 0, x, y, BRUSH_RADIUS);
      grad.addColorStop(0, 'rgba(0,0,0,1)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.95)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      addPetals(x, y, 2, false);

      if (!touchedRef.current) {
        touchedRef.current = true;
        setHintVisible(false);
        onFirstTouch?.();
      }
    },
    [addPetals, onFirstTouch]
  );

  function strokeBetween(clientX, clientY) {
    if (!lastPoint.current) {
      scratchAt(clientX, clientY);
    } else {
      const steps = Math.max(1, Math.floor(Math.hypot(clientX - lastPoint.current.x, clientY - lastPoint.current.y) / 10));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        scratchAt(lastPoint.current.x + (clientX - lastPoint.current.x) * t, lastPoint.current.y + (clientY - lastPoint.current.y) * t);
      }
    }
    lastPoint.current = { x: clientX, y: clientY };
  }

  function handlePointerDown(e) {
    if (revealedRef.current) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    strokeBetween(e.clientX, e.clientY);
    checkProgress();
  }

  function handlePointerMove(e) {
    if (!drawing.current || revealedRef.current) return;
    strokeBetween(e.clientX, e.clientY);
  }

  function handlePointerUp() {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    checkProgress();
  }

  function removePetal(id) {
    setPetals((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSkip() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHintVisible(false);
    onFirstTouch?.();
    triggerFinalBurst();
  }

  return (
    <motion.div
      className="relative z-10 flex w-full flex-col items-center justify-center px-4"
      animate={opening ? { opacity: 0, scale: 1.04 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: opening ? 0.1 : 0 }}
    >
      <div className="mb-6 text-center">
        <GateNames theme={theme} groom={groom} bride={bride} dateStr={dateStr} kicker={kicker} sub={null} />
      </div>

      <div
        ref={wrapRef}
        className="relative select-none overflow-hidden rounded-[26px]"
        style={{
          width: 'min(300px, 74vw)',
          aspectRatio: '2 / 3',
          boxShadow: `0 30px 90px -24px rgba(0,0,0,0.65), 0 0 0 1px rgba(${theme.accentRgb},0.22)`,
          background: theme.surface,
        }}
      >
        {/* Hidden underneath — revealed as the flowers are scratched / fly away */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div style={{ color: theme.accent, fontSize: '1.6rem' }}>{theme.divider}</div>
          <p className="mt-4 text-[0.92rem] italic leading-[1.8]" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
            {sub}
          </p>
        </div>

        <motion.canvas
          ref={canvasRef}
          className="absolute inset-0 z-20 touch-none"
          style={{ cursor: 'pointer', pointerEvents: bursting ? 'none' : 'auto' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          animate={bursting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 1, delay: bursting ? 0.15 : 0 }}
        />

        <div className="pointer-events-none absolute inset-0 z-30 overflow-visible">
          {petals.map((p) => (
            <Petal key={p.id} x={p.x} y={p.y} accent={theme.accent} accentSoft={theme.accentSoft} big={p.big} onDone={() => removePetal(p.id)} />
          ))}
        </div>

        {bursting && (
          <motion.div
            className="absolute inset-0 z-10"
            style={{ background: `radial-gradient(circle at 50% 45%, rgba(${theme.accentRgb},0.5), transparent 70%)` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.1 }}
          />
        )}
      </div>

      <AnimatePresence>
        {hintVisible && !bursting && (
          <motion.button
            type="button"
            onClick={handleSkip}
            className="mt-6 text-[0.78rem] italic"
            style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span
              className="mb-2 block text-[0.7rem] uppercase"
              style={{ color: theme.accent, letterSpacing: '0.3em', fontFamily: theme.uiFont }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            >
              {scratchHint}
            </motion.span>
            <span className="underline decoration-dotted underline-offset-4">{scratchSkip}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
