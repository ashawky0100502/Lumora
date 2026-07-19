import { motion } from 'framer-motion';
import { Field, StepHeading, SuggestTextArea, StepActions, stepMotion } from '../ui';
import {
  QURAN_SUGGESTIONS,
  INVITATION_MESSAGE_SUGGESTIONS,
  STORY_SUGGESTIONS,
  HOWWEMET_SUGGESTIONS,
  BIO_GROOM_SUGGESTIONS,
  BIO_BRIDE_SUGGESTIONS,
  LETTER_GROOM_SUGGESTIONS,
  LETTER_BRIDE_SUGGESTIONS,
} from '../../../../lib/wizardSuggestions';

export default function StepNames({ data, update, onNext }) {
  const lang = data.language === 'en' ? 'en' : 'ar';
  const canContinue = data.groom.trim() && data.bride.trim();

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Names of the Couple" sub="These names will appear at the top of your invitation page" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Groom's Name" value={data.groom} onChange={(v) => update({ groom: v })} placeholder="e.g. Ahmed" />
        <Field label="Bride's Name" value={data.bride} onChange={(v) => update({ bride: v })} placeholder="e.g. Sarah" />
      </div>

      <div className="form-group mt-5">
        <label className="mb-2 block text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.55)' }}>
          Invitation Language / لغة الدعوة
        </label>
        <select
          value={data.language}
          onChange={(e) => update({ language: e.target.value })}
          className="w-full rounded-xl border px-4 py-3.5 outline-none"
          style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)', fontSize: '0.95rem' }}
        >
          <option value="ar">العربية (Arabic)</option>
          <option value="en">English</option>
        </select>
        {!canContinue && (
          <div className="mt-2 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
            Both names are required before you can continue.
          </div>
        )}
      </div>

      <div className="mt-6">
        <SuggestTextArea
          label="Quran Verse / Dua — آية قرآنية أو دعاء (optional)"
          value={data.quranVerse}
          onChange={(v) => update({ quranVerse: v })}
          placeholder="e.g. وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا..."
          rows={3}
          suggestions={QURAN_SUGGESTIONS}
          lang="ar"
          suggestLabel="اقترح آيات / Suggest verses"
        />
        <div className="mt-2 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          Shown lower on the invitation page, right below the countdown.
        </div>
      </div>

      <div className="mt-6">
        <SuggestTextArea
          label="Invitation Message — رسالة الدعوة (optional)"
          value={data.invitationMessage}
          onChange={(v) => update({ invitationMessage: v })}
          placeholder="e.g. يتشرف العروسان بدعوتكم لمشاركتهم أجمل لحظات حياتهم..."
          rows={3}
          suggestions={INVITATION_MESSAGE_SUGGESTIONS}
          lang={lang}
          suggestLabel="اقترح رسالة / Suggest a message"
        />
        <div className="mt-2 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          Shown right under your names, inside a decorative frame — the frame's style automatically matches your chosen template.
        </div>
      </div>

      <div className="mt-6">
        <SuggestTextArea
          label="Our Story — رسالة رومانسية (optional)"
          value={data.story}
          onChange={(v) => update({ story: v })}
          placeholder="Write a heartfelt line or two about your journey together..."
          suggestions={STORY_SUGGESTIONS}
          lang={lang}
        />
      </div>

      <StepHeading className="mt-8" title="How We Met — إزاي اتقابلنا (optional)" sub="Tell your guests how it all began" />
      <SuggestTextArea
        label="How We Met"
        value={data.howWeMet}
        onChange={(v) => update({ howWeMet: v })}
        placeholder="Tell your guests how you first met..."
        suggestions={HOWWEMET_SUGGESTIONS}
        lang={lang}
      />

      <StepHeading className="mt-8" title="Life Story — قصة كل شخص (optional)" sub="A short note about who each of you is" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SuggestTextArea
          label="About the Groom"
          value={data.bioGroom}
          onChange={(v) => update({ bioGroom: v })}
          placeholder="Write a little about who he is..."
          rows={3}
          suggestions={BIO_GROOM_SUGGESTIONS}
          lang={lang}
          suggestLabel="اقترح نبذة / Suggest a bio"
        />
        <SuggestTextArea
          label="About the Bride"
          value={data.bioBride}
          onChange={(v) => update({ bioBride: v })}
          placeholder="Write a little about who she is..."
          rows={3}
          suggestions={BIO_BRIDE_SUGGESTIONS}
          lang={lang}
          suggestLabel="اقترح نبذة / Suggest a bio"
        />
      </div>

      <StepHeading className="mt-8" title="Love Letters (optional)" sub="A note from each of you to the other — shown to guests as a real love letter" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <SuggestTextArea
          label="From the Groom, to the Bride"
          value={data.letterGroom}
          onChange={(v) => update({ letterGroom: v })}
          placeholder="Write a few words to her..."
          suggestions={LETTER_GROOM_SUGGESTIONS}
          lang={lang}
        />
        <SuggestTextArea
          label="From the Bride, to the Groom"
          value={data.letterBride}
          onChange={(v) => update({ letterBride: v })}
          placeholder="Write a few words to him..."
          suggestions={LETTER_BRIDE_SUGGESTIONS}
          lang={lang}
        />
      </div>

      <StepActions onNext={onNext} nextDisabled={!canContinue} />
    </motion.div>
  );
}
