import { useState } from 'react';
import { motion } from 'framer-motion';
import { sfxClick, sfxError } from '../lib/sfx';
import { setVisitorName, setVisitorEmail } from '../lib/visitorIdentity';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shown once, before a visitor reaches the template gallery or the chat —
// requires a real first + last name (not "hi" or a single word) plus a
// valid email, so the owner's inbox always shows who they're actually
// talking to and has a way to reach them outside the chat thread, and so
// the welcome message that follows can greet them by name.
export default function VisitorNameGate({ onContinue, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function validateName(raw) {
    const trimmed = raw.trim().replace(/\s+/g, ' ');
    const parts = trimmed.split(' ').filter(Boolean);
    if (parts.length < 2) return 'Please enter your first and last name.';
    if (parts.some((p) => p.length < 2)) return "That doesn't look like a full name — please check it.";
    if (/[0-9]/.test(trimmed)) return 'Names don\u2019t contain numbers — please re-check.';
    return '';
  }

  function validateEmail(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return 'Please enter your email.';
    if (!EMAIL_RE.test(trimmed)) return "That doesn't look like a valid email — please check it.";
    return '';
  }

  function handleSubmit(e) {
    e.preventDefault();
    const nameMsg = validateName(name);
    const emailMsg = !nameMsg ? validateEmail(email) : '';
    const msg = nameMsg || emailMsg;
    if (msg) {
      sfxError();
      setError(msg);
      return;
    }
    sfxClick();
    const cleanName = name.trim().replace(/\s+/g, ' ');
    const cleanEmail = email.trim();
    setVisitorName(cleanName);
    setVisitorEmail(cleanEmail);
    onContinue({ name: cleanName, email: cleanEmail });
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto px-6 py-16">
      <motion.form
        onSubmit={handleSubmit}
        className="glass-card w-[min(420px,90vw)] rounded-[22px] px-[38px] pt-11 pb-9"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="font-display mb-2 text-center text-2xl font-semibold" style={{ letterSpacing: '0.06em' }}>
          Let's get you in
        </div>
        <div className="font-serif-alt mb-8 text-center italic" style={{ fontSize: '0.95rem', color: 'rgba(246,244,239,0.55)' }}>
          Your real name and email, so the team knows who they're talking to.
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
          {error}
        </div>

        <div className="field relative mb-7">
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
            id="visitor-name"
            type="text"
            autoFocus
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            className={`field-input ${name ? 'filled' : ''}`}
          />
          <label htmlFor="visitor-name" className="field-label">
            Full name
          </label>
        </div>

        <div className="field relative mb-7">
          <svg
            className="field-icon pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
            style={{ color: 'rgba(212,175,55,0.65)' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Z" />
            <path d="m4 6.5 8 6 8-6" />
          </svg>
          <input
            id="visitor-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            className={`field-input ${email ? 'filled' : ''}`}
          />
          <label htmlFor="visitor-email" className="field-label">
            Email address
          </label>
        </div>

        <button type="submit" className="btn-gold w-full rounded-xl py-3.5 text-center font-semibold">
          Continue
        </button>

        <button
          type="button"
          onClick={() => {
            sfxClick();
            onBack();
          }}
          className="mt-5 w-full text-center text-[0.82rem]"
          style={{ color: 'rgba(246,244,239,0.45)' }}
        >
          ← Back
        </button>
      </motion.form>
    </div>
  );
}
