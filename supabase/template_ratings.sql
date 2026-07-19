-- ============================================================================
-- LUMORA — Template Ratings (تقييمات نجوم حقيقية على كارت كل قالب)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql, owner_inbox.sql (بيستخدم نفس فكرة
-- visitor_token المحفوظ في localStorage من visitorIdentity.js).
--
-- الفكرة: كل زائر (بنفس الـ visitor_token بتاعه) يقدر يدّي نجمة من 1 لـ 5
-- لأي قالب في VisitorTemplateGallery.jsx — تقييم واحد بس لكل زائر لكل
-- قالب (upsert لو غيّر رأيه). المعروض على الكارت هو المتوسط + العدد بس
-- (زي 4.8 ⭐ من 132) — مفيش ريفيوهات مكتوبة، ومفيش أرقام وهمية مزروعة:
-- لو مفيش تقييمات لسه، الكارت بيظهر "New" بدل رقم مختلق.
-- ============================================================================

create table if not exists template_ratings (
  template_id text not null,
  visitor_token text not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (template_id, visitor_token)
);

alter table template_ratings enable row level security;
revoke all on template_ratings from anon, authenticated;

-- ---------------------------------------------------------------------------
-- متوسط + عدد التقييمات لكل القوالب دفعة واحدة — بيتقرا مرة واحدة لما
-- الجاليري تفتح، عشان الكروت كلها تظهر تقييماتها من غير طلب لكل كارت لوحده.
-- ---------------------------------------------------------------------------
create or replace function get_template_ratings_summary()
returns table (template_id text, avg_rating numeric, rating_count int)
language sql security definer set search_path = public stable
as $$
  select template_id, round(avg(rating)::numeric, 2) as avg_rating, count(*)::int as rating_count
  from template_ratings
  group by template_id;
$$;
grant execute on function get_template_ratings_summary() to anon, authenticated;

-- تقييمات الزائر نفسه (بالـ visitor_token بتاعه) — عشان الجاليري توري
-- نجومه هو مضيّة لو كان قيّم قبل كده، بدل ما تبدأ فاضية كل مرة.
create or replace function visitor_get_own_ratings(p_visitor_token text)
returns table (template_id text, rating smallint)
language sql security definer set search_path = public stable
as $$
  select template_id, rating from template_ratings where visitor_token = p_visitor_token;
$$;
grant execute on function visitor_get_own_ratings(text) to anon, authenticated;

-- بيدّي/يعدّل تقييم الزائر لقالب معيّن (upsert)، وبيرجّع المتوسط والعدد
-- المحدّثين على طول عشان الفرونت إند يحدّث الكارت من غير reload.
create or replace function visitor_rate_template(p_visitor_token text, p_template_id text, p_rating int)
returns table (template_id text, avg_rating numeric, rating_count int)
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(trim(p_visitor_token), '') = '' then
    raise exception 'missing visitor token';
  end if;
  if coalesce(trim(p_template_id), '') = '' then
    raise exception 'missing template id';
  end if;
  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'rating must be between 1 and 5';
  end if;

  insert into template_ratings (template_id, visitor_token, rating, updated_at)
  values (p_template_id, p_visitor_token, p_rating, now())
  on conflict (template_id, visitor_token)
  do update set rating = excluded.rating, updated_at = now();

  return query
    select t.template_id, round(avg(t.rating)::numeric, 2), count(*)::int
    from template_ratings t
    where t.template_id = p_template_id
    group by t.template_id;
end;
$$;
grant execute on function visitor_rate_template(text, text, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
