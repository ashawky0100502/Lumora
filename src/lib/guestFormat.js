export function initialsOf(name) {
  return (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function timeAgo(iso, lang = 'en') {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const isAr = lang === 'ar';
  if (mins < 1) return isAr ? 'الآن' : 'just now';
  if (mins < 60) return isAr ? `منذ ${mins} د` : `${mins}m ago`;
  if (hours < 24) return isAr ? `منذ ${hours} س` : `${hours}h ago`;
  if (days < 7) return isAr ? `منذ ${days} يوم` : `${days}d ago`;
  return new Date(iso).toLocaleDateString(isAr ? 'ar' : 'en-US', { month: 'short', day: 'numeric' });
}
