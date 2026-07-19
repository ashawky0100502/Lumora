export function shouldRenderAuroraRsvp(data = {}, slug) {
  const enabled = data?.rsvp?.enabled !== false && data?.sections?.rsvp !== false;
  if (!enabled) return false;

  const hasSlug = typeof slug === 'string' && slug.trim() !== '';
  if (hasSlug) return true;

  return true;
}
