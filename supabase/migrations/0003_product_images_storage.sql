insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone reads product images" on storage.objects;
create policy "Anyone reads product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images" on storage.objects
  for update using (
    bucket_id = 'product-images'
    and public.is_admin()
  ) with check (
    bucket_id = 'product-images'
    and public.is_admin()
  );

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images" on storage.objects
  for delete using (
    bucket_id = 'product-images'
    and public.is_admin()
  );
