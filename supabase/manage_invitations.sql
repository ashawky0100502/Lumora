-- ============================================================================
-- LUMORA — Manage Invitations (حذف دعوة واحدة / حذف كل الدعوات لتوفير المساحة)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده كامل مرة واحدة في: Supabase → SQL Editor → New query → Run
-- بيفترض إنك شغّلت قبل كده: setup.sql, storage-setup.sql, couple_portal.sql
-- السكريبت ده idempotent (تقدر تشغّله أكتر من مرة من غير ما يبوظ حاجة).
--
-- ليه RPC وليس DELETE مباشر من الفرونت إند؟
-- rsvps / comments / messages مالهاش policy للـ delete خالص (شوف
-- couple_portal.sql) — لو حذفنا من invitations بس، الصفوف دي هتفضل يتيمة
-- في الداتابيز وتاخد مساحة من غير أي فايدة. الدالة دي SECURITY DEFINER
-- عشان تقدر تنضف كل الجداول المرتبطة بالـ slug مرة واحدة، حتى لو مفيش
-- ON DELETE CASCADE متظبط على الـ foreign keys الأصلية.
--
-- الصور والفيديوهات نفسها متخزنة كـ base64 جوه عمود invitations.data
-- (مش ملفات منفصلة)، فمجرد حذف الصف بيفضي المساحة دي تلقائي. الحاجة
-- الوحيدة اللي ممكن تبقى ملف منفصل في storage هي الأغنية لو اتربعت رفع
-- مباشر وقت النشر (StepReview.jsx بيحفظ مسارها في data.audioPath) —
-- الفرونت إند (invitationsManageApi.js) بيمسحها من الـ storage قبل ما ينادي
-- على الدالة دي.
-- ============================================================================

-- حذف دعوة أو أكتر مرة واحدة، مع كل البيانات المرتبطة بيها (RSVPs،
-- التعليقات، الرسايل، وكود دخول العروسين).
create or replace function delete_invitations_cascade(p_slugs text[])
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if p_slugs is null or array_length(p_slugs, 1) is null then
    return;
  end if;

  delete from invite_access where slug = any(p_slugs);
  delete from rsvps where slug = any(p_slugs);
  delete from comments where slug = any(p_slugs);
  delete from messages where slug = any(p_slugs);
  delete from invitations where slug = any(p_slugs);
end;
$$;
grant execute on function delete_invitations_cascade(text[]) to anon, authenticated;

-- بيرجع audio_path المخزنة لكل سلَج (لو موجودة) عشان الفرونت إند يمسح
-- ملف الأغنية من الـ storage قبل ما يمسح الصف نفسه.
create or replace function get_invitation_audio_paths(p_slugs text[])
returns table (slug text, audio_path text)
language sql security definer set search_path = public stable
as $$
  select i.slug, i.data->>'audioPath' as audio_path
  from invitations i
  where i.slug = any(p_slugs) and i.data->>'audioPath' is not null;
$$;
grant execute on function get_invitation_audio_paths(text[]) to anon, authenticated;

NOTIFY pgrst, 'reload schema';
