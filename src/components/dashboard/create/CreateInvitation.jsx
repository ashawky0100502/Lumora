import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createInitialInvData, STEP_LABELS, stepCompletion } from '../../../lib/wizardData';
import { sfxClick } from '../../../lib/sfx';

import StepNames from './steps/StepNames';
import StepDateTime from './steps/StepDateTime';
import StepLocation from './steps/StepLocation';
import StepPhotos from './steps/StepPhotos';
import StepMusic from './steps/StepMusic';
import StepMenu from './steps/StepMenu';
import StepDesign from './steps/StepDesign';
import StepReview from './steps/StepReview';

const DRAFT_KEY = 'lumora_wizard_draft';
const PREVIEW_CHANNEL_NAME = 'lumora-wizard-draft';

function StepDots({ current, done, onJump }) {
  return (
    <div className="mb-8 flex flex-wrap items-center gap-x-1 gap-y-3">
      {STEP_LABELS.map((s, i) => (
        <div key={s.step} className="flex items-center">
          <button
            type="button"
            onClick={() => onJump(s.step)}
            className="flex flex-col items-center gap-1.5 px-2"
          >
            <motion.span
              className="flex h-8 w-8 items-center justify-center rounded-full text-[0.78rem] font-semibold"
              animate={{
                background: s.step === current ? 'var(--gold)' : done[s.step] ? 'rgba(212,175,55,0.22)' : 'rgba(255,255,255,0.06)',
                color: s.step === current ? '#1a1305' : done[s.step] ? 'var(--gold-soft)' : 'rgba(246,244,239,0.45)',
                borderColor: s.step === current ? 'var(--gold)' : 'rgba(212,175,55,0.25)',
              }}
              style={{ border: '1px solid' }}
            >
              {done[s.step] && s.step !== current ? '✓' : s.step}
            </motion.span>
            <span
              className="hidden text-[0.66rem] sm:block"
              style={{ color: s.step === current ? 'var(--gold-soft)' : 'rgba(246,244,239,0.4)', letterSpacing: '0.02em' }}
            >
              {s.label}
            </span>
          </button>
          {i < STEP_LABELS.length - 1 && <div className="mx-1 h-px w-4 sm:w-8" style={{ background: 'rgba(212,175,55,0.18)' }} />}
        </div>
      ))}
    </div>
  );
}

export default function CreateInvitation({ selectedTemplate, session }) {
  // Same rule as Dashboard.jsx: null = every template allowed. Recomputed
  // here (not just trusted from selectedTemplate) so Step 7 can filter its
  // own template list — the Templates gallery filtering isn't the only
  // gate, a member should never be able to reach a disallowed template by
  // switching it from inside the builder either.
  const isDemo = session?.type === 'demo';
  const allowedTemplates = isDemo ? session.account?.allowedTemplates || null : null;

  const [data, setData] = useState(() => {
    const initial = createInitialInvData();
    if (selectedTemplate) initial.template = selectedTemplate;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        return { ...initial, ...draft, template: selectedTemplate || draft.template || initial.template };
      }
    } catch (e) {
      /* ignore corrupt draft */
    }
    return initial;
  });
  const [step, setStep] = useState(1);
  const [audioFile, setAudioFile] = useState(null);
  const [savedTick, setSavedTick] = useState(false);
  const saveTimer = useRef(null);
  const previewChannelRef = useRef(null);

  function update(patch) {
    setData((d) => ({ ...d, ...patch }));
  }

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (typeof BroadcastChannel !== 'undefined' && !previewChannelRef.current) {
      previewChannelRef.current = new BroadcastChannel(PREVIEW_CHANNEL_NAME);
    }

    return () => {
      previewChannelRef.current?.close();
      previewChannelRef.current = null;
    };
  }, []);

  // Debounced draft autosave — a small "smart" touch so a couple never
  // loses their progress on an accidental refresh.
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('lumora:preview-refresh', { detail: data }));
        }

        previewChannelRef.current?.postMessage({ type: 'draft-updated', draft: data });
        setSavedTick(true);
        setTimeout(() => setSavedTick(false), 1200);
      } catch (e) {
        /* storage full or unavailable — fail silently */
      }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  function goToStep(n) {
    sfxClick();
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const done = stepCompletion(data);

  const stepProps = {
    data,
    update,
    session,
    allowedTemplates,
    onBack: () => goToStep(step - 1),
    onNext: () => goToStep(step + 1),
    onSkip: () => goToStep(step + 1),
  };

  return (
    <div>
      <div className="mb-7 flex items-start justify-between">
        <div>
          <div className="font-display text-[1.7rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
            Create Your <span style={{ color: 'var(--gold-soft)' }}>Invitation</span>
          </div>
          <div className="font-serif-alt mt-1.5 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '0.98rem' }}>
            Eight quick steps — skip anything optional, and come back anytime.
          </div>
        </div>
        <AnimatePresence>
          {savedTick && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-1 flex-shrink-0 text-[0.72rem]"
              style={{ color: 'rgba(140,224,168,0.85)' }}
            >
              Draft saved ✓
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StepDots current={step} done={done} onJump={goToStep} />

      <div className="glass-card rounded-2xl p-6 sm:p-9" style={{ maxWidth: 880 }}>
        <AnimatePresence mode="wait">
          <div key={step}>
            {step === 1 && <StepNames {...stepProps} />}
            {step === 2 && <StepDateTime {...stepProps} />}
            {step === 3 && <StepLocation {...stepProps} />}
            {step === 4 && <StepPhotos {...stepProps} />}
            {step === 5 && <StepMusic {...stepProps} audioFile={audioFile} setAudioFile={setAudioFile} />}
            {step === 6 && <StepMenu {...stepProps} />}
            {step === 7 && <StepDesign {...stepProps} />}
            {step === 8 && (
              <StepReview
                data={data}
                audioFile={audioFile}
                session={session}
                allowedTemplates={allowedTemplates}
                onJumpToStep={goToStep}
                onBack={() => goToStep(7)}
                onPublished={() => {
                  // The invitation is now saved in Supabase — the localStorage
                  // draft has done its job (protecting against an accidental
                  // refresh mid-edit) and must be cleared now. Without this,
                  // the *next* "Create Invitation" click would silently load
                  // this already-published invitation's data as if it were
                  // still an unfinished draft.
                  try {
                    localStorage.removeItem(DRAFT_KEY);
                  } catch (e) {
                    /* storage unavailable — nothing to clean up */
                  }
                }}
              />
            )}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
