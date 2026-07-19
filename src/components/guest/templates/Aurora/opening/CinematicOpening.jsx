import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import '../styles/opening.css';

import backgroundImage from '../../../../../assets/lumora/aurora/backgrounds/royal-palace.webp.png';
import lightingImage from '../../../../../assets/lumora/aurora/lighting/sunrise-light-rays.svg';
import fogImage from '../../../../../assets/lumora/aurora/overlays/fog-01.png';
import dustTexture from '../../../../../assets/lumora/aurora/particles/white-dust.png';

export default function CinematicOpening({ onComplete, data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  const [isComplete, setIsComplete] = useState(false);
  const coupleName = data?.names?.coupleName || 'Avery & Eli';
  const weddingDate = data?.hero?.date || 'October 18, 2026';
  const subtitle = data?.hero?.subtitle || 'A private celebration';

  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${8 + (index % 6) * 14}%`,
        top: `${12 + (index % 5) * 15}%`,
        size: 1 + (index % 4) * 0.8,
        delay: index * 0.06,
      })),
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      const revealTimer = window.setTimeout(() => setIsComplete(true), 700);
      const finishTimer = window.setTimeout(() => {
        if (typeof onComplete === 'function') onComplete();
      }, 900);
      return () => {
        window.clearTimeout(revealTimer);
        window.clearTimeout(finishTimer);
      };
    }

    const revealTimer = window.setTimeout(() => setIsComplete(true), 5000);
    const finishTimer = window.setTimeout(() => {
      if (typeof onComplete === 'function') onComplete();
    }, 5200);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <motion.section
      className="aurora-opening aurora-cinematic-opening"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="aurora-scene" aria-label="Aurora opening cinematic scene">
        <motion.div
          className="aurora-layer aurora-layer--background"
          initial={{ opacity: 0, scale: 1.06, y: 28 }}
          animate={{ opacity: prefersReducedMotion ? 1 : 1, scale: isComplete ? 1.01 : 1.03, y: isComplete ? -6 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0.8 : 3.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <img className="aurora-image aurora-image--background" src={backgroundImage} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-layer aurora-layer--fog"
          initial={{ opacity: 0, x: -24, y: 20, filter: 'blur(24px)' }}
          animate={{ opacity: isComplete ? 0.28 : 0.48, x: isComplete ? 14 : -6, y: isComplete ? 4 : 0, filter: isComplete ? 'blur(12px)' : 'blur(6px)' }}
          transition={{ duration: prefersReducedMotion ? 0.75 : 2.6, delay: prefersReducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img className="aurora-fog-image" src={fogImage} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-layer aurora-layer--light"
          initial={{ opacity: 0, scale: 1.06, filter: 'blur(26px)' }}
          animate={{ opacity: isComplete ? 0.42 : 0.76, scale: isComplete ? 1.02 : 1.09, filter: isComplete ? 'blur(8px)' : 'blur(2px)' }}
          transition={{ duration: prefersReducedMotion ? 0.8 : 3.2, delay: prefersReducedMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <img className="aurora-light-image" src={lightingImage} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-layer aurora-layer--dust"
          initial={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 0.38 : 0.8 }}
          transition={{ duration: prefersReducedMotion ? 0.7 : 2.8, delay: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <img className="aurora-image" src={dustTexture} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-curtain aurora-curtain--left"
          initial={{ x: '-48%', opacity: 1, scaleX: 1.08, rotateY: 0, y: 0 }}
          animate={{ x: isComplete ? '-6%' : '-24%', opacity: isComplete ? 0.92 : 0.98, scaleX: isComplete ? 1 : 1.02, rotateY: isComplete ? -4 : -2, y: isComplete ? 0 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0.8 : 2.4, delay: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div
          className="aurora-curtain aurora-curtain--right"
          initial={{ x: '48%', opacity: 1, scaleX: 1.08, rotateY: 0, y: 0 }}
          animate={{ x: isComplete ? '6%' : '24%', opacity: isComplete ? 0.92 : 0.98, scaleX: isComplete ? 1 : 1.02, rotateY: isComplete ? 4 : 2, y: isComplete ? 0 : 0 }}
          transition={{ duration: prefersReducedMotion ? 0.8 : 2.4, delay: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.div
          className="aurora-curtain-glow"
          initial={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 0.16 : 0.56 }}
          transition={{ duration: prefersReducedMotion ? 0.7 : 2.6, delay: prefersReducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="aurora-particle"
            initial={{ opacity: 0, scale: 0.4, y: 24 }}
            animate={{ opacity: isComplete ? [0.2, 0.7, 0.3] : [0.1, 0.9, 0.75, 0.9], scale: isComplete ? [0.8, 1, 0.85] : [0.4, 1, 0.85, 1], y: isComplete ? [8, 0, 6] : [24, 0, 8, 0] }}
            transition={{ duration: prefersReducedMotion ? 1.8 : 5.2 + particle.delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
            style={{ left: particle.left, top: particle.top, width: particle.size, height: particle.size }}
          />
        ))}

        <motion.div
          className="aurora-typography"
          initial={{ opacity: 0, scale: 1.04, y: 26 }}
          animate={{ opacity: isComplete ? 0.95 : prefersReducedMotion ? 0.7 : 0.92, scale: isComplete ? 1 : 1.01, y: isComplete ? 0 : 4 }}
          transition={{ duration: prefersReducedMotion ? 0.6 : 1.4, delay: prefersReducedMotion ? 0 : 3.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-typography-card">
            <p className="aurora-subtitle">{subtitle}</p>
            <h1 className="aurora-title">{coupleName}</h1>
            <p className="aurora-caption">{weddingDate}</p>
          </div>
        </motion.div>

        <motion.div
          className="aurora-opening-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: isComplete ? 0.95 : 0.1, y: isComplete ? 0 : 6 }}
          transition={{ duration: prefersReducedMotion ? 0.6 : 1.2, delay: prefersReducedMotion ? 0 : 4.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-opening-hero-card">
            <p className="aurora-opening-hero-date">{weddingDate}</p>
            <p className="aurora-opening-hero-venue">The palace opens in warm light</p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
