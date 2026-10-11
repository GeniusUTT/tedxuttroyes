'use server';

import { redirect } from 'next/navigation';
import { editionCourante, exigerAdmin } from '@/lib/acces';
import { changerEmail, changerRole, definirPoles, desactiver, reactiver, RefusCompte } from '@/lib/comptes';
import { inviter, RefusInvitation, renvoyer, revoquer } from '@/lib/invitations';
import { supprimerCompte } from '@/lib/rgpd';
import type { Role } from '@/lib/regles';

const ROLES: Role[] = ['speaker', 'membre', 'admin'];

function retour(ok?: string, erreur?: string): never {
  const q = ok ? `ok=${encodeURIComponent(ok)}` : `erreur=${encodeURIComponent(erreur ?? '')}`;
  redirect(`/espace/admin/?${q}`);
}

async function tenter(f: () => Promise<unknown>, ok: string): Promise<never> {
  try {
    await f();
  } catch (e) {
    if (e instanceof RefusInvitation || e instanceof RefusCompte) retour(undefined, e.message);
    throw e;
  }
  retour(ok);
}

export async function actionInviter(form: FormData) {
  const a = await exigerAdmin();
  const role = String(form.get('role')) as Role;
  if (!ROLES.includes(role)) retour(undefined, 'Rôle inconnu.');
  const e = await editionCourante();
  await tenter(() => inviter({
    email: String(form.get('email') ?? ''),
    role,
    editionId: e.id,
    poles: form.getAll('poles').map(String),
    nomAffiche: String(form.get('nom') ?? ''),
    derogation: form.get('derogation') === 'oui',
    parId: a.id,
  }), 'Invitation envoyée.');
}

export async function actionRenvoyer(id: string) {
  const a = await exigerAdmin();
  await tenter(() => renvoyer(id, a.id), 'Invitation renvoyée, avec un nouveau lien valable 7 jours.');
}

export async function actionRevoquer(id: string) {
  const a = await exigerAdmin();
  await tenter(() => revoquer(id, a.id), 'Invitation révoquée.');
}

export async function actionRole(userId: string, form: FormData) {
  const a = await exigerAdmin();
  const role = String(form.get('role')) as Role;
  if (!ROLES.includes(role)) retour(undefined, 'Rôle inconnu.');
  await tenter(() => changerRole(userId, role, a.id), 'Rôle modifié. Les sessions du compte ont été fermées.');
}

export async function actionPoles(userId: string, form: FormData) {
  const a = await exigerAdmin();
  const e = await editionCourante();
  await tenter(() => definirPoles(userId, e.id, form.getAll('poles').map(String), a.id), 'Pôles enregistrés.');
}

export async function actionEmail(userId: string, form: FormData) {
  const a = await exigerAdmin();
  await tenter(() => changerEmail(userId, String(form.get('email') ?? ''), a.id), 'Adresse modifiée. Les sessions du compte ont été fermées.');
}

export async function actionDesactiver(userId: string) {
  const a = await exigerAdmin();
  await tenter(() => desactiver(userId, a.id), 'Compte désactivé, sessions fermées.');
}

export async function actionReactiver(userId: string) {
  const a = await exigerAdmin();
  await tenter(() => reactiver(userId, a.id), 'Compte réactivé.');
}

export async function actionSupprimerCompte(userId: string, form: FormData) {
  const a = await exigerAdmin();
  if (form.get('confirmer') !== 'oui') retour(undefined, 'Cochez la confirmation.');
  if (userId === a.id) retour(undefined, 'Un admin ne supprime pas son propre compte.');
  await tenter(() => supprimerCompte(userId, a.id), 'Compte supprimé.');
}
