import { getCollection, getEntry } from 'astro:content';

export async function getSite() {
  const entry = await getEntry('site', 'config');
  if (!entry) throw new Error('src/content/site.json : entrée "config" introuvable');
  return entry.data;
}

export async function getProjets() {
  const items = await getCollection('projets');
  return items.sort((a, b) => a.data.ordre - b.data.ordre);
}

/** Uniquement les projets à afficher comme lignes chiffrées dans Résultats
    (les crédits vidéo/réseaux sans KPI client restent réservés à Travaux). */
export async function getEtudesDeCas() {
  const items = await getProjets();
  return items.filter((p) => p.data.casEtude !== false);
}

export async function getOffres() {
  const items = await getCollection('offres');
  return items.sort((a, b) => a.data.ordre - b.data.ordre);
}

export async function getParcours() {
  const items = await getCollection('parcours');
  return items.sort((a, b) => a.data.ordre - b.data.ordre);
}

export type MediaCard = {
  type: 'video' | 'image';
  src: string;
  srcKey?: string;
  poster: string;
  titre: string;
  vues: string;
  unite: string;
  format: string;
  href?: string;
  plateforme: string;
  nature: string;
  date: string;
  groupe: string;
  credit: string;
  secteur: string;
  client: string;
};

/** Aplatit les médias de tous les projets pour la section Travaux. */
export async function getTravaux(limit?: number): Promise<MediaCard[]> {
  const projets = await getProjets();
  const cards: MediaCard[] = [];
  for (const p of projets) {
    if (p.data.featured === false) continue;
    for (const m of p.data.medias) {
      cards.push({ ...m, secteur: p.data.secteur, client: p.data.client });
    }
  }
  return typeof limit === 'number' ? cards.slice(0, limit) : cards;
}
