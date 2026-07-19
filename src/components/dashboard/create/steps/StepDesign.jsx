import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepHeading, StepActions, ToggleRow, SwatchOption, stepMotion } from '../ui';
import { TEMPLATE_REGISTRY, templateById } from '../../../../lib/templateRegistry';
import { UploadBox } from '../ui';
import { readAsDataUrl } from '../../../../lib/wizardData';
import GalleryPickerModal from '../../GalleryPickerModal';

const BG_THEMES = [
  { id: 'midnight', label: 'Midnight Gold', preview: { background: 'radial-gradient(circle at 50% 20%,#6a3ea1,#050308)' } },
  { id: 'purple', label: 'Royal Bloom', preview: { background: 'linear-gradient(160deg,#3a1a5c,#12081f)' } },
  { id: 'champagne', label: 'Champagne', preview: { background: 'linear-gradient(160deg,#f3e2b8,#c9a35f)' } },
  { id: 'emerald', label: 'Emerald', preview: { background: 'linear-gradient(160deg,#1f4d3a,#082018)' } },
  { id: 'rose', label: 'Rose Blush', preview: { background: 'linear-gradient(160deg,#f2c9d4,#c98096)' } },
  { id: 'ivory', label: 'Ivory Romance', preview: { background: 'linear-gradient(160deg,#fbf7f1,#e4d6cc)' } },
];

const MOTIFS = [
  { id: 'floral', label: 'Floral', color: '#8fae6f' },
  { id: 'laurel', label: 'Laurel', color: '#6f9a5c' },
  { id: 'stars', label: 'Starlight', color: '#7fb8ff' },
  { id: 'hearts', label: 'Hearts & Roses', color: '#c9697a' },
  { id: 'doves', label: 'Doves', color: '#cfd6e0' },
  { id: 'rings', label: 'Rings', color: '#d4af37' },
  { id: 'none', label: 'Minimal', color: '#8a8a8a' },
];

const GATE_STYLES = [
  { id: 'classic', label: 'Classic Frame', color: '#d4af37' },
  { id: 'envelope', label: 'Wax Seal Envelope', color: '#8c1f1f' },
  { id: 'arch', label: 'Arched Doorway', color: '#b8874a' },
  { id: 'split', label: 'Galaxy Doors', color: '#6a3ea1' },
  { id: 'minimal', label: 'Minimal Line Art', color: '#cfcfcf' },
];

const SECTION_ROWS = [
  { key: 'location', label: 'Location (Map)', desc: 'Venue location on Google Maps' },
  { key: 'gallery', label: 'Gallery', desc: 'Photos of the couple' },
  { key: 'letters', label: 'Love Letters', desc: 'Show the letters the couple wrote to each other' },
  { key: 'music', label: 'Music', desc: 'Play the selected song' },
  { key: 'menu', label: 'Menu', desc: 'Show the wedding menu to guests' },
  { key: 'messages', label: 'Guest Messages', desc: 'Guests can leave a congratulatory message' },
  { key: 'comments', label: 'Comments', desc: 'General comments on the invitation' },
  { key: 'rsvp', label: 'RSVP', desc: 'Guests confirm their attendance' },
  { key: 'timeline', label: 'Timeline', desc: 'Wedding day schedule of events' },
];

