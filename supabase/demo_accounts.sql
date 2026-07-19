-- ============================================================================
-- LUMORA — Demo Member Accounts (نظام حسابات الأعضاء بالسيريال كود)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: license_codes.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- الفكرة:
--   • كل كود لايسنس بقى ليه صلاحيات خاصة بيه: سعر، وقايمة القوالب المسموح
--     بيها (allowed_templates). لو allowed_templates = NULL يبقى معناها "كل
--     القوالب متاحة" (عشان الأكواد القديمة قبل الميزة دي تفضل شغالة زي
--     ما هي بدون قيود).
--   • كل كود = حساب واحد بس (1:1). أول ما حد يسجّل بيه، الكود ده بيتقفل
--     على حسابه ومحدش تاني يقدر يسجّل بنفس الكود.
--   • حساب العضو (demo_accounts) مربوط بالكود بس، ومفيش أي علاقة له
--     بحساب الأونر — صلاحياته (القوالب المسموحة) بتتجاب لايف من الكود
--     نفسه، مش نسخة مجمدة وقت التسجيل، عشان لو الأونر غيّر الصلاحيات
--     بعدين تتحدث فورًا للعضو.
--   • مفيش حالة "disabled" منفصلة على الحساب نفسه — حالة الحساب (شغال /
--     معطّل / منتهي) هي *نفسها* حالة الكود اللي اتسجّل بيه (join كل مرة).
--     كده تعطيل الكود = تعطيل الحساب فورًا، وحذف الكود = حذف الحساب.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- صلاحيات إضافية على كل كود لايسنس
-- ---------------------------------------------------------------------------
alter table license_codes add column if not exists price numeric;
alter table license_codes add column if not exists allowed_templates text[]; -- NULL = كل القوالب

