import { motion } from 'framer-motion';
import { Field, StepHeading, StepActions, stepMotion } from '../ui';

function useCountdownLabel(date, time) {
  if (!date) return null;
  const target = new Date(`${date}T${time || '00:00'}`);
  const diffMs = target.getTime() - Date.now();
  if (Number.isNaN(diffMs)) return null;
  if (diffMs <= 0) return 'This date has already passed';
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days} day${days === 1 ? '' : 's'} and ${hours} hour${hours === 1 ? '' : 's'} to go`;
}

export default function StepDateTime({ data, update, onNext, onBack }) {
  const countdown = useCountdownLabel(data.date, data.time);

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Event Date & Time" sub="A live countdown will show your guests exactly how long is left" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date" type="date" value={data.date} onChange={(v) => update({ date: v })} />
        <Field label="Time" type="time" value={data.time} onChange={(v) => update({ time: v })} />
      </div>

      {countdown && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 inline-block rounded-full border px-4 py-2 text-[0.82rem]"
          style={{ borderColor: 'rgba(212,175,55,0.3)', color: 'var(--gold-soft)', background: 'rgba(212,175,55,0.08)' }}
        >
          ✨ {countdown}
        </motion.div>
      )}

      <StepActions onBack={onBack} onNext={onNext} />
    </motion.div>
  );
}
