-- ============================================================================
-- LUMORA — Owner Gallery (المكتبة الخاصة بصور الأونر في الـ Dashboard)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql, storage-setup.sql, couple_portal.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- ليه جدول منفصل عن invitations؟
-- الجاليري دي مكتبة صور عامة للأونر (مش مرتبطة بدعوة واحدة بعينها) — بيرفع
-- فيها صور مرة واحدة وبعدين يختار منها لأي دعوة، بأي قالب، حالي أو هيتضاف
-- بعدين. القوالب نفسها مش عندها أي جدول أو كود خاص بالصور — كلها بتعدي
-- على نفس GuestPageLayout / GalleryBlock، فبمجرد ما الرابط اتحط في
-- engagementPhotos / outingPhotos / photoGroom / photoBride بيشتغل تلقائي
-- على أي قالب من غير أي تعديل إضافي.
--
-- الموديل الأمني هنا زي بالظبط invitations (select using (true)) لأن
-- الداشبورد ده أصلاً single-admin panel من غير حسابات حقيقية (myInvites.js
-- بيتتبع كل حاجة محليًا بالـ localStorage) — مفيش داعي لحماية أعلى من كده
-- هنا، بس بنعزل صور كل جهاز/متصفح بعمود owner_key.
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists gallery_photos (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  url text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists gallery_photos_owner_idx on gallery_photos (owner_key, created_at desc);

alter table gallery_photos enable row level security;

drop policy if exists "gallery select" on gallery_photos;
create policy "gallery select" on gallery_photos
  for select to anon, authenticated using (true);

drop policy if exists "gallery insert" on gallery_photos;
create policy "gallery insert" on gallery_photos
  for insert to anon, authenticated with check (true);

drop policy if exists "gallery delete" on gallery_photos;
create policy "gallery delete" on gallery_photos
  for delete to anon, authenticated using (true);

-- ملحوظة: الرفع الفعلي للملفات بيستخدم نفس bucket الـ 'media' المستخدم
-- بالفعل لرفع الأغاني في StepReview.jsx (supabaseClient.storage.from('media'))
-- تحت مسار gallery/{owner_key}/... — مفيش داعي لعمل bucket أو policy جديدة
-- لأن الـ bucket ده أصلاً public-read ومسموح فيه upload بالـ anon key.
