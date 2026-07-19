import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Gate from '../guest/shared/Gate';
import { coupleCopy } from '../../lib/coupleCopy';
import CongratsScreen from './CongratsScreen';
import PortalShell from './PortalShell';

export default function CoupleExperience({ slug, code, data, theme, lang, skipIntro, onIntroDone }) {
  // 'gate' -> 'congrats' -> 'portal'
  const [stage, setStage] = useState(skipIntro ? 'portal' : 'gate');
  const t = coupleCopy(lang);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const dateStr = data.date
    ? new Date(`${data.date}T${data.time || '00:00'}`).toLocaleDateString(lang === 'ar' ? 'ar' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  function handleGateOpen() {
    setStage('congrats');
  }

  function handleCongratsContinue() {
    onIntroDone();
    setStage('portal');
  }

  return (
    <div dir={dir} className="fixed inset-0 h-screen w-full overflow-hidden" style={{ background: theme.bg }}>
      <AnimatePresence mode="wait">
        {stage === 'gate' && (
          <Gate
            key="gate"
            theme={theme}
            variant={theme.gate}
            groom={data.groom}
            bride={data.bride}
            dateStr={dateStr}
            kicker={t.gateKicker}
            sub={t.gateSub}
            openLabel={t.gateOpenLabel}
            scratchHint={t.gateScratch}
            scratchSkip={t.gateScratchSkip}
            onOpen={handleGateOpen}
          />
        )}

        {stage === 'congrats' && (
          <CongratsScreen
            key="congrats"
            theme={theme}
            lang={lang}
            groom={data.groom}
            bride={data.bride}
            onContinue={handleCongratsContinue}
          />
        )}

        {stage === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: theme.ease }}
            className="h-full w-full"
          >
            <PortalShell slug={slug} code={code} data={data} theme={theme} lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
