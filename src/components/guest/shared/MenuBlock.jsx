import { GuestCard, SectionHeading } from './GuestUI';
import Reveal from './Reveal';

export default function MenuBlock({ theme, menu, t }) {
  const items = (menu || []).filter((m) => m.name?.trim());
  if (items.length === 0) return null;

  const groups = items.reduce((acc, item) => {
    const cat = item.category || t.defaultCategory;
    (acc[cat] = acc[cat] || []).push(item);
    return acc;
  }, {});

  return (
    <Reveal theme={theme} className="mx-auto w-full max-w-lg px-5">
      <GuestCard theme={theme}>
        <SectionHeading theme={theme} kicker={t.kicker} title={t.title} />
        <div className="flex flex-col gap-6">
          {Object.entries(groups).map(([cat, dishes]) => (
            <div key={cat}>
              <div
                className="relative mb-3 text-[0.72rem] uppercase after:absolute after:left-0 after:top-1/2 after:ml-[6.5em] after:h-px after:w-16 after:content-['']"
                style={{ color: theme.accent, letterSpacing: '0.2em', fontFamily: theme.uiFont }}
              >
                {cat}
              </div>
              <div className="flex flex-col gap-2">
                {dishes.map((d, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-3 text-[0.92rem]" style={{ fontFamily: theme.bodyFont, color: theme.ink }}>
                    <span>{d.name}</span>
                    {d.note && <span className="text-[0.78rem] italic" style={{ color: theme.inkSoft }}>{d.note}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GuestCard>
    </Reveal>
  );
}
