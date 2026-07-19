import { motion } from 'framer-motion';
import '../../styles/opening.css';
import {
  BackgroundFrame,
  MarbleReflection,
  GlassOverlay,
  FogLayer,
  LightRays,
  DustParticles,
  Curtains,
  Typography,
} from '../../components';

import backgroundImage from '../../../../../../assets/lumora/aurora/backgrounds/royal-palace.webp.png';
import lightingImage from '../../../../../../assets/lumora/aurora/lighting/sunrise-light-rays.svg';
import fogImage from '../../../../../../assets/lumora/aurora/overlays/fog-01.png';
import marbleTexture from '../../../../../../assets/lumora/shared/textures/marble/white-marble.png';
import glassTexture from '../../../../../../assets/lumora/shared/textures/glass/clear-glass.png';
import dustTexture from '../../../../../../assets/lumora/aurora/particles/white-dust.png';
import leftCurtain from '../../../../../../assets/lumora/aurora/curtains/left-curtain.png';
import rightCurtain from '../../../../../../assets/lumora/aurora/curtains/right-curtain.png';

export default function AuroraOpening() {
  return (
    <motion.section
      className="aurora-opening"
      initial={{ opacity: 0, scale: 1.01 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.9, ease: 'easeOut' }}
    >
      <div className="aurora-scene" aria-label="Aurora opening cinematic scene">
        <BackgroundFrame image={backgroundImage} />
        <MarbleReflection texture={marbleTexture} />
        <GlassOverlay texture={glassTexture} />
        <FogLayer image={fogImage} />
        <LightRays image={lightingImage} />
        <DustParticles texture={dustTexture} />
        <Curtains leftImage={leftCurtain} rightImage={rightCurtain} />
        <Typography
          subtitle="A Morning Ceremony"
          title="Alexandra & Benjamin"
          caption="An intimate celebration — Aurora"
        />

        <motion.div
          className="aurora-opening-hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 2.2, ease: 'easeOut' }}
        >
          <div className="aurora-opening-hero-card">
            <p className="aurora-opening-hero-date">18 October 2026</p>
            <p className="aurora-opening-hero-venue">The Glass Pavilion • Aspen</p>
            <a className="aurora-opening-hero-button" href="#details">
              View invitation
            </a>
            <div className="aurora-opening-scroll">
              <span className="aurora-opening-scroll-line" />
              <span>Scroll</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
