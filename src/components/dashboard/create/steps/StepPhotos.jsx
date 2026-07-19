import { useState } from 'react';
import { motion } from 'framer-motion';
import { Field, StepHeading, SuggestTextArea, UploadBox, MultiUploadGrid, StepActions, stepMotion } from '../ui';
import { readAsDataUrl } from '../../../../lib/wizardData';
import { ENGAGEMENT_SUGGESTIONS } from '../../../../lib/wizardSuggestions';
import GalleryPickerModal from '../../GalleryPickerModal';

const DECOR_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'floral', label: 'Floral' },
  { id: 'candles', label: 'Candles' },
  { id: 'fairylights', label: 'Fairy Lights' },
];

export default function StepPhotos({ data, update, onNext, onBack, onSkip, session }) {
  const isDemo = session?.type === 'demo';
  const lang = data.language === 'en' ? 'en' : 'ar';
  const [picker, setPicker] = useState(null); // { key, multiple } | null

  async function handleSingle(key, file) {
    update({ [key]: await readAsDataUrl(file) });
  }
  async function addMulti(key, file) {
    const url = await readAsDataUrl(file);
    update({ [key]: [...data[key], url] });
  }
  function removeMulti(key, i) {
    update({ [key]: data[key].filter((_, idx) => idx !== i) });
  }

  function handlePick(value) {
    if (!picker) return;
    if (picker.multiple) {
      update({ [picker.key]: [...data[picker.key], ...value] });
    } else {
      update({ [picker.key]: value });
    }
  }

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Photos of the Couple" sub="Completely optional — you can skip this step and add photos later" />
      <div className="grid max-w-md grid-cols-2 gap-4">
        <div>
          <UploadBox label="Groom's Photo" value={data.photoGroom} onFile={(f) => handleSingle('photoGroom', f)} onRemove={() => update({ photoGroom: null })} />
          {!isDemo && (
            <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setPicker({ key: 'photoGroom', multiple: false })}>
              اختر من الجاليري
            </button>
          )}
        </div>
        <div>
          <UploadBox label="Bride's Photo" value={data.photoBride} onFile={(f) => handleSingle('photoBride', f)} onRemove={() => update({ photoBride: null })} />
          {!isDemo && (
            <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setPicker({ key: 'photoBride', multiple: false })}>
              اختر من الجاليري
            </button>
          )}
        </div>
      </div>

      <StepHeading className="mt-9" title="Engagement — فترة الخطوبة (optional)" sub="لو حابين تشاركوا ضيوفكم فترة الخطوبة، اكتبوا كام سطر وارفعوا صور" />
      <Field label="Engagement Date (optional)" type="date" value={data.engagementDate} onChange={(v) => update({ engagementDate: v })} className="max-w-xs" />

      <div className="mt-4">
        <SuggestTextArea
          label="Engagement Story (optional)"
          value={data.engagementStory}
          onChange={(v) => update({ engagementStory: v })}
          placeholder="Tell your guests about your engagement..."
          suggestions={ENGAGEMENT_SUGGESTIONS}
          lang={lang}
        />
      </div>

      <div className="form-group mt-5">
        <label className="mb-2 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
          Engagement Photos (optional)
        </label>
        <MultiUploadGrid photos={data.engagementPhotos} onAdd={(f) => addMulti('engagementPhotos', f)} onRemove={(i) => removeMulti('engagementPhotos', i)} />
        {!isDemo && (
          <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setPicker({ key: 'engagementPhotos', multiple: true })}>
            اختر من الجاليري
          </button>
        )}
      </div>

      <div className="form-group mt-6">
        <label className="mb-1 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
          Romantic Engagement Look (optional)
        </label>
        <div className="mb-2.5 text-[0.74rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          Choose a ready-made romantic backdrop for the engagement section
        </div>
        <div className="flex flex-wrap gap-2.5">
          {DECOR_OPTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => update({ engagementDecor: d.id })}
              className="rounded-full border px-4 py-2 text-[0.78rem] transition-colors"
              style={{
                borderColor: data.engagementDecor === d.id ? 'var(--gold)' : 'rgba(212,175,55,0.22)',
                background: data.engagementDecor === d.id ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: data.engagementDecor === d.id ? 'var(--gold-soft)' : 'rgba(246,244,239,0.6)',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <StepHeading className="mt-9" title="Outings & Trips (optional)" sub="لحظات جمعتكوا سوا قبل الفرح — كافيهات، سفر، فسح" />
      <MultiUploadGrid photos={data.outingPhotos} onAdd={(f) => addMulti('outingPhotos', f)} onRemove={(i) => removeMulti('outingPhotos', i)} />
      {!isDemo && (
        <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setPicker({ key: 'outingPhotos', multiple: true })}>
          اختر من الجاليري
        </button>
      )}

      <StepActions onBack={onBack} onNext={onNext} onSkip={onSkip} />

      {!isDemo && (
        <GalleryPickerModal open={Boolean(picker)} multiple={Boolean(picker?.multiple)} onClose={() => setPicker(null)} onPick={handlePick} />
      )}
    </motion.div>
  );
}
