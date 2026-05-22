create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');
create type public.order_status as enum ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded', 'disputed');
create type public.reservation_status as enum ('active', 'converted', 'released', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null,
  price_cents integer not null check (price_cents > 0),
  images text[] not null default '{}',
  active boolean not null default true,
  abacatepay_product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  color_hex text,
  sku text unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color),
  check (reserved_quantity <= stock_quantity)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  abacatepay_checkout_id text unique,
  abacatepay_checkout_url text,
  abacatepay_payload jsonb,
  customer_email text,
  customer_name text,
  expires_at timestamptz not null default (now() + interval '20 minutes'),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null,
  image_url text,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents > 0),
  total_cents integer generated always as (quantity * unit_price_cents) stored
);

create table public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status public.reservation_status not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.webhook_events (
  id text primary key,
  provider text not null,
  event text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create index products_active_idx on public.products(active);
create index product_variants_product_id_idx on public.product_variants(product_id);
create index orders_user_id_idx on public.orders(user_id);
create index stock_reservations_order_id_idx on public.stock_reservations(order_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
      p.price_cents,
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

create or replace function public.confirm_order_payment(
  p_order_id uuid,
  p_checkout_id text,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_reservation record;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    raise exception 'Order not found';
  end if;

  if v_order.payment_status = 'paid' then
    return;
  end if;

  for v_reservation in
    select * from public.stock_reservations
    where order_id = p_order_id and status = 'active'
    for update
  loop
    update public.product_variants
    set stock_quantity = stock_quantity - v_reservation.quantity,
        reserved_quantity = reserved_quantity - v_reservation.quantity,
        updated_at = now()
    where id = v_reservation.variant_id
      and reserved_quantity >= v_reservation.quantity
      and stock_quantity >= v_reservation.quantity;

    update public.stock_reservations
    set status = 'converted'
    where id = v_reservation.id;
  end loop;

  update public.orders
  set status = 'paid',
      payment_status = 'paid',
      abacatepay_checkout_id = coalesce(p_checkout_id, abacatepay_checkout_id),
      abacatepay_payload = p_payload,
      paid_at = now(),
      updated_at = now()
  where id = p_order_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_reservations enable row level security;
alter table public.webhook_events enable row level security;

create policy "Profiles are readable by owner or admins" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "Users update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Admins manage profiles" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone reads active categories" on public.categories
  for select using (active = true or public.is_admin());

create policy "Admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone reads active products" on public.products
  for select using (active = true or public.is_admin());

create policy "Admins manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Anyone reads active variants for active products" on public.product_variants
  for select using (
    public.is_admin()
    or (
      active = true
      and exists (
        select 1 from public.products
        where products.id = product_variants.product_id
          and products.active = true
      )
    )
  );

create policy "Admins manage variants" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read their own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read their own order items" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "Admins manage order items" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins read stock reservations" on public.stock_reservations
  for select using (public.is_admin());

create policy "Admins read webhook events" on public.webhook_events
  for select using (public.is_admin());

insert into public.categories (name, slug, description) values
  ('Leggings', 'leggings', 'Leggings de alta compressao para treino e rotina.'),
  ('Tops', 'tops', 'Tops firmes, confortaveis e respiráveis.'),
  ('Conjuntos', 'conjuntos', 'Looks completos para treinar com praticidade.');

insert into public.products (category_id, name, slug, description, price_cents, images, active)
select id, 'Legging Aura High', 'legging-aura-high', 'Legging cintura alta com toque macio, compressao equilibrada e bolso interno discreto.', 15990,
  array['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80'],
  true
from public.categories where slug = 'leggings';

insert into public.products (category_id, name, slug, description, price_cents, images, active)
select id, 'Top Flow Support', 'top-flow-support', 'Top com sustentacao media, alcas confortaveis e tecido respiravel para treinos intensos.', 8990,
  array['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80'],
  true
from public.categories where slug = 'tops';

insert into public.products (category_id, name, slug, description, price_cents, images, active)
select id, 'Conjunto Bloom Move', 'conjunto-bloom-move', 'Conjunto leve com top e short de secagem rapida para musculacao, pilates e corrida.', 22990,
  array['https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80'],
  true
from public.categories where slug = 'conjuntos';

insert into public.product_variants (product_id, size, color, color_hex, sku, stock_quantity)
select id, size, color, color_hex, sku, stock
from public.products
cross join (
  values
    ('P', 'Lavanda', '#C9BEFF', 'P-LAV', 8),
    ('M', 'Lavanda', '#C9BEFF', 'M-LAV', 12),
    ('G', 'Azul Aura', '#8494FF', 'G-AUR', 7)
) as v(size, color, color_hex, sku, stock)
where slug = 'legging-aura-high';

insert into public.product_variants (product_id, size, color, color_hex, sku, stock_quantity)
select id, size, color, color_hex, sku, stock
from public.products
cross join (
  values
    ('P', 'Branco', '#FFFFFF', 'P-BRA', 10),
    ('M', 'Coraly', '#6367FF', 'M-COR', 9),
    ('G', 'Coraly', '#6367FF', 'G-COR', 5)
) as v(size, color, color_hex, sku, stock)
where slug = 'top-flow-support';

insert into public.product_variants (product_id, size, color, color_hex, sku, stock_quantity)
select id, size, color, color_hex, sku, stock
from public.products
cross join (
  values
    ('P', 'Lavanda', '#C9BEFF', 'P-LAV', 4),
    ('M', 'Azul Aura', '#8494FF', 'M-AUR', 6),
    ('G', 'Coraly', '#6367FF', 'G-COR', 3)
) as v(size, color, color_hex, sku, stock)
where slug = 'conjunto-bloom-move';
