-- CREATIX STUDIO — extension médias Supabase
-- À exécuter APRÈS supabase-setup.sql.
-- Les fichiers sont dans Supabase Storage. Les visiteurs lisent les images,
-- seul l'administrateur peut téléverser, modifier ou supprimer les fichiers.

alter table public.projects add column if not exists screenshots text[] not null default '{}';

create table if not exists public.site_settings (
  id text primary key default 'main' check (id = 'main'),
  profile_image text not null default '',
  banner_image text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
drop policy if exists "Studio settings are publicly readable" on public.site_settings;
drop policy if exists "Only Creatix admin can insert studio settings" on public.site_settings;
drop policy if exists "Only Creatix admin can update studio settings" on public.site_settings;
create policy "Studio settings are publicly readable" on public.site_settings for select to anon, authenticated using (true);
create policy "Only Creatix admin can insert studio settings" on public.site_settings for insert to authenticated with check (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);
create policy "Only Creatix admin can update studio settings" on public.site_settings for update to authenticated using (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid) with check (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);
insert into public.site_settings (id) values ('main') on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Portfolio images are publicly readable" on storage.objects;
drop policy if exists "Only Creatix admin can upload portfolio images" on storage.objects;
drop policy if exists "Only Creatix admin can update portfolio images" on storage.objects;
drop policy if exists "Only Creatix admin can delete portfolio images" on storage.objects;
create policy "Portfolio images are publicly readable" on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio-media');
create policy "Only Creatix admin can upload portfolio images" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);
create policy "Only Creatix admin can update portfolio images" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid) with check (bucket_id = 'portfolio-media' and auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);
create policy "Only Creatix admin can delete portfolio images" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);
