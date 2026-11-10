-- CREATIX STUDIO V13 — compatibilité de la table projects
-- Migration additive et sûre : ajoute seulement la colonne utilisée par admin.js.
-- À exécuter une seule fois dans Supabase > SQL Editor.
alter table public.projects
  add column if not exists logo text not null default '';
