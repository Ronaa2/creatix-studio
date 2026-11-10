-- CREATIX STUDIO v10 — logo des projets
-- À exécuter une seule fois dans Supabase > SQL Editor, AVANT d'enregistrer depuis l'admin.
alter table public.projects
  add column if not exists logo text not null default '';
