import { motion, useReducedMotion } from 'framer-motion';
import '../../debugRender';
import '../../styles/story.css';
import storyImage from '../../../../../../assets/lumora/aurora/backgrounds/sky-pavilion.webp.png';
import storyFog from '../../../../../../assets/lumora/aurora/overlays/fog-01.png';
import storyLight from '../../../../../../assets/lumora/aurora/lighting/sunrise-light-rays.svg';
import storyDust from '../../../../../../assets/lumora/aurora/particles/white-dust.png';

const defaultIntro = 'A love story written in light, stillness, and the quiet grace of a shared beginning.';
const defaultQuote = '“A love that feels timeless the moment it is named.”';

export default function AuroraStory({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Story component mounted');
  }
  const intro = data?.story?.intro || defaultIntro;
  const quote = data?.story?.quote || defaultQuote;
  const storyParagraphs = data?.story?.paragraphs?.length ? data.story.paragraphs : [data?.story?.intro || defaultIntro].filter(Boolean);
  const storyVisualImage = data?.story?.image || storyImage;

  return (
    <section className="aurora-story-section" aria-labelledby="aurora-story-title">
      <div className="aurora-story-shell">
        <motion.div
          className="aurora-story-visual"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <div className="aurora-story-frame">
            <img className="aurora-story-image" src={storyVisualImage} alt="A cinematic Aurora editorial scene" loading="lazy" decoding="async" />
            <img className="aurora-story-fog" src={storyFog} alt="" />
            <img className="aurora-story-light" src={storyLight} alt="" />
            <img className="aurora-story-dust" src={storyDust} alt="" />
          </div>
        </motion.div>

        <motion.div
          className="aurora-story-copy"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <p className="aurora-story-eyebrow">Editorial Feature</p>
          <h2 className="aurora-story-title" id="aurora-story-title">{data?.story?.title || 'Our Story'}</h2>
          <p className="aurora-story-intro">{intro}</p>
          <div className="aurora-story-quote">{quote}</div>
          <div className="aurora-story-body">
            {storyParagraphs.map((paragraph, index) => (
              <p key={`${paragraph.slice(0, 12)}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
