alter table public.profiles
  add column if not exists phone text;

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);

alter table public.favorites enable row level security;

create policy "Users read their own favorites" on public.favorites
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users create their own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users delete their own favorites" on public.favorites
  for delete using (auth.uid() = user_id or public.is_admin());
