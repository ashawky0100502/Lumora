export function orderGuestbookComments(comments = []) {
  const sorted = [...comments].sort((a, b) => {
    const aPinned = Boolean(a.pinned_at);
    const bPinned = Boolean(b.pinned_at);

    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return sorted;
}
