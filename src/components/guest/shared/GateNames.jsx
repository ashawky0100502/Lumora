export default function GateNames({ theme, groom, bride, dateStr, kicker, sub }) {
  return (
    <div className="relative z-10 text-center">
      {kicker && (
        <div className="mb-5 text-[0.62rem] uppercase" style={{ color: theme.accent, letterSpacing: '0.42em', fontFamily: theme.uiFont }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.5rem, 6.5vw, 2.1rem)', letterSpacing: '0.05em', lineHeight: 1.3 }}>
        {groom}
      </div>
      <div className="relative my-2.5 inline-block text-[1.05rem] italic" style={{ color: theme.accent, fontFamily: theme.bodyFont }}>
        &amp;
      </div>
      <div style={{ fontFamily: theme.displayFont, color: theme.ink, fontSize: 'clamp(1.5rem, 6.5vw, 2.1rem)', letterSpacing: '0.05em', lineHeight: 1.3 }}>
        {bride}
      </div>
      {dateStr && (
        <div className="mt-4 text-[0.95rem]" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
          {dateStr}
        </div>
      )}
      {sub && (
        <p className="mx-auto mt-5 max-w-[280px] text-[0.95rem] italic leading-[1.8]" style={{ color: theme.inkSoft, fontFamily: theme.bodyFont }}>
          {sub}
        </p>
      )}
    </div>
  );
}
