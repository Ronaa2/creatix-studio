# Creatix Studio V13 — installation complète

## Ce que fait cette version
- Conserve les fonctions V12 et les données Supabase existantes.
- Ajoute les métadonnées SEO de la page d'accueil.
- Ajoute robots.txt et sitemap.xml.
- Ajoute un générateur de pages projet HTML statiques depuis Supabase.
- Ajoute un workflow GitHub Actions : exécution manuelle ou chaque heure.
- Chaque page projet statique contient le nom, la description, le détail, les liens et les images issus de Supabase au moment de la génération.

## Très important : Supabase
Aucune migration de schéma n'est nécessaire pour cette fonction SEO. Le générateur ne fait que lire `public.projects` avec la clé publishable déjà présente dans `supabase-config.js`. Il n'utilise pas de colonne `logo` : l'image principale provient de `screenshots` ou `image`, avec le logo du studio en secours.
Il faut que :
1. `public.projects` existe et contienne les colonnes id, name, type, description, details, status, visible, image, screenshots, links, sort_order, updated_at.
2. RLS soit activé.
3. Une politique SELECT publique permette aux visiteurs anonymes de lire les projets visibles (le script filtre `visible=true`).
4. Le bucket `portfolio-media` soit public en lecture si les captures doivent être visibles sans connexion.
5. Ne jamais utiliser une clé `service_role` ou `sb_secret_` dans le site ou le workflow.

`supabase-v13-seo-check.sql` est un diagnostic en lecture seule. Il ne modifie rien. Lance-le dans Supabase SQL Editor et vérifie les résultats. Si une colonne manque, ne lance pas le script d'initialisation `supabase-setup.sql` : demande un diagnostic avant toute migration.

## Installation GitHub (recommandée)
1. Télécharge une sauvegarde ZIP du dépôt GitHub actuel.
2. Extrais cette archive V13.
3. Dans le dépôt `Ronaa2/creatix-studio`, utilise Add file > Upload files.
4. Envoie le contenu de `Creatix-Studio-v13/` à la racine du dépôt, en conservant le fichier `CNAME` existant.
5. Commit changes.
6. Dans Settings > Actions > General, vérifie que les workflows ont le droit de créer des commits si le workflow est bloqué. Le workflow nécessite `contents: write`.
7. Ouvre Actions > Generate SEO pages from Supabase > Run workflow pour le premier lancement.
8. Vérifie le résultat de l'exécution : il doit annoncer le nombre de projets générés.
9. Le workflow se relance ensuite automatiquement chaque heure.

## Vérifications
- https://creatix-studio.fr/robots.txt
- https://creatix-studio.fr/sitemap.xml
- https://creatix-studio.fr/projets/timood/
- https://creatix-studio.fr/projets/spingo/

Le sitemap est actualisé par le workflow. Google Search Console > Sitemaps : soumettre `sitemap.xml`.

## Limites honnêtes
- Une mise à jour faite dans Supabase est visible dans le site dynamique après son actualisation, mais les pages HTML destinées aux robots sont rafraîchies au prochain workflow (horaire) ou en lançant manuellement l'action.
- Le générateur ne crée pas de nouvelles pages si le projet est masqué (`visible=false`).
- Le workflow lit uniquement Supabase. Il n'expose aucun secret d'administration.