export default function StepDesign({ data, update, onNext, onBack, session, allowedTemplates }) {
  const isDemo = session?.type === 'demo';
  const activeTemplate = templateById(data.template);
  const isReadyMade = activeTemplate.readyMade;
  const [galleryOpen, setGalleryOpen] = useState(false);

  // Same filtering rule as TemplatesView.jsx — the Templates gallery isn't
  // the only place a member could reach a template their code doesn't
  // include, so this step has to enforce it too (defense in depth, plus
  // a database trigger backs this up server-side — see
  // supabase/license_fixes.sql).
  const visibleTemplates = allowedTemplates
    ? TEMPLATE_REGISTRY.filter((t) => allowedTemplates.includes(t.id))
    : TEMPLATE_REGISTRY;

  function selectTemplate(id) {
    if (allowedTemplates && !allowedTemplates.includes(id)) return;
    update({ template: id });
  }

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Invitation Template" sub="Choose the overall design system — the opening animation, colors and layout all come from this choice" />
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {visibleTemplates.map((t) => (
          <SwatchOption
            key={t.id}
            name="inv-template"
            value={t.id}
            checked={data.template === t.id}
            onChange={selectTemplate}
            label={t.name}
            sublabel={t.badge}
            previewClassName={`tpl-preview-${t.id}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {isReadyMade ? (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 text-[0.8rem] italic leading-relaxed" style={{ color: 'rgba(246,244,239,0.55)' }}>
            This is a complete, ready-made design with its own opening animation and color story built in — the options below are turned off automatically.
          </motion.div>
        ) : (
          <motion.div key="classic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StepHeading className="mt-8" title="Background & Style" sub="Pick a premium background theme for your invitation" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {BG_THEMES.map((b) => (
                <SwatchOption key={b.id} name="bg-theme" value={b.id} checked={data.bgTheme === b.id} onChange={(v) => update({ bgTheme: v })} label={b.label} preview={b.preview} />
              ))}
            </div>

            <StepHeading className="mt-8" title="Decorative Cover Motif" sub="Ready-made artwork for the opening card" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))' }}>
              {MOTIFS.map((m) => (
                <SwatchOption
                  key={m.id}
                  name="cover-motif"
                  value={m.id}
                  checked={data.coverMotif === m.id}
                  onChange={(v) => update({ coverMotif: v })}
                  label={m.label}
                  preview={{ background: `linear-gradient(135deg, ${m.color}, rgba(0,0,0,0.35))` }}
                />
              ))}
            </div>

            <StepHeading className="mt-8" title="Opening Card Style" sub="The very first card your guests see — the one they tap to open the invitation" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {GATE_STYLES.map((g) => (
                <SwatchOption
                  key={g.id}
                  name="gate-style"
                  value={g.id}
                  checked={data.gateStyle === g.id}
                  onChange={(v) => update({ gateStyle: v })}
                  label={g.label}
                  preview={{ background: `linear-gradient(135deg, ${g.color}, rgba(0,0,0,0.35))` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {data.template === 'silk' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <StepHeading className="mt-8" title="Silk & Pearl — Color Story" sub="Two botanical palettes to choose from" />
          <div className="grid max-w-sm grid-cols-2 gap-3">
            <SwatchOption name="silk-palette" value="sage" checked={data.silkPalette === 'sage'} onChange={(v) => update({ silkPalette: v })} label="Sage & Rose" preview={{ background: 'linear-gradient(135deg,#a8bfa2,#d9a9a9)' }} />
            <SwatchOption name="silk-palette" value="blush" checked={data.silkPalette === 'blush'} onChange={(v) => update({ silkPalette: v })} label="Blush & Champagne" preview={{ background: 'linear-gradient(135deg,#f0cfc4,#e4c48f)' }} />
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <StepHeading className="mt-8" title="Cover Photo (optional)" sub="Add a photo behind your names on the opening card — leave it empty to use the template's default look" />
        <UploadBox
          label="Cover Photo"
          value={data.coverPhoto}
          onFile={async (f) => update({ coverPhoto: await readAsDataUrl(f) })}
          onRemove={() => update({ coverPhoto: null })}
          className="max-w-[180px]"
        />
        {!isDemo && (
          <button type="button" className="mt-2 text-[0.74rem] underline" style={{ color: 'var(--gold-soft)' }} onClick={() => setGalleryOpen(true)}>
            اختر من الجاليري
          </button>
        )}
      </motion.div>

      <StepHeading className="mt-9" title="Show / Hide Sections" sub="Control which sections appear for your guests on the invitation page" />
      <div className="flex flex-col gap-2.5">
        {SECTION_ROWS.map((s) => (
          <ToggleRow key={s.key} label={s.label} desc={s.desc} checked={data.sections[s.key]} onChange={(v) => update({ sections: { ...data.sections, [s.key]: v } })} />
        ))}
      </div>

      <StepActions onBack={onBack} onNext={onNext} />

      {!isDemo && (
        <GalleryPickerModal open={galleryOpen} multiple={false} onClose={() => setGalleryOpen(false)} onPick={(url) => update({ coverPhoto: url })} />
      )}
    </motion.div>
  );
}
