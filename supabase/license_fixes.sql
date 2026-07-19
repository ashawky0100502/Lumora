-- ============================================================================
-- LUMORA — License System Hardening (المرحلة 4 من نظام حسابات الأعضاء)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: license_codes.sql, demo_accounts.sql,
-- member_invitations.sql, manage_invitations.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- بيصلّح حاجتين اتلقّطوا وقت المراجعة:
--
-- 1) فرض صلاحيات القوالب (allowed_templates) كان بس فرونت-إند (TemplatesView
--    + StepDesign) — أي حد يقدر يبعت insert/update مباشر لجدول invitations
--    بقالب مش من ضمن قوالب الكود بتاعه كان هينفع من غير ما حد يوقفه. الحل
--    هنا trigger حقيقي على الداتابيز نفسها، فمفيش أي طريق (فرونت-إند حالي،
--    فرونت-إند تاني في المستقبل، أو نداء مباشر للـ API) يقدر يتخطاه.
--
-- 2) مسح كود لايسنس كان بيمسح حساب العضو (demo_accounts) بس عن طريق
--    الـ CASCADE الأصلي — لكن أي دعوات كان العضو ده نشرها كانت بتفضل في
--    الداتابيز وتتحول ملكيتها لـ NULL (يعني "دعوة الأونر") بدل ما تتمسح،
--    لأن العمود owner_account_id كان ON DELETE SET NULL. owner_delete_license
--    هنا بقت بتمسح كل دعوات العضو (ومعاها RSVPs/تعليقات/رسايل/كود دخول
--    العروسين بتاعتهم، عن طريق delete_invitations_cascade الموجودة بالفعل)
--    قبل ما تمسح الكود نفسه، فمفيش أي أثر للعضو بيفضل في الداتابيز.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) فرض صلاحيات القوالب على مستوى الداتابيز
-- ---------------------------------------------------------------------------
create or replace function _enforce_invitation_template_permission()
returns trigger
language plpgsql
as $$
declare
  v_allowed text[];
begin
  -- دعوة الأونر نفسه (owner_account_id is null) — مفيش قيود عليها خالص.
  if new.owner_account_id is null then
    return new;
  end if;

  select lc.allowed_templates into v_allowed
  from demo_accounts da
  join license_codes lc on lc.id = da.license_code_id
  where da.id = new.owner_account_id;

  -- NULL = كل القوالب متاحة لهذا الكود (زي أي مكان تاني في المشروع).
  if v_allowed is null then
    return new;
  end if;

  if not (new.data ->> 'template' = any (v_allowed)) then
    raise exception 'template not permitted for this license code'
      using errcode = '42501'; -- insufficient_privilege
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_invitation_template on invitations;
create trigger trg_enforce_invitation_template
  before insert or update on invitations
  for each row
  execute function _enforce_invitation_template_permission();

-- ---------------------------------------------------------------------------
-- 2) مسح كود اللايسنس = مسح العضو وكل أثره بالكامل من الداتابيز
-- ---------------------------------------------------------------------------
create or replace function owner_delete_license(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_account_id uuid;
  v_slugs text[];
begin
  select id into v_account_id from demo_accounts where license_code_id = p_id;

  if v_account_id is not null then
    select array_agg(slug) into v_slugs from invitations where owner_account_id = v_account_id;
    if v_slugs is not null and array_length(v_slugs, 1) > 0 then
      -- بيمسح invite_access + rsvps + comments + messages + invitations
      -- الخاصة بالعضو ده بالكامل (نفس الدالة المستخدمة في حذف الدعوات
      -- العادي — شوف manage_invitations.sql).
      perform delete_invitations_cascade(v_slugs);
    end if;
  end if;

  -- حذف الكود نفسه بيكاسكيد يمسح demo_accounts تلقائيًا (ON DELETE CASCADE
  -- في demo_accounts.sql) — دلوقتي مفيش أي دعوات يتيمة تفضل وراه.
  delete from license_codes where id = p_id;
end;
$$;
grant execute on function owner_delete_license(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
