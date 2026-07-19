import { useState } from 'react';
import { motion } from 'framer-motion';
import { checkLicenseCode, createDemoAccount } from '../lib/licenseApi';
import { createDemoSession } from '../lib/demoAuthStore';
import { sfxClick, sfxError, sfxSuccess } from '../lib/sfx';

// Step 1: verify the code. Step 2 (only shown once the code is valid):
// name + username + password → creates a real, isolated member account
// tied to that one code (see supabase/demo_accounts.sql) and signs them
// straight in.
export default function LicenseSignupForm({ onBack, onAccountCreated }) {
  const [step, setStep] = useState('code'); // 'code' | 'register'
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleCheckCode(e) {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    sfxClick();
    const result = await checkLicenseCode(code.trim());
    setSubmitting(false);
    if (result.ok) {
      sfxSuccess();
      setMessage('');
      setStep('register');
    } else {
      sfxError();
      setMessage(result.message);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    sfxClick();
    const result = await createDemoAccount({
      code: code.trim(),
      displayName: displayName.trim(),
      username: username.trim(),
      password,
    });
    setSubmitting(false);
    if (!result.ok) {
      sfxError();
      setMessage(result.message);
      return;
    }
    sfxSuccess();
    createDemoSession(result.account);
    onAccountCreated?.(result.account);
  }

  if (step === 'register') {
    return (
      <motion.form
        onSubmit={handleRegister}
        autoComplete="off"
        className="glass-card w-[min(420px,90vw)] rounded-[22px] px-[38px] pt-11 pb-9"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="font-display mb-2 text-center text-2xl font-semibold" style={{ letterSpacing: '0.06em' }}>
          Create Your Account
        </div>
        <div
          className="font-serif-alt mb-8 text-center italic"
          style={{ fontSize: '1rem', color: 'rgba(246,244,239,0.55)' }}
        >
          Code verified. Set up your account to continue.
        </div>

        <div className="field relative mb-6">
          <input
            id="display-name"
            type="text"
            required
            autoFocus
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={`field-input ${displayName ? 'filled' : ''}`}
          />
          <label htmlFor="display-name" className="field-label">
            Your Name
          </label>
        </div>

        <div className="field relative mb-6">
          <input
            id="new-username"
            type="text"
            required
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`field-input ${username ? 'filled' : ''}`}
          />
          <label htmlFor="new-username" className="field-label">
            Username
          </label>
        </div>

        <div className="field relative mb-6">
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`field-input ${password ? 'filled' : ''}`}
          />
          <label htmlFor="new-password" className="field-label">
            Password
          </label>
        </div>

        {message && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-center text-[0.82rem] leading-relaxed"
            style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(246,244,239,0.7)' }}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-gold relative w-full overflow-hidden rounded-xl py-4 font-semibold tracking-wide"
        >
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setStep('code');
              setMessage('');
            }}
            className="text-[0.85rem]"
            style={{ color: 'rgba(246,244,239,0.45)' }}
          >
            ← Back
          </button>
        </div>
      </motion.form>
    );
  }

  return (
    <motion.form
      onSubmit={handleCheckCode}
      autoComplete="off"
      className="glass-card w-[min(420px,90vw)] rounded-[22px] px-[38px] pt-11 pb-9"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="font-display mb-2 text-center text-2xl font-semibold" style={{ letterSpacing: '0.06em' }}>
        Create Account
      </div>
      <div
        className="font-serif-alt mb-8 text-center italic"
        style={{ fontSize: '1rem', color: 'rgba(246,244,239,0.55)' }}
      >
        Enter your license code to activate your account.
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
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
        <input
          id="license-code"
          type="text"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`field-input ${code ? 'filled' : ''}`}
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
        />
        <label htmlFor="license-code" className="field-label">
          License Code
        </label>
      </div>

      {message && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-center text-[0.82rem] leading-relaxed"
          style={{ background: 'rgba(212,175,55,0.08)', color: 'rgba(246,244,239,0.7)' }}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-gold relative w-full overflow-hidden rounded-xl py-4 font-semibold tracking-wide"
      >
        {submitting ? 'Checking…' : 'Continue'}
      </button>

      <div className="mt-5 text-center">
        <button type="button" onClick={onBack} className="text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
          ← Back to Sign In
        </button>
      </div>
    </motion.form>
  );
}
