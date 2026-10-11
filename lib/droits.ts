import type { Rattachement, Sens } from './categories';
import type { Role } from './regles';

// La matrice des droits, en fonctions pures : aucune base, aucune session.
// Chaque action serveur et chaque route construisent le contexte de
// l'acteur puis demandent ici. Les tests unitaires couvrent la matrice
// entière, case par case.

export const POLE_SPEAKERS = 'prospection-speakers';

export type Contexte = {
  id: string;
  role: Role;
  poles: { id: string; slug: string }[];
  speakers: string[];
};

export type RefDocument = {
  rattachement: Rattachement;
  speakerId: string | null;
  poleId: string | null;
  sens: Sens;
  creeParId: string | null;
};

export type Cible = { rattachement: Rattachement; speakerId?: string | null; poleId?: string | null; sens: Sens };

const estAdmin = (c: Contexte) => c.role === 'admin';
const estMembre = (c: Contexte) => c.role === 'membre';
const aUnPole = (c: Contexte) => c.poles.length > 0;
const dansPole = (c: Contexte, poleId: string | null) => !!poleId && c.poles.some((p) => p.id === poleId);
const sonDossier = (c: Contexte, speakerId: string | null | undefined) => c.role === 'speaker' && !!speakerId && c.speakers.includes(speakerId);

export function peutVoirTableau(c: Contexte): boolean {
  return estAdmin(c) || estMembre(c);
}

export function peutVoirFicheSpeaker(c: Contexte, speakerId: string): boolean {
  return estAdmin(c) || estMembre(c) || sonDossier(c, speakerId);
}

export function peutModifierFicheSpeaker(c: Contexte, speakerId: string): boolean {
  return estAdmin(c) || sonDossier(c, speakerId);
}

export function peutLire(c: Contexte, d: RefDocument): boolean {
  if (estAdmin(c)) return true;
  switch (d.rattachement) {
    case 'speaker': return sonDossier(c, d.speakerId) || (estMembre(c) && aUnPole(c));
    case 'tous_speakers': return c.role === 'speaker' || (estMembre(c) && aUnPole(c));
    case 'pole': return estMembre(c) && dansPole(c, d.poleId);
    case 'commun': return estMembre(c);
  }
}

export function peutDeposer(c: Contexte, cible: Cible): boolean {
  if (estAdmin(c)) return true;
  switch (cible.rattachement) {
    case 'speaker':
      if (c.role === 'speaker') return sonDossier(c, cible.speakerId) && cible.sens === 'du_speaker';
      return estMembre(c) && aUnPole(c) && cible.sens === 'vers_speaker';
    case 'tous_speakers': return estMembre(c) && aUnPole(c) && cible.sens === 'vers_speaker';
    case 'pole': return estMembre(c) && dansPole(c, cible.poleId ?? null) && cible.sens === 'interne';
    case 'commun': return estMembre(c) && aUnPole(c) && cible.sens === 'interne';
  }
}

export function peutCommenter(c: Contexte, d: RefDocument): boolean {
  if (!peutLire(c, d)) return false;
  if (d.rattachement === 'commun') return estAdmin(c) || aUnPole(c);
  if (d.rattachement === 'tous_speakers') return estAdmin(c) || estMembre(c);
  return true;
}

export function peutSupprimer(c: Contexte, d: RefDocument): boolean {
  if (estAdmin(c)) return true;
  return peutLire(c, d) && d.creeParId === c.id;
}

export function peutValiderJalon(c: Contexte): boolean {
  return estAdmin(c) || (estMembre(c) && c.poles.some((p) => p.slug === POLE_SPEAKERS));
}
