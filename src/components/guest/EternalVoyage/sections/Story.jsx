import useScrollReveal from './lib/useScrollReveal';
import { firstText } from './lib/builderData';

function resolveSectionContent(data, fieldName, fallback) {
  return firstText(
    data?.[fieldName],
    data?.[fieldName]?.text,
    data?.[fieldName]?.content,
    data?.[fieldName]?.body,
    fallback
  );
}

function resolveStoryEntries(data) {
  const entries = [];

  const ourStory = resolveSectionContent(data, 'story', data?.story?.text);
  if (ourStory) entries.push({ label: 'Our Story', text: ourStory });

  const howWeMet = resolveSectionContent(data, 'howWeMet', data?.howWeMetText);
  if (howWeMet) entries.push({ label: 'How We Met', text: howWeMet });

  const lifeStory = resolveSectionContent(data, 'lifeStory', data?.lifeStoryText);
  if (lifeStory) entries.push({ label: 'Life Story', text: lifeStory });

  const brideStory = resolveSectionContent(data, 'brideStory', data?.letterBride);
  if (brideStory) entries.push({ label: 'From the Bride', text: brideStory });

  const groomStory = resolveSectionContent(data, 'groomStory', data?.letterGroom);
  if (groomStory) entries.push({ label: 'From the Groom', text: groomStory });

  const engagementStory = resolveSectionContent(data, 'engagementStory', data?.engagement?.story);
  if (engagementStory) entries.push({ label: 'Our Engagement', text: engagementStory });

  return entries;
}

function StoryCard({ entry, index }) {
  const [ref, visible] = useScrollReveal();
  const isRightAligned = index % 2 === 1;
  return (
    <article
      ref={ref}
      className={`ev-story__chapter ev-reveal ${visible ? 'ev-reveal--visible' : ''} ${isRightAligned ? 'ev-story__chapter--right' : ''}`}
      style={{ transitionDelay: visible ? `${Math.min(index, 6) * 120}ms` : '0ms' }}
    >
      <div className="ev-story__chapter-inner">
        {entry.label && <span className="ev-story__label">{entry.label}</span>}
        <p className="ev-story__text">{entry.text}</p>
      </div>
    </article>
  );
}

export default function Story({ data }) {
  const entries = resolveStoryEntries(data);
  const [headerRef, headerVisible] = useScrollReveal();
  if (!entries.length) return null;

  const title = firstText(
    typeof data?.story === 'object' ? data?.story?.title : '',
    data?.storyTitle
  ) || 'Our Story';

  return (
    <section className="ev-story" id="story" data-section="story">
      <div
        ref={headerRef}
        className={`ev-story__header ev-reveal ${headerVisible ? 'ev-reveal--visible' : ''}`}
      >
        <h2 className="ev-story__heading">{title}</h2>
        <span className="ev-story__divider" aria-hidden="true" />
      </div>
      <div className="ev-story__chapters">
        {entries.map((entry, index) => (
          <StoryCard key={`${entry.label}-${index}`} entry={entry} index={index} />
        ))}
      </div>
    </section>
  );
}
