-- ============================================================================
-- LUMORA — Couple Portal (النسخة الصح، متوافقة مع السيكوال + الفرونت إند)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql و storage-setup.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- ليه اتعمل من الأول؟
-- الملف القديم (couple_portal.sql اللي كان جوه الـ zip) كان بيحفظ الكود
-- السري (access_code) كعمود جوه جدول invitations نفسه، وinvitations عنده
-- policy عامة "select using (true)" من setup.sql. ده معناه إن أي حد يعرف
-- الـ REST endpoint يقدر يعمل GET لعمود access_code مباشرة لأي دعوة، من
-- غير ما يعدي على أي دالة تحقق — ثغرة أمنية حقيقية.
-- السيكوال الأصلي (lumora_couple_access.sql) كان عامل الموضوع صح: جدول
-- منفصل (invite_access) مقفول تمامًا (revoke all from anon/authenticated)
-- والوصول الوحيد ليه عن طريق دوال SECURITY DEFINER. السكريبت ده بيرجع
-- لنفس المبدأ، وفي نفس الوقت بيدّي بالظبط أسماء وأشكال الدوال اللي
-- coupleApi.js و guestApi.js بينادوا عليها فعليًا في الكود.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) لو كان الملف القديم اتشغّل قبل كده وحط access_code في invitations،
--    ننقل القيم لجدول آمن ونشيل العمود المكشوف ده.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'invitations' and column_name = 'access_code'
  ) then
    create table if not exists invite_access (
      slug text primary key references invitations(slug) on delete cascade,
      access_code text not null,
      created_at timestamptz default now()
    );
    insert into invite_access (slug, access_code)
      select slug, access_code from invitations
      where access_code is not null
      on conflict (slug) do nothing;
    alter table invitations drop column access_code;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 1) جدول الكود السري — مقفول تمامًا، مفيش وصول مباشر من الفرونت إند خالص
-- ---------------------------------------------------------------------------
create table if not exists invite_access (
  slug text primary key references invitations(slug) on delete cascade,
  access_code text not null,
  created_at timestamptz default now()
);
alter table invite_access enable row level security;
revoke all on invite_access from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) أعمدة الشات الخاص + ردود الكومنتات (زي ما اتعمل في السيكوال الأصلي)
-- ---------------------------------------------------------------------------
alter table messages add column if not exists guest_token text;
alter table messages add column if not exists sender text default 'guest';
alter table messages add column if not exists seen_by_couple boolean not null default false;
alter table messages add column if not exists seen_by_guest boolean not null default true;
-- ردود العروسين (sender = 'couple') مالهاش اسم ضيف، فلازم نشيل قيد
-- NOT NULL عن name وإلا send_couple_reply هيفشل بـ "null value in column name".
alter table messages alter column name drop not null;
update messages set guest_token = coalesce(guest_token, id::text) where guest_token is null;

alter table comments add column if not exists reply text;
alter table comments add column if not exists replied_at timestamptz;

-- ---------------------------------------------------------------------------
-- 3) RLS — نقفل القراءة المباشرة على اللي المفروض يبقى خاص، ونسيب اللي
--    المفروض يفضل عام زي ما هو
-- ---------------------------------------------------------------------------

-- RSVPs: الإضافة مفتوحة (الضيف بيأكد حضوره)، القراءة المباشرة ممنوعة —
-- القراءة بس عن طريق get_couple_rsvps بعد التحقق من الكود.
alter table rsvps enable row level security;
drop policy if exists "public read rsvps" on rsvps;
drop policy if exists "guests can submit rsvp" on rsvps;
create policy "guests can submit rsvp" on rsvps
  for insert to anon, authenticated
  with check (true);

-- Messages: الإضافة مفتوحة بس كـ sender='guest' (عشان محدش ينتحل شخصية
-- العروسين)، وممنوع القراءة المباشرة العامة — كل ضيف بيشوف شاته بس عن
-- طريق get_guest_thread، والعروسين عن طريق get_couple_threads /
-- get_couple_thread_messages.
alter table messages enable row level security;
drop policy if exists "public can read messages" on messages;
drop policy if exists "guests can post messages" on messages;
create policy "guests can post messages" on messages
  for insert to anon, authenticated
  with check (sender = 'guest');

