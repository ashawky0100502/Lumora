-- ============================================================================
-- LUMORA — Owner Inbox (رسايل الأونر: زوار قبل ما يبقوا عندهم أي حساب)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- الفكرة: أي زائر (قبل ما يبقى عنده حساب/كود) — سواء دخل من "Continue as
-- Guest" واختار قالب، أو دوس على "Contact Owner" من شاشة اللوجين — بياخد
-- محادثة خاصة بيه لوحده (thread واحد لكل زائر، متعرف بـ visitor_token
-- محفوظ في localStorage بتاعه، نفس فكرة guest_token في couple_portal.sql).
-- أول رسالة من الزائر بتطلق رد تلقائي فورًا (نص قابل للتعديل من
-- Settings → Inbox)، وبعده رسالة تانية فيها وسائل الدفع المفعّلة (كمان
-- من Settings)، عشان الزائر ياخد كل المعلومة من غير ما يستنى حد.
--
-- الموديل الأمني: بيانات كل زائر مقفولة تمامًا (زي invite_access) وميتقراش
-- إلا عن طريق دوال SECURITY DEFINER بتتأكد من visitor_token بتاعه. جانب
-- الأونر (owner_*) سايبينه مفتوح للـ anon زي get_owner_rsvps بالظبط —
-- لأن الداشبورد أصلاً single-admin panel محمي بلوجين فرونت-إند بس
-- (LoginScreen.jsx) من غير Supabase Auth حقيقي، فمفيش فايدة حماية إضافية
-- على مستوى الداتابيز هنا أكتر من كده.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) الإعدادات اللي بتتحكم في الرسايل (بتتقرا من كل الأجهزة، مش localStorage
--    زي settingsStore.js، عشان الزائر لازم يشوفها من جهازه هو مش جهاز الأونر)
-- ---------------------------------------------------------------------------
create table if not exists owner_inbox_settings (
  id int primary key default 1,
  is_online boolean not null default true,
  auto_reply_text text not null default
    'Thanks for reaching out! I''ve got your message and I''ll reply personally very soon. In the meantime, here''s how you can send payment to lock in your order:',
  payment_methods jsonb not null default '[
    {"id":"vodafone_cash","label":"Vodafone Cash","enabled":false,"value":""},
    {"id":"etisalat_cash","label":"Etisalat Cash","enabled":false,"value":""},
    {"id":"orange_cash","label":"Orange Cash","enabled":false,"value":""},
    {"id":"stc_pay","label":"STC Pay","enabled":false,"value":""},
    {"id":"usdt","label":"USDT","enabled":false,"value":"","note":"TRC20"},
    {"id":"binance_pay","label":"Binance Pay","enabled":false,"value":""},
    {"id":"paypal","label":"PayPal","enabled":false,"value":""}
  ]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint owner_inbox_settings_singleton check (id = 1)
);
insert into owner_inbox_settings (id) values (1) on conflict (id) do nothing;

alter table owner_inbox_settings enable row level security;
revoke all on owner_inbox_settings from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2) محادثة واحدة لكل زائر
-- ---------------------------------------------------------------------------
create table if not exists owner_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_token text not null unique,
  visitor_name text,
  visitor_email text,
  source text not null default 'quick_order', -- 'template' | 'quick_order'
  template_id text,
  template_name text,
  status text not null default 'open', -- 'open' | 'closed'
  unread_by_owner boolean not null default true,
  unread_by_visitor boolean not null default false,
  is_archived boolean not null default false,
  is_blocked boolean not null default false,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists owner_conversations_last_msg_idx on owner_conversations (last_message_at desc);

-- Added after the initial release — safe no-ops if the columns already
-- exist (e.g. a fresh run of this whole script via the create table above).
alter table owner_conversations add column if not exists is_archived boolean not null default false;
alter table owner_conversations add column if not exists is_blocked boolean not null default false;
alter table owner_conversations add column if not exists visitor_email text;

alter table owner_conversations enable row level security;
revoke all on owner_conversations from anon, authenticated;

