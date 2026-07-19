import { motion } from 'framer-motion';
import { GuestCard, GuestInput, GuestButton } from '../guest/shared/GuestUI';
import { coupleCopy } from '../../lib/coupleCopy';

export default function CodeEntryScreen({ theme, lang, groom, bride, code, setCode, busy, error, onSubmit }) {
  const t = coupleCopy(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const coupleNames = groom && bride ? (lang === 'ar' ? `${groom} و${bride}` : `${groom} & ${bride}`) : '';

  function handleSubmit(e) {
    e.preventDefault();
    if (code.trim().length < 4 || busy) return;
    onSubmit();
  }

  return (
    <div
      dir={dir}
      className="fixed inset-0 flex items-center justify-center overflow-y-auto px-6 py-16"
      style={{ background: theme.bg }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: theme.duration, ease: theme.ease }}
        className="w-full max-w-md"
      >
        <GuestCard theme={theme}>
          <div className="mb-7 text-center">
            <div
              className="mb-3 text-[0.68rem] uppercase"
              style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.4em' }}
            >
              {t.entryKicker}
            </div>
            <h1
              style={{ color: theme.ink, fontFamily: theme.displayFont, fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', letterSpacing: '0.03em' }}
            >
              {t.entryTitle}
            </h1>
            {coupleNames && (
              <div className="mt-2 text-[0.95rem] italic" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
                {coupleNames}
              </div>
            )}
            <p className="mx-auto mt-4 max-w-[300px] text-[0.85rem] leading-relaxed" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont, fontStyle: 'italic' }}>
              {t.entrySub}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-[0.7rem] uppercase" style={{ color: theme.accent, fontFamily: theme.uiFont, letterSpacing: '0.2em' }}>
              {t.codeLabel}
            </label>
            <GuestInput
              theme={theme}
              inputMode="numeric"
              maxLength={6}
              placeholder={t.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }}
              autoFocus
            />

            {error === 'wrong' && (
              <div className="text-center text-[0.8rem]" style={{ color: '#c25a5a' }}>{t.wrongCode}</div>
            )}
            {error === 'generic' && (
              <div className="text-center text-[0.8rem]" style={{ color: '#c25a5a' }}>{t.genericError}</div>
            )}

            <GuestButton theme={theme} type="submit" disabled={busy || code.trim().length < 4} style={{ width: '100%', marginTop: 6 }}>
              {busy ? t.checking : t.enter}
            </GuestButton>
          </form>
        </GuestCard>
      </motion.div>
    </div>
  );
}
