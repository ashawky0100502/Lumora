import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { sfxSuccess, sfxCurtain } from '../../lib/sfx';

/**
 * Plays once, from login success to dashboard reveal:
 *   1. galaxy darkens + freezes, held for a silent beat
 *   2. particles stream in from the edges and settle into the word "LUMORA"
 *   3. a gold flash bursts from the formed logo
 *   4. heavy theater curtains sweep open (with their own logo flash) to
 *      uncover the dashboard, which is mounted mid-sweep so it's already
 *      animating in by the time the curtains fully part
 *
 * `galaxyControls` is the same imperative ref GalaxyBackground reads every
 * frame — mutating it here avoids re-rendering the WebGL scene.
 */
export default function CinematicSequence({ galaxyControls, onRevealDashboard, onDone }) {
  const canvasRef = useRef(null);
  const glowBurstRef = useRef(null);
  const curtainStageRef = useRef(null);
  const curtainLeftRef = useRef(null);
  const curtainRightRef = useRef(null);
  const curtainLightRef = useRef(null);
  const curtainLogoWrapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = null;

    const canvas = canvasRef.current;
    const cctx = canvas.getContext('2d');
    const glowBurst = glowBurstRef.current;
    const curtainStage = curtainStageRef.current;
    const curtainLeft = curtainLeftRef.current;
    const curtainRight = curtainRightRef.current;
    const curtainLight = curtainLightRef.current;
    const curtainLogoWrap = curtainLogoWrapRef.current;

    function resizeCine() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeCine();
    window.addEventListener('resize', resizeCine);

    // Sample target points for the word LUMORA from an offscreen text render.
    function getTextTargetPoints(word, count) {
      const off = document.createElement('canvas');
      const W = window.innerWidth;
      const H = window.innerHeight;
      off.width = W;
      off.height = H;
      const octx = off.getContext('2d');
      const fontSize = Math.min(W * 0.13, 150);
      octx.fillStyle = '#fff';
      octx.font = `700 ${fontSize}px Cinzel, serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.letterSpacing = `${fontSize * 0.12}px`;
      octx.fillText(word, W / 2, H / 2);
      const data = octx.getImageData(0, 0, W, H).data;
      const candidates = [];
      const step = 3;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const idx = (y * W + x) * 4;
          if (data[idx + 3] > 120) candidates.push({ x, y });
        }
      }
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      const pts = [];
      for (let i = 0; i < count; i++) pts.push(candidates[i % candidates.length] || { x: W / 2, y: H / 2 });
      return pts;
    }

    function runStarFormation(onComplete) {
      const N = 1400;
      const targets = getTextTargetPoints('LUMORA', N);
      const particles = [];
      const W = window.innerWidth;
      const H = window.innerHeight;
      for (let i = 0; i < N; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.max(W, H) * 0.75;
        particles.push({
          x: W / 2 + Math.cos(angle) * radius,
          y: H / 2 + Math.sin(angle) * radius,
          tx: targets[i].x,
          ty: targets[i].y,
          speed: 0.02 + Math.random() * 0.025,
          size: 1.2 + Math.random() * 1.8,
        });
      }

      canvas.style.opacity = '1';
      let done = false;

      function step() {
        if (cancelled) return;
        cctx.fillStyle = 'rgba(2,2,2,0.22)';
        cctx.fillRect(0, 0, W, H);

        let settled = 0;
        for (const p of particles) {
          p.x += (p.tx - p.x) * p.speed;
          p.y += (p.ty - p.y) * p.speed;
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          if (Math.sqrt(dx * dx + dy * dy) < 1.5) settled++;

          cctx.beginPath();
          const grad = cctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grad.addColorStop(0, 'rgba(255,247,220,0.95)');
          grad.addColorStop(1, 'rgba(212,175,55,0)');
          cctx.fillStyle = grad;
          cctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
          cctx.fill();
        }

        const progress = settled / N;
        if (progress < 0.985) {
          rafId = requestAnimationFrame(step);
        } else if (!done) {
          done = true;
          cctx.fillStyle = 'rgba(2,2,2,0.4)';
          cctx.fillRect(0, 0, W, H);
          cctx.fillStyle = '#fff8dd';
          cctx.font = `700 ${Math.min(W * 0.13, 150)}px Cinzel, serif`;
          cctx.textAlign = 'center';
          cctx.textBaseline = 'middle';
          cctx.letterSpacing = `${Math.min(W * 0.13, 150) * 0.12}px`;
          cctx.shadowColor = 'rgba(212,175,55,0.9)';
          cctx.shadowBlur = 40;
          cctx.fillText('LUMORA', W / 2, H / 2);

          gsap.set(glowBurst, { opacity: 1, scale: 1 });
          gsap.to(glowBurst, { scale: 60, opacity: 0, duration: 1.4, ease: 'power2.out' });
          onComplete();
        } else {
          rafId = requestAnimationFrame(step);
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function openCurtains() {
      if (cancelled) return;
      gsap.set(curtainStage, { autoAlpha: 1 });
      sfxCurtain();
      const tl = gsap.timeline();
      tl.to(curtainLogoWrap, { opacity: 1, duration: 0.5, ease: 'power1.out' })
        .to({}, { duration: 0.6 }) // hold on logo
        .to(curtainLogoWrap, { opacity: 0, duration: 0.4, ease: 'power1.in' })
        .to(curtainLight, { width: '160%', duration: 1.1, ease: 'power2.out' }, '-=0.1')
        .to(canvas, { opacity: 0, duration: 0.6 }, '-=0.9')
        .to(curtainLeft, { x: '-102%', duration: 1.6, ease: 'power3.inOut' }, '-=0.4')
        .to(curtainRight, { x: '102%', duration: 1.6, ease: 'power3.inOut' }, '<')
        .to(curtainLight, { opacity: 0, duration: 0.8 }, '-=0.9')
        .add(() => {
          // let a bit of galaxy shine through again subtly behind glass
          galaxyControls.current.starsFrozen = false;
          gsap.to(galaxyControls.current, { galaxyDark: 0, duration: 3, ease: 'power2.out' });
          onRevealDashboard?.();
        }, '-=0.7')
        .add(() => {
          gsap.set(curtainStage, { autoAlpha: 0 });
          onDone?.();
        });
    }

    function beginCinematicSequence() {
      const tl = gsap.timeline();
      tl.to(galaxyControls.current, { galaxyDark: 1, duration: 1.1, ease: 'power2.inOut' })
        .add(() => {
          galaxyControls.current.starsFrozen = true;
        })
        .to({}, { duration: 1.0 }) // one second of silence
        .add(() => {
          if (cancelled) return;
          sfxSuccess();
          runStarFormation(() => {
            gsap.to({}, { duration: 2.0, onComplete: openCurtains });
          });
        });
    }

    beginCinematicSequence();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCine);
      gsap.killTweensOf(galaxyControls.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-20 block opacity-0"
      />
      <div ref={glowBurstRef} className="logo-glow-burst z-[21] opacity-0" />

      <div ref={curtainStageRef} className="pointer-events-none fixed inset-0 z-30 invisible opacity-0">
        <div ref={curtainLeftRef} className="curtain-panel curtain-panel-left" />
        <div ref={curtainRightRef} className="curtain-panel curtain-panel-right" />
        <div ref={curtainLightRef} className="curtain-light z-[1]" />
        <div
          ref={curtainLogoWrapRef}
          className="pointer-events-none absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-center opacity-0"
        >
          <div
            className="font-display curtain-logo-gold pl-[0.32em] font-bold"
            style={{ fontSize: 'clamp(2.1rem, 5.2vw, 3.4rem)', letterSpacing: '0.32em' }}
          >
            LUMORA
          </div>
          <div
            className="font-serif-alt mt-2.5 italic"
            style={{ fontSize: '0.9rem', letterSpacing: '0.08em', color: 'rgba(246,244,239,0.6)' }}
          >
            Where Love Becomes an Experience
          </div>
        </div>
      </div>
    </>
  );
}
