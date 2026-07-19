import { motion } from 'framer-motion';
import { Field, StepHeading, StepActions, stepMotion } from '../ui';
import { parseMapsLink } from '../../../../lib/wizardData';
import { sfxClick } from '../../../../lib/sfx';

function TimelineRow({ item, onChange, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-2.5 flex items-center gap-2.5"
    >
      <input
        type="time"
        value={item.time}
        onChange={(e) => onChange({ ...item, time: e.target.value })}
        className="rounded-lg border px-3 py-2.5 text-[0.85rem] outline-none"
        style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
      />
      <input
        type="text"
        value={item.title}
        placeholder="Event name (e.g. Ceremony, Reception, Dinner)"
        onChange={(e) => onChange({ ...item, title: e.target.value })}
        className="flex-1 rounded-lg border px-3 py-2.5 text-[0.85rem] outline-none"
        style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
      />
      <button
        type="button"
        onClick={onRemove}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
        style={{ color: 'rgba(246,244,239,0.5)' }}
        title="Remove"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default function StepLocation({ data, update, onNext, onBack, onSkip }) {
  const coords = parseMapsLink(data.mapsLink);

  function handleMapsLinkChange(url) {
    const parsed = parseMapsLink(url);
    update({ mapsLink: url, mapsLat: parsed?.lat ?? null, mapsLng: parsed?.lng ?? null });
  }

  function updateTimeline(i, item) {
    const next = data.timeline.slice();
    next[i] = item;
    update({ timeline: next });
  }
  function removeTimeline(i) {
    update({ timeline: data.timeline.filter((_, idx) => idx !== i) });
  }
  function addTimeline() {
    sfxClick();
    update({ timeline: [...data.timeline, { time: '', title: '', description: '' }] });
  }

  return (
    <motion.div {...stepMotion}>
      <StepHeading
        title="Venue Location"
        sub={'Open Google Maps, find your venue, tap "Share" and copy the link, then paste it here — free, no setup required'}
      />
      <Field label="Venue Name (optional)" value={data.venueName} onChange={(v) => update({ venueName: v })} placeholder="e.g. The Diamond Hall - Cairo" />
      <div className="mt-4">
        <Field label="Google Maps Link" value={data.mapsLink} onChange={handleMapsLinkChange} />
        <div className="mt-1.5 text-[0.72rem] leading-relaxed" style={{ color: coords ? '#8ce0a8' : 'rgba(246,244,239,0.42)' }}>
          {data.mapsLink
            ? coords
              ? 'تمام، تم تحديد اللوكيشن على الخريطة ✓'
              : 'مش قادرين نستخرج الإحداثيات من اللينك ده تلقائيًا (شكله لينك مختصر) — بس هيتحفظ ويفتح خرائط جوجل عادي لما الضيوف يضغطوا عليه.'
            : 'Example: https://maps.app.goo.gl/xxxxx or https://www.google.com/maps/place/...'}
        </div>
      </div>

      {coords && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 200 }}
          className="mt-4 overflow-hidden rounded-xl"
        >
          <iframe
            title="venue-preview"
            loading="lazy"
            className="h-full w-full border-0"
            src={`https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`}
          />
        </motion.div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-group">
          <label className="mb-2 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
            Location Description (optional)
          </label>
          <textarea
            rows={3}
            value={data.locationDescription}
            onChange={(e) => update({ locationDescription: e.target.value })}
            placeholder="e.g. Enter through the main gate on the east side of the building..."
            className="w-full rounded-xl border px-4 py-3.5 outline-none"
            style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)', fontSize: '0.92rem', resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label className="mb-2 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
            Parking Information (optional)
          </label>
          <textarea
            rows={3}
            value={data.parkingInfo}
            onChange={(e) => update({ parkingInfo: e.target.value })}
            placeholder="e.g. Free valet parking available at the front entrance"
            className="w-full rounded-xl border px-4 py-3.5 outline-none"
            style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)', fontSize: '0.92rem', resize: 'vertical' }}
          />
        </div>
      </div>

      <StepHeading className="mt-8" title="Wedding Day Timeline (optional)" sub="جدول مواعيد اليوم — استقبال، عقد، حفل، عشاء" />
      {data.timeline.length === 0 && (
        <div className="mb-3 text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          No timeline events added yet.
        </div>
      )}
      {data.timeline.map((item, i) => (
        <TimelineRow key={i} item={item} onChange={(v) => updateTimeline(i, v)} onRemove={() => removeTimeline(i)} />
      ))}
      <button type="button" className="btn-ghost mt-1.5" onClick={addTimeline}>
        + Add Timeline Event
      </button>

      <StepActions onBack={onBack} onNext={onNext} onSkip={onSkip} />
    </motion.div>
  );
}
