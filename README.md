# Adrien Lassau — site portfolio

Site vitrine une page (Astro + Tailwind CSS v4, TypeScript). Statique, sans CMS :
tout le contenu vit dans `src/content/`.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # génère dist/ (précédé de la génération favicon + OG)
npm run preview      # sert dist/
npm run check        # vérification de types Astro/TS
npm run standalone   # build + fichier HTML unique (CSS/JS/polices inline)
```

`npm run standalone` écrit `dist/site-autonome.html` **et** `../apercu-site-complet.html`
(racine du dossier CLAUDE) : un seul fichier, ouvrable au double-clic sans serveur,
pratique pour envoyer un aperçu. Ce n'est pas la version de production — pour la
mise en ligne, on déploie `dist/`.

> Node ≥ 18.20. Sur cette machine, un Node local est installé dans `~/.local/node`
> (ajouté au `PATH` via `~/.zshrc`).

## Où se trouve le contenu

| Fichier / dossier                | Rôle |
|----------------------------------|------|
| `src/content/site.json`          | Nom, e-mail, réseaux, **endpoint du formulaire**, 4 chiffres de la bande rouge, SEO |
| `src/content/projets/*.md`       | Études de cas (section Résultats) **et** vignettes (section Travaux) |
| `src/content/offres/*.md`        | Les deux blocs d'offre |
| `src/content/parcours/*.md`      | Lignes du parcours |

Tous les chiffres et noms de clients sont **fictifs** et regroupés dans ces
fichiers — les remplacer ne demande aucune modification de code.

### Rendre un projet anonyme

Dans le `.md` du projet : `anonyme: true` → le secteur s'affiche à la place du
nom du client, partout.

### Ajouter un vrai média

1. Déposer les fichiers dans `public/media/` (MP4 H.264 + poster JPG/WebP).
2. Dans le projet concerné, renseigner `medias[].src` et `medias[].poster`.
3. Pour la vidéo du hero : `public/media/showreel.mp4` + `showreel-poster.jpg`,
   puis dé-commenter le `<video>` dans `src/components/Hero.astro`.

Tant que `src` est vide, un placeholder rayé au bon ratio s'affiche.

## Formulaire de contact

`src/content/site.json` → `formEndpoint`. Mettre l'URL Formspree
(`https://formspree.io/f/xxxxxxxx`). Tant que la valeur contient `REMPLACER_ID`,
le JS laisse le POST natif se faire (pas d'interception). Une fois l'ID en place,
l'envoi est géré en AJAX avec états chargement / succès / erreur.

## Déploiement

Site statique — sortie dans `dist/`.

- **Vercel** : preset « Astro », build `npm run build`, output `dist`.
- **Netlify** : build `npm run build`, publish `dist`.

Penser à définir la variable `SITE_URL` (ex. `https://adrienlassau.com`) pour que
`canonical`, l'Open Graph et le sitemap pointent vers le bon domaine.

## À compléter avant mise en ligne

- [ ] Compte Instagram (`site.json` → `reseaux.instagram` / `instagramUrl`)
- [ ] Noms de clients + chiffres réels (`src/content/projets/`, `site.json`)
- [ ] Années des lignes de parcours (`src/content/parcours/`)
- [ ] `formEndpoint` Formspree
- [ ] SIRET / TVA / hébergeur dans `src/pages/mentions-legales.astro`
- [ ] Vrais médias (`public/media/`)
- [ ] `SITE_URL` sur la plateforme d'hébergement
