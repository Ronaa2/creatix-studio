# Creatix Studio — version 6 (GitHub Pages + Supabase)

## Fichiers
- `index.html` : portfolio public.
- `admin.html` : panneau d'administration protégé par Supabase Auth.
- `supabase-config.js` : URL du projet, publishable key et UID administrateur.
- `supabase-setup.sql` : création de la table, politiques RLS, permissions et projets initiaux.

## Mise en place Supabase
1. Dans Supabase, ouvre **SQL Editor** puis **New query**.
2. Ouvre `supabase-setup.sql`, copie tout son contenu et colle-le dans l'éditeur SQL.
3. Clique sur **Run**. Vérifie que l'exécution se termine sans erreur.
4. Dans Authentication > Users, vérifie que le compte correspondant à l'UID configuré existe et que son adresse e-mail est confirmée. Si nécessaire, utilise l'action de confirmation / renvoi de confirmation dans Supabase.

## Mise en ligne GitHub Pages
1. Envoie tous les fichiers et le dossier `assets` à la racine du dépôt `Ronaa2/creatix-studio`.
2. Remplace les anciens fichiers `index.html`, `script.js`, `admin.html`, `admin.js`, `admin.css` par ceux de cette archive et ajoute `supabase-config.js`.
3. Ajoute `supabase-setup.sql` et ce README (facultatif pour le site).
4. Attends la fin du déploiement GitHub Pages.
5. Ouvre le site public, puis `/admin.html` pour te connecter.

## Sécurité
- La publishable key est prévue pour le navigateur. Elle n'est pas un secret.
- Ne publie jamais de clé `sb_secret_...`, `service_role` ou le mot de passe de la base.
- La table est lisible publiquement. Les insertions, modifications et suppressions sont limitées par RLS à l'UID administrateur inscrit dans le SQL.
- L'UID dans le JavaScript ne constitue pas une protection : les politiques RLS côté base sont la vraie protection.
- Les visiteurs ne peuvent pas modifier les projets depuis le site public.

## Notes
- Le formulaire de contact conserve le comportement `mailto:` de la v5 : il ouvre le logiciel de messagerie du visiteur, il ne stocke pas les messages dans Supabase.
- Les chemins `assets/projects/*.png` sont conservés. Ajoute tes captures de projets dans `assets/projects/` si tu veux remplacer les visuels CSS de démonstration.

## Images et médias (v7)

Après le SQL initial `supabase-setup.sql`, exécuter une seule fois `supabase-media-setup.sql` dans Supabase SQL Editor. Ce script crée le bucket public `portfolio-media`, la table `site_settings`, ajoute `screenshots` aux projets et applique les politiques RLS/Storage. Les fichiers sont stockés dans Supabase Storage et leurs URL publiques sont enregistrées dans les tables. Les visiteurs peuvent lire les images ; seul l'UID administrateur configuré peut téléverser, remplacer ou supprimer des objets.

Limite d'envoi : 10 Mo par image, formats JPEG, PNG et WebP.


## V8 — liens de projets et administration améliorée

1. Dans Supabase → SQL Editor, exécuter `supabase-links-migration.sql` (migration additive, sans effacer les projets).
2. Remplacer les fichiers du dépôt GitHub par le contenu de ce dossier.
3. Dans `/admin.html`, chaque projet dispose maintenant d'un éditeur repliable, d'aperçus d'images non recadrés et d'un champ liens.
4. Pour les liens, saisir une ligne par bouton au format `Nom | https://adresse.fr`.
5. Enregistrer et publier. Les boutons sont rendus dans la fenêtre de détails du projet.

Les captures sont affichées en `object-fit: contain` pour préserver leur ratio et éviter les zooms/cadrages observés précédemment. La migration SQL doit être exécutée avant d'utiliser le nouveau champ de liens.


## V8 — liens de projets et administration améliorée

1. Dans Supabase → SQL Editor, exécuter `supabase-links-migration.sql` (migration additive, sans effacer les projets).
2. Remplacer les fichiers du dépôt GitHub par le contenu de ce dossier.
3. Dans `/admin.html`, chaque projet dispose maintenant d'un éditeur repliable, d'aperçus d'images non recadrés et d'un champ liens.
4. Pour les liens, saisir une ligne par bouton au format `Nom | https://adresse.fr`.
5. Enregistrer et publier. Les boutons sont rendus dans la fenêtre de détails du projet.

Les captures sont affichées en `object-fit: contain` pour préserver leur ratio et éviter les zooms/cadrages observés précédemment. La migration SQL doit être exécutée avant d'utiliser le nouveau champ de liens.