-- Comments: فاضلة "حائط تهاني" عام زي ما هي — القراءة والإضافة مفتوحة،
-- بس الرد نفسه بيتحط بس عن طريق reply_to_comment.
alter table comments enable row level security;
drop policy if exists "public can read comments" on comments;
create policy "public can read comments" on comments
  for select to anon, authenticated using (true);
drop policy if exists "guests can post comments" on comments;
create policy "guests can post comments" on comments
  for insert to anon, authenticated with check (true);

-- ---------------------------------------------------------------------------
-- 4) دوال جانب الضيف (بينادي عليها guestApi.js)
-- ---------------------------------------------------------------------------
create or replace function get_guest_thread(p_slug text, p_guest_token text)
returns setof messages
language sql security definer set search_path = public
as $$
  select * from messages
  where slug = p_slug and guest_token = p_guest_token
  order by created_at asc;
$$;
grant execute on function get_guest_thread(text, text) to anon, authenticated;

-- ملحوظة: النسخة القديمة (lumora_v2_chat_and_notifications.sql) عرّفت
-- الدالة دي بـ returns boolean، وإحنا هنا محتاجينها returns void —
-- الـ drop ده لازم عشان create or replace بيرفض يغيّر الـ return type.
drop function if exists guest_mark_thread_seen(text, text);

