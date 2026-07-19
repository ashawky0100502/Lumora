-- ============================================================================
-- LUMORA — Performance indexes
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده بعد reactions.sql. من غير الـ index ده، أي كويري بيفلتر
-- بـ slug ويرتب بـ created_at (زي pagination التعليقات) هيضطر Postgres يمشي
-- على الجدول كله (sequential scan) ويرتبه في الميموري — بطيء وبيبقى أبطأ كل
-- ما التعليقات تزيد. الـ index ده خلاصته: خزّن التعليقات مرتبة ومفهرسة على
-- (slug, created_at) من الأول، فأي صفحة تعليقات بترجع فوري تقريبًا لوحدها،
-- سواء الدعوة فيها 20 تعليق أو 20,000.
-- ============================================================================

create index if not exists idx_comments_slug_created_at
  on comments (slug, created_at desc);

create index if not exists idx_gallery_photos_owner_created_at
  on gallery_photos (owner_key, created_at desc);

NOTIFY pgrst, 'reload schema';
