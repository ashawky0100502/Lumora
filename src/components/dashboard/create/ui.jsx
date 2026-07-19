import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { sfxClick } from '../../../lib/sfx';

/* ============================================================
   Floating-label text / date / time input — reuses the existing
   .field-input / .field-label pair defined in index.css so it
   matches the login screen's input styling exactly.
============================================================= */
export function Field({ label, value, onChange, type = 'text', placeholder, hint, className = '' }) {
  // Date/time inputs always show their own native placeholder chrome
  // (mm/dd/yyyy etc.), so the floating label needs to start "up" for
  // those — otherwise it collides with the browser's own hint text.
  const alwaysFloated = type === 'date' || type === 'time';
  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        className={`field-input ${value || alwaysFloated ? 'filled' : ''}`}
        style={{ padding: '17px 16px' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label className="field-label" style={{ left: '16px' }}>
        {label}
      </label>
      {(hint || placeholder) && (
        <div className="mt-1.5 text-[0.72rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.42)' }}>
          {hint || placeholder}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Section heading used inside a step ("Names of the Couple" etc.)
============================================================= */
export function StepHeading({ title, sub, className = '' }) {
  return (
    <div className={className}>
      <h2 className="font-display text-[1.2rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
        {title}
      </h2>
      {sub && (
        <div className="font-serif-alt mt-1.5 mb-5 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '0.98rem' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Romantic textarea with an optional "✨ Suggest" one-tap AI-style
   panel underneath — the signature "smart" touch across the wizard.
============================================================= */
export function SuggestTextArea({ label, value, onChange, placeholder, rows = 4, suggestions, lang, suggestLabel }) {
  const [open, setOpen] = useState(false);
  const options = suggestions ? suggestions.filter((s) => s.lang === lang) : [];

  return (
    <div className="form-group">
      <label className="mb-2 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)', letterSpacing: '0.03em' }}>
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="font-serif-alt w-full rounded-xl border px-4 py-3.5 outline-none transition-colors duration-300"
        style={{
          background: 'rgba(0,0,0,0.25)',
          borderColor: value ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.22)',
          color: 'var(--white)',
          fontSize: '1.02rem',
          resize: 'vertical',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
        onBlur={(e) => (e.target.style.borderColor = value ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.22)')}
      />
      {suggestions && (
        <>
          <button
            type="button"
            className="btn-ghost mt-2.5"
            style={{ fontSize: '0.8rem' }}
            onClick={() => {
              sfxClick();
              setOpen((o) => !o);
            }}
          >
            ✨ {suggestLabel || 'اقترح لي / Suggest'}
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-3 flex flex-col gap-2.5 overflow-hidden"
              >
                {options.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.06 }}
                    whileHover={{ borderColor: 'rgba(212,175,55,0.8)', y: -2 }}
                    className="font-serif-alt cursor-pointer rounded-xl border px-4 py-3.5 italic leading-relaxed"
                    style={{
                      borderColor: 'rgba(212,175,55,0.22)',
                      background: 'rgba(0,0,0,0.22)',
                      color: 'rgba(246,244,239,0.85)',
                      fontSize: '0.96rem',
                    }}
                    onClick={() => {
                      sfxClick();
                      onChange(s.text);
                      setOpen(false);
                    }}
                  >
                    {s.text}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Single photo upload box (click-to-upload, shows preview + remove)
============================================================= */
export function UploadBox({ label, value, onFile, onRemove, className = '' }) {
  return (
    <div
      className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border text-center transition-colors duration-300 ${className}`}
      style={{ borderColor: 'rgba(212,175,55,0.25)', background: 'rgba(0,0,0,0.2)' }}
      onClick={(e) => {
        if (e.target.closest('.remove-photo')) return;
        document.getElementById(`up-${label}`)?.click();
      }}
    >
      {value ? (
        <>
          <img src={value} alt={label} className="absolute inset-0 h-full w-full object-cover" />
          <button
            type="button"
            className="remove-photo absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            ✕
          </button>
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" style={{ color: 'rgba(246,244,239,0.4)' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-5-5-9 9" />
          </svg>
          <span className="px-2 text-[0.75rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
            {label}
          </span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        id={`up-${label}`}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ============================================================
   Multi-photo gallery uploader (engagement photos, outings...)
============================================================= */
export function MultiUploadGrid({ photos, onAdd, onRemove }) {
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
      {photos.map((src, i) => (
        <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border" style={{ borderColor: 'rgba(212,175,55,0.22)' }}>
          <img src={src} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem]"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            onClick={() => onRemove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      <label
        className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-center transition-colors duration-300 hover:border-[var(--gold)]"
        style={{ borderColor: 'rgba(212,175,55,0.25)', background: 'rgba(0,0,0,0.18)' }}
      >
        <span style={{ color: 'rgba(246,244,239,0.5)', fontSize: '1.3rem' }}>+</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach((f) => onAdd(f));
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

/* ============================================================
   iOS-style toggle switch used for the section show/hide list
============================================================= */
export function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => {
        sfxClick();
        onChange(!checked);
      }}
      className="relative h-[26px] w-[46px] flex-shrink-0 rounded-full transition-colors duration-300"
      style={{ background: checked ? 'var(--gold)' : 'rgba(246,244,239,0.18)' }}
    >
      <motion.span
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow"
        animate={{ left: checked ? 23 : 3 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3.5"
      style={{ borderColor: 'rgba(212,175,55,0.14)', background: 'rgba(0,0,0,0.16)' }}
    >
      <div>
        <div className="text-[0.86rem]" style={{ color: 'var(--white)' }}>
          {label}
        </div>
        <div className="mt-0.5 text-[0.74rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
          {desc}
        </div>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

/* ============================================================
   Radio "swatch" card used for template / theme / motif / gate
   style pickers.
============================================================= */
export function SwatchOption({ name, value, checked, onChange, label, sublabel, preview, previewClassName }) {
  return (
    <label
      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-300"
      style={{
        borderColor: checked ? 'var(--gold)' : 'rgba(212,175,55,0.18)',
        background: checked ? 'rgba(212,175,55,0.1)' : 'rgba(0,0,0,0.16)',
        boxShadow: checked ? '0 0 0 1px var(--gold)' : 'none',
      }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => {
          sfxClick();
          onChange(value);
        }}
        className="hidden"
      />
      <div className={`h-12 w-full rounded-lg ${previewClassName || ''}`} style={previewClassName ? undefined : preview} />
      <div className="text-[0.76rem]" style={{ color: checked ? 'var(--gold-soft)' : 'rgba(246,244,239,0.65)' }}>
        {label}
        {sublabel && (
          <>
            <br />
            <small style={{ opacity: 0.6, fontWeight: 400 }}>{sublabel}</small>
          </>
        )}
      </div>
    </label>
  );
}

/* ============================================================
   Back / Skip / Next footer row shown at the bottom of every step
============================================================= */
export function StepActions({ onBack, onNext, onSkip, nextLabel = 'Next', nextDisabled }) {
  return (
    <div className="mt-8 flex items-center justify-between border-t pt-6" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
      <div>
        {onBack ? (
          <button type="button" className="btn-ghost" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="flex items-center gap-3">
        {onSkip && (
          <button type="button" className="btn-ghost" onClick={onSkip}>
            Skip
          </button>
        )}
        <button type="button" className="btn-gold" disabled={nextDisabled} onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

export const stepMotion = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
};