-- ---------------------------------------------------------------------------
-- حسابات الأعضاء (الديمو)
-- ---------------------------------------------------------------------------
create table if not exists demo_accounts (
  id uuid primary key default gen_random_uuid(),
  license_code_id uuid not null unique references license_codes(id) on delete cascade,
  username text not null unique,
  password_hash text not null,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table demo_accounts enable row level security;
revoke all on demo_accounts from anon, authenticated;

create index if not exists demo_accounts_username_idx on demo_accounts (lower(username));

-- ---------------------------------------------------------------------------
-- هيلبر داخلي: حالة كود + حساب مربوط بيه (لو موجود) في صف واحد، عشان كل
-- الدوال تحت تستخدم نفس منطق الفحص بالظبط من غير تكرار
-- ---------------------------------------------------------------------------
create or replace function _license_account_status(p_license license_codes)
returns text
language sql
immutable
as $$
  select case
    when p_license is null then 'not-found'
    when p_license.disabled then 'disabled'
    when p_license.expires_at < now() then 'expired'
    else 'ok'
  end;
$$;

-- ---------------------------------------------------------------------------
-- جانب الزائر — الخطوة 1: التحقق من الكود بس (زي الأول تمامًا)
-- ---------------------------------------------------------------------------
-- (redeem_license_code من license_codes.sql فاضلة زي ما هي وبتتنادى في
-- خطوة التحقق الأولى قبل ما يظهر فورم التسجيل)

-- ---------------------------------------------------------------------------
-- جانب الزائر — الخطوة 2: إنشاء الحساب فعليًا (اسم + يوزرنيم + باسورد)
-- ---------------------------------------------------------------------------
create or replace function redeem_and_create_account(
  p_code text,
  p_display_name text,
  p_username text,
  p_password text
)
returns table (
  ok boolean,
  reason text,
  account_id uuid,
  display_name text,
  username text,
  license_code_id uuid,
  price numeric,
  allowed_templates text[]
)
language plpgsql security definer set search_path = public
as $$
declare
  v_code text;
  v_uname text;
  v_license license_codes;
  v_account demo_accounts;
begin
  v_code := upper(trim(coalesce(p_code, '')));
  v_uname := lower(trim(coalesce(p_username, '')));

  if v_code = '' then
    return query select false, 'not-found', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;
  if length(trim(coalesce(p_display_name, ''))) = 0 then
    return query select false, 'name-required', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;
  if length(v_uname) < 3 then
    return query select false, 'username-too-short', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;
  if length(coalesce(p_password, '')) < 6 then
    return query select false, 'password-too-short', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  select * into v_license from license_codes where code = v_code;

  if _license_account_status(v_license) <> 'ok' then
    return query select false, _license_account_status(v_license), null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  if exists (select 1 from demo_accounts where license_code_id = v_license.id) then
    return query select false, 'already-used', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  if exists (select 1 from demo_accounts where lower(username) = v_uname) then
    return query select false, 'username-taken', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  insert into demo_accounts (license_code_id, username, password_hash, display_name)
  values (v_license.id, v_uname, crypt(p_password, gen_salt('bf')), trim(p_display_name))
  returning * into v_account;

  return query select
    true, null::text,
    v_account.id, v_account.display_name, v_account.username,
    v_license.id, v_license.price, v_license.allowed_templates;
end;
$$;
grant execute on function redeem_and_create_account(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- جانب الزائر — تسجيل الدخول لحساب عضو موجود
-- ---------------------------------------------------------------------------
create or replace function demo_login(p_username text, p_password text)
returns table (
  ok boolean,
  reason text,
  account_id uuid,
  display_name text,
  username text,
  license_code_id uuid,
  price numeric,
  allowed_templates text[]
)
language plpgsql security definer set search_path = public
as $$
declare
  v_uname text;
  v_account demo_accounts;
  v_license license_codes;
begin
  v_uname := lower(trim(coalesce(p_username, '')));
  if v_uname = '' or coalesce(p_password, '') = '' then
    return query select false, 'not-found', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  select * into v_account from demo_accounts where lower(username) = v_uname;
  if not found or v_account.password_hash <> crypt(p_password, v_account.password_hash) then
    return query select false, 'not-found', null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  select * into v_license from license_codes where id = v_account.license_code_id;
  if _license_account_status(v_license) <> 'ok' then
    return query select false, _license_account_status(v_license), null::uuid, null::text, null::text, null::uuid, null::numeric, null::text[];
    return;
  end if;

  return query select
    true, null::text,
    v_account.id, v_account.display_name, v_account.username,
    v_license.id, v_license.price, v_license.allowed_templates;
end;
$$;
grant execute on function demo_login(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- إعادة فحص جلسة عضو حالية (يتنادى عند فتح/تحديث الداشبورد) — عشان لو
-- الأونر عطّل أو مسح الكود وهو شغال، يتم تسجيل خروجه فورًا مش لما يعمل
-- ريفريش بالصدفة بس
-- ---------------------------------------------------------------------------
create or replace function demo_validate_session(p_account_id uuid)
returns table (
  ok boolean,
  reason text,
  display_name text,
  username text,
  price numeric,
  allowed_templates text[]
)
language plpgsql security definer set search_path = public stable
as $$
declare
  v_account demo_accounts;
  v_license license_codes;
begin
  select * into v_account from demo_accounts where id = p_account_id;
  if not found then
    return query select false, 'not-found', null::text, null::text, null::numeric, null::text[];
    return;
  end if;

  select * into v_license from license_codes where id = v_account.license_code_id;
  if _license_account_status(v_license) <> 'ok' then
    return query select false, _license_account_status(v_license), null::text, null::text, null::numeric, null::text[];
    return;
  end if;

  return query select true, null::text, v_account.display_name, v_account.username, v_license.price, v_license.allowed_templates;
end;
$$;
grant execute on function demo_validate_session(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- جانب الأونر — توليد كود مع تحديد السعر والقوالب المسموحة من الأول
-- (بيحل محل owner_generate_license(int) القديمة بنفس الاسم، مع باراميترز
-- اختيارية جديدة، فأي كود قديم في الفرونت إند لسه شغال زي ما هو)
-- ---------------------------------------------------------------------------
create or replace function owner_generate_license(
  p_duration_days int,
  p_price numeric default null,
  p_allowed_templates text[] default null
)
returns license_codes
language plpgsql security definer set search_path = public
as $$
declare
  v_code text;
  v_row license_codes;
begin
  if p_duration_days is null or p_duration_days <= 0 then
    raise exception 'invalid duration';
  end if;

  loop
    v_code := _gen_license_code();
    exit when not exists (select 1 from license_codes where code = v_code);
  end loop;

  insert into license_codes (code, duration_days, expires_at, price, allowed_templates)
  values (v_code, p_duration_days, now() + (p_duration_days || ' days')::interval, p_price, p_allowed_templates)
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function owner_generate_license(int, numeric, text[]) to anon, authenticated;

-- تحديث صلاحيات كود موجود (السعر + القوالب) من قسم اللايسنس
create or replace function owner_update_license_permissions(
  p_id uuid,
  p_price numeric,
  p_allowed_templates text[]
)
returns license_codes
language plpgsql security definer set search_path = public
as $$
declare
  v_row license_codes;
begin
  update license_codes
  set price = p_price, allowed_templates = p_allowed_templates
  where id = p_id
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function owner_update_license_permissions(uuid, numeric, text[]) to anon, authenticated;

-- قايمة الأكواد + بيانات الحساب المسجّل بيها (لو اتسجّل) عشان الأونر
-- يشوف مين استخدم كل كود
create or replace function owner_list_licenses()
returns table (
  id uuid,
  code text,
  duration_days int,
  created_at timestamptz,
  expires_at timestamptz,
  disabled boolean,
  price numeric,
  allowed_templates text[],
  account_id uuid,
  account_display_name text,
  account_username text
)
language sql security definer set search_path = public stable
as $$
  select
    lc.id, lc.code, lc.duration_days, lc.created_at, lc.expires_at, lc.disabled,
    lc.price, lc.allowed_templates,
    da.id, da.display_name, da.username
  from license_codes lc
  left join demo_accounts da on da.license_code_id = lc.id
  order by lc.created_at desc;
$$;
grant execute on function owner_list_licenses() to anon, authenticated;

-- تعطيل/تفعيل الكود موجودة بالفعل في license_codes.sql (owner_toggle_license)
-- وبتتحكم في حالة الحساب تلقائيًا عن طريق الـ join فوق — مفيش داعي لتغييرها.

-- حذف الكود: لازم تحديث owner_delete_license عشان يمسح الحساب المرتبط
-- بيه بالكامل معاه (demo_accounts.license_code_id عليه ON DELETE CASCADE
-- بالفعل، فمجرد حذف صف license_codes كافي، بس بنعيد التعريف هنا للوضوح
-- ولضمان إنها موجودة حتى لو حد شغّل السكريبت القديم بس)
create or replace function owner_delete_license(p_id uuid)
returns void
language sql security definer set search_path = public
as $$
  delete from license_codes where id = p_id;
$$;
grant execute on function owner_delete_license(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
