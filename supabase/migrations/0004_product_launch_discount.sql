alter table public.products
  add column if not exists is_launch boolean not null default false,
  add column if not exists discount_percent integer not null default 0
    check (discount_percent >= 0 and discount_percent <= 100);

create or replace function public.reserve_order_stock(
  p_items jsonb,
  p_user_id uuid,
  p_customer_email text default null,
  p_customer_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_variant record;
  v_total integer := 0;
  v_quantity integer;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  insert into public.orders (user_id, total_cents, customer_email, customer_name)
  values (p_user_id, 0, p_customer_email, p_customer_name)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    select
      pv.id,
      pv.size,
      pv.color,
      pv.stock_quantity,
      pv.reserved_quantity,
      p.id as product_id,
      p.name,
      greatest(
        1,
        round(p.price_cents * (1 - (coalesce(p.discount_percent, 0)::numeric / 100)))
      )::integer as price_cents,
      coalesce(p.images[1], null) as image_url,
      p.active as product_active,
      pv.active as variant_active
    into v_variant
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = (v_item ->> 'variantId')::uuid
    for update of pv;

    if v_variant.id is null or not v_variant.product_active or not v_variant.variant_active then
      raise exception 'Product variation is unavailable';
    end if;

    if v_quantity <= 0 or (v_variant.stock_quantity - v_variant.reserved_quantity) < v_quantity then
      raise exception 'Insufficient stock';
    end if;

    update public.product_variants
    set reserved_quantity = reserved_quantity + v_quantity,
        updated_at = now()
    where id = v_variant.id;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      size,
      color,
      image_url,
      quantity,
      unit_price_cents
    )
    values (
      v_order_id,
      v_variant.product_id,
      v_variant.id,
      v_variant.name,
      v_variant.size,
      v_variant.color,
      v_variant.image_url,
      v_quantity,
      v_variant.price_cents
    );

    insert into public.stock_reservations (order_id, variant_id, quantity, expires_at)
    values (v_order_id, v_variant.id, v_quantity, now() + interval '20 minutes');

    v_total := v_total + (v_variant.price_cents * v_quantity);
  end loop;

  update public.orders
  set total_cents = v_total,
      updated_at = now()
  where id = v_order_id;

  return v_order_id;
end;
$$;
