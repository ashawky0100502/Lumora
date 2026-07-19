function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function resolveStoryText(value) {
  if (typeof value === 'string') return value.trim() || undefined;
  if (!value || typeof value !== 'object') return undefined;
  if (typeof value.text === 'string' && value.text.trim()) return value.text.trim();
  if (typeof value.description === 'string' && value.description.trim()) return value.description.trim();
  if (typeof value.body === 'string' && value.body.trim()) return value.body.trim();
  if (Array.isArray(value.paragraphs)) {
    const paragraphs = value.paragraphs
      .map((item) => (typeof item === 'string' ? item : firstText(item?.text, item?.paragraph, item?.description)))
      .filter(Boolean);
    if (paragraphs.length) return paragraphs.join(' ');
  }
  return undefined;
}

function hasContent(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function aliasMissing(target, key, resolveValue) {
  if (hasContent(target[key])) return;
  const value = resolveValue();
  if (value !== undefined && value !== null) target[key] = value;
}

export function normalizeInvitationData(rawData) {
  const data = { ...rawData };

  aliasMissing(data, 'story', () => {
    if (hasContent(data.story)) return data.story;
    return firstText(data.howWeMet, data.storyText, data.loveStory);
  });

  aliasMissing(data, 'howWeMet', () => {
    if (hasContent(data.howWeMet)) return data.howWeMet;
    return resolveStoryText(data.story) || firstText(data.storyText, data.loveStory);
  });

  aliasMissing(data, 'lifeStory', () => firstText(data.lifeStory, resolveStoryText(data.story), data.howWeMet, data.storyText, data.loveStory));
  aliasMissing(data, 'brideStory', () => firstText(data.brideStory, data.letterBride, data.bioBride));
  aliasMissing(data, 'groomStory', () => firstText(data.groomStory, data.letterGroom, data.bioGroom));
  aliasMissing(data, 'engagementStory', () => firstText(data.engagementStory, data.engagement?.story));

  return data;
}
