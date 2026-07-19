import { motion } from 'framer-motion';
import { TEMPLATE_REGISTRY } from '../../lib/templateRegistry';
import { sfxClick } from '../../lib/sfx';

export default function TemplatesView({ onUseTemplate, allowedTemplates = null }) {
  const templates = allowedTemplates
    ? TEMPLATE_REGISTRY.filter((t) => allowedTemplates.includes(t.id))
    : TEMPLATE_REGISTRY;

  return (
    <div>
      <div id="welcome-block" className="mb-9">
        <div className="font-display text-[2rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
          Choose a <span style={{ color: 'var(--gold-soft)' }}>Template</span>
        </div>
        <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '1.05rem' }}>
          Every template comes with its own opening animation, color story and layout — pick one to start designing.
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="py-10 text-center text-[0.85rem] italic" style={{ color: 'rgba(246,244,239,0.4)' }}>
          No templates are available on your account yet. Contact LUMORA to get access.
        </div>
      ) : (
        <div className="grid gap-[26px]" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))' }}>
          {templates.map((t, i) => (
          <motion.div
            key={t.id}
            className="tpl-gallery-card"
            initial={{ opacity: 0, y: 26, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className={`tpl-gallery-preview tpl-preview-${t.id}`}>
              <div className={`tpl-gallery-ring tpl-ring-${t.id}`}>A&amp;S</div>
              <div className={`tpl-gallery-names tpl-names-${t.id}`}>
                Ahmed <span>&amp;</span> Sarah
              </div>
            </div>
            <div style={{ padding: '22px 24px 26px' }}>
              <h3 className="font-display mb-2" style={{ fontSize: '1.05rem', color: 'var(--gold-soft)' }}>
                {t.name}{' '}
                <span
                  className="ml-1 align-middle text-[0.62rem] font-normal"
                  style={{ letterSpacing: '0.04em', color: t.readyMade ? '#8ce0a8' : 'rgba(246,244,239,0.5)' }}
                >
                  · {t.badge}
                </span>
              </h3>
              <p className="mb-[18px] text-[0.82rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.55)' }}>
                {t.tagline}
              </p>
              <button
                type="button"
                className="btn-gold tpl-use-btn w-full"
                onClick={() => {
                  sfxClick();
                  onUseTemplate?.(t.id);
                }}
              >
                Use This Template
              </button>
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
