'use server';

import { redirect } from 'next/navigation';
import { editionCourante, exigerMembre } from '@/lib/acces';
import { changerEmail, desactiver, reactiver, RefusCompte } from '@/lib/comptes';
import { inviter, RefusInvitation, renvoyer, revoquer } from '@/lib/invitations';
import { ROLES, type Role } from '@/lib/regles';
import { supprimerCompte, supprimerSpeaker } from '@/lib/rgpd';

const COMPTES = '/espace/equipe/comptes/';

function retour(chemin: string, ok?: string, erreur?: string): never {
  const q = ok ? `ok=${encodeURIComponent(ok)}` : `erreur=${encodeURIComponent(erreur ?? '')}`;
  redirect(`${chemin}?${q}`);
}

async function tenter(chemin: string, f: () => Promise<unknown>, ok: string): Promise<never> {
  try {
    await f();
  } catch (e) {
    if (e instanceof RefusInvitation || e instanceof RefusCompte) retour(chemin, undefined, e.message);
    throw e;
  }
  retour(chemin, ok);
}

// Le formulaire vit sur deux pages (Speakers et Comptes) : on revient sur
// celle d'où il est parti.
export async function actionInviter(chemin: string, form: FormData) {
  const a = await exigerMembre();
  const dest = chemin === '/espace/equipe/' ? chemin : COMPTES;
  const role = String(form.get('role')) as Role;
  if (!ROLES.includes(role)) retour(dest, undefined, 'Rôle inconnu.');
  const e = await editionCourante();
  await tenter(dest, () => inviter({
    email: String(form.get('email') ?? ''),
    role,
    editionId: e.id,
    nomAffiche: String(form.get('nom') ?? ''),
    derogation: form.get('derogation') === 'oui',
    parId: a.id,
  }), 'Invitation envoyée.');
}

export async function actionRenvoyer(id: string) {
  const a = await exigerMembre();
  await tenter(COMPTES, () => renvoyer(id, a.id), 'Invitation renvoyée, avec un nouveau lien valable 7 jours.');
}

export async function actionRevoquer(id: string) {
  const a = await exigerMembre();
  await tenter(COMPTES, () => revoquer(id, a.id), 'Invitation révoquée.');
}

export async function actionEmail(userId: string, form: FormData) {
  const a = await exigerMembre();
  await tenter(COMPTES, () => changerEmail(userId, String(form.get('email') ?? ''), a.id), 'Adresse modifiée. Les sessions du compte ont été fermées.');
}

export async function actionDesactiver(userId: string) {
  const a = await exigerMembre();
  await tenter(COMPTES, () => desactiver(userId, a.id), 'Compte désactivé, sessions fermées.');
}

export async function actionReactiver(userId: string) {
  const a = await exigerMembre();
  await tenter(COMPTES, () => reactiver(userId, a.id), 'Compte réactivé.');
}

export async function actionSupprimerCompte(userId: string, form: FormData) {
  const a = await exigerMembre();
  if (form.get('confirmer') !== 'oui') retour(COMPTES, undefined, 'Cochez la confirmation.');
  if (userId === a.id) retour(COMPTES, undefined, 'Votre propre compte se supprime depuis « Mon compte ».');
  await tenter(COMPTES, () => supprimerCompte(userId, a.id), 'Compte supprimé.');
}

// Retirer un speaker de l'édition, depuis son dossier. On revient à la liste.
export async function actionSupprimerSpeaker(speakerId: string, form: FormData) {
  const a = await exigerMembre();
  if (form.get('confirmer') !== 'oui') retour(`/espace/equipe/speakers/${speakerId}/`, undefined, 'Cochez la confirmation.');
  const e = await editionCourante();
  await tenter('/espace/equipe/', () => supprimerSpeaker(speakerId, e.id, a.id), 'Speaker supprimé. Ses documents signés sont archivés.');
}