-- Every write to this table goes through a SECURITY DEFINER function
-- above, which bypasses RLS — so RLS blocking direct table access never
-- stopped anyone from reading/writing through the RPCs. What it DID
-- silently block is Supabase Realtime: postgres_changes checks RLS
-- against the *subscribing* role (anon here, since there's no real
-- Supabase Auth in this app) before delivering any row, with no
-- exception for rows a SECURITY DEFINER function wrote. With zero
-- policies, every realtime event was silently dropped for every visitor
-- and the owner's dashboard alike — the UI only ever caught up on the
-- next manual refetch (opening the thread again, sending a message,
-- etc.), never live. This grants the same "no extra protection at the DB
-- layer" stance the file already takes for owner_* below (documented in
-- the header above: the dashboard's only real gate is the frontend login
-- screen, and owner_list_conversations/owner_get_conversation_messages
-- are already callable by anyone with the anon key regardless) —
-- extending it to SELECT just makes realtime actually work instead of
-- changing what was already reachable.
drop policy if exists "owner_conversations_read" on owner_conversations;
create policy "owner_conversations_read" on owner_conversations for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- 3) الرسايل نفسها
-- ---------------------------------------------------------------------------
create table if not exists owner_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references owner_conversations(id) on delete cascade,
  sender text not null,          -- 'visitor' | 'owner' | 'system'
  kind text not null default 'text', -- 'text' | 'payment_methods'
  text text,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists owner_messages_conv_idx on owner_messages (conversation_id, created_at asc);

alter table owner_messages enable row level security;
revoke all on owner_messages from anon, authenticated;

-- Same reasoning as owner_conversations_read above — needed purely so
-- postgres_changes can actually deliver INSERT events to a subscribed
-- visitor/owner instead of silently dropping every one of them.
drop policy if exists "owner_messages_read" on owner_messages;
create policy "owner_messages_read" on owner_messages for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- 4) حالة الأونر (أونلاين/أوفلاين) — القراءة دي بس، عامة لأي زائر
-- ---------------------------------------------------------------------------
create or replace function get_public_owner_status()
returns boolean
language sql security definer set search_path = public stable
as $$
  select is_online from owner_inbox_settings where id = 1;
$$;
grant execute on function get_public_owner_status() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) جانب الزائر
-- ---------------------------------------------------------------------------

-- بيفتح المحادثة لو مش موجودة (من غير ما يبعت رسالة لسه)
-- Postgres won't let CREATE OR REPLACE change a function's parameter list
-- (p_visitor_email was added here) — it just silently creates a SECOND,
-- separate overload alongside the old 5-parameter one instead of erroring.
-- With both signatures present, PostgREST can no longer tell which one a
-- call matches and starts rejecting every call to this function with
-- "Could not choose the best candidate function" — which is exactly why
-- visitor_open_conversation (the very first call in the visitor flow,
-- before any message is even sent) started failing after this update, and
-- with it never resolving, the visitor's composer stays disabled forever
-- and no message from them ever reaches visitor_send_message, let alone
-- the owner. Same fix already applied to owner_list_conversations below
-- for the same underlying reason: drop the stale signature first.
drop function if exists visitor_open_conversation(text, text, text, text, text);

create or replace function visitor_open_conversation(
  p_visitor_token text,
  p_visitor_name text,
  p_source text,
  p_template_id text,
  p_template_name text,
  p_visitor_email text default null
)
returns owner_conversations
language plpgsql security definer set search_path = public
as $$
declare
  v_conv owner_conversations;
  v_clean_name text;
  v_clean_email text;
  v_is_new_thread boolean;
begin
  v_clean_name := nullif(trim(p_visitor_name), '');
  v_clean_email := nullif(trim(p_visitor_email), '');

  -- Atomic upsert instead of "SELECT, then INSERT if nothing came back":
  -- two calls for the same brand-new visitor_token landing at nearly the
  -- same instant (React StrictMode's mount->cleanup->mount firing this
  -- effect twice in dev is the common case, but two tabs or a retried
  -- request hit the same window) used to both see no existing row and
  -- both try to INSERT — the second one then failed with 409 "duplicate
  -- key value violates ... owner_conversations_visitor_token_key". ON
  -- CONFLICT folds that second call into an UPDATE of the same row
  -- instead, atomically, so there's no window where two calls can both
  -- think they're the first.
  insert into owner_conversations (visitor_token, visitor_name, visitor_email, source, template_id, template_name)
  values (p_visitor_token, v_clean_name, v_clean_email, coalesce(p_source, 'quick_order'), p_template_id, p_template_name)
  on conflict (visitor_token) do update set
    visitor_name = coalesce(excluded.visitor_name, owner_conversations.visitor_name),
    visitor_email = coalesce(excluded.visitor_email, owner_conversations.visitor_email),
    template_id = coalesce(excluded.template_id, owner_conversations.template_id),
    template_name = case when excluded.template_id is not null then excluded.template_name else owner_conversations.template_name end
  returning * into v_conv;

  -- Same idiom visitor_send_message below already uses (see v_is_first
  -- there) to detect "is this the first message in the thread" — reused
  -- here for "is this thread brand new", instead of the xmax trick this
  -- used to try: PL/pgSQL refuses to put a row-typed variable (v_conv)
  -- into a multi-target INTO list alongside anything else
  -- ("record variable cannot be part of multiple-item INTO list"), which
  -- is exactly what `returning ... into v_conv, v_is_new` was doing.
  select not exists(select 1 from owner_messages where conversation_id = v_conv.id) into v_is_new_thread;

  -- الاسم بيتاخد من "GateNames"-style الاسم الحقيقي قبل ما الزائر يوصل
  -- للشات أصلاً (VisitorNameGate.jsx)، فأول حاجة يشوفها هي ترحيبة بالاسم
  -- ده — قبل حتى ما يبعت أي رسالة أو يشوف الرد التلقائي بتاع الأونر.
  if v_is_new_thread and v_clean_name is not null then
    insert into owner_messages (conversation_id, sender, kind, text)
    values (v_conv.id, 'system', 'text', format('Welcome, %s! We''re so glad you''re here — feel free to ask us anything.', v_clean_name));
  end if;

  return v_conv;
