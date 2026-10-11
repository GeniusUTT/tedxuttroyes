// Règles pures de l'espace, sans base ni réseau : testées unitairement.

export type Role = 'speaker' | 'membre' | 'admin';

export const DOMAINE_MEMBRES = (process.env.ESPACE_DOMAINE_MEMBRES ?? 'utt.fr').toLowerCase();

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

// Un membre ou un admin doit avoir une adresse du domaine, sauf dérogation
// accordée par un admin. Un speaker n'a aucune restriction.
export function invitationAutorisee(role: Role, email: string, derogation: boolean, domaine = DOMAINE_MEMBRES): boolean {
  if (!emailValide(normaliserEmail(email))) return false;
  if (role === 'speaker') return true;
  return derogation || domaineMembreAccepte(email, domaine);
}

export const DUREE_INVITATION_MS = 7 * 24 * 3600 * 1000;

export type EtatInvitation = 'valide' | 'expiree' | 'utilisee' | 'revoquee';

export function etatInvitation(inv: { expireLe: Date; accepteeLe: Date | null; revoqueeLe: Date | null }, maintenant = new Date()): EtatInvitation {
  if (inv.revoqueeLe) return 'revoquee';
  if (inv.accepteeLe) return 'utilisee';
  if (inv.expireLe.getTime() <= maintenant.getTime()) return 'expiree';
  return 'valide';
}

// Au moins deux admins actifs à tout moment.
export const ADMINS_MINIMUM = 2;

export function retraitAdminPermis(adminsActifs: number, cibleEstAdminActif: boolean): boolean {
  return !cibleEstAdminActif || adminsActifs - 1 >= ADMINS_MINIMUM;
}
