import useScrollReveal from './lib/useScrollReveal';
import { firstText } from './lib/builderData';

function resolveItems(data) {
  const raw = Array.isArray(data?.timeline) ? data.timeline : [];

  return raw
    .map((item) => {
      if (!item) return null;
      const time = firstText(item.time, item.hour, item.label);
      const title = firstText(item.title, item.event, item.name);
      const description = firstText(item.description, item.details, item.text);
      if (!time && !title && !description) return null;
      return { time, title, description };
    })
    .filter(Boolean);
}

function TimelineItem({ item, index }) {
  const [ref, visible] = useScrollReveal();

  return (
    <li
      ref={ref}
      className={`ev-timeline__item ev-reveal ${visible ? 'ev-reveal--visible' : ''}`}
      style={{ transitionDelay: visible ? `${Math.min(index, 6) * 90}ms` : '0ms' }}
    >
      <div className="ev-timeline__marker" aria-hidden="true" />
      <div className="ev-timeline__content">
        {item.time && <span className="ev-timeline__time">{item.time}</span>}
        {item.title && <h3 className="ev-timeline__title">{item.title}</h3>}
        {item.description && <p className="ev-timeline__desc">{item.description}</p>}
      </div>
    </li>
  );
}

export default function Timeline({ data }) {
  const items = resolveItems(data);
  const [headerRef, headerVisible] = useScrollReveal();
  if (!items.length) return null;

  return (
    <section className="ev-timeline" id="timeline" data-section="timeline">
      <div
        ref={headerRef}
        className={`ev-timeline__header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <h2 className="ev-timeline__heading">The Day&apos;s Journey</h2>
        <span className="ev-timeline__divider" aria-hidden="true" />
      </div>
      <ol className="ev-timeline__list">
        {items.map((item, index) => (
          <TimelineItem key={`${item.time}-${item.title}-${index}`} item={item} index={index} />
        ))}
      </ol>
    </section>
  );
}
