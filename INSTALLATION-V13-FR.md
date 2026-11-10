# Creatix Studio V13 — installation coordonnée GitHub Pages + Supabase

## 0. Sauvegarde
Télécharger le ZIP actuel depuis GitHub avant toute modification. Conserver le fichier `CNAME` existant à la racine du dépôt.

## 1. Vérifier Supabase
Le schéma vérifié de `public.projects` contient déjà : id, name, type, description, details, status, visible, image, sort_order, created_at, updated_at, screenshots et links.
Les politiques RLS fournies par le propriétaire permettent SELECT public et limitent INSERT/UPDATE/DELETE à son UID administrateur.

### Ajouter la colonne logo manquante
Le code d'administration V13 lit et écrit `projects.logo`. Le schéma fourni ne contenait pas cette colonne.
Dans Supabase > SQL Editor > New query, exécuter UNIQUEMENT `supabase-v13-compatibility.sql`.
Ce script ne fait qu'un `ADD COLUMN IF NOT EXISTS` et ne modifie aucune donnée existante.
Ne pas exécuter `supabase-setup.sql`.

### Contrôler site_settings et Storage avant publication
Exécuter cette requête en lecture seule :
```sql
select column_name, data_type
from information_schema.columns
where table_schema='public' and table_name='site_settings'
order by ordinal_position;
```
Les colonnes attendues par admin.js et script.js sont `id`, `profile_image`, `banner_image`, `updated_at`.

Contrôler les policies Storage :
```sql
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname='storage' and tablename='objects';
```
Le bucket `portfolio-media` est public (lecture des images). Pour téléverser/supprimer depuis l'administration, il faut des policies `INSERT`, `UPDATE`, `DELETE` limitées à l'UID administrateur et au bucket `portfolio-media`. Ne pas rendre l'écriture publique.

La clé `sb_publishable_...` dans le navigateur est publique et s'appuie sur RLS. Ne jamais utiliser une clé `sb_secret_...` ou `service_role` dans le site.

## 2. Envoyer les fichiers
1. Extraire le ZIP.
2. Dans le dépôt GitHub `Ronaa2/creatix-studio`, cliquer Add file > Upload files.
3. Envoyer le CONTENU de `Creatix-Studio-v13/` à la racine du dépôt.
4. Conserver `CNAME` à la racine. Ne pas supprimer les fichiers/assets existants qui ne sont pas remplacés intentionnellement.
5. Commit changes.

## 3. Basculer GitHub Pages vers Actions
Dans GitHub > dépôt > Settings > Pages > Build and deployment > Source, sélectionner `GitHub Actions`.
C'est requis par le workflow fourni : il génère les pages projet et le sitemap, puis déploie directement l'artefact Pages.
Le workflow n'a pas besoin d'écrire des commits générés dans le dépôt.
Le fichier CNAME présent à la racine est inclus dans l'artefact.

## 4. Lancer et vérifier
1. GitHub > Actions.
2. Sélectionner `Build SEO pages and deploy Creatix Studio`.
3. Run workflow.
4. Attendre le statut vert.
5. Vérifier `https://creatix-studio.fr/`, `/robots.txt`, `/sitemap.xml` et les pages de projet générées.

Le workflow se déclenche aussi sur chaque push à main et toutes les heures. Les changements Supabase apparaissent dans les pages HTML destinées aux robots au prochain lancement, ou après un lancement manuel.

## 5. Tests après publication
- Ouvrir /admin.html, se connecter, modifier une description, enregistrer.
- Vérifier le site public.
- Lancer manuellement le workflow SEO.
- Vérifier le HTML de la page projet et le sitemap.
- Tester les téléversements de logo/captures et l'identité du studio.

## Important
Le générateur SEO interroge `public.projects` avec les colonnes existantes. Le code d'administration exige en plus `logo`, d'où la petite migration additive ci-dessus.
Le site utilise également `site_settings` pour `profile_image` et `banner_image` ; vérifier ses colonnes avant le déploiement.
