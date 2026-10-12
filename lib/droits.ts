import type { Rattachement, Sens } from './categories';
import type { Role } from './regles';

// La matrice des droits, en fonctions pures : aucune base, aucune session.
// Chaque action serveur et chaque route construisent le contexte de
// l'acteur puis demandent ici. Les tests unitaires couvrent la matrice
// entière, case par case.
//
// Trois rôles : un membre de l'équipe peut tout, un speaker ne voit que son
// dossier et ce que l'équipe met à disposition de tous les speakers, un
// prestataire ne voit que le dossier de sa structure. Un prestataire ne
// voit jamais rien des speakers (embargo), ni un speaker rien des
// prestataires.

export type Contexte = {
  id: string;
  role: Role;
  speakers: string[];
  // Les dossiers prestataires auxquels le compte a accès (rôle prestataire).
  prestataires?: string[];
};

export type RefDocument = {
  rattachement: Rattachement;
  speakerId: string | null;
  prestataireId?: string | null;
  sens: Sens;
  creeParId: string | null;
  archive?: boolean;
};

export type Cible = { rattachement: Rattachement; speakerId?: string | null; prestataireId?: string | null; sens: Sens };

const estMembre = (c: Contexte) => c.role === 'membre';
const sonDossier = (c: Contexte, speakerId: string | null | undefined) => c.role === 'speaker' && !!speakerId && c.speakers.includes(speakerId);
const saStructure = (c: Contexte, prestataireId: string | null | undefined) =>
  c.role === 'prestataire' && !!prestataireId && (c.prestataires ?? []).includes(prestataireId);

export function peutVoirTableau(c: Contexte): boolean {
  return estMembre(c);
}

export function peutGererComptes(c: Contexte): boolean {
  return estMembre(c);
}

export function peutVoirFicheSpeaker(c: Contexte, speakerId: string): boolean {
  return estMembre(c) || sonDossier(c, speakerId);
}

export function peutModifierFicheSpeaker(c: Contexte, speakerId: string): boolean {
  return estMembre(c) || sonDossier(c, speakerId);
}

export function peutVoirFichePrestataire(c: Contexte, prestataireId: string): boolean {
  return estMembre(c) || saStructure(c, prestataireId);
}

export function peutModifierFichePrestataire(c: Contexte, prestataireId: string): boolean {
  return estMembre(c) || saStructure(c, prestataireId);
}

export function peutLire(c: Contexte, d: RefDocument): boolean {
  if (estMembre(c)) return true;
  if (d.archive) return false;
  switch (d.rattachement) {
    case 'speaker': return sonDossier(c, d.speakerId);
    case 'tous_speakers': return c.role === 'speaker';
    case 'prestataire': return saStructure(c, d.prestataireId);
  }
}

export function peutDeposer(c: Contexte, cible: Cible): boolean {
  switch (cible.rattachement) {
    case 'speaker':
      if (estMembre(c)) return true;
      return sonDossier(c, cible.speakerId) && cible.sens === 'du_speaker';
    case 'tous_speakers': return estMembre(c) && cible.sens === 'vers_speaker';
    case 'prestataire':
      if (estMembre(c)) return true;
      return saStructure(c, cible.prestataireId) && cible.sens === 'du_prestataire';
  }
}

export function peutCommenter(c: Contexte, d: RefDocument): boolean {
  if (!peutLire(c, d)) return false;
  if (d.rattachement === 'tous_speakers') return estMembre(c);
  return true;
}

export function peutSupprimer(c: Contexte, d: RefDocument): boolean {
  if (d.archive) return false;
  if (estMembre(c)) return true;
  return peutLire(c, d) && d.creeParId === c.id;
}

export function peutValiderJalon(c: Contexte): boolean {
  return estMembre(c);
}
