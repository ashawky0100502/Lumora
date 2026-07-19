-- ============================================================================
-- LUMORA — Chat Attachments (صور وملفات صوت في محادثات الأونر إنبوكس)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده بعد ما تكون شغّلت setup.sql, storage-setup.sql, owner_inbox.sql.
--
-- الفكرة: نفس جدول owner_messages بالظبط — kind بقى ممكن يبقى 'image' أو
-- 'audio' كمان (مش 'text'/'payment_methods' بس)، وpayload (jsonb) بيحمل
-- {url, path, name, size, mime}. الرفع نفسه بيستخدم نفس bucket الـ 'media'
-- المستخدم بالفعل في الجاليري والأغاني (chatAttachmentsApi.js)، تحت مسار
-- chat/{visitor_token}/... — مفيش داعي لجدول أو bucket جديد.
--
-- الحذف: visitor_delete_message بتتأكد إن الرسالة فعلاً بتاعة نفس الزائر
-- (عكس owner_delete_message اللي مفتوحة زي باقي دوال الأونر، لأن الداشبورد
-- محمي بلوجين فرونت-إند بس زي ما موضّح في owner_inbox.sql). مسح ملف
-- الاستوريدج نفسه بيحصل من الفرونت إند (chatAttachmentsApi.js) قبل ما
-- ينادي دالة الحذف — get_conversation_attachment_paths بتساعد الداشبورد
-- يمسح كل مرفقات محادثة كاملة أول ما يحذفها، بدل ما تفضل ملفات يتيمة
-- في الـ storage وتكبّر الحجم من غير داعي.
-- ============================================================================

-- بيبعت مرفق (صورة أو صوت) من الزائر — نفس منطق "أول رسالة" بتاع
-- visitor_send_message (رد تلقائي + وسائل الدفع)، عشان مفيش فرق لو
-- أول حاجة يبعتها الزائر كانت نص أو صورة.
create or replace function visitor_send_attachment(
  p_visitor_token text,
  p_kind text,
  p_url text,
  p_path text,
  p_name text,
  p_size bigint,
  p_mime text
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_conv_id uuid;
  v_is_blocked boolean;
  v_is_first boolean;
  v_settings owner_inbox_settings;
  v_enabled_methods jsonb;
  v_payload jsonb;
begin
  if p_kind not in ('image', 'audio') then
    raise exception 'invalid attachment kind';
  end if;
  if coalesce(trim(p_url), '') = '' or coalesce(trim(p_path), '') = '' then
    raise exception 'missing attachment url/path';
  end if;

  select id, is_blocked into v_conv_id, v_is_blocked from owner_conversations where visitor_token = p_visitor_token;
  if v_conv_id is null then
    raise exception 'no conversation open — call visitor_open_conversation first';
  end if;
  if v_is_blocked then
    raise exception 'blocked';
  end if;

  select not exists(select 1 from owner_messages where conversation_id = v_conv_id) into v_is_first;

  v_payload := jsonb_build_object('url', p_url, 'path', p_path, 'name', p_name, 'size', p_size, 'mime', p_mime);

  insert into owner_messages (conversation_id, sender, kind, payload)
  values (v_conv_id, 'visitor', p_kind, v_payload);

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
grant execute on function visitor_send_attachment(text, text, text, text, text, bigint, text) to anon, authenticated;

-- بيبعت مرفق (صورة أو صوت) من الأونر كرد
create or replace function owner_send_attachment(
  p_conversation_id uuid,
  p_kind text,
  p_url text,
  p_path text,
  p_name text,
  p_size bigint,
  p_mime text
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_payload jsonb;
begin
  if p_kind not in ('image', 'audio') then
    raise exception 'invalid attachment kind';
  end if;
  if coalesce(trim(p_url), '') = '' or coalesce(trim(p_path), '') = '' then
    raise exception 'missing attachment url/path';
  end if;

  v_payload := jsonb_build_object('url', p_url, 'path', p_path, 'name', p_name, 'size', p_size, 'mime', p_mime);

  insert into owner_messages (conversation_id, sender, kind, payload)
  values (p_conversation_id, 'owner', p_kind, v_payload);

  update owner_conversations
    set last_message_at = now(), unread_by_visitor = true
    where id = p_conversation_id;
end;
$$;
grant execute on function owner_send_attachment(uuid, text, text, text, text, bigint, text) to anon, authenticated;

-- بيسمح للزائر يمسح رسالة هو اللي بعتها بس (نص أو مرفق) — عكس
-- owner_delete_message اللي بتقدر تمسح أي رسالة، دي بتتأكد إن الرسالة
-- فعلاً بتاعة الـ conversation بتاع نفس الـ visitor_token ده.
create or replace function visitor_delete_message(p_visitor_token text, p_message_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_conv_id uuid;
begin
  select id into v_conv_id from owner_conversations where visitor_token = p_visitor_token;
  if v_conv_id is null then
    raise exception 'no conversation found';
  end if;

  delete from owner_messages
    where id = p_message_id and conversation_id = v_conv_id and sender = 'visitor';
end;
$$;
grant execute on function visitor_delete_message(text, uuid) to anon, authenticated;

-- كل مسارات المرفقات (صور/صوت) في محادثة معيّنة — الداشبورد بيستخدمها
-- عشان يمسح الملفات دي فعليًا من الـ storage قبل ما يحذف المحادثة نفسها،
-- لأن الـ cascade بيمسح صفوف الداتابيز بس مش الملفات المرفوعة.
create or replace function get_conversation_attachment_paths(p_conversation_id uuid)
returns table (path text)
language sql security definer set search_path = public stable
as $$
  select payload->>'path' from owner_messages
  where conversation_id = p_conversation_id and payload ? 'path';
$$;
grant execute on function get_conversation_attachment_paths(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- خلي PostgREST يعيد تحميل الـ schema cache فورًا
-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
