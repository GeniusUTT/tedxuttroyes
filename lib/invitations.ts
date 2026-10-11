import { randomUUID } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { empreinte, jetonAleatoire } from './chiffrement';
import { base, schema } from './db';
import { noter } from './journal';
import { envoyer } from './mail';
import { courrielInvitation } from './mail/gabarits';
import { hashPassword } from 'better-auth/crypto';
import { DUREE_INVITATION_MS, etatInvitation, invitationAutorisee, motDePasseRefuse, normaliserEmail, type Role } from './regles';
import { urlDeBase } from './url';

// Le seul chemin vers un compte : un membre invite, la personne accepte en
// choisissant son mot de passe. Le jeton ne vit qu'en empreinte dans la
// base, il sert une fois et expire au bout de sept jours.

export class RefusInvitation extends Error {}

type Demande = {
  email: string;
  role: Role;
  editionId: string;
  nomAffiche: string;
  derogation: boolean;
  parId: string;
};

async function envoyerLien(id: string, email: string, role: Role, editionId: string) {
  const b = await base();
  const jeton = jetonAleatoire();
  const expireLe = new Date(Date.now() + DUREE_INVITATION_MS);
  await b.update(schema.invitation).set({ jetonEmpreinte: empreinte(jeton, 'invitation'), expireLe }).where(eq(schema.invitation.id, id));
  const [e] = await b.select({ annee: schema.edition.annee }).from(schema.edition).where(eq(schema.edition.id, editionId));
  await envoyer({ a: email, ...courrielInvitation(`${urlDeBase()}/espace/invitation/${jeton}/`, role, e?.annee ?? new Date().getFullYear()) });
}

export async function inviter(d: Demande): Promise<string> {
  const email = normaliserEmail(d.email);
  if (!invitationAutorisee(d.role, email, d.derogation)) {
    throw new RefusInvitation(d.role === 'speaker'
      ? 'Adresse invalide.'
      : "Cette adresse n'est pas dans le domaine des membres : cochez la dérogation pour l'inviter quand même.");
  }
  const b = await base();
  const [existant] = await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
  if (existant) throw new RefusInvitation('Un compte existe déjà pour cette adresse.');
  // Une seule invitation en attente par adresse : les précédentes sont révoquées.
  await b.update(schema.invitation).set({ revoqueeLe: new Date() })
    .where(and(eq(schema.invitation.email, email), isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)));
  const id = randomUUID();
  await b.insert(schema.invitation).values({
    id,
    email,
    role: d.role,
    editionId: d.editionId,
    nomAffiche: d.nomAffiche.trim(),
    derogationDomaine: d.derogation,
    jetonEmpreinte: empreinte(jetonAleatoire(), 'invitation'),
    inviteParId: d.parId,
    expireLe: new Date(Date.now() + DUREE_INVITATION_MS),
  });
  await envoyerLien(id, email, d.role, d.editionId);
  await noter('invitation.creee', { acteurId: d.parId, cibleType: 'invitation', cibleId: id, editionId: d.editionId, details: { role: d.role, derogation: d.derogation } });
  return id;
}

export async function renvoyer(id: string, parId: string) {
  const b = await base();
  const [inv] = await b.select().from(schema.invitation).where(eq(schema.invitation.id, id));
  if (!inv || inv.accepteeLe || inv.revoqueeLe) throw new RefusInvitation('Invitation introuvable ou close.');
  await envoyerLien(inv.id, inv.email, inv.role, inv.editionId);
  await noter('invitation.renvoyee', { acteurId: parId, cibleType: 'invitation', cibleId: id });
}

export async function revoquer(id: string, parId: string) {
  const b = await base();
  await b.update(schema.invitation).set({ revoqueeLe: new Date() })
    .where(and(eq(schema.invitation.id, id), isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)));
  await noter('invitation.revoquee', { acteurId: parId, cibleType: 'invitation', cibleId: id });
}

export async function lireInvitation(jeton: string) {
  const b = await base();
  const [inv] = await b.select().from(schema.invitation).where(eq(schema.invitation.jetonEmpreinte, empreinte(jeton, 'invitation')));
  if (!inv) return null;
  return { ...inv, etat: etatInvitation(inv) };
}

// Crée le compte avec son mot de passe et clôt l'invitation, d'un seul
// tenant. Renvoie l'adresse, avec laquelle on ouvre aussitôt la session.
export async function accepter(jeton: string, mdp: string, confirmation: string): Promise<string> {
  const inv = await lireInvitation(jeton);
  if (!inv || inv.etat !== 'valide') {
    await noter('invitation.refusee', { cibleType: 'invitation', cibleId: inv?.id, details: { etat: inv?.etat ?? 'inconnue' } });
    throw new RefusInvitation(inv?.etat === 'expiree'
      ? "Cette invitation a expiré. Demandez à l'équipe de vous la renvoyer."
      : "Cette invitation n'est plus valable.");
  }
  if (mdp !== confirmation) throw new RefusInvitation('Les deux mots de passe ne sont pas identiques.');
  const refus = motDePasseRefuse(mdp, inv.email);
  if (refus) throw new RefusInvitation(refus);
  const hache = await hashPassword(mdp);
  const b = await base();
  const userId = randomUUID();
  await b.transaction(async (tx) => {
    const clos = await tx.update(schema.invitation).set({ accepteeLe: new Date() })
      .where(and(eq(schema.invitation.id, inv.id), isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)))
      .returning({ id: schema.invitation.id });
    if (clos.length !== 1) throw new RefusInvitation("Cette invitation n'est plus valable.");
    await tx.insert(schema.user).values({
      id: userId,
      email: inv.email,
      name: inv.nomAffiche || inv.email.slice(0, inv.email.indexOf('@')),
      emailVerified: true,
      role: inv.role,
    });
    await tx.insert(schema.account).values({ id: randomUUID(), accountId: userId, providerId: 'credential', userId, password: hache });
    if (inv.role === 'speaker') {
      await tx.insert(schema.speaker).values({ id: randomUUID(), userId, editionId: inv.editionId, nomAffiche: inv.nomAffiche || inv.email, emailContact: inv.email });
    }
  });
  await noter('invitation.acceptee', { acteurId: userId, cibleType: 'invitation', cibleId: inv.id, editionId: inv.editionId });
  return inv.email;
}