end;
$$;
grant execute on function visitor_open_conversation(text, text, text, text, text, text) to anon, authenticated;

-- بيبعت رسالة من الزائر — أول رسالة في المحادثة كلها بتطلق أوتوماتيك:
-- رد تلقائي (نص من الإعدادات) + رسالة وسائل الدفع المفعّلة، فورًا
create or replace function visitor_send_message(p_visitor_token text, p_text text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_conv_id uuid;
  v_is_blocked boolean;
  v_is_first boolean;
  v_settings owner_inbox_settings;
  v_enabled_methods jsonb;
begin
  if coalesce(trim(p_text), '') = '' then
    raise exception 'empty message';
  end if;

  select id, is_blocked into v_conv_id, v_is_blocked from owner_conversations where visitor_token = p_visitor_token;
  if v_conv_id is null then
    raise exception 'no conversation open — call visitor_open_conversation first';
  end if;
  if v_is_blocked then
    raise exception 'blocked';
  end if;

  select not exists(select 1 from owner_messages where conversation_id = v_conv_id) into v_is_first;

  insert into owner_messages (conversation_id, sender, kind, text)
  values (v_conv_id, 'visitor', 'text', trim(p_text));

  update owner_conversations
    set last_message_at = now(), unread_by_owner = true
    where id = v_conv_id;

  if v_is_first then
    select * into v_settings from owner_inbox_settings where id = 1;

    insert into owner_messages (conversation_id, sender, kind, text)
    values (v_conv_id, 'system', 'text', v_settings.auto_reply_text);

    select coalesce(jsonb_agg(m) filter (where (m->>'enabled')::boolean is true), '[]'::jsonb)
      into v_enabled_methods
      from jsonb_array_elements(v_settings.payment_methods) m;

    insert into owner_messages (conversation_id, sender, kind, text, payload)
    values (v_conv_id, 'system', 'payment_methods', null, v_enabled_methods);

    update owner_conversations
      set last_message_at = now(), unread_by_visitor = true
      where id = v_conv_id;
  end if;
end;
$$;
grant execute on function visitor_send_message(text, text) to anon, authenticated;

-- بيرجع كل تاريخ الشات بتاع الزائر ده، وبيعلّمه مقروء منه في نفس الوقت
create or replace function visitor_get_thread(p_visitor_token text)
returns setof owner_messages
language plpgsql security definer set search_path = public
as $$
declare
  v_conv_id uuid;
begin
  select id into v_conv_id from owner_conversations where visitor_token = p_visitor_token;
  if v_conv_id is null then
    return;
  end if;

  update owner_conversations set unread_by_visitor = false where id = v_conv_id;

  return query select * from owner_messages where conversation_id = v_conv_id order by created_at asc;
end;
$$;
grant execute on function visitor_get_thread(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6) جانب الأونر (الداشبورد) — مفتوح للـ anon زي get_owner_rsvps، لأن
--    الداشبورد أصلاً محمي بلوجين فرونت-إند بس (مفيش Supabase Auth هنا)
-- ---------------------------------------------------------------------------

-- Postgres refuses to CREATE OR REPLACE a function when its OUT/return
-- columns changed shape (added is_archived/is_blocked here) — has to be
-- dropped first. Safe: recreated immediately below.
drop function if exists owner_list_conversations();

create or replace function owner_list_conversations()
returns table (
  id uuid,
  visitor_token text,
  visitor_name text,
  visitor_email text,
  source text,
  template_id text,
  template_name text,
  status text,
  unread_by_owner boolean,
  is_archived boolean,
  is_blocked boolean,
  last_message_at timestamptz,
  created_at timestamptz,
  last_text text,
  last_sender text
)
language sql security definer set search_path = public stable
as $$
  select
    c.id, c.visitor_token, c.visitor_name, c.visitor_email, c.source, c.template_id, c.template_name,
    c.status, c.unread_by_owner, c.is_archived, c.is_blocked, c.last_message_at, c.created_at,
    (select coalesce(text, '📎 Payment methods') from owner_messages where conversation_id = c.id order by created_at desc limit 1) as last_text,
    (select sender from owner_messages where conversation_id = c.id order by created_at desc limit 1) as last_sender
  from owner_conversations c
  order by c.last_message_at desc;
$$;
grant execute on function owner_list_conversations() to anon, authenticated;

create or replace function owner_get_conversation_messages(p_conversation_id uuid)
returns setof owner_messages
language plpgsql security definer set search_path = public
as $$
begin
  update owner_conversations set unread_by_owner = false where id = p_conversation_id;
  return query select * from owner_messages where conversation_id = p_conversation_id order by created_at asc;
end;
$$;
grant execute on function owner_get_conversation_messages(uuid) to anon, authenticated;

create or replace function owner_send_reply(p_conversation_id uuid, p_text text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(trim(p_text), '') = '' then
    raise exception 'empty message';
  end if;
  insert into owner_messages (conversation_id, sender, kind, text)
  values (p_conversation_id, 'owner', 'text', trim(p_text));
  update owner_conversations
    set last_message_at = now(), unread_by_visitor = true
    where id = p_conversation_id;
end;
$$;
grant execute on function owner_send_reply(uuid, text) to anon, authenticated;

-- بيحذف رسالة واحدة بس جوه الشات (مش كل المحادثة)
create or replace function owner_delete_message(p_message_id uuid)
returns void
language sql security definer set search_path = public
as $$
  delete from owner_messages where id = p_message_id;
$$;
grant execute on function owner_delete_message(uuid) to anon, authenticated;

-- بيحذف المحادثة كاملة (وكل رسايلها، cascade)
create or replace function owner_delete_conversation(p_conversation_id uuid)
returns void
language sql security definer set search_path = public
as $$
  delete from owner_conversations where id = p_conversation_id;
$$;
grant execute on function owner_delete_conversation(uuid) to anon, authenticated;

-- أرشفة/إلغاء أرشفة محادثة — بتفضل موجودة بس بتختفي من القايمة الرئيسية
create or replace function owner_set_archived(p_conversation_id uuid, p_archived boolean)
returns void
language sql security definer set search_path = public
as $$
  update owner_conversations set is_archived = p_archived where id = p_conversation_id;
$$;
grant execute on function owner_set_archived(uuid, boolean) to anon, authenticated;

-- بلوك/إلغاء بلوك زائر — لو محظور، visitor_send_message بترفض أي رسالة جديدة منه
create or replace function owner_set_blocked(p_conversation_id uuid, p_blocked boolean)
returns void
language sql security definer set search_path = public
as $$
  update owner_conversations set is_blocked = p_blocked where id = p_conversation_id;
$$;
grant execute on function owner_set_blocked(uuid, boolean) to anon, authenticated;

create or replace function owner_get_settings()
returns owner_inbox_settings
language sql security definer set search_path = public stable
as $$
  select * from owner_inbox_settings where id = 1;
$$;
grant execute on function owner_get_settings() to anon, authenticated;

create or replace function owner_set_online(p_is_online boolean)
returns void
language sql security definer set search_path = public
as $$
  update owner_inbox_settings set is_online = p_is_online, updated_at = now() where id = 1;
$$;
grant execute on function owner_set_online(boolean) to anon, authenticated;

create or replace function owner_update_auto_reply(p_text text)
returns void
language sql security definer set search_path = public
as $$
  update owner_inbox_settings set auto_reply_text = p_text, updated_at = now() where id = 1;
$$;
grant execute on function owner_update_auto_reply(text) to anon, authenticated;

create or replace function owner_update_payment_methods(p_methods jsonb)
returns void
language sql security definer set search_path = public
as $$
  update owner_inbox_settings set payment_methods = p_methods, updated_at = now() where id = 1;
$$;
grant execute on function owner_update_payment_methods(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7) Realtime — عشان الشات يوصل فورًا للطرفين من غير ما حد يعمل refresh
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'owner_messages'
  ) then
    alter publication supabase_realtime add table owner_messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'owner_conversations'
  ) then
    alter publication supabase_realtime add table owner_conversations;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 8) خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
