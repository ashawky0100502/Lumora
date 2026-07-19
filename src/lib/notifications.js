import { supabaseClient } from './supabaseClient';
import { getMyInvites, getSeenMap } from './myInvites';

const NOTIF_SOURCES = [
  { table: 'rsvps', icon: '💌' },
  { table: 'messages', icon: '💬' },
  { table: 'comments', icon: '📝' },
];

export function notifText(item) {
  const guestName = item.row.name || (item.invite.language === 'en' ? 'A guest' : 'ضيف');
  const couple = `${item.invite.groom || ''} & ${item.invite.bride || ''}`;
  if (item.table === 'rsvps') {
    const attending = item.row.status === 'attending' || item.row.status === 'yes';
    const verb =
      item.invite.language === 'en'
        ? attending
          ? 'confirmed attendance to'
          : 'responded to'
        : attending
          ? 'أكد حضوره لـ'
          : 'اعتذر عن حضور';
    return { guestName, verb, couple, table: item.table };
  }
  if (item.table === 'messages') {
    return {
      guestName,
      couple,
      table: item.table,
      text: item.invite.language === 'en' ? 'left a message on' : 'ترك رسالة على دعوة',
    };
  }
  return {
    guestName,
    couple,
    table: item.table,
    text: item.invite.language === 'en' ? 'commented on' : 'علّق على دعوة',
  };
}

export function timeAgo(iso, lang) {
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

export async function fetchNotifications() {
  const invites = getMyInvites();
  if (!invites.length) return [];
  const seenMap = getSeenMap();

  // Fire every invite x table query in parallel instead of awaiting them
  // one at a time — for N invites that's N*3 round trips happening
  // together instead of in sequence, which is the difference between one
  // network round-trip's worth of latency and N*3 of them stacked up.
  const queries = [];
  for (const inv of invites) {
    for (const src of NOTIF_SOURCES) {
      queries.push(
        supabaseClient
          .from(src.table)
          .select('*')
          .eq('slug', inv.slug)
          .order('created_at', { ascending: false })
          .limit(8)
          .then(({ data, error }) => {
            if (error || !data) return [];
            const seenAt = seenMap[inv.slug];
            return data.map((row) => ({
              table: src.table,
              icon: src.icon,
              invite: inv,
              row,
              created_at: row.created_at,
              unread: seenAt ? new Date(row.created_at) > new Date(seenAt) : true,
            }));
          })
          .catch(() => []) // a table that doesn't exist yet shouldn't sink the rest
      );
    }
  }

  const batches = await Promise.all(queries);
  const results = batches.flat();
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return results.slice(0, 25);
}
