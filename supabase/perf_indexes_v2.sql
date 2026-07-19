-- ============================================================================
-- LUMORA — Performance indexes v2 (rsvps + messages)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده بعد perf_indexes.sql. ده بيكمّل نفس الفكرة على جدولين
-- كانوا ناقصين index: rsvps و messages.
--
-- get_couple_rsvps / get_owner_rsvps بيفلتروا rsvps بـ slug ويرتبوا بـ
-- created_at — من غير index، أي دعوة فيها كام مية RSVP هتاخد وقت أطول كل ما
-- الردود تزيد لأن بوستجريس بيمشي على الجدول كله.
--
-- get_couple_threads بيتجمع (group by) على guest_token بعد فلترة بـ slug،
-- وget_guest_thread / get_couple_thread_messages بيفلتروا بـ (slug,
-- guest_token) بالظبط — الـ index المركب ده بيخلي الفلترة والتجميع يتعملوا
-- من الفهرس مباشرة من غير ما بوستجريس يقرا الجدول كله.
-- ============================================================================

create index if not exists idx_rsvps_slug_created_at
  on rsvps (slug, created_at desc);

create index if not exists idx_messages_slug_guest_token_created_at
  on messages (slug, guest_token, created_at asc);

create index if not exists idx_messages_slug_created_at
  on messages (slug, created_at desc);

NOTIFY pgrst, 'reload schema';
