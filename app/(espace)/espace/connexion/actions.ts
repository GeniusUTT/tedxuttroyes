'use server';

import { redirect } from 'next/navigation';
import { demanderCode, seConnecter } from '@/lib/connexion';
import { normaliserEmail } from '@/lib/regles';

export type Etat = { erreur?: string };

export async function actionDemander(_e: Etat, form: FormData): Promise<Etat> {
  const email = normaliserEmail(String(form.get('email') ?? ''));
  const r = await demanderCode(email);
  if (!r.ok) return { erreur: r.message };
  redirect(`/espace/connexion/code/?email=${encodeURIComponent(email)}&envoye=1`);
}

export async function actionConnecter(_e: Etat, form: FormData): Promise<Etat> {
  const email = String(form.get('email') ?? '');
  const code = String(form.get('code') ?? '').replace(/\s/g, '');
  const r = await seConnecter(email, code);
  if (!r.ok) return { erreur: r.message };
  redirect('/espace/');
}
