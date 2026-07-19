import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestCard, SectionHeading, GuestInput, GuestButton } from './GuestUI';
import Reveal from './Reveal';
import { submitRsvp } from '../../../lib/guestApi';

export default function RSVPBlock({ theme, slug, t }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState('1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      await submitRsvp(slug, { name, status, guestCount });
      setDone(true);
    } catch (err) {
      setError(t.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <GuestCard theme={theme}>
        <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: theme.ease }}
              className="py-6 text-center"
            >
              <div className="mb-2 text-2xl" style={{ color: theme.accent }}>✦</div>
              <div style={{ color: theme.ink, fontFamily: theme.bodyFont, fontSize: '1.1rem', fontStyle: 'italic' }}>
                {t.thanks}
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4"
            >
              <GuestInput theme={theme} placeholder={t.namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} required />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: 'attending', label: t.attending },
                  { v: 'not_attending', label: t.notAttending },
                ].map((opt) => (
                  <label
                    key={opt.v}
                    className="cursor-pointer rounded-xl border px-4 py-3 text-center text-[0.85rem] transition-all duration-300"
                    style={{
                      borderColor: status === opt.v ? theme.accent : `rgba(${theme.accentRgb},0.25)`,
                      background: status === opt.v ? `linear-gradient(120deg, rgba(${theme.accentRgb},0.9), rgba(${theme.accentRgb},0.6))` : 'transparent',
                      color: status === opt.v ? '#fff' : theme.ink,
                      fontFamily: theme.uiFont,
                    }}
                  >
                    <input
                      type="radio"
                      name="rsvp-status"
                      value={opt.v}
                      checked={status === opt.v}
                      onChange={() => setStatus(opt.v)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              {status === 'attending' && (
                <GuestInput
                  theme={theme}
                  type="number"
                  min="1"
                  placeholder={t.countPlaceholder}
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                />
              )}

              {error && (
                <div className="text-[0.78rem]" style={{ color: '#c25a5a' }}>
                  {error}
                </div>
              )}

              <GuestButton theme={theme} type="submit" disabled={busy} style={{ width: '100%' }}>
                {busy ? t.sending : t.submit}
              </GuestButton>
            </motion.form>
          )}
        </AnimatePresence>
      </GuestCard>
    </Reveal>
  );
}
