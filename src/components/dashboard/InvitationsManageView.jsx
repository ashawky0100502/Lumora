import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOwnerRsvps } from '../../lib/ownerApi';
import {
  removeFromMyList,
  removeAllFromMyList,
  permanentlyDeleteInvitation,
  permanentlyDeleteAllInvitations,
  permanentlyDeleteMemberInvitation,
  permanentlyDeleteAllMemberInvitations,
} from '../../lib/invitationsManageApi';
import { sfxClick, sfxSuccess, sfxError } from '../../lib/sfx';
import { supabaseClient } from '../../lib/supabaseClient';
import { slugify, BRAND_DOMAIN } from '../../lib/wizardData';

// Rebuilds the same guest/couple links + access code shown right after
// publishing (StepReview.jsx) — but on demand, from just the slug, so an
// owner who lost/closed that one-time screen can always find them again
// from "My Invitations".
async function fetchInviteLinks(invite) {
  const prettySlug = slugify(`${invite.groom || ''}-${invite.bride || ''}`) || invite.slug;
  const url = `${location.origin}${location.pathname}?invite=${encodeURIComponent(invite.slug)}`;
  const prettyUrl = `${BRAND_DOMAIN}/${prettySlug}`;

  let coupleUrl = null;
  let accessCode = null;
  const { data: code, error } = await supabaseClient.rpc('get_or_create_access_code', { p_slug: invite.slug });
  if (!error && code) {
    accessCode = code;
    coupleUrl = `${location.origin}${location.pathname}?couple=${encodeURIComponent(invite.slug)}&key=${encodeURIComponent(code)}`;
  }

  return { url, prettyUrl, coupleUrl, accessCode };
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={() => {
        sfxClick();
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? 'Copied ✓' : 'Copy Link'}
    </button>
  );
}

