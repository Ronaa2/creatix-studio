-- CREATIX STUDIO — initialisation Supabase
-- À exécuter une seule fois dans Supabase > SQL Editor > New query.
-- Cette configuration rend les projets lisibles publiquement, mais réserve
-- INSERT / UPDATE / DELETE au seul compte administrateur indiqué ci-dessous.

create table if not exists public.projects (
  id text primary key,
  name text not null,
  type text not null default 'PROJET DIGITAL',
  description text not null default '',
  details text not null default '',
  status text not null default 'En développement',
  visible boolean not null default true,
  image text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- L'API doit avoir les droits SQL, puis RLS filtre les lignes et opérations.
grant usage on schema public to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert, update, delete on table public.projects to authenticated;

-- Retire les politiques de ce script si on le relance.
drop policy if exists "Projects are publicly readable" on public.projects;
drop policy if exists "Only Creatix admin can insert projects" on public.projects;
drop policy if exists "Only Creatix admin can update projects" on public.projects;
drop policy if exists "Only Creatix admin can delete projects" on public.projects;

create policy "Projects are publicly readable"
on public.projects for select
to anon, authenticated
using (true);

create policy "Only Creatix admin can insert projects"
on public.projects for insert
to authenticated
with check (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);

create policy "Only Creatix admin can update projects"
on public.projects for update
to authenticated
using (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid)
with check (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);

create policy "Only Creatix admin can delete projects"
on public.projects for delete
to authenticated
using (auth.uid() = 'a75adf70-aef8-48be-a62e-d57eb331728d'::uuid);

-- Projets initiaux. ON CONFLICT évite de dupliquer les projets si le script est relancé.
insert into public.projects (id,name,type,description,details,status,visible,image,sort_order)
values
('timood','Timood','APPLICATION MOBILE','Une expérience mobile centrée sur le suivi et l''expression de l''humeur.','Timood explore une façon simple et visuelle de suivre son humeur au fil du temps. Le projet met l''accent sur une interface accessible, des interactions intuitives et une expérience mobile agréable.','Bientôt fini',true,'assets/projects/timood.png',1),
('spingo','SpinGO','APPLICATION MOBILE','Une roue interactive pensée autour du jeu et du partage.','SpinGO transforme une roue de tirage en une expérience ludique et personnalisable. Le projet rassemble des mécaniques de jeu, des récompenses et des options de partage.','Bientôt fini',true,'assets/projects/spingo.png',2),
('homespace','HomeSpace','PLATEFORME FAMILIALE','Un espace numérique pour organiser et partager la vie de famille.','HomeSpace imagine un espace commun pour centraliser les échanges, les tâches, les albums et les informations utiles à la vie familiale.','En développement',true,'assets/projects/homespace.png',3),
('waterly','Waterly','APPLICATION MOBILE','Un compagnon de suivi d''hydratation au quotidien.','Waterly accompagne le suivi de l''hydratation avec des objectifs, des statistiques et une interface visuelle pensée pour encourager une routine régulière.','En développement',true,'assets/projects/waterly.png',4)
on conflict (id) do update set
 name=excluded.name,type=excluded.type,description=excluded.description,details=excluded.details,
 status=excluded.status,visible=excluded.visible,image=excluded.image,sort_order=excluded.sort_order;

-- Actualise automatiquement updated_at à chaque modification.
create or replace function public.set_projects_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
for each row execute function public.set_projects_updated_at();

-- Active les mises à jour en direct sur le portfolio (facultatif mais utile).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'projects') then
    alter publication supabase_realtime add table public.projects;
  end if;
end $$;
