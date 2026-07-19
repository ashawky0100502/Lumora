/**
 * Builds a unified notification feed for the couple portal out of data the
 * portal is already polling (rsvps, thread summaries, comments) — no extra
 * network calls needed. Each item gets a stable `key` so callers can diff
 * consecutive polls to detect what's genuinely new.
 */
export function buildNotificationItems(lang, rsvps, threads, comments) {
  const ar = lang !== 'en';
  const items = [];

  (rsvps || []).forEach((r) => {
    if (!r.created_at) return;
    const attending = r.status === 'attending' || r.status === 'yes';
    items.push({
      key: `rsvp:${r.id ?? r.created_at}`,
      type: 'rsvp',
      icon: '💌',
      ts: r.created_at,
      guestName: r.name || (ar ? 'ضيف' : 'A guest'),
      text: ar ? (attending ? 'أكد حضوره' : 'اعتذر عن الحضور') : attending ? 'confirmed attendance' : 'sent regrets',
    });
  });

  (threads || []).forEach((th) => {
    if (!th.last_at || th.last_sender !== 'guest') return;
    items.push({
      key: `msg:${th.guest_token}:${th.last_at}`,
      type: 'message',
      icon: '💬',
      ts: th.last_at,
      guestName: th.guest_name || (ar ? 'ضيف' : 'A guest'),
      text: ar ? 'أرسل رسالة' : 'sent a message',
    });
  });

  (comments || []).forEach((c) => {
    if (!c.created_at) return;
    items.push({
      key: `comment:${c.id ?? c.created_at}`,
      type: 'comment',
      icon: '📝',
      ts: c.created_at,
      guestName: c.name || (ar ? 'ضيف' : 'A guest'),
      text: ar ? 'ترك تهنئة' : 'left a comment',
    });
  });

  items.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  return items.slice(0, 30);
}

export function timeAgoPortal(iso, lang) {
  if (!iso) return '';
  const diff = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const ar = lang !== 'en';
  const units = [
    [31536000, 'y', 'سنة'],
    [2592000, 'mo', 'شهر'],
    [604800, 'w', 'أسبوع'],
    [86400, 'd', 'يوم'],
    [3600, 'h', 'ساعة'],
    [60, 'm', 'دقيقة'],
  ];
  for (const [secs, en, arLabel] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return ar ? `منذ ${val} ${arLabel}` : `${val}${en} ago`;
  }
  return ar ? 'الآن' : 'just now';
}
