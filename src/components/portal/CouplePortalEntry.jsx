import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchInvitationBySlug } from '../../lib/guestApi';
import { coupleLogin, getSavedCode, saveCode } from '../../lib/coupleApi';
import { themeFor } from '../../lib/guestThemes';
import { useThemeFonts } from '../../hooks/useThemeFonts';
import CodeEntryScreen from './CodeEntryScreen';
import CoupleExperience from './CoupleExperience';

function introSeenKey(slug) {
  return `lumora_couple_intro_seen_${slug}`;
}

export default function CouplePortalEntry({ slug, urlKey }) {
  // 'loading' -> 'need-code' -> 'authed'   (or 'not-found')
  const [phase, setPhase] = useState('loading');
  const [invData, setInvData] = useState(null);
  const [code, setCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [authing, setAuthing] = useState(false);
  const [authError, setAuthError] = useState('');

  // Loads only this invitation's theme fonts (3 families) — called before
  // any early return so hook order stays stable across phase changes.
  useThemeFonts(themeFor(invData?.template));

  // Step 1 — public read, just to get the couple's names/template so even
  // the code-entry screen is themed correctly, not a generic placeholder.
  useEffect(() => {
    let alive = true;
    fetchInvitationBySlug(slug)
      .then((data) => {
        if (!alive) return;
        if (!data) {
          setPhase('not-found');
          return;
        }
        setInvData(data);
        attemptAutoLogin(data);
      })
      .catch(() => alive && setPhase('not-found'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function attemptAutoLogin(data) {
    const candidate = urlKey || getSavedCode(slug);
    if (!candidate) {
      setPhase('need-code');
      return;
    }
    try {
      const result = await coupleLogin(slug, candidate);
      if (result) {
        saveCode(slug, candidate);
        setActiveCode(candidate);
        setInvData(result);
        setPhase('authed');
      } else {
        setPhase('need-code');
      }
    } catch {
      setPhase('need-code');
    }
  }

  async function handleSubmitCode(enteredCode) {
    setAuthing(true);
    setAuthError('');
    try {
      const result = await coupleLogin(slug, enteredCode);
      if (result) {
        saveCode(slug, enteredCode);
        setActiveCode(enteredCode);
        setInvData(result);
        setPhase('authed');
      } else {
        setAuthError('wrong');
      }
    } catch {
      setAuthError('generic');
    } finally {
      setAuthing(false);
    }
  }

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080b1a]">
        <motion.div
          className="h-10 w-10 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'rgba(212,175,55,0.8)', borderTopColor: 'transparent' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (phase === 'not-found') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#080b1a] px-6 text-center">
        <div style={{ color: '#f0d98c', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', fontStyle: 'italic' }}>
          This invitation could not be found.
        </div>
      </div>
    );
  }

  const theme = themeFor(invData?.template);
  const lang = invData?.language || 'en';

  if (phase === 'need-code') {
    return (
      <CodeEntryScreen
        theme={theme}
        lang={lang}
        groom={invData?.groom}
        bride={invData?.bride}
        code={code}
        setCode={setCode}
        busy={authing}
        error={authError}
        onSubmit={() => handleSubmitCode(code)}
      />
    );
  }

  const skipIntro = (() => {
    try {
      return sessionStorage.getItem(introSeenKey(slug)) === '1';
    } catch {
      return false;
    }
  })();

  function markIntroSeen() {
    try {
      sessionStorage.setItem(introSeenKey(slug), '1');
    } catch {
      /* noop */
    }
  }

  return (
    <CoupleExperience
      slug={slug}
      code={activeCode}
      data={invData}
      theme={theme}
      lang={lang}
      skipIntro={skipIntro}
      onIntroDone={markIntroSeen}
    />
  );
}
