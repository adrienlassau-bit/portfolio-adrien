import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* --------------------------------------------------------------------------
   projets — études de cas (section Résultats) + médias (section Travaux)
   -------------------------------------------------------------------------- */
const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: z.object({
    client: z.string(),
    secteur: z.string(),
    /** true → affiche le secteur à la place du nom du client */
    anonyme: z.boolean().default(false),
    /** false → n'apparaît pas comme ligne dans Résultats (réservé aux vraies
        études de cas chiffrées) ; le projet reste visible dans Travaux. */
    casEtude: z.boolean().default(true),
    /** lien externe optionnel (ex. le compte Instagram du client) — rend le
        nom cliquable dans Résultats. */
    lien: z.string().url().optional(),
    debut: z.string().default(''), // ex. "JANV. 2025 ›"
    fin: z.string().default(''), // ex. "JANV. 2026"
    duree: z.string().default(''), // ex. "12 MOIS"
    chiffres: z
      .array(
        z.object({
          valeur: z.string(), // ex. "×7,5" · "+180 %" · "2,1 M"
          legende: z.string(), // ex. "ABONNÉS"
        }),
      )
      .max(3)
      .default([]),
    medias: z
      .array(
        z.object({
          type: z.enum(['video', 'image']).default('video'),
          src: z.string().default(''), // fichier auto-hébergé (public/media/…)
          /** clé vers une image optimisée importée dans src/assets/travaux/
              (astro:assets, AVIF/WebP) — prioritaire sur `src` si présente */
          srcKey: z.string().optional(),
          poster: z.string().default(''),
          titre: z.string(),
          vues: z.string().default(''), // ex. "820 K"
          /** unité affichée après `vues` — "vues", "abonnés", "vues cumulées"… */
          unite: z.string().default('vues'),
          format: z.string().default('9:16'),
          /** lien externe (YouTube, Instagram…) : la vignette ouvre ce lien
              dans un nouvel onglet au lieu de la lightbox interne */
          href: z.string().url().optional(),
          plateforme: z.string().default(''), // ex. "YouTube", "Instagram"
          /** nature du projet, affichée après la plateforme (ex. "Documentaire",
              "Community management") — distinct du `secteur` (industrie du
              client, utilisé dans Résultats) */
          nature: z.string().default(''),
          /** date affichée dans Travaux — "2024", "AOÛT 2023 – AOÛT 2025"… */
          date: z.string().default(''),
          /** regroupe plusieurs vignettes sous un même intitulé, avec un
              séparateur visuel avant la première du groupe (ex. "Agence EARLY") */
          groupe: z.string().default(''),
          credit: z.string().default(''), // ex. "Photo : @nom"
        }),
      )
      .default([]),
    ordre: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

/* --------------------------------------------------------------------------
   offres
   -------------------------------------------------------------------------- */
const offres = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/offres' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    prix: z.string(), // ex. "150 € / jour" · "forfait — sur devis"
    condition: z.string().default(''), // ex. "DEVIS SOUS 24 H"
    ordre: z.number().default(0),
  }),
});

/* --------------------------------------------------------------------------
   parcours
   -------------------------------------------------------------------------- */
const parcours = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/parcours' }),
  schema: z.object({
    periode: z.string(),
    poste: z.string(),
    description: z.string(),
    ordre: z.number().default(0),
  }),
});

/* --------------------------------------------------------------------------
   site — données globales (entrée unique "config")
   -------------------------------------------------------------------------- */
const site = defineCollection({
  loader: file('./src/content/site.json'),
  schema: z.object({
    id: z.string(),
    nom: z.string(),
    role: z.string(),
    discipline: z.string(),
    email: z.string().email(),
    zone: z.string(),
    zoneCourt: z.string(),
    annee: z.string(),
    experienceAnnees: z.number(),
    reseaux: z.object({
      linkedin: z.string(),
      linkedinUrl: z.string(),
    }),
    /** les 4 chiffres de la bande rouge */
    chiffresGlobaux: z
      .array(z.object({ valeur: z.string(), legende: z.string() }))
      .length(4),
    seo: z.object({
      titre: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = { projets, offres, parcours, site };
