-- ============================================================================
-- LUMORA — License Codes (أكواد التفعيل اللي الزوار بيدخلوها في "Create Account")
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- ليه ده لازم؟ الأكواد كانت متخزنة في localStorage بس (نفس نمط
-- settingsStore.js) — يعني الكود اللي الأونر بيولّده من جهازه هو مش شايفه
-- أي زائر بيفتح الموقع من جهاز/متصفح تاني، فأي محاولة تفعيل حقيقية كانت
-- دايمًا بترجع "لا يوجد كود مطابق" حتى لو الكود صحيح فعلاً. هنا الأكواد
-- بقت في جدول حقيقي، فأي جهاز يقدر يتحقق منها.
--
-- الموديل الأمني: نفس مبدأ owner_inbox.sql — الجدول مقفول تمامًا ومفيش
-- وصول مباشر ليه من الفرونت-إند، كل حاجة عن طريق دوال SECURITY DEFINER.
-- جانب الأونر (owner_*) سايبينه مفتوح للـ anon زي باقي الداشبورد، لأن
-- الداشبورد أصلاً محمي بلوجين فرونت-إند بس (مفيش Supabase Auth هنا).
-- ============================================================================

create extension if not exists pgcrypto;

create table if not exists license_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  duration_days int not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  disabled boolean not null default false
);

alter table license_codes enable row level security;
revoke all on license_codes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- هيلبر داخلي: كود بشكل XXXX-XXXX-XXXX (نفس CODE_CHARS في settingsStore.js
-- القديم — من غير حروف/أرقام ممكن تتلخبط زي 0/O و 1/I)
-- ---------------------------------------------------------------------------
create or replace function _gen_license_code()
returns text
language plpgsql
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_out text := '';
  v_group text;
  i int;
  g int;
begin
  for g in 1..3 loop
    v_group := '';
    for i in 1..4 loop
      v_group := v_group || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;
    v_out := v_out || (case when g > 1 then '-' else '' end) || v_group;
  end loop;
  return v_out;
end;
$$;

-- ---------------------------------------------------------------------------
-- جانب الأونر (Settings → License Codes)
-- ---------------------------------------------------------------------------
create or replace function owner_generate_license(p_duration_days int)
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

  insert into license_codes (code, duration_days, expires_at)
  values (v_code, p_duration_days, now() + (p_duration_days || ' days')::interval)
  returning * into v_row;

  return v_row;
end;
$$;
grant execute on function owner_generate_license(int) to anon, authenticated;

create or replace function owner_list_licenses()
returns setof license_codes
language sql security definer set search_path = public stable
as $$
  select * from license_codes order by created_at desc;
$$;
grant execute on function owner_list_licenses() to anon, authenticated;

create or replace function owner_toggle_license(p_id uuid)
returns void
language sql security definer set search_path = public
as $$
  update license_codes set disabled = not disabled where id = p_id;
$$;
grant execute on function owner_toggle_license(uuid) to anon, authenticated;

create or replace function owner_delete_license(p_id uuid)
returns void
language sql security definer set search_path = public
as $$
  delete from license_codes where id = p_id;
$$;
grant execute on function owner_delete_license(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- جانب الزائر (LicenseSignupForm.jsx → "Create Account")
-- ---------------------------------------------------------------------------
create or replace function redeem_license_code(p_code text)
returns table(ok boolean, reason text)
language plpgsql security definer set search_path = public
as $$
declare
  v_row license_codes;
  v_code text;
begin
  v_code := upper(trim(coalesce(p_code, '')));
  if v_code = '' then
    return query select false, 'not-found';
    return;
  end if;

  select * into v_row from license_codes where code = v_code;
  if not found then
    return query select false, 'not-found';
    return;
  end if;
  if v_row.disabled then
    return query select false, 'disabled';
    return;
  end if;
  if v_row.expires_at < now() then
    return query select false, 'expired';
    return;
  end if;

  return query select true, null::text;
end;
$$;
grant execute on function redeem_license_code(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
