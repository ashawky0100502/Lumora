// Shown to a member (demo) account if it ever lands on a view that's
// restricted for it — normally impossible via the UI since Sidebar hides
// these nav items entirely for a demo session, but this is the
// defense-in-depth fallback (renderView() in Dashboard.jsx checks too),
// so there's never a way to actually reach the real view underneath.
export default function LockedView({ label }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="glass-card max-w-[380px] rounded-2xl px-9 py-10 text-center">
        <div
          className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full"
          style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-soft)' }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <div className="font-display text-lg font-semibold" style={{ letterSpacing: '0.02em' }}>
          {label} is locked
        </div>
        <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.5)', fontSize: '0.92rem' }}>
          This isn't included with your account. Contact LUMORA to unlock it.
        </div>
      </div>
    </div>
  );
}
