import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepHeading, stepMotion } from '../ui';
import { slugify, BRAND_DOMAIN } from '../../../../lib/wizardData';
import { templateById } from '../../../../lib/templateRegistry';
import { supabaseClient } from '../../../../lib/supabaseClient';
import { rememberInvite } from '../../../../lib/myInvites';
import { sfxClick, sfxSuccess, sfxError } from '../../../../lib/sfx';
import { serializeInvitationPayload } from './publishSerializer';
import { generateStorageKey } from '../../../../lib/storageKey';

function ReviewItem({ label, value, done, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors duration-300 hover:border-[var(--gold)]"
      style={{ borderColor: 'rgba(212,175,55,0.16)', background: 'rgba(0,0,0,0.18)' }}
    >
      <div className="flex w-full items-center justify-between text-[0.7rem]" style={{ color: 'rgba(246,244,239,0.45)', letterSpacing: '0.04em' }}>
        <span>{label}</span>
        {done && <span style={{ color: '#8ce0a8' }}>✓</span>}
      </div>
      <div className="text-[0.9rem]" style={{ color: 'var(--gold-soft)' }}>
        {value}
      </div>
    </button>
  );
}

export default function StepReview({ data, audioFile, session, allowedTemplates, onJumpToStep, onBack, onPublished }) {
  const [publishing, setPublishing] = useState(false);
  const [publishState, setPublishState] = useState(null); // { url, prettyUrl, coupleUrl, accessCode }
  const [error, setError] = useState('');

  const dateStr = data.date
    ? new Date(`${data.date}T${data.time || '00:00'}`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not set';
  const activeSections = Object.values(data.sections).filter(Boolean).length;
  const totalSections = Object.keys(data.sections).length;
  const dishCount = data.menu.filter((m) => m.name.trim()).length;

  const items = [
    { label: 'Couple', value: `${data.groom || '—'} & ${data.bride || '—'}`, done: Boolean(data.groom && data.bride), step: 1 },
    { label: 'Date & Time', value: `${dateStr}${data.time ? ' · ' + data.time : ''}`, done: Boolean(data.date), step: 2 },
    { label: 'Venue', value: data.venueName || (data.mapsLink ? 'Map link added' : '—'), done: Boolean(data.venueName || data.mapsLink), step: 3 },
    { label: 'Photos', value: data.photoGroom || data.photoBride ? 'Uploaded ✓' : 'Not added (optional)', done: Boolean(data.photoGroom || data.photoBride), step: 4 },
    { label: 'Song', value: data.audioUrl ? (data.audioFull ? 'Full track' : 'Custom trim') : 'Not added', done: Boolean(data.audioUrl), step: 5 },
    { label: 'Menu', value: dishCount ? `${dishCount} dishes added` : 'Not added (optional)', done: dishCount > 0, step: 6 },
    { label: 'How We Met', value: data.howWeMet ? 'Added ✓' : 'Not added (optional)', done: Boolean(data.howWeMet), step: 1 },
    { label: 'Engagement', value: data.engagementStory || data.engagementDate || data.engagementPhotos.length ? 'Added ✓' : 'Not added (optional)', done: Boolean(data.engagementStory || data.engagementDate || data.engagementPhotos.length), step: 4 },
    { label: 'Love Letters', value: data.letterGroom || data.letterBride ? 'Added ✓' : 'Not added (optional)', done: Boolean(data.letterGroom || data.letterBride), step: 1 },
    { label: 'Template', value: templateById(data.template).name, done: true, step: 7 },
    { label: 'Active Sections', value: `${activeSections} of ${totalSections}`, done: true, step: 7 },
  ];

  async function handlePublish() {
    setError('');
    if (!data.groom.trim() || !data.bride.trim()) {
      sfxError();
      setError("Please enter at least the groom's and bride's names before publishing.");
      onJumpToStep(1);
      return;
    }

    // A member's code may only include some templates (see
    // supabase/demo_accounts.sql allowed_templates + LicenseSettings.jsx).
    // TemplatesView and StepDesign already only ever offer allowed
    // templates, but data.template could still be stale (e.g. an old
    // localStorage draft from before the owner changed this code's
    // permissions) — never trust it silently at publish time. The
    // database trigger in supabase/license_fixes.sql is the real
    // enforcement; this is just a friendlier error than a raw DB failure.
    if (allowedTemplates && !allowedTemplates.includes(data.template)) {
      sfxError();
      setError('This template isn\u2019t included in your current plan. Please pick one of your available templates before publishing.');
      onJumpToStep(7);
      return;
    }

    setPublishing(true);
    try {
      const prettySlug = slugify(`${data.groom}-${data.bride}`) || 'invitation';
      const slug = data.slug || `${prettySlug}-${Math.random().toString(36).slice(2, 7)}`;

      const dataToSave = serializeInvitationPayload(data, slug);

      // Upload the song as a real file to Supabase Storage instead of
      // stuffing a huge base64 string into the database row — skipped
      // entirely if a direct online link was provided instead.
      if (audioFile) {
        const path = generateStorageKey('audio', audioFile);
        const { error: upErr } = await supabaseClient.storage.from('media').upload(path, audioFile, { upsert: true, contentType: audioFile.type || 'audio/mpeg' });
        if (upErr) throw new Error(`حصل خطأ أثناء رفع الأغنية: ${upErr.message}`);
        const { data: pub } = supabaseClient.storage.from('media').getPublicUrl(path);
        dataToSave.audioUrl = pub.publicUrl;
        dataToSave.audioPath = path;
      }

      // A member (demo) account's invitations get tagged with their real
      // account id right here — this is what lets member_list_invitations /
      // member_get_rsvps (see supabase/member_invitations.sql) know which
      // invitations are actually theirs, instead of trusting whatever this
      // browser's local "My Invitations" list happens to remember. The
      // owner's own invitations are untouched (owner_account_id stays null).
      const ownerAccountId = session?.type === 'demo' ? session.account?.accountId || null : null;

      const { error: dbErr } = await supabaseClient
        .from('invitations')
        .upsert({ slug, data: dataToSave, updated_at: new Date().toISOString(), owner_account_id: ownerAccountId });
      if (dbErr) throw new Error(`حصل خطأ أثناء نشر الدعوة: ${dbErr.message}`);

      rememberInvite({ slug, groom: data.groom, bride: data.bride, language: data.language });

      const url = `${location.origin}${location.pathname}?invite=${encodeURIComponent(slug)}`;
      const prettyUrl = `${BRAND_DOMAIN}/${prettySlug}`;

      let coupleUrl = null;
      let accessCode = null;
      const { data: code, error: codeErr } = await supabaseClient.rpc('get_or_create_access_code', { p_slug: slug });
      if (!codeErr && code) {
        accessCode = code;
        coupleUrl = `${location.origin}${location.pathname}?couple=${encodeURIComponent(slug)}&key=${encodeURIComponent(code)}`;
      }

      sfxSuccess();
      setPublishState({ slug, url, prettyUrl, coupleUrl, accessCode });
      onPublished?.();
    } catch (e) {
      sfxError();
      setError(e.message || String(e));
    } finally {
      setPublishing(false);
    }
  }

  function copy(text, setLabel) {
    sfxClick();
    navigator.clipboard.writeText(text).then(() => {
      setLabel(true);
      setTimeout(() => setLabel(false), 1500);
    });
  }

  const [copiedGuest, setCopiedGuest] = useState(false);
  const [copiedCouple, setCopiedCouple] = useState(false);

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Review & Publish" sub="Double-check the details before publishing your invitation" />

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {items.map((it, i) => (
          <ReviewItem key={i} label={it.label} value={it.value} done={it.done} onClick={() => onJumpToStep(it.step)} />
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-xl border px-4 py-3 text-[0.82rem]" style={{ borderColor: 'rgba(220,90,90,0.4)', color: '#e08a8a', background: 'rgba(220,90,90,0.08)' }}>
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t pt-6" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
        <button type="button" className="btn-ghost" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-gold" disabled={publishing} onClick={handlePublish}>
          {publishing ? 'Publishing...' : 'Publish Invitation'}
        </button>
      </div>

      <AnimatePresence>
        {publishState && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-7 rounded-2xl p-6"
          >
            <div className="font-display" style={{ color: 'var(--gold-soft)' }}>
              🎉 Your invitation is live
            </div>
            <div className="mt-1.5 text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
              Share this link with your guests:
            </div>
            <a
              href={publishState.url}
              target="_blank"
              rel="noopener"
              className="mt-2 block break-all text-[0.92rem] underline"
              style={{ color: 'var(--gold-soft)' }}
            >
              {publishState.prettyUrl}
            </a>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <a href={publishState.url} target="_blank" rel="noopener" className="btn-gold">
                Preview Invitation
              </a>
              <button type="button" className="btn-ghost" onClick={() => copy(publishState.url, setCopiedGuest)}>
                {copiedGuest ? 'Copied ✓' : 'Copy Link'}
              </button>
            </div>

            {publishState.coupleUrl && (
              <div className="mt-6 border-t pt-5" style={{ borderColor: 'rgba(212,175,55,0.2)' }}>
                <div className="text-[0.82rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
                  💍 Private link for the couple only — lets them view guest messages, RSVPs and reply:
                </div>
                <a href={publishState.coupleUrl} target="_blank" rel="noopener" className="mt-2 block break-all text-[0.88rem] underline" style={{ color: 'var(--gold-soft)' }}>
                  Couple link
                </a>
                <div className="mt-1.5 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
                  كود الدخول: <b style={{ color: 'var(--gold-soft)' }}>{publishState.accessCode}</b>
                </div>
                <button type="button" className="btn-ghost mt-3" onClick={() => copy(publishState.coupleUrl, setCopiedCouple)}>
                  {copiedCouple ? 'Copied ✓' : 'Copy Couple Link'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
