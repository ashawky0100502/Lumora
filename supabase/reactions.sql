-- ============================================================================
-- LUMORA — Reactions (إيموجي على رسايل شات الضيف + حائط الكومنتات)
-- ----------------------------------------------------------------------------
-- شغّل السكريبت ده بعد ما تكون شغّلت setup.sql و couple_portal.sql.
-- بيضيف عمود reactions (jsonb) لجدولي messages و comments، وبيديف دوال
-- SECURITY DEFINER يقدر الضيف والعروسين ياخدوا/يشيلوا رياكت من خلالها —
-- نفس مبدأ باقي الملف ده: مفيش تعديل مباشر على الجداول من الفرونت إند،
-- كل حاجة عن طريق دالة بتتحقق من الصلاحية الأول.
--
-- شكل reactions: {"❤️": ["guest", "couple"], "😍": ["<guest_token>"]}
--   - في رسايل الشات الخاص (thread واحد بين ضيف والعروسين): الممثلين
--     ثابتين، إما 'guest' أو 'couple'.
--   - في كومنتات الحائط العام (كذا ضيف ممكن يتفاعل مع نفس الكومنت): كل
--     ضيف بيتسجل بالـ guest_token بتاعه، والعروسين بـ 'couple'.
-- ============================================================================

alter table messages add column if not exists reactions jsonb not null default '{}'::jsonb;
alter table comments add column if not exists reactions jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- هيلبر داخلي بس (مش هيتعمله grant) — بياخد الـ reactions الحالية وبيـ
-- toggle لممثل واحد على إيموجي واحد: لو موجود بيتشال، لو مش موجود بيتضاف.
-- بيشيل مفتاح الإيموجي كله لو القايمة بقت فاضية بعد الشيل.
-- ---------------------------------------------------------------------------
create or replace function _toggle_reaction(p_reactions jsonb, p_emoji text, p_actor text)
returns jsonb
language plpgsql
as $$
declare
  v_arr jsonb;
begin
  if p_emoji is null or length(p_emoji) = 0 or length(p_emoji) > 16 then
    raise exception 'invalid emoji';
  end if;

  v_arr := coalesce(p_reactions -> p_emoji, '[]'::jsonb);

  if v_arr @> to_jsonb(p_actor) then
    select coalesce(jsonb_agg(x), '[]'::jsonb) into v_arr
      from jsonb_array_elements_text(v_arr) x
      where x <> p_actor;
  else
    v_arr := v_arr || to_jsonb(p_actor);
  end if;

  if jsonb_array_length(v_arr) = 0 then
    return coalesce(p_reactions, '{}'::jsonb) - p_emoji;
  end if;
  return jsonb_set(coalesce(p_reactions, '{}'::jsonb), array[p_emoji], v_arr);
end;
$$;

-- ---------------------------------------------------------------------------
-- جانب الضيف — شات الشخصي (بس على رسايل الثريد بتاعه هو)
-- ---------------------------------------------------------------------------
create or replace function guest_toggle_message_reaction(p_slug text, p_guest_token text, p_message_id uuid, p_emoji text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_current jsonb;
  v_new jsonb;
begin
  select reactions into v_current from messages
    where id = p_message_id and slug = p_slug and guest_token = p_guest_token;
  if not found then
    raise exception 'message not found';
  end if;

  v_new := _toggle_reaction(v_current, p_emoji, 'guest');
  update messages set reactions = v_new where id = p_message_id;
  return v_new;
end;
$$;
grant execute on function guest_toggle_message_reaction(text, text, uuid, text) to anon, authenticated;

-- جانب الضيف — حائط الكومنتات (عام، أي ضيف يقدر يتفاعل مع أي كومنت)
create or replace function guest_toggle_comment_reaction(p_slug text, p_guest_token text, p_comment_id uuid, p_emoji text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_current jsonb;
  v_new jsonb;
begin
  if coalesce(trim(p_guest_token), '') = '' then
    raise exception 'missing guest token';
  end if;

  select reactions into v_current from comments where id = p_comment_id and slug = p_slug;
  if not found then
    raise exception 'comment not found';
  end if;

  v_new := _toggle_reaction(v_current, p_emoji, p_guest_token);
  update comments set reactions = v_new where id = p_comment_id;
  return v_new;
end;
$$;
grant execute on function guest_toggle_comment_reaction(text, text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- جانب العروسين (بورتال) — نفس الفكرة بس محمية بـ access_code
-- ---------------------------------------------------------------------------
create or replace function couple_toggle_message_reaction(p_slug text, p_code text, p_guest_token text, p_message_id uuid, p_emoji text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_current jsonb;
  v_new jsonb;
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;

  select reactions into v_current from messages
    where id = p_message_id and slug = p_slug and guest_token = p_guest_token;
  if not found then
    raise exception 'message not found';
  end if;

  v_new := _toggle_reaction(v_current, p_emoji, 'couple');
  update messages set reactions = v_new where id = p_message_id;
  return v_new;
end;
$$;
grant execute on function couple_toggle_message_reaction(text, text, text, uuid, text) to anon, authenticated;

create or replace function couple_toggle_comment_reaction(p_slug text, p_code text, p_comment_id uuid, p_emoji text)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_current jsonb;
  v_new jsonb;
begin
  if not couple_is_authorized(p_slug, p_code) then
    raise exception 'unauthorized';
  end if;

  select reactions into v_current from comments where id = p_comment_id and slug = p_slug;
  if not found then
    raise exception 'comment not found';
  end if;

  v_new := _toggle_reaction(v_current, p_emoji, 'couple');
  update comments set reactions = v_new where id = p_comment_id;
  return v_new;
end;
$$;
grant execute on function couple_toggle_comment_reaction(text, text, uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
