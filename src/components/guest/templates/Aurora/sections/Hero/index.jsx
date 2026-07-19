import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useMemo, useRef } from 'react';
import HeroGlassCard from '../../components/HeroGlassCard';
import HeroScrollIndicator from '../../components/HeroScrollIndicator';
import heroBackground from '../../../../../../assets/lumora/aurora/backgrounds/royal-palace.webp.png';
import heroFog from '../../../../../../assets/lumora/aurora/overlays/fog-01.png';
import heroLight from '../../../../../../assets/lumora/aurora/lighting/sunrise-light-rays.svg';
import heroDust from '../../../../../../assets/lumora/aurora/particles/white-dust.png';
import '../../styles/opening.css';

export default function AuroraHero({ data = {}, onViewInvitation }) {
  const heroSectionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const coupleName = data?.names?.coupleName || 'Avery & Eli';
  const groomName = data?.names?.groom || '';
  const brideName = data?.names?.bride || '';
  const weddingDate = data?.hero?.date || 'October 18, 2026';
  const subtitle = data?.hero?.subtitle || 'A private celebration of light, stillness & devotion';
  const heroImage = data?.hero?.image;
  const venueName = data?.venue?.name || '';
  const invitationMessage = data?.invitation?.message || '';
  const heroVideo = data?.hero?.video;
  const ctaText = data?.hero?.ctaText || 'View invitation';
  const { scrollYProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22, 0.68], [1, 0.55, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, -90]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.96]);
  const floatingStars = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${8 + (index % 6) * 14}%`,
        top: `${12 + (index % 5) * 15}%`,
        size: 2 + (index % 3) * 1.2,
        delay: index * 0.08,
      })),
    []
  );

  return (
    <motion.section
      ref={heroSectionRef}
      className="aurora-opening aurora-hero"
      aria-labelledby="aurora-hero-title"
      style={prefersReducedMotion ? undefined : { opacity: heroOpacity, y: heroY, scale: heroScale }}
    >
      <div className="aurora-scene">
        <div className="aurora-layer aurora-layer--background">
          {heroVideo ? (
            <video className="aurora-image aurora-image--background" src={heroVideo} autoPlay muted loop playsInline />
          ) : (
            <img className="aurora-image aurora-image--background" src={heroImage || heroBackground} alt="Aurora background" decoding="async" />
          )}
        </div>

        <motion.div
          className="aurora-layer aurora-layer--fog"
          animate={{ x: [-16, 20, -16], y: [0, -10, 0], opacity: [0.24, 0.4, 0.24] }}
          transition={{ duration: 24, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <img className="aurora-fog-image" src={heroFog} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-layer aurora-layer--light"
          animate={{ x: [-8, 12, -8], rotate: [-0.25, 0.35, -0.25], opacity: [0.48, 0.7, 0.48] }}
          transition={{ duration: 22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <img className="aurora-light-image" src={heroLight} alt="" decoding="async" />
        </motion.div>

        <motion.div
          className="aurora-layer aurora-layer--dust"
          animate={{ opacity: [0.28, 0.55, 0.28] }}
          transition={{ duration: 18, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <img className="aurora-image" src={heroDust} alt="" decoding="async" />
        </motion.div>

        {floatingStars.map((star) => (
          <motion.span
            key={star.id}
            className="aurora-hero-star"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.2, 0.85, 0.2], scale: [0.7, 1, 0.7] }}
            transition={{ duration: 4.2 + star.delay, repeat: Infinity, ease: 'easeInOut' }}
            style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          />
        ))}

        <motion.div
          className="aurora-hero-content"
          style={prefersReducedMotion ? undefined : { opacity: heroOpacity, y: heroY }}
        >
          <HeroGlassCard className="aurora-hero-glass">
            <motion.p
              className="aurora-subtitle aurora-hero-subtitle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease: 'easeOut' }}
            >
              {subtitle}
            </motion.p>
            <motion.h1
              id="aurora-hero-title"
              className="aurora-title aurora-hero-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.35, ease: 'easeOut' }}
            >
              {coupleName}
            </motion.h1>
            <motion.p
              className="aurora-caption aurora-hero-caption"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.55, ease: 'easeOut' }}
            >
              {weddingDate}
            </motion.p>
            <motion.div
              className="aurora-hero-actions"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.8, ease: 'easeOut' }}
            >
              <motion.button
                type="button"
                className="aurora-hero-button"
                onClick={onViewInvitation}
                whileHover={{ y: -2, scale: 1.01, boxShadow: '0 14px 30px rgba(255,255,255,0.18)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {ctaText}
              </motion.button>
            </motion.div>
          </HeroGlassCard>

          <HeroScrollIndicator />
        </motion.div>
      </div>
    </motion.section>
  );
}
