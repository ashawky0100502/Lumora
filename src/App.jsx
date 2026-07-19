import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SoundToggle from './components/SoundToggle';
import GuestView from './components/guest/GuestView';
import { createOwnerSession, clearOwnerSession, hasOwnerSession } from './lib/authStore';
import { getDemoSession, createDemoSession, clearDemoSession } from './lib/demoAuthStore';
import { validateDemoSession } from './lib/licenseApi';
import { loadFontFamilies } from './lib/fontLoader';

// The dashboard/login chrome only ever uses these 3 families (see
// .font-display / .font-serif-alt / body in index.css) — guests and the
// couple portal load their own theme's fonts separately (see
// hooks/useThemeFonts) and never touch this list.
const CHROME_FONTS = ['Cinzel', 'Cormorant Garamond', 'Manrope'];

// Everything below is only ever needed by the LUMORA team (owner dashboard)
// or the couple's private portal — never by a guest opening an invitation
// link. Loading them lazily means Vite ships them as separate chunks that
// are only fetched over the network when that branch actually renders.
// GalaxyBackground alone pulls in three.js, which is a big chunk of JS a
// guest on a phone was previously downloading and parsing for a starfield
// they'd never see.
const GalaxyBackground = lazy(() => import('./components/GalaxyBackground'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const CinematicSequence = lazy(() => import('./components/cinematic/CinematicSequence'));
const Dashboard = lazy(() => import('./components/dashboard/Dashboard'));
const CouplePortalEntry = lazy(() => import('./components/portal/CouplePortalEntry'));

// A guest opening a shared invitation link (?invite=<slug>) never sees the
// login/dashboard shell at all — bail out to the public guest page first.
const inviteSlug = new URLSearchParams(window.location.search).get('invite');

// Likewise, the couple opening their private link (?couple=<slug>&key=<code>)
// goes straight to their own portal — never the LUMORA staff login/dashboard.
const coupleSlug = new URLSearchParams(window.location.search).get('couple');
const coupleKey = new URLSearchParams(window.location.search).get('key');

// If the owner already has an active session (e.g. they refreshed the
// page), skip the login screen and the cinematic curtain sequence
// entirely and drop them straight into the dashboard. A member (demo)
// session does the same, but is re-validated against the live license
// state right after mount (see the effect below) since it may have been
// disabled/deleted by the owner since this browser last checked.
const ownerAlreadyLoggedIn = hasOwnerSession();
const existingDemoSession = ownerAlreadyLoggedIn ? null : getDemoSession();
const alreadyLoggedIn = ownerAlreadyLoggedIn || !!existingDemoSession;

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#080b1a]">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-t-transparent"
        style={{ borderColor: 'rgba(212,175,55,0.7)', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

export default function App() {
  // 'login' -> 'cinematic' (curtain sequence playing) -> 'app' (sequence done)
  // Member (demo) accounts skip the cinematic sequence — that intro is
  // LUMORA-team branding, not part of what a member signs up for.
  const [stage, setStage] = useState(alreadyLoggedIn ? 'app' : 'login');
  const [dashboardMounted, setDashboardMounted] = useState(ownerAlreadyLoggedIn);
  const [demoAccount, setDemoAccount] = useState(existingDemoSession);
  const [demoChecked, setDemoChecked] = useState(!existingDemoSession);

  // Shared imperative state the galaxy reads every frame (dim/freeze the
  // starfield during the cinematic curtain sequence) without triggering
  // React re-renders on every tick.
  const galaxyControls = useRef({ galaxyDark: 0, starsFrozen: false });

  // Guests and the couple portal never render this dashboard/login chrome,
  // so they never pay for Cinzel/Cormorant Garamond/Manrope either.
  useEffect(() => {
    if (!inviteSlug && !coupleSlug) loadFontFamilies(CHROME_FONTS);
  }, []);

  // A returning member's session is re-checked against the live license
  // state (disabled/expired/deleted) right after mount — a stale local
  // session should never keep someone in once the owner has revoked it.
  useEffect(() => {
    if (!existingDemoSession) return;
    validateDemoSession(existingDemoSession.accountId).then((result) => {
      if (result.ok) {
        createDemoSession(result.account); // refresh cached permissions
        setDemoAccount(result.account);
        setDashboardMounted(true);
      } else {
        clearDemoSession();
        setDemoAccount(null);
        setStage('login');
      }
      setDemoChecked(true);
    });
  }, []);

  if (inviteSlug) {
    return <GuestView slug={inviteSlug} />;
  }

  if (coupleSlug) {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <CouplePortalEntry slug={coupleSlug} urlKey={coupleKey} />
      </Suspense>
    );
  }

  function handleLogout() {
    clearOwnerSession();
    clearDemoSession();
    setDemoAccount(null);
    galaxyControls.current.galaxyDark = 0;
    galaxyControls.current.starsFrozen = false;
    setDashboardMounted(false);
    setStage('login');
  }

  function handleLoginSuccess() {
    createOwnerSession();
    setStage('cinematic');
  }

  // Member (demo) account just signed up or logged in — session is already
  // written to localStorage by LoginScreen/LicenseSignupForm at this point.
  function handleDemoLoginSuccess(account) {
    setDemoAccount(account);
    setDemoChecked(true);
    setDashboardMounted(true);
    setStage('app');
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <div id="app" className="fixed inset-0 overflow-hidden">
        <GalaxyBackground controlsRef={galaxyControls} />

        <div
          id="vignette"
          className="pointer-events-none fixed inset-0 z-[1]"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        <SoundToggle />

        <AnimatePresence>
          {stage === 'login' && (
            <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
              <LoginScreen onSuccess={handleLoginSuccess} onDemoSuccess={handleDemoLoginSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'cinematic' && (
          <CinematicSequence
            galaxyControls={galaxyControls}
            onRevealDashboard={() => setDashboardMounted(true)}
            onDone={() => setStage('app')}
          />
        )}

        {stage === 'app' && !dashboardMounted && !demoChecked && <FullScreenLoader />}

        {dashboardMounted && (
          <Dashboard
            onLogout={handleLogout}
            session={demoAccount ? { type: 'demo', account: demoAccount } : { type: 'owner' }}
          />
        )}
      </div>
    </Suspense>
  );
}
