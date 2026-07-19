import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfxClick, sfxError } from '../lib/sfx';
import { verifyOwnerLogin } from '../lib/authStore';
import { demoLogin } from '../lib/licenseApi';
import { createDemoSession } from '../lib/demoAuthStore';
import ForgotPasswordModal from './ForgotPasswordModal';
import VisitorTemplateGallery from './VisitorTemplateGallery';
import VisitorNameGate from './VisitorNameGate';
import VisitorWelcomeMessage from './VisitorWelcomeMessage';
import VisitorChat from './VisitorChat';
import LicenseSignupForm from './LicenseSignupForm';
import { getVisitorName } from '../lib/visitorIdentity';

// 'signin' (owner login) -> 'license' (create account with a license code)
// 'signin' -> 'guest-name' (name + email gate, skipped if already known) ->
//   'guest-welcome' (personal greeting) -> 'guest-gallery' (the store) -> 'guest-contact'
// 'signin' -> 'owner-name' -> 'owner-welcome' -> 'owner-contact' (short
// "Contact Owner" button — skips the gallery entirely for a visitor who
// already knows they want to order)
export default function LoginScreen({ onSuccess, onDemoSuccess }) {
  const [view, setView] = useState('signin');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [visitorDisplayName, setVisitorDisplayName] = useState(getVisitorName());

  // A returning visitor (same browser) already has a name saved — no need
  // to ask (or greet them) again, so these two entry points skip straight
  // past the gate and the welcome screen.
  function goToGuestFlow() {
    setView(getVisitorName() ? 'guest-gallery' : 'guest-name');
  }
  function goToOwnerContact() {
    setView(getVisitorName() ? 'owner-contact' : 'owner-name');
  }

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef(null);
  const btnRef = useRef(null);

  function handleFormMouseMove(e) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const inside =
      e.clientX > rect.left - 30 &&
      e.clientX < rect.right + 30 &&
      e.clientY > rect.top - 30 &&
      e.clientY < rect.bottom + 30;
    if (inside) {
      const relX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
      const relY = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
      btn.style.transform = `translate(${relX}px, ${relY}px)`;
    } else {
      btn.style.transform = 'translate(0,0)';
    }
  }

  function handleFormMouseLeave() {
    if (btnRef.current) btnRef.current.style.transform = 'translate(0,0)';
  }

  function spawnRipple(e) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = `${size}px`;
    r.style.left = `${e.clientX - rect.left - size / 2}px`;
    r.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
    sfxClick();
  }

  function failLogin() {
    sfxError();
    setError(true);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setError(false), 1400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const u = username.trim();
    const p = password;

    if (verifyOwnerLogin(u, p)) {
      setSubmitting(true);
      setError(false);
      onSuccess?.();
      return;
    }

    // Not the owner — try it as an existing member (demo) account before
    // giving up. Member accounts are created via the license code flow
    // (see LicenseSignupForm) and are completely separate from the owner.
    setSubmitting(true);
    const result = await demoLogin(u, p);
    setSubmitting(false);
    if (result.ok) {
      setError(false);
      createDemoSession(result.account);
      onDemoSuccess?.(result.account);
    } else {
      failLogin();
    }
  }

  if (view === 'guest-name') {
    return (
      <VisitorNameGate
        onContinue={({ name }) => {
          setVisitorDisplayName(name);
          setView('guest-welcome');
        }}
        onBack={() => setView('signin')}
      />
    );
  }

  if (view === 'owner-name') {
    return (
      <VisitorNameGate
        onContinue={({ name }) => {
          setVisitorDisplayName(name);
          setView('owner-welcome');
        }}
        onBack={() => setView('signin')}
      />
    );
  }

  if (view === 'guest-welcome') {
    return <VisitorWelcomeMessage name={visitorDisplayName} onContinue={() => setView('guest-gallery')} />;
  }

  if (view === 'owner-welcome') {
    return <VisitorWelcomeMessage name={visitorDisplayName} onContinue={() => setView('owner-contact')} />;
  }

  if (view === 'guest-gallery') {
    return (
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-start overflow-y-auto px-6 pt-16 pb-16">
        <VisitorTemplateGallery
          onSelectTemplate={(t) => {
            setSelectedTemplate(t);
            setView('guest-contact');
          }}
          onBack={() => setView('signin')}
        />
      </div>
    );
  }

  if (view === 'guest-contact') {
    return (
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
        <VisitorChat template={selectedTemplate} onBack={() => setView('signin')} />
      </div>
    );
  }

  if (view === 'owner-contact') {
    return (
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
        <VisitorChat template={null} onBack={() => setView('signin')} />
      </div>
    );
  }

  if (view === 'license') {
    return (
      <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
        <LicenseSignupForm onBack={() => setView('signin')} onAccountCreated={onDemoSuccess} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
      <motion.div
        className="mb-9 text-center animate-float-logo"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <div
          className="font-display gold-text-shine animate-shine pl-[0.32em] font-bold"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 3.6rem)', letterSpacing: '0.32em' }}
        >
          LUMORA
        </div>
        <div
          className="font-serif-alt mt-2.5 italic"
          style={{ fontSize: '0.95rem', letterSpacing: '0.08em', color: 'rgba(246,244,239,0.55)' }}
        >
          Where Love Becomes an Experience
        </div>
      </motion.div>

      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        onMouseMove={handleFormMouseMove}
        onMouseLeave={handleFormMouseLeave}
        autoComplete="off"
        className={`glass-card animate-float-card w-[min(420px,90vw)] rounded-[22px] px-[38px] pt-11 pb-9 ${shake ? 'animate-shake' : ''}`}
        style={error ? { boxShadow: '0 0 0 1px rgba(224,138,138,0.5), 0 30px 80px -20px rgba(0,0,0,0.75)' } : undefined}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
      >
        <div className="font-display mb-2 text-center text-2xl font-semibold" style={{ letterSpacing: '0.06em' }}>
          Welcome Back
        </div>
        <div
          className="font-serif-alt mb-8 text-center italic"
          style={{ fontSize: '1rem', color: 'rgba(246,244,239,0.55)' }}
        >
          Create unforgettable wedding experiences.
        </div>

        <div
          className="overflow-hidden text-center text-xs"
          style={{
            color: '#e08a8a',
            maxHeight: error ? '40px' : '0px',
            opacity: error ? 1 : 0,
            marginBottom: error ? '14px' : '0px',
            transition: 'all 0.35s ease',
          }}
        >
          Incorrect username or password.
        </div>

        <div className="field relative mb-6">
          <svg
            className="field-icon pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            style={{ color: 'rgba(212,175,55,0.65)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
          <input
            id="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`field-input ${username ? 'filled' : ''}`}
          />
          <label htmlFor="username" className="field-label">
            Username
          </label>
        </div>

        <div className="field relative mb-6">
          <svg
            className="field-icon pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            style={{ color: 'rgba(212,175,55,0.65)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field-input ${password ? 'filled' : ''}`}
          />
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <button
            type="button"
            aria-label="Show password"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute top-1/2 right-3.5 h-[18px] w-[18px] -translate-y-1/2"
            style={{ color: 'rgba(246,244,239,0.4)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        <div className="-mt-2 mb-6 text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-[0.78rem]"
            style={{ color: 'rgba(212,175,55,0.75)' }}
          >
            Forgot password?
          </button>
        </div>

        <button
          ref={btnRef}
          type="submit"
          disabled={submitting}
          onClick={spawnRipple}
          className="relative w-full overflow-hidden rounded-xl py-4 font-semibold tracking-wide transition-transform"
          style={{
            background: 'linear-gradient(100deg,#7a601f,#D4AF37 35%,#f0d98c 60%,#D4AF37 85%,#7a601f)',
            color: '#1a1204',
            transition: 'transform 0.15s ease',
          }}
        >
          Enter Lumora
        </button>
        <div
          className="font-serif-alt mt-4 mb-6 text-center italic"
          style={{ fontSize: '0.82rem', color: 'rgba(246,244,239,0.4)' }}
        >
          Step into a universe made for your story
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.18)' }} />
          <span className="text-[0.7rem] uppercase" style={{ color: 'rgba(246,244,239,0.35)', letterSpacing: '0.2em' }}>
            or
          </span>
          <div className="h-px flex-1" style={{ background: 'rgba(212,175,55,0.18)' }} />
        </div>

        <button
          type="button"
          onClick={() => {
            sfxClick();
            goToGuestFlow();
          }}
          className="btn-ghost w-full rounded-xl py-3.5 text-center font-semibold"
        >
          Continue as Guest
        </button>

        <div className="mt-5 text-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
          Have a license code?{' '}
          <button
            type="button"
            onClick={() => {
              sfxClick();
              setView('license');
            }}
            style={{ color: 'rgba(212,175,55,0.85)' }}
          >
            Create an account
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            sfxClick();
            goToOwnerContact();
          }}
          className="btn-ghost mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-center text-[0.82rem] font-semibold"
        >
          <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-4.5a8.5 8.5 0 1 1 17-4Z" />
          </svg>
          Contact Owner to Order
        </button>
      </motion.form>

      <AnimatePresence>
        {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
      </AnimatePresence>
    </div>
  );
}
