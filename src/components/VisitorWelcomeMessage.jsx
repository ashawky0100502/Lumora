import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { sfxClick, sfxSuccess } from '../lib/sfx';

// A short, personal beat between the name/email gate and the store —
// confirms the visitor's details went through and greets them by name
// before they land in VisitorTemplateGallery.jsx. Auto-advances after a
// few seconds, but "Continue" is always there for anyone who doesn't want
// to wait.
export default function VisitorWelcomeMessage({ name, onContinue }) {
  const firstName = (name || '').trim().split(' ')[0] || 'there';

  useEffect(() => {
    sfxSuccess();
    const t = setTimeout(() => onContinue(), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
      <motion.div
        className="glass-card w-[min(420px,90vw)] rounded-[22px] px-[38px] pt-12 pb-9 text-center"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)' }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="var(--gold-soft)" strokeWidth="1.8">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </motion.div>

        <div className="font-display mb-2 text-2xl font-semibold" style={{ letterSpacing: '0.04em' }}>
          Welcome, <span style={{ color: 'var(--gold-soft)' }}>{firstName}</span>!
        </div>
        <div
          className="font-serif-alt mb-8 italic"
          style={{ fontSize: '0.95rem', color: 'rgba(246,244,239,0.55)', lineHeight: 1.7 }}
        >
          So glad you're here. Let's find the perfect design for your story.
        </div>

        <button
          type="button"
          onClick={() => {
            sfxClick();
            onContinue();
          }}
          className="btn-gold w-full rounded-xl py-3.5 text-center font-semibold"
        >
          Continue to Templates
        </button>
      </motion.div>
    </div>
  );
}
