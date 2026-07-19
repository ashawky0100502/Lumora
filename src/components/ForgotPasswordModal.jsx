import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resetOwnerPassword } from '../lib/authStore';
import { sfxClick, sfxSuccess, sfxError } from '../lib/sfx';

// Self-serve password reset. There's only one owner account and no
// email/backend yet, so "forgot password" today means: confirm the
// username, then set a new password right here — it's saved for real
// (see authStore.js) and works on the next login. Once a real backend
// exists this is the natural place to add an email/OTP step in front of
// the same reset call.
export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState('username'); // 'username' -> 'newPassword' -> 'done'
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function handleUsernameSubmit(e) {
    e.preventDefault();
    // We don't reveal whether the username exists here — just move to the
    // next step. The real check happens on submit of the new password.
    sfxClick();
    setError('');
    setStep('newPassword');
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      sfxError();
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      sfxError();
      return;
    }
    const result = resetOwnerPassword(username, newPassword);
    if (!result.ok) {
      setError('No account found with that username.');
      sfxError();
      return;
    }
    sfxSuccess();
    setError('');
    setStep('done');
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto px-6 py-16"
        style={{ background: 'rgba(5,3,8,0.72)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-card w-[min(400px,90vw)] rounded-[22px] px-8 py-9"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-display mb-2 text-center text-xl font-semibold" style={{ letterSpacing: '0.04em' }}>
            Reset Password
          </div>

          {step === 'username' && (
            <>
              <div
                className="font-serif-alt mb-6 text-center italic"
                style={{ fontSize: '0.92rem', color: 'rgba(246,244,239,0.55)' }}
              >
                Enter your username to continue.
              </div>
              <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
                <div className="field relative">
                  <input
                    id="fp-username"
                    type="text"
                    required
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`field-input ${username ? 'filled' : ''}`}
                  />
                  <label htmlFor="fp-username" className="field-label">
                    Username
                  </label>
                </div>
                <button type="submit" className="btn-gold w-full rounded-xl py-3.5 font-semibold">
                  Continue
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-center text-[0.82rem]"
                  style={{ color: 'rgba(246,244,239,0.45)' }}
                >
                  Cancel
                </button>
              </form>
            </>
          )}

          {step === 'newPassword' && (
            <>
              <div
                className="font-serif-alt mb-6 text-center italic"
                style={{ fontSize: '0.92rem', color: 'rgba(246,244,239,0.55)' }}
              >
                Choose a new password for &ldquo;{username}&rdquo;.
              </div>
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
                <div className="field relative">
                  <input
                    id="fp-new-password"
                    type="password"
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`field-input ${newPassword ? 'filled' : ''}`}
                  />
                  <label htmlFor="fp-new-password" className="field-label">
                    New Password
                  </label>
                </div>
                <div className="field relative">
                  <input
                    id="fp-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`field-input ${confirmPassword ? 'filled' : ''}`}
                  />
                  <label htmlFor="fp-confirm-password" className="field-label">
                    Confirm Password
                  </label>
                </div>

                {error && (
                  <div className="text-center text-[0.8rem]" style={{ color: '#e08a8a' }}>
                    {error}
                  </div>
                )}

                <button type="submit" className="btn-gold w-full rounded-xl py-3.5 font-semibold">
                  Save New Password
                </button>
                <button
                  type="button"
                  onClick={() => setStep('username')}
                  className="text-center text-[0.82rem]"
                  style={{ color: 'rgba(246,244,239,0.45)' }}
                >
                  Back
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <>
              <div
                className="font-serif-alt mb-7 text-center italic"
                style={{ fontSize: '0.95rem', color: 'rgba(246,244,239,0.65)' }}
              >
                Your password has been updated. You can now sign in with your new password.
              </div>
              <button type="button" onClick={onClose} className="btn-gold w-full rounded-xl py-3.5 font-semibold">
                Back to Sign In
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
