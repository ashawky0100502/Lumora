const LABELS = {
  create: 'Create Invitation',
  templates: 'Templates',
  gallery: 'Gallery',
  music: 'Music Studio',
  guests: 'Guests',
  analytics: 'Analytics',
  settings: 'Settings',
};

export default function PlaceholderView({ nav, selectedTemplate }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="font-display text-xl" style={{ color: 'var(--gold-soft)' }}>
          {LABELS[nav] || ''} — قريبًا
        </div>
        <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.45)' }}>
          This part is coming in the next build pass.
        </div>
        {selectedTemplate && (
          <div className="mt-4 text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.35)' }}>
            Selected template: <span style={{ color: 'var(--gold-soft)' }}>{selectedTemplate}</span>
          </div>
        )}
      </div>
    </div>
  );
}