create or replace function guest_mark_thread_seen(p_slug text, p_guest_token text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update messages set seen_by_guest = true
  where slug = p_slug and guest_token = p_guest_token and seen_by_guest = false;
end;
$$;
grant execute on function guest_mark_thread_seen(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) دوال جانب العروسين (بينادي عليها coupleApi.js)
-- ---------------------------------------------------------------------------

-- الكود بيتولّد مرة واحدة وقت النشر ويتحفظ في invite_access مش invitations
create or replace function get_or_create_access_code(p_slug text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_code text;
begin
  select access_code into v_code from invite_access where slug = p_slug;
  if v_code is null then
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');
    insert into invite_access (slug, access_code) values (p_slug, v_code)
      on conflict (slug) do nothing;
    select access_code into v_code from invite_access where slug = p_slug;
  end if;
  return v_code;
end;
$$;
grant execute on function get_or_create_access_code(text) to anon, authenticated;

-- تسجيل الدخول: بيرجع بيانات الدعوة (jsonb) لو الكود صح، أو null لو غلط
create or replace function couple_login(p_slug text, p_code text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_code text;
  v_data jsonb;
begin
  select access_code into v_code from invite_access where slug = p_slug;
  if v_code is null or p_code is null or v_code <> trim(p_code) then
    return null;
  end if;
  select data into v_data from invitations where slug = p_slug;
  return v_data;
end;
$$;
grant execute on function couple_login(text, text) to anon, authenticated;

-- هيلبر بتتنادى من كل دالة تانية تحت — أي كود غلط/ناقص يفشل مضمون
create or replace function couple_is_authorized(p_slug text, p_code text)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from invite_access
    where slug = p_slug and access_code = p_code
  );
$$;
grant execute on function couple_is_authorized(text, text) to anon, authenticated;

create or replace function get_couple_rsvps(p_slug text, p_code text)
returns setof rsvps
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;
  return query select * from rsvps where slug = p_slug order by created_at desc;
end;
$$;
grant execute on function get_couple_rsvps(text, text) to anon, authenticated;

-- ملحوظة: النسخة القديمة (lumora_v2_chat_and_notifications.sql) عرّفت
-- الدالة دي بـ returns setof messages (رسايل خام)، وإحنا هنا محتاجينها
-- ترجّع ملخص لكل ثريد (guest_name, last_text, unread_count...) عشان
-- MessagesTab.jsx شغّال على الشكل ده — لازم drop قبل الإعادة تعريف.
drop function if exists get_couple_threads(text, text);

-- ملخص كل الشاتات (واحد لكل ضيف) — ده الشكل اللي MessagesTab.jsx محتاجه
create or replace function get_couple_threads(p_slug text, p_code text)
returns table (
  guest_token text,
  guest_name text,
  last_text text,
  last_sender text,
  last_at timestamptz,
  unread_count bigint
)
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;

  -- The inner subqueries below alias `messages` (as mn/mt/ms) and qualify
  -- every column with it. Without that, an unqualified `guest_token` (or
  -- `slug`, `name`, `text`, `sender`, `created_at`) is genuinely ambiguous
  -- to Postgres: it could mean this function's own `returns table` output
  -- column of the same name (exposed as a variable throughout the
  -- function body) or the `messages` table's column — hence "column
  -- reference \"guest_token\" is ambiguous" at query time.
  return query
  select
    m.guest_token,
    (
      select mn.name from messages mn
      where mn.slug = p_slug and mn.guest_token = m.guest_token and coalesce(mn.name, '') <> ''
      order by mn.created_at desc limit 1
    ) as guest_name,
    (
      select mt.text from messages mt
      where mt.slug = p_slug and mt.guest_token = m.guest_token
      order by mt.created_at desc limit 1
    ) as last_text,
    (
      select ms.sender from messages ms
      where ms.slug = p_slug and ms.guest_token = m.guest_token
      order by ms.created_at desc limit 1
    ) as last_sender,
    max(m.created_at) as last_at,
    count(*) filter (where m.sender = 'guest' and not m.seen_by_couple) as unread_count
  from messages m
  where m.slug = p_slug
  group by m.guest_token
  order by max(m.created_at) desc;
end;
$$;
grant execute on function get_couple_threads(text, text) to anon, authenticated;

-- فتح شات ضيف معين — بيعلّم رسايله كمقروءة في نفس الوقت
create or replace function get_couple_thread_messages(p_slug text, p_code text, p_guest_token text)
returns setof messages
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;

  update messages
    set seen_by_couple = true
    where slug = p_slug and guest_token = p_guest_token and sender = 'guest' and not seen_by_couple;

  return query
    select * from messages
    where slug = p_slug and guest_token = p_guest_token
    order by created_at asc;
end;
$$;
grant execute on function get_couple_thread_messages(text, text, text) to anon, authenticated;

create or replace function send_couple_reply(p_slug text, p_code text, p_guest_token text, p_text text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;
  if coalesce(trim(p_text), '') = '' then
    raise exception 'empty message';
  end if;

  insert into messages (slug, guest_token, sender, text, seen_by_couple, seen_by_guest)
  values (p_slug, p_guest_token, 'couple', trim(p_text), true, false);
end;
$$;
grant execute on function send_couple_reply(text, text, text, text) to anon, authenticated;

create or replace function get_couple_comments(p_slug text, p_code text)
returns setof comments
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;
  return query select * from comments where slug = p_slug order by created_at desc;
end;
$$;
grant execute on function get_couple_comments(text, text) to anon, authenticated;

-- ملحوظة: comments.id من نوع uuid (مش bigint) — لو كانت نسخة قديمة
-- بـ bigint اتعملتلها grant قبل كده، الـ drop ده بيمنع تعارض التوقيع.
drop function if exists reply_to_comment(text, text, bigint, text);

create or replace function reply_to_comment(p_slug text, p_code text, p_comment_id uuid, p_reply text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;
  update comments
    set reply = trim(p_reply), replied_at = now()
    where id = p_comment_id and slug = p_slug;
end;
$$;
grant execute on function reply_to_comment(text, text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5.5) داشبورد الأدمن (LUMORA) — بيجيب RSVPs كل الدعوات اللي هو عملها،
--      محدد بمصفوفة slugs بالظبط (المتصفح عارفها من myInvites.js). الداشبورد
--      نفسه محمي بـ login في الفرونت (LoginScreen.jsx)، فمفيش داعي لكود
--      دخول زي بورتال العروسين — ده بس ملخص أرقام مش بيانات حساسة لضيف بعينه
--      أكتر من اللي أصلاً ظاهر في صفحة الكومنتات العامة.
create or replace function get_owner_rsvps(p_slugs text[])
returns setof rsvps
language sql security definer set search_path = public stable
as $$
  select * from rsvps where slug = any(p_slugs) order by created_at desc;
$$;
grant execute on function get_owner_rsvps(text[]) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6) خلي PostgREST يعيد تحميل الـ schema cache عشان الدوال الجديدة/المعدّلة
--    تظهر فورًا من غير ما تستنى
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
