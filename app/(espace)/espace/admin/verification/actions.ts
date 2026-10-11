'use server';

import { redirect } from 'next/navigation';
import { exigerRole } from '@/lib/acces';
import { RefusTotp, valider } from '@/lib/second-facteur';

export async function actionValider(form: FormData) {
  const a = await exigerRole('admin');
  try {
    await valider(a.id, a.sessionId, String(form.get('code') ?? ''));
  } catch (e) {
    if (e instanceof RefusTotp) redirect(`/espace/admin/verification/?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  redirect('/espace/admin/');
}