function InviteLinksPanel({ invite }) {
  const [links, setLinks] = useState(null); // null = loading, 'error', or the object
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLinks(null);
    fetchInviteLinks(invite)
      .then((res) => alive && setLinks(res))
      .catch(() => alive && setLinks('error'));
    return () => {
      alive = false;
    };
  }, [invite.slug, reloadKey]);

  if (links === null) {
    return (
      <div className="mt-3 text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
        Loading links…
      </div>
    );
  }

  if (links === 'error') {
    return (
      <div className="mt-3 text-[0.78rem]" style={{ color: '#e08a8a' }}>
        Couldn't load links.{' '}
        <button type="button" className="underline" onClick={() => setReloadKey((k) => k + 1)}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
      <div className="text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
        رابط الضيوف — شاركه مع المدعوين:
      </div>
      <a
        href={links.url}
        target="_blank"
        rel="noopener"
        className="mt-1.5 block break-all text-[0.85rem] underline"
        style={{ color: 'var(--gold-soft)' }}
      >
        {links.prettyUrl}
      </a>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={links.url} target="_blank" rel="noopener" className="btn-gold">
          Preview Invitation
        </a>
        <CopyButton text={links.url} />
      </div>

      {links.coupleUrl && (
        <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(212,175,55,0.14)' }}>
          <div className="text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
            💍 رابط خاص بالعروسين — لمتابعة الرسايل والـ RSVP والرد على الضيوف:
          </div>
          <a
            href={links.coupleUrl}
            target="_blank"
            rel="noopener"
            className="mt-1.5 block break-all text-[0.85rem] underline"
            style={{ color: 'var(--gold-soft)' }}
          >
            Couple link
          </a>
          <div className="mt-1.5 text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
            كود الدخول: <b style={{ color: 'var(--gold-soft)' }}>{links.accessCode}</b>
          </div>
          <div className="mt-2">
            <CopyButton text={links.coupleUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

function InviteRow({ invite, rsvpCount, session, onDeleted }) {
  const isDemo = session?.type === 'demo';
  // Owner: 'remove' = safe default (unlink from my list only); 'forever' =
  // the real, irreversible server-side delete — two confirmation flows on
  // purpose. Member: there's no local list to unlink from (their list IS
  // the server), so 'forever' is the only path, just still confirmed.
  const [confirming, setConfirming] = useState(null); // null | 'remove' | 'forever'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const coupleNames = `${invite.groom || ''} & ${invite.bride || ''}`.trim() || invite.slug;

  function handleRemoveFromList() {
    removeFromMyList(invite.slug);
    sfxSuccess();
    onDeleted(invite.slug);
  }

  async function handleDeleteForever() {
    setBusy(true);
    setError('');
    try {
      if (isDemo) {
        await permanentlyDeleteMemberInvitation(session.account?.accountId, invite.slug);
      } else {
        await permanentlyDeleteInvitation(invite.slug);
      }
      sfxSuccess();
      onDeleted(invite.slug);
    } catch (e) {
      sfxError();
      setError(e?.message || 'Could not delete this invitation.');
      setBusy(false);
      setConfirming(null);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="min-w-0 flex-1 cursor-pointer text-right"
          onClick={() => {
            sfxClick();
            setExpanded((e) => !e);
          }}
        >
          <div className="flex items-center gap-2 truncate text-[0.92rem]" style={{ color: 'var(--gold-soft)' }}>
            <span className="truncate">{coupleNames}</span>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 shrink-0 transition-transform"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
          <div className="truncate text-[0.72rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
            /{invite.slug} · {rsvpCount} response{rsvpCount === 1 ? '' : 's'} · اضغط لعرض الروابط
          </div>
          {error && (
            <div className="mt-1 text-[0.7rem]" style={{ color: '#e08a8a' }}>
              {error}
            </div>
          )}
        </button>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {!isDemo && confirming === null && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  sfxClick();
                  setConfirming('remove');
                }}
              >
                إزالة من قايمتي
              </button>
            </div>
          )}

          {!isDemo && confirming === 'remove' && (
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[0.74rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
                هتشيلها من "دعواتي" بس — الدعوة والبورتال بتاع العريس هيفضلوا شغالين عادي.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full px-4 py-1.5 text-[0.78rem]"
                  style={{ background: 'var(--gold-soft)', color: '#1a1206' }}
                  onClick={() => {
                    sfxClick();
                    handleRemoveFromList();
                  }}
                >
                  أيوه، شيلها من القايمة
                </button>
                <button type="button" className="btn-ghost" onClick={() => setConfirming(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {(isDemo || confirming !== 'remove') && confirming !== 'forever' && (
            <button
              type="button"
              className={isDemo ? 'btn-ghost' : 'text-[0.7rem] underline'}
              style={isDemo ? undefined : { color: 'rgba(224,138,138,0.75)' }}
              onClick={() => {
                sfxClick();
                setConfirming('forever');
              }}
            >
              {isDemo ? 'حذف' : 'حذف نهائي (يوقف الدعوة عند العريس)'}
            </button>
          )}

          {confirming === 'forever' && (
            <div className="flex flex-col items-end gap-1.5 rounded-xl border p-2.5" style={{ borderColor: 'rgba(220,90,90,0.35)' }}>
              <span className="text-[0.74rem]" style={{ color: '#e08a8a' }}>
                ده حذف نهائي: الرابط عند الضيوف والبورتال بتاع العريس هيقفوا خالص، مع كل الـ RSVPs
                والتعليقات والرسايل. الإجراء ده مينفعش يترجع.
              </span>
              {error && (
                <span className="text-[0.7rem]" style={{ color: '#e08a8a' }}>
                  {error}
                </span>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  className="rounded-full px-4 py-1.5 text-[0.78rem]"
                  style={{ background: '#c25a5a', color: '#fff' }}
                  onClick={handleDeleteForever}
                >
                  {busy ? 'بيتم الحذف…' : 'أيوه، احذفها نهائي'}
                </button>
                <button type="button" className="btn-ghost" disabled={busy} onClick={() => setConfirming(null)}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <InviteLinksPanel invite={invite} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function InvitationsManageView({ session = { type: 'owner' } }) {
  const isDemo = session.type === 'demo';
  const [state, setState] = useState(null); // { invites, rsvps } | 'error'
  const [deletedSlugs, setDeletedSlugs] = useState([]);
  const [confirmingAll, setConfirmingAll] = useState(null); // null | 'remove' | 'forever'
  const [deletingAll, setDeletingAll] = useState(false);
  const [allError, setAllError] = useState('');

  useEffect(() => {
    let alive = true;
    getOwnerRsvps(session)
      .then((res) => alive && setState(res))
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
    };
  }, [session]);

  const rsvpCountBySlug = useMemo(() => {
    const map = {};
    if (state && state !== 'error') {
      state.rsvps.forEach((r) => (map[r.slug] = (map[r.slug] || 0) + 1));
    }
    return map;
  }, [state]);

  const invites = useMemo(() => {
    if (!state || state === 'error') return [];
    return state.invites.filter((i) => !deletedSlugs.includes(i.slug));
  }, [state, deletedSlugs]);

  function handleOneDeleted(slug) {
    setDeletedSlugs((s) => [...s, slug]);
  }

  function handleRemoveAllFromList() {
    removeAllFromMyList();
    sfxSuccess();
    setDeletedSlugs(invites.map((i) => i.slug));
    setConfirmingAll(null);
  }

  async function handleDeleteAllForever() {
    setDeletingAll(true);
    setAllError('');
    try {
      if (isDemo) {
        await permanentlyDeleteAllMemberInvitations(session.account?.accountId, invites.map((i) => i.slug));
      } else {
        await permanentlyDeleteAllInvitations();
      }
      sfxSuccess();
      setDeletedSlugs(invites.map((i) => i.slug));
      setConfirmingAll(null);
    } catch (e) {
      sfxError();
      setAllError(e?.message || 'Could not delete your invitations.');
    } finally {
      setDeletingAll(false);
    }
  }

  if (state === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: 'rgba(246,244,239,0.5)' }}>
        Loading your invitations…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[0.85rem]" style={{ color: '#e08a8a' }}>
        Couldn't load your invitations. Try refreshing the page.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-display text-[1.5rem]" style={{ letterSpacing: '0.02em' }}>
            My Invitations
          </div>
          <div className="font-serif-alt mt-1 italic" style={{ color: 'rgba(246,244,239,0.5)' }}>
            {isDemo
              ? 'الدعوات اللي نشرتها من حسابك — خاصة بيك وحدك.'
              : 'إزالة دعوة هنا بتشيلها من قايمتك بس — الدعوة، الروابط، والبورتال بتاع العريس بيفضلوا شغالين عادي. لو عايز تفضي المساحة فعليًا وتوقف الدعوة نهائيًا، استخدم "حذف نهائي".'}
          </div>
        </div>

        {invites.length > 0 && (
          <div className="flex shrink-0 flex-col items-end gap-2">
            {confirmingAll === null && (
              <div className="flex items-center gap-3">
                {!isDemo && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      sfxClick();
                      setConfirmingAll('remove');
                    }}
                  >
                    إزالة الكل من قايمتي
                  </button>
                )}
                <button
                  type="button"
                  className={isDemo ? 'btn-ghost' : 'text-[0.7rem] underline'}
                  style={isDemo ? undefined : { color: 'rgba(224,138,138,0.75)' }}
                  onClick={() => {
                    sfxClick();
                    setConfirmingAll('forever');
                  }}
                >
                  {isDemo ? 'حذف الكل' : 'حذف الكل نهائي'}
                </button>
              </div>
            )}

            {!isDemo && confirmingAll === 'remove' && (
              <div className="glass-card flex flex-col gap-2 rounded-xl p-3.5 text-right">
                <span className="text-[0.78rem]" style={{ color: 'rgba(246,244,239,0.6)' }}>
                  هتشيل كل {invites.length} دعوة من قايمتك بس — كل الدعوات هتفضل شغالة عادي عند العرسان.
                </span>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-ghost" onClick={() => setConfirmingAll(null)}>
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="rounded-full px-4 py-1.5 text-[0.78rem]"
                    style={{ background: 'var(--gold-soft)', color: '#1a1206' }}
                    onClick={handleRemoveAllFromList}
                  >
                    أيوه، شيلهم من القايمة
                  </button>
                </div>
              </div>
            )}

            {confirmingAll === 'forever' && (
              <div className="glass-card flex flex-col gap-2 rounded-xl p-3.5 text-right" style={{ borderColor: 'rgba(220,90,90,0.35)' }}>
                <span className="text-[0.78rem]" style={{ color: '#e08a8a' }}>
                  ده حذف نهائي لكل {invites.length} دعوة{invites.length === 1 ? '' : ''} — هيقفل رابط الضيوف وبورتال
                  العريس لكل واحدة، مع كل الردود والرسايل. الإجراء ده مينفعش يترجع.
                </span>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn-ghost" disabled={deletingAll} onClick={() => setConfirmingAll(null)}>
                    إلغاء
                  </button>
                  <button
                    type="button"
                    disabled={deletingAll}
                    className="rounded-full px-4 py-1.5 text-[0.78rem]"
                    style={{ background: '#c25a5a', color: '#fff' }}
                    onClick={handleDeleteAllForever}
                  >
                    {deletingAll ? 'بيتم الحذف…' : 'أيوه، احذف الكل نهائي'}
                  </button>
                </div>
                {allError && <span className="text-[0.7rem]">{allError}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {invites.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
          <div className="font-display text-xl" style={{ color: 'var(--gold-soft)' }}>
            No invitations to manage
          </div>
          <div className="font-serif-alt mt-2 italic" style={{ color: 'rgba(246,244,239,0.45)' }}>
            {isDemo ? 'Invitations you publish will show up here.' : 'Invitations you publish from this browser will show up here.'}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {invites.map((invite) => (
              <InviteRow
                key={invite.slug}
                invite={invite}
                rsvpCount={rsvpCountBySlug[invite.slug] || 0}
                session={session}
                onDeleted={handleOneDeleted}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
