import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TEMPLATE_REGISTRY } from '../lib/templateRegistry';
import { getTemplatePrice, CURRENCY } from '../lib/visitorPricing';
import { getTemplateRatingsSummary, getVisitorOwnRatings, rateTemplate } from '../lib/templateRatingsApi';
import { getVisitorToken } from '../lib/visitorIdentity';
import { sfxClick } from '../lib/sfx';
import StarRating from './StarRating';

// Shown to anyone who continues as a Guest on the login screen (no account
// needed). Reuses the same TEMPLATE_REGISTRY the owner's dashboard uses,
// but adds a price tag per template — pulled from visitorPricing.js for
// now, and from the real Settings panel once that's built — plus a real
// star rating (template_ratings.sql): one vote per visitor, averaged live,
// no fabricated numbers. A template with zero votes shows "New" instead
// of a made-up score.
export default function VisitorTemplateGallery({ onSelectTemplate, onBack }) {
  const [ratings, setRatings] = useState({}); // { [id]: { avgRating, ratingCount } }
  const [ownRatings, setOwnRatings] = useState({}); // { [id]: 1-5 }

  useEffect(() => {
    getTemplateRatingsSummary().then(setRatings).catch(() => {});
    getVisitorOwnRatings(getVisitorToken()).then(setOwnRatings).catch(() => {});
  }, []);

  async function handleRate(templateId, stars) {
    sfxClick();
    setOwnRatings((prev) => ({ ...prev, [templateId]: stars })); // optimistic
    try {
      const summary = await rateTemplate(getVisitorToken(), templateId, stars);
      setRatings((prev) => ({ ...prev, [templateId]: summary }));
    } catch {
      // rating just won't be reflected in the average if this failed — the
      // visitor's own stars stay showing what they clicked either way.
    }
  }

  return (
    <motion.div
      className="w-[min(920px,94vw)]"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mb-8 text-center">
        <div className="font-display text-[1.8rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
          Browse Our <span style={{ color: 'var(--gold-soft)' }}>Templates</span>
        </div>
        <div
          className="font-serif-alt mt-2 italic"
          style={{ color: 'rgba(246,244,239,0.55)', fontSize: '0.98rem' }}
        >
          Pick a design you love — no account or payment needed to reserve it.
        </div>
      </div>

      <div className="grid gap-[22px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))' }}>
        {TEMPLATE_REGISTRY.map((t, i) => (
          <motion.div
            key={t.id}
            className="tpl-gallery-card"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className={`tpl-gallery-preview tpl-preview-${t.id}`}>
              <div className={`tpl-gallery-ring tpl-ring-${t.id}`}>A&amp;S</div>
              <div className={`tpl-gallery-names tpl-names-${t.id}`}>
                Ahmed <span>&amp;</span> Sarah
              </div>
            </div>
            <div style={{ padding: '20px 22px 24px' }}>
              <div className="mb-1.5 flex items-center justify-between">
                <h3 className="font-display" style={{ fontSize: '1rem', color: 'var(--gold-soft)' }}>
                  {t.name}
                </h3>
                <span className="font-display text-[0.9rem] font-semibold" style={{ color: 'rgba(246,244,239,0.85)' }}>
                  {getTemplatePrice(t.id)} {CURRENCY}
                </span>
              </div>
              <p className="mb-3 text-[0.78rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.5)' }}>
                {t.tagline}
              </p>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {ratings[t.id] ? (
                    <>
                      <StarRating average={ratings[t.id].avgRating} size={13} />
                      <span className="text-[0.75rem] font-semibold" style={{ color: 'rgba(246,244,239,0.8)' }}>
                        {ratings[t.id].avgRating.toFixed(1)}
                      </span>
                      <span className="text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
                        ({ratings[t.id].ratingCount})
                      </span>
                    </>
                  ) : (
                    <span
                      className="rounded-full px-2 py-0.5 text-[0.68rem] uppercase"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold-soft)', letterSpacing: '0.08em' }}
                    >
                      New
                    </span>
                  )}
                </div>
                <div title={ownRatings[t.id] ? `You rated ${ownRatings[t.id]}/5 — tap to change` : 'Rate this template'}>
                  <StarRating value={ownRatings[t.id] || 0} onRate={(stars) => handleRate(t.id, stars)} size={14} interactive />
                </div>
              </div>

              <button
                type="button"
                className="btn-gold tpl-use-btn w-full"
                onClick={() => {
                  sfxClick();
                  onSelectTemplate?.(t);
                }}
              >
                Select This Template
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-[0.85rem]"
          style={{ color: 'rgba(246,244,239,0.45)' }}
        >
          ← Back to Sign In
        </button>
      </div>
    </motion.div>
  );
}
