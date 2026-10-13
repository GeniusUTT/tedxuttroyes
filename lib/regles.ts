// Règles pures de l'espace, sans base ni réseau : testées unitairement.

// Trois rôles : le speaker, le prestataire (depuis le 2026-10-12), et le
// membre de l'équipe, qui a tous les droits (il n'y a plus ni admin ni pôles
// depuis le 2026-10-11).
export type Role = 'speaker' | 'membre' | 'prestataire';

export const ROLES: Role[] = ['speaker', 'membre', 'prestataire'];

export const DOMAINE_MEMBRES = (process.env.ESPACE_DOMAINE_MEMBRES ?? 'geniusutt.fr').toLowerCase();

export function normaliserEmail(brut: string): string {
  return brut.normalize('NFKC').trim().toLowerCase();
}

const FORME_EMAIL = /^[^\s@]+@[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function emailValide(email: string): boolean {
  return email.length <= 254 && FORME_EMAIL.test(email);
}

// Le domaine se compare en entier : « x@utt.fr.exemple.com » ou
// « x@autre-utt.fr » ne passent pas.
export function domaineDe(email: string): string {
  return email.slice(email.lastIndexOf('@') + 1);
}

export function domaineMembreAccepte(email: string, domaine = DOMAINE_MEMBRES): boolean {
  return domaineDe(normaliserEmail(email)) === domaine;
}

// Un membre doit avoir une adresse du domaine, sauf dérogation accordée par
// un autre membre. Un speaker ou un prestataire n'a aucune restriction.
export function invitationAutorisee(role: Role, email: string, derogation: boolean, domaine = DOMAINE_MEMBRES): boolean {
  if (!emailValide(normaliserEmail(email))) return false;
  if (role !== 'membre') return true;
  return derogation || domaineMembreAccepte(email, domaine);
}

export const DUREE_INVITATION_MS = 7 * 24 * 3600 * 1000;
export const DUREE_REINITIALISATION_MS = 3600 * 1000;

export type EtatInvitation = 'valide' | 'expiree' | 'utilisee' | 'revoquee';

export function etatInvitation(inv: { expireLe: Date; accepteeLe: Date | null; revoqueeLe: Date | null }, maintenant = new Date()): EtatInvitation {
  if (inv.revoqueeLe) return 'revoquee';
  if (inv.accepteeLe) return 'utilisee';
  if (inv.expireLe.getTime() <= maintenant.getTime()) return 'expiree';
  return 'valide';
}

// Au moins deux membres actifs à tout moment : un membre a tous les droits,
// l'espace ne doit jamais se retrouver sans personne pour le tenir.
export const MEMBRES_MINIMUM = 2;

export function retraitMembrePermis(membresActifs: number, cibleEstMembreActif: boolean): boolean {
  return !cibleEstMembreActif || membresActifs - 1 >= MEMBRES_MINIMUM;
}

// Mot de passe : douze caractères au moins. Pas de règle de composition
// (majuscule, chiffre…) : la longueur protège mieux et se retient plus
// facilement. On refuse seulement l'évident : l'identifiant de l'adresse
// dans le mot de passe, ou un caractère répété.
export const MDP_MIN = 12;
export const MDP_MAX = 128;

export function motDePasseRefuse(mdp: string, email = ''): string | null {
  if (mdp.length < MDP_MIN) return `Le mot de passe doit faire au moins ${MDP_MIN} caractères.`;
  if (mdp.length > MDP_MAX) return `Le mot de passe ne doit pas dépasser ${MDP_MAX} caractères.`;
  const identifiant = normaliserEmail(email).split('@')[0] ?? '';
  if (identifiant.length >= 4 && mdp.toLowerCase().includes(identifiant)) return 'Le mot de passe ne doit pas reprendre votre adresse e-mail.';
  if (new Set(mdp).size < 5) return 'Ce mot de passe est trop répétitif.';
  return null;
}

// Téléphone : on garde ce que la personne a saisi, à condition qu'il
// ressemble à un numéro (chiffres, espaces, points, traits d'union,
// parenthèses et un + initial), de 6 à 20 chiffres. Vide est permis.
export function telephoneValide(t: string): boolean {
  const s = t.trim();
  if (!s) return true;
  if (!/^\+?[\d\s.()-]+$/.test(s)) return false;
  const chiffres = s.replace(/\D/g, '').length;
  return chiffres >= 6 && chiffres <= 20;
}
