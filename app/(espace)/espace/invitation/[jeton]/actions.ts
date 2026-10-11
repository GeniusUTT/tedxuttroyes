'use server';

import { redirect } from 'next/navigation';
import { demanderCode } from '@/lib/connexion';
import { accepter, RefusInvitation } from '@/lib/invitations';

export async function actionAccepter(jeton: string) {
  let email: string;
  try {
    email = await accepter(jeton);
  } catch (e) {
    if (e instanceof RefusInvitation) redirect(`/espace/invitation/${encodeURIComponent(jeton)}/?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  await demanderCode(email);
  redirect(`/espace/connexion/code/?email=${encodeURIComponent(email)}&envoye=1`);
}
