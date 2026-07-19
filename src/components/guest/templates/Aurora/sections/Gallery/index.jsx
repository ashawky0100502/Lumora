import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import '../../debugRender';
import './gallery.css';

function normalizeGalleryImages(data) {
  const parsedImages = (data?.gallery?.images || []).map((item, index) => ({
    src: typeof item === 'string' ? item : item?.src || '',
    alt: typeof item === 'string' ? `Luxury wedding photography ${index + 1}` : item?.alt || `Luxury wedding photography ${index + 1}`,
  })).filter((item) => item.src);

  return parsedImages;
}

export default function AuroraGallery({ data = {} }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] Gallery component mounted');
  }
  const [activeIndex, setActiveIndex] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, 42]);
  const cardParallax = useTransform(scrollY, [0, 800], [0, 24]);

  const galleryImages = useMemo(() => normalizeGalleryImages(data), [data]);
  const galleryTitle = useMemo(() => data?.gallery?.title || 'A study in candlelight and calm', [data]);
  const galleryCopy = useMemo(() => data?.gallery?.description || 'A quiet composition of intimate portraits, softened light, and the kind of elegance that feels effortless at first glance.', [data]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoaded(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      } else if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current === null ? 0 : (current + 1) % galleryImages.length));
      } else if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current === null ? galleryImages.length - 1 : (current - 1 + galleryImages.length) % galleryImages.length));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, galleryImages.length]);

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeIndex]);

  if (!galleryImages.length) return null;

  const openLightbox = (index) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);
  const showPrev = () => setActiveIndex((current) => (current === null ? 0 : (current - 1 + galleryImages.length) % galleryImages.length));
  const showNext = () => setActiveIndex((current) => (current === null ? 0 : (current + 1) % galleryImages.length));

  const heroImage = galleryImages[0];
  const masonryImages = galleryImages.slice(1);

  return (
    <section className="aurora-gallery" aria-labelledby="aurora-gallery-title">
      <div className="aurora-gallery__inner">
        <div className="aurora-gallery__intro">
          <p className="aurora-gallery__eyebrow">Private gallery</p>
          <h2 id="aurora-gallery-title" className="aurora-gallery__title">{galleryTitle}</h2>
          <p className="aurora-gallery__copy">{galleryCopy}</p>
        </div>

        <motion.div
          className="aurora-gallery__hero"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? false : { opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={prefersReducedMotion ? undefined : { y: heroParallax }}
        >
          <img className="aurora-gallery__hero-image" src={heroImage.src} alt={heroImage.alt} loading="eager" decoding="async" />
          <div className="aurora-gallery__hero-overlay" />
          <div className="aurora-gallery__hero-caption">
            <span>Editorial feature</span>
            <strong>Quiet luxury, framed in light.</strong>
          </div>
        </motion.div>

        <motion.div
          className="aurora-gallery__masonry"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? false : { opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 24 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {masonryImages.map((item, index) => {
            const className = index % 3 === 0
              ? 'aurora-gallery__item--tall'
              : index % 2 === 0
                ? 'aurora-gallery__item--wide'
                : 'aurora-gallery__item--balanced';

            return (
              <motion.button
                key={`${item.src}-${index}`}
                type="button"
                className={`aurora-gallery__item ${className}`}
                onClick={() => openLightbox(index + 1)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.015, y: -6 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                style={prefersReducedMotion ? undefined : { y: cardParallax }}
              >
                <img className="aurora-gallery__item-image" src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                <div className="aurora-gallery__item-glow" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {activeIndex !== null && galleryImages[activeIndex] ? (
          <motion.div
            className="aurora-lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Full screen gallery"
          >
            <motion.div
              className="aurora-lightbox__shell"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <img className="aurora-lightbox__image" src={galleryImages[activeIndex].src} alt={galleryImages[activeIndex].alt} decoding="async" />
              {galleryImages.length > 1 ? (
                <>
                  <button type="button" className="aurora-lightbox__nav aurora-lightbox__nav--prev" onClick={showPrev} aria-label="View previous image">←</button>
                  <button type="button" className="aurora-lightbox__nav aurora-lightbox__nav--next" onClick={showNext} aria-label="View next image">→</button>
                </>
              ) : null}
              <button type="button" className="aurora-lightbox__close" onClick={closeLightbox} aria-label="Close gallery">✕</button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
