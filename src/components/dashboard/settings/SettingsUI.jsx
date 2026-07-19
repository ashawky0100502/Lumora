/**
 * Shared building blocks for the Settings tabs, matching the same
 * lux-card / glass-card language already used across the dashboard
 * (see DashboardHome.jsx, GuestsView.jsx).
 */
export function SettingsCard({ title, description, children }) {
  return (
    <div
      className="lux-card mb-6 rounded-[18px] border p-[28px]"
      style={{ background: 'var(--glass)', borderColor: 'rgba(212,175,55,0.16)', backdropFilter: 'blur(16px)' }}
    >
      <h3 className="font-display mb-1.5 text-[1.05rem] font-semibold" style={{ letterSpacing: '0.02em' }}>
        {title}
      </h3>
      {description && (
        <p className="mb-6 text-[0.82rem] leading-relaxed" style={{ color: 'rgba(246,244,239,0.5)' }}>
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

const NOTICE_PALETTE = {
  success: { bg: 'rgba(120,180,130,0.12)', color: '#8ce0a8' },
  error: { bg: 'rgba(194,90,90,0.14)', color: '#e08a8a' },
  neutral: { bg: 'rgba(212,175,55,0.08)', color: 'rgba(246,244,239,0.7)' },
};

export function InlineNotice({ tone = 'neutral', children }) {
  const palette = NOTICE_PALETTE[tone] || NOTICE_PALETTE.neutral;
  return (
    <div
      className="mt-4 rounded-xl px-4 py-3 text-[0.82rem] leading-relaxed"
      style={{ background: palette.bg, color: palette.color }}
    >
      {children}
    </div>
  );
}

export function StatPill({ label, value }) {
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <div className="text-[0.68rem] uppercase" style={{ color: 'rgba(246,244,239,0.5)', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="font-display mt-0.5 text-[1.25rem]" style={{ color: 'var(--gold-soft)' }}>
        {value}
      </div>
    </div>
  );
}
