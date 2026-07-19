-- ============================================================================
-- LUMORA — Member-owned invitations (المرحلة 3 من نظام حسابات الأعضاء)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: demo_accounts.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- ليه ده لازم؟ لحد دلوقتي "دعواتي" وكل شاشات الداشبورد (Guests, Gallery,
-- Music) كانت بتشتغل بمنطق واحد بس: "جيبلي بيانات أي slug تديهولي" —
-- من غير ما تتحقق مين صاحب الـ slug ده أصلاً. ده كان مقبول لما كان
-- المستخدم الوحيد هو الأونر نفسه، لكن دلوقتي بقى فيه أعضاء (demo_accounts)
-- كل واحد المفروض يشوف بيانات دعواته هو بس — فلازم كل دعوة تتسجل رسميًا
-- إنها ملك مين، والاستعلامات الخاصة بالعضو تتأكد من ده بنفسها بدل ما
-- تصدق أي slug يتبعت لها.
--
-- الأمان هنا زي باقي الموقع بالظبط (couple_portal.sql, gallery.sql):
-- demo_accounts.id نفسه UUID عشوائي مينفعش حد يخمنه — فهو اللي بيتعامل
-- معاه كـ"مفتاح الدخول" لبيانات العضو، مش عن طريق تسجيل دخول Supabase Auth
-- حقيقي. أي دالة member_* تتأكد إن الحساب/الكود لسه شغال (مش متعطل أو
-- منتهي) قبل ما ترجع أي بيانات، بنفس منطق demo_validate_session بالظبط.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) عمود ملكية على جدول الدعوات — NULL يعني "دعوة الأونر نفسه" (زي ما هي
--    دلوقتي)، مش NULL يعني دعوة عضو معين
-- ---------------------------------------------------------------------------
alter table invitations add column if not exists owner_account_id uuid references demo_accounts(id) on delete set null;
create index if not exists idx_invitations_owner_account_id on invitations (owner_account_id);

-- ---------------------------------------------------------------------------
-- 2) هيلبر داخلي: يتأكد إن حساب العضو ده لسه شغال (نفس فحص
--    demo_validate_session) — كل دالة member_* بتستخدمه أول حاجة
-- ---------------------------------------------------------------------------
create or replace function _member_account_is_active(p_account_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1
    from demo_accounts da
    join license_codes lc on lc.id = da.license_code_id
    where da.id = p_account_id
      and not lc.disabled
      and lc.expires_at >= now()
  );
$$;

-- ---------------------------------------------------------------------------
-- 3) قايمة دعوات العضو (بديل myInvites.js المحلي — ده بيرجع من السيرفر
--    فعليًا، بيشتغل من أي جهاز، ومحدود بدعوات الحساب ده بس)
-- ---------------------------------------------------------------------------
create or replace function member_list_invitations(p_account_id uuid)
returns table (slug text, data jsonb, updated_at timestamptz)
language plpgsql security definer set search_path = public stable
as $$
begin
  if not _member_account_is_active(p_account_id) then
    return;
  end if;
  return query
    select i.slug, i.data, i.updated_at
    from invitations i
    where i.owner_account_id = p_account_id
    order by i.updated_at desc;
end;
$$;
grant execute on function member_list_invitations(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) نفس فكرة get_owner_rsvps بالظبط، بس محصورة في دعوات الحساب ده بس —
--    بيتجاهل أي slug العضو يحاول يمرره غير ملكه (بيجيب القايمة من عنده هو
--    مش من الكلاينت)
-- ---------------------------------------------------------------------------
create or replace function member_get_rsvps(p_account_id uuid)
returns setof rsvps
language plpgsql security definer set search_path = public stable
as $$
begin
  if not _member_account_is_active(p_account_id) then
    return;
  end if;
  return query
    select r.*
    from rsvps r
    where r.slug in (select slug from invitations where owner_account_id = p_account_id)
    order by r.created_at desc;
end;
$$;
grant execute on function member_get_rsvps(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) نفس فكرة delete_invitations_cascade بس بيتأكد الأول إن كل الـ slugs
--    فعلاً ملك الحساب ده قبل ما يمسح حاجة (دفاع إضافي حتى لو الفرونت-إند
--    غلط في اللي بيبعته)
-- ---------------------------------------------------------------------------
create or replace function member_delete_invitation(p_account_id uuid, p_slug text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not _member_account_is_active(p_account_id) then
    raise exception 'account not active';
  end if;
  if not exists (select 1 from invitations where slug = p_slug and owner_account_id = p_account_id) then
    raise exception 'not found or not yours';
  end if;
  perform delete_invitations_cascade(array[p_slug]);
end;
$$;
grant execute on function member_delete_invitation(uuid, text) to anon, authenticated;

create or replace function member_delete_all_invitations(p_account_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_slugs text[];
begin
  if not _member_account_is_active(p_account_id) then
    raise exception 'account not active';
  end if;
  select array_agg(slug) into v_slugs from invitations where owner_account_id = p_account_id;
  if v_slugs is not null and array_length(v_slugs, 1) > 0 then
    perform delete_invitations_cascade(v_slugs);
  end if;
end;
$$;
grant execute on function member_delete_all_invitations(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
