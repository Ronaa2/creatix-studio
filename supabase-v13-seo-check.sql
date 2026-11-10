-- CREATIX STUDIO V13 — contrôle Supabase SEO (LECTURE SEULE)
-- Ce script ne modifie aucune donnée, table, politique ou bucket.
-- À lancer dans Supabase > SQL Editor > New query.

-- 1) Vérifie que les colonnes utilisées par le site existent.
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'projects'
order by ordinal_position;

-- 2) Vérifie les politiques RLS de lecture publique de projects.
select schemaname, tablename, policyname, roles, cmd, qual
from pg_policies
where schemaname = 'public'
  and tablename = 'projects'
order by policyname;

-- 3) Vérifie les buckets Storage existants.
select id, name, public, file_size_limit
from storage.buckets
where id = 'portfolio-media';

-- 4) Vérifie les tables de configuration du site.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('projects','site_settings')
order by table_name;
