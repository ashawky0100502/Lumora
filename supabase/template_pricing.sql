-- ==========================================================================
-- Template Pricing
-- ---------------------------------------------------------------------------
-- This table stores the canonical visitor-facing price for each template.
-- It is a shared, Supabase-backed source of truth for pricing across all
-- devices, replacing the old browser-localStorage-only implementation.
-- ============================================================================

create table if not exists template_pricing (
  template_id text primary key,
  price numeric not null check (price >= 0),
  updated_at timestamptz not null default now()
);

alter table template_pricing enable row level security;
revoke all on template_pricing from anon, authenticated;

create or replace function get_template_prices()
returns table (template_id text, price numeric)
language sql security definer set search_path = public stable
as $$
  select tp.template_id, tp.price from template_pricing as tp;
$$;
grant execute on function get_template_prices() to anon, authenticated;

create or replace function upsert_template_price(p_template_id text, p_price numeric)
returns table (template_id text, price numeric)
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(trim(p_template_id), '') = '' then
    raise exception 'missing template id';
  end if;
  if p_price is null or p_price < 0 then
    raise exception 'invalid price';
  end if;

  insert into template_pricing (template_id, price)
  values (p_template_id, p_price)
  on conflict (template_id) do update set price = excluded.price, updated_at = now();

  return query select tp.template_id, tp.price from template_pricing as tp where tp.template_id = p_template_id;
end;
$$;
grant execute on function upsert_template_price(text, numeric) to anon, authenticated;
