'use server';

import { redirect } from 'next/navigation';
import { demanderReinitialisation, REPONSE_DEMANDE, reinitialiser, seConnecter } from '@/lib/connexion';

export type Etat = { erreur?: string; ok?: string };

export async function actionConnecter(_e: Etat, form: FormData): Promise<Etat> {
  const r = await seConnecter(String(form.get('email') ?? ''), String(form.get('mdp') ?? ''));
  if (!r.ok) return { erreur: r.message };
  redirect('/espace/');
}

export async function actionDemanderLien(_e: Etat, form: FormData): Promise<Etat> {
  const r = await demanderReinitialisation(String(form.get('email') ?? ''));
  if (!r.ok) return { erreur: r.message };
  return { ok: REPONSE_DEMANDE };
}

export async function actionReinitialiser(jeton: string, _e: Etat, form: FormData): Promise<Etat> {
  const r = await reinitialiser(jeton, String(form.get('mdp') ?? ''), String(form.get('confirmation') ?? ''));
  if (!r.ok) return { erreur: r.message };
  redirect('/espace/');
}
