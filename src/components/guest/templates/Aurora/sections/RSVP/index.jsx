import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import useRSVP from '../../../../../../hooks/useRSVP';
import { submitComment, sendGuestMessage, setGuestName } from '../../../../../../lib/guestApi';
import '../../debugRender';
import './rsvp.css';
import { shouldRenderAuroraRsvp } from './rsvpVisibility.js';

const DEFAULT_RSVP = {
  title: 'We Would Be Honored',
  subtitle: 'Your response will complete the invitation and remain treasured with the evening.',
  fields: {
    nameLabel: 'Guest Name',
    attendanceLabel: 'Attendance',
    attending: 'Happily Attending',
    declining: 'Regretfully Declines',
    guestCountLabel: 'Number of Guests',
      dietaryLabel: 'A HEARTFELT WISH',
      messageLabel: 'A PRIVATE MESSAGE',
    button: 'Send Response',
  },
};

function normalizeFormData(data) {
  return {
    title: data?.rsvp?.title || DEFAULT_RSVP.title,
    subtitle: data?.rsvp?.subtitle || DEFAULT_RSVP.subtitle,
    fields: {
      nameLabel: DEFAULT_RSVP.fields.nameLabel,
      attendanceLabel: DEFAULT_RSVP.fields.attendanceLabel,
      attending: DEFAULT_RSVP.fields.attending,
      declining: DEFAULT_RSVP.fields.declining,
      guestCountLabel: DEFAULT_RSVP.fields.guestCountLabel,
      dietaryLabel: DEFAULT_RSVP.fields.dietaryLabel,
      messageLabel: DEFAULT_RSVP.fields.messageLabel,
      button: DEFAULT_RSVP.fields.button,
    },
  };
}

export default function AuroraRSVP({ data = {}, slug }) {
  const prefersReducedMotion = useReducedMotion();
  if (typeof window !== 'undefined') {
    console.info('[Aurora render] RSVP component mounted');
  }
  const [name, setName] = useState('');
  const [status, setStatus] = useState('attending');
  const [guestCount, setGuestCount] = useState('1');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [message, setMessage] = useState('');
  const enabled = data?.rsvp?.enabled !== false && data?.sections?.rsvp !== false;
  const rsvp = useRSVP(slug, data);
  const content = useMemo(() => normalizeFormData(data), [data]);

  if (!shouldRenderAuroraRsvp(data, slug)) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || rsvp.busy) return;
    try {
      // 1) Save RSVP
      await rsvp.send(slug, { name, status, guestCount });

      // 2) Take 'Wish' (dietaryNotes) and publish as a public comment (guestbook)
      const wishText = (dietaryNotes || '').trim();
      if (wishText) {
        try {
          await submitComment(slug, { name: name.trim(), text: wishText });
        } catch (err) {
          console.error('[Aurora RSVP] publish wish (comment) failed', err);
        }
      }

      // 3) Take 'Personal Message' and send as private couple message
      const personal = (message || '').trim();
      if (personal) {
        try {
          // ensure guest name is set for the private thread
          try { setGuestName(slug, name.trim()); } catch (e) { /* ignore */ }
          await sendGuestMessage(slug, personal);
        } catch (err) {
          console.error('[Aurora RSVP] send private message failed', err);
        }
      }
    } catch (err) {
      // rsvp hook exposes error state
    }
  }

  return (
    <section className="aurora-rsvp" aria-labelledby="aurora-rsvp-title">
      <div className="aurora-rsvp__inner">
        <div className="aurora-rsvp__intro">
          <p className="aurora-rsvp__eyebrow">With gratitude</p>
          <h2 id="aurora-rsvp-title" className="aurora-rsvp__title">{content.title}</h2>
          <p className="aurora-rsvp__subtitle">{content.subtitle}</p>
        </div>

        <motion.div
          className="aurora-rsvp__card"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
          whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="aurora-rsvp__card-inner">
            {rsvp.submitted ? (
              <motion.div
                className="aurora-rsvp__success"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="aurora-rsvp__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none">
                    <path d="M5 12.5 9.5 17 19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="aurora-rsvp__success-title">Your response is cherished</h3>
                <p className="aurora-rsvp__success-copy">
                  Thank you for answering this invitation with such warmth. Your presence, or your kind absence, will be remembered with deep gratitude.
                </p>
              </motion.div>
            ) : (
              <form className="aurora-rsvp__form" onSubmit={handleSubmit}>
                <label className="aurora-rsvp__field">
                  <span className="aurora-rsvp__field-label">{content.fields.nameLabel}</span>
                  <input
                    className="aurora-rsvp__input"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="aurora-rsvp__field">
                  <span className="aurora-rsvp__field-label">{content.fields.attendanceLabel}</span>
                  <div className="aurora-rsvp__choice-grid" role="radiogroup" aria-label="attendance">
                    <label className={`aurora-rsvp__choice ${status === 'attending' ? 'aurora-rsvp__choice--selected' : ''}`}>
                      <input
                        className="aurora-rsvp__choice-input"
                        type="radio"
                        name="attendance"
                        value="attending"
                        checked={status === 'attending'}
                        onChange={() => setStatus('attending')}
                      />
                      <span>{content.fields.attending}</span>
                    </label>
                    <label className={`aurora-rsvp__choice ${status === 'declining' ? 'aurora-rsvp__choice--selected' : ''}`}>
                      <input
                        className="aurora-rsvp__choice-input"
                        type="radio"
                        name="attendance"
                        value="declining"
                        checked={status === 'declining'}
                        onChange={() => setStatus('declining')}
                      />
                      <span>{content.fields.declining}</span>
                    </label>
                  </div>
                </label>

                <label className="aurora-rsvp__field">
                  <span className="aurora-rsvp__field-label">{content.fields.guestCountLabel}</span>
                  <input
                    className="aurora-rsvp__input"
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(event) => setGuestCount(event.target.value)}
                  />
                </label>

                <label className="aurora-rsvp__field">
                  <span className="aurora-rsvp__field-label">{content.fields.dietaryLabel}</span>
                  <textarea
                    className="aurora-rsvp__textarea"
                    value={dietaryNotes}
                    onChange={(event) => setDietaryNotes(event.target.value)}
                    placeholder="Share your heartfelt wishes for the beginning of our forever journey..."
                  />
                </label>

                <label className="aurora-rsvp__field">
                  <span className="aurora-rsvp__field-label">{content.fields.messageLabel}</span>
                  <textarea
                    className="aurora-rsvp__textarea"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Write something only the couple will be able to read..."
                  />
                </label>

                {rsvp.error ? <p className="aurora-rsvp__error">{rsvp.error}</p> : null}

                <button className="aurora-rsvp__button" type="submit" disabled={rsvp.busy}>
                  {rsvp.busy ? 'Sending…' : content.fields.button}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        <div className="aurora-rsvp__particles" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, index) => (
            <span key={index} className="aurora-rsvp__particle" style={{ left: `${8 + index * 8}%`, top: `${12 + (index % 4) * 18}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
