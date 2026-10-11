'use server';

import { redirect } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { contexte } from '@/lib/documents';
import { changerEtatJalon, commenter, definirReferent, enregistrerPreferences, RefusSuivi, supprimerCommentaire } from '@/lib/suivi';

function retour(chemin: string, ok?: string, erreur?: string): never {
  redirect(`${chemin}?${ok ? `ok=${encodeURIComponent(ok)}` : `erreur=${encodeURIComponent(erreur ?? '')}`}`);
}

async function tenter(chemin: string, f: () => Promise<unknown>, ok: string): Promise<never> {
  try {
    await f();
  } catch (e) {
    if (e instanceof RefusSuivi) retour(chemin, undefined, e.message);
    throw e;
  }
  retour(chemin, ok);
}

export async function actionCommenter(documentId: string, form: FormData) {
  const ctx = await contexte(await exigerSession());
  await tenter(`/espace/documents/${documentId}/`, () => commenter(ctx, documentId, String(form.get('texte') ?? '')), 'Retour publié.');
}

export async function actionSupprimerCommentaire(id: string, documentId: string) {
  const ctx = await contexte(await exigerSession());
  await tenter(`/espace/documents/${documentId}/`, () => supprimerCommentaire(ctx, id), 'Retour supprimé.');
}

export async function actionJalon(speakerId: string, jalonId: string, form: FormData) {
  const ctx = await contexte(await exigerSession());
  const etat = String(form.get('etat')) as 'a_faire' | 'depose' | 'valide';
  if (!['a_faire', 'depose', 'valide'].includes(etat)) retour(`/espace/equipe/speakers/${speakerId}/`, undefined, 'État inconnu.');
  await tenter(`/espace/equipe/speakers/${speakerId}/`, () => changerEtatJalon(ctx, speakerId, jalonId, etat), 'Jalon mis à jour.');
}

export async function actionReferent(speakerId: string, form: FormData) {
  const ctx = await contexte(await exigerSession());
  const r = String(form.get('referent') ?? '');
  await tenter(`/espace/equipe/speakers/${speakerId}/`, () => definirReferent(ctx, speakerId, r || null), 'Référent enregistré.');
}

export async function actionPreferences(form: FormData) {
  const a = await exigerSession();
  await enregistrerPreferences(a.id, form.get('depot') === 'oui', form.get('commentaire') === 'oui');
  retour('/espace/compte/', 'Préférences enregistrées.');
}
