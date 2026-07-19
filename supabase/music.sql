-- ============================================================================
-- LUMORA — Owner Music Studio (مكتبة الأغاني الخاصة بالأونر في الـ Dashboard)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql, storage-setup.sql, gallery.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- نفس فكرة gallery_photos بالظبط: مكتبة أغاني عامة للأونر، بيرفع فيها
-- مرة واحدة وبعدين يختار منها لأي دعوة بأي قالب — مفيش أي كود خاص
-- بالقوالب هنا برضه، الأغنية بترجع رابط عادي بيتحط في data.audioUrl
-- زي بالظبط لما بيرفع أغنية مباشر من StepMusic.jsx.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists music_tracks (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  url text not null,
  path text not null,
  name text not null default 'Untitled',
  created_at timestamptz not null default now()
);

create index if not exists music_tracks_owner_idx on music_tracks (owner_key, created_at desc);

alter table music_tracks enable row level security;

drop policy if exists "music select" on music_tracks;
create policy "music select" on music_tracks
  for select to anon, authenticated using (true);

drop policy if exists "music insert" on music_tracks;
create policy "music insert" on music_tracks
  for insert to anon, authenticated with check (true);

drop policy if exists "music delete" on music_tracks;
create policy "music delete" on music_tracks
  for delete to anon, authenticated using (true);

-- بيستخدم نفس bucket الـ 'media' زي الجاليري والأغنية بتاعة كل دعوة،
-- بس تحت مسار music-library/{owner_key}/... عشان ميتلخبطش مع audio/
-- المستخدم وقت نشر الدعوة نفسها في StepReview.jsx.
