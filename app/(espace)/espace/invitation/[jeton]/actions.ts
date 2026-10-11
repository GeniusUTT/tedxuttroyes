'use server';

import { redirect } from 'next/navigation';
import { connecterApresInvitation } from '@/lib/connexion';
import { accepter, RefusInvitation } from '@/lib/invitations';

export type EtatInvitation = { erreur?: string };

export async function actionAccepter(jeton: string, _e: EtatInvitation, form: FormData): Promise<EtatInvitation> {
  const mdp = String(form.get('mdp') ?? '');
  let email: string;
  try {
    email = await accepter(jeton, mdp, String(form.get('confirmation') ?? ''));
  } catch (e) {
    if (e instanceof RefusInvitation) return { erreur: e.message };
    throw e;
  }
  await connecterApresInvitation(email, mdp);
  redirect('/espace/');
}
