import { motion, useReducedMotion } from 'framer-motion';
import '../../debugRender';
import '../../styles/quran-verse.css';

export default function AuroraQuranVerse({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Quran component mounted');
  }
  const enabled = data?.quran?.enabled !== false;
  const verseArabic = data?.quran?.verseArabic || '';
  const verseTranslation = data?.quran?.verseTranslation || '';
  const surahName = data?.quran?.surahName || '';
  const audioUrl = data?.quran?.audioUrl || '';

  if (!enabled) return null;
  if (!verseArabic && !verseTranslation && !surahName) return null;

  return (
    <motion.section
      className="aurora-quran-verse"
      aria-labelledby="aurora-quran-title"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="aurora-quran-verse__halo" />
      <div className="aurora-quran-verse__radiance" />
      <div className="aurora-quran-verse__mist" />

      <div className="aurora-quran-verse__stage">
        <motion.div
          className="aurora-quran-verse__frame"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.95, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-quran-verse__frame-glow" />
          <div className="aurora-quran-verse__column aurora-quran-verse__column--left" />
          <div className="aurora-quran-verse__column aurora-quran-verse__column--right" />
          <div className="aurora-quran-verse__arch" />
          <div className="aurora-quran-verse__arch-core" />
          <div className="aurora-quran-verse__arch-lines" />
          <div className="aurora-quran-verse__arch-sheen" />
          <motion.div
            className="aurora-quran-verse__scripture"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.24 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="aurora-quran-verse__label" id="aurora-quran-title">Quran Verse</p>
            <div className="aurora-quran-verse__ornament" />
            {verseArabic ? (
              <p className="aurora-quran-verse__arabic" dir="rtl" lang="ar">
                {verseArabic}
              </p>
            ) : null}
            {verseTranslation ? (
              <p className="aurora-quran-verse__translation">{verseTranslation}</p>
            ) : null}
            {surahName ? (
              <p className="aurora-quran-verse__surah">{surahName}</p>
            ) : null}
            {audioUrl ? (
              <a className="aurora-quran-verse__audio" href={audioUrl} target="_blank" rel="noreferrer">
                Listen
              </a>
            ) : null}
          </motion.div>
          <div className="aurora-quran-verse__dust aurora-quran-verse__dust--a" />
          <div className="aurora-quran-verse__dust aurora-quran-verse__dust--b" />
          <div className="aurora-quran-verse__dust aurora-quran-verse__dust--c" />
        </motion.div>
      </div>
    </motion.section>
  );
}
