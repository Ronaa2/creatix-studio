-- CREATIX STUDIO — migration liens de projets
-- À exécuter une seule fois dans Supabase > SQL Editor > New query.
-- Migration additive : ne supprime et ne remplace aucun projet existant.
alter table public.projects
  add column if not exists links jsonb not null default '[]'::jsonb;

comment on column public.projects.links is
  'Liens externes affichés dans la fiche publique du projet : tableau JSON {label,url}.';
