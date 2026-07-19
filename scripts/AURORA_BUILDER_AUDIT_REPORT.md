Aurora Builder Integration Audit — FINAL REPORT

✅ Fixed issues
- Removed serializer-injected preview fallbacks that polluted published payloads (no more groom/bride fallback images or default copy injected at publish time).
- Normalizer (`normalizeAuroraPayload`) hardened: accepts nested and alternate builder key shapes (e.g. `timeline.events`, `rsvp.title`/`rsvp.subtitle`, `commentsTitle`/`commentsDescription`, `messagesTitle`).
- Timeline: stopped fabricating events; now only renders real builder `events` (title/time/description/icon).
- Gallery: strictly sources images from builder `gallery.images` (and engagement/outings where present); removed preview image fallbacks.
- Guestbook & Private Messages: replaced bespoke guestbook with shared `CommentsBlock` and `ChatBlock` (uses `guestApi` canonical flows for load/submit/react/send).
- RSVP: `slug` is now accepted/passed consistently from the template root into RSVP and Guestbook; `submitRsvp` is used unmodified.
- Venue: normalized `mapLat`/`mapLng` and improved `mapUrl` parsing; `parkingInfo` exposed from builder payload.
- Publish serializer (`serializeInvitationPayload`) audited to avoid injecting preview content; it writes only explicit builder fields (menu, timeline.events, gallery.images, rsvp object, etc.).
- Small code-quality/perf: added `decoding="async"` and `loading` attributes to large images to reduce main-thread decoding (no visual changes).
- Unit test adjusted to reflect removed default gallery title.

⚠ Remaining runtime-only verification items
- Database/RLS verification: confirm Supabase RLS policies and RPCs allow guest writes (comments, messages, rsvps) from the public anon key used by the guest UI.
- End-to-end API checks: run smoke tests to confirm `submitRsvp`, `submitComment`, `sendGuestMessage`, `toggleCommentReaction`, and related RPCs succeed in the live DB and that webhooks/owner inboxes receive data.
- Couple portal integration: validate that published payload shape matches the couple portal/read RPCs exactly (e.g. `get_owner_rsvps`, `get_couple_rsvps`) in production.
- Production build & asset audit: perform `npm run build` to collect real chunk sizes, bundler warnings, and to validate no tree-shaking/runtime errors.
- Cross-template behavior tests: verify `CommentsBlock`/`ChatBlock` live behavior matches other templates in production (message delivery, polling, reactions UX).
- Third-party embed verification: test Google Maps embed URL generation and iframe loading in production origin.

❌ Known unresolved issues
- Cannot execute runtime verification here (Node/npm/build environment and network access not available in this session). All remaining checks above require running the app against the real Supabase instance.
- Minor schema shape assumptions: while serializer+normalizer were aligned, there are multiple accepted key shapes (top-level vs nested). The code supports the common variants, but if a dashboard writes an unexpected custom key, runtime verification will surface it.
- Possible edge-case: `timeline` may exist in builder as either an array or an object with `events`; normalization now supports both shapes, but any additional unknown timeline shapes would need runtime logs to diagnose.

Builder fields Aurora now supports (normalized payload keys)
- `names`
  - `groom`
  - `bride`
  - `coupleName`

- `hero`
  - `subtitle`
  - `date`
  - `image` (hero/cover/background)
  - `video`
  - `ctaText`

- `story`
  - `intro`
  - `quote`
  - `title`
  - `paragraphs` (array)
  - `image`

- `howWeMet`
  - `title`
  - `content`

- `gallery`
  - `title`
  - `description`
  - `images` (array of `{ src, alt }`)

- `engagement`
  - `enabled`
  - `title`
  - `description`
  - `date`
  - `location`
  - `timeline` (array of `{ label, value }`)
  - `images` (array)
  - `story`

- `timeline`
  - `title`
  - `description`
  - `events` (array of `{ title, time, description, icon }`)

- `outings`
  - `enabled`
  - `title`
  - `description`
  - `images`

- `letters`
  - `enabled`
  - `groom`
  - `bride`

- `comments` (guestbook)
  - `enabled`
  - `title`
  - `description`

- `messages` (private guest thread)
  - `enabled`
  - `title`
  - `description`

- `venue`
  - `name`
  - `address`
  - `ceremonyTime`
  - `receptionTime`
  - `image`
  - `mapUrl`
  - `mapLat`
  - `mapLng`
  - `parkingInfo`

- `menu`
  - `title`
  - `description`
  - `items` (array of `{ title/name, description, icon, category }`)

- `quran`
  - `enabled`
  - `verseArabic`
  - `verseTranslation`
  - `surahName`
  - `audioUrl`
  - `reciterName`

- `footer`
  - `message`

- `invitation`
  - `message`

- `sections` (flags)
  - `location`, `gallery`, `engagement`, `outings`, `letters`, `music`, `menu`, `messages`, `comments`, `rsvp`, `timeline`

- `music`
  - `audioUrl`
  - `title`
  - `autoplay`
  - `loop`
  - `volume`
  - `trimStart`
  - `trimEnd`
  - `audioFull`

- `countdown`
  - `targetDate`
  - `targetTime`

- `rsvp`
  - `enabled`
  - `title`
  - `subtitle`

Notes on supported input shapes
- The normalizer accepts multiple common builder/published key shapes: nested (`section.field`), top-level aliases (`rsvpTitle`, `timelineTitle`), and both `timeline.events` or `timeline` array forms.
- Image arrays accept strings or objects with common keys (`image`, `src`, `url`, `photo`, `file.url`, `alt`, `title`).

---

If you want, I can:
- Run the smoke test script against the production Supabase (you'll need to run it locally or provide a Node environment here).
- Execute `npm run build` locally to collect production build diagnostics and complete the performance audit.

Files changed (high level)
- `src/components/guest/templates/Aurora/lib/auroraPayload.js` — normalization fixes and expanded key support
- `src/components/dashboard/create/steps/publishSerializer.js` — audited to avoid preview fallbacks
- `src/components/guest/templates/Aurora/sections/Guestbook/index.jsx` — replaced with shared `CommentsBlock`/`ChatBlock`
- `src/components/guest/templates/Aurora/Aurora.jsx` — pass `theme`/`slug` through
- Minor image decoding/perf tweaks and a unit test update

Audit completed to code-level parity: Builder integration checklist 11/11 (functional, code-only). Runtime verification steps remain as listed above.
