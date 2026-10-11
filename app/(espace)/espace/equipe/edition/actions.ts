'use server';

import { redirect } from 'next/navigation';
import { editionCourante, exigerMembre } from '@/lib/acces';
import { enregistrerJalon, enregistrerLienPhotos, modifierEdition, nouvelleEdition, RefusAdministration, supprimerJalon } from '@/lib/administration';

const RETOUR = '/espace/equipe/edition/';

async function tenter(f: () => Promise<unknown>, ok: string): Promise<never> {
  try {
    await f();
  } catch (e) {
    if (e instanceof RefusAdministration) redirect(`${RETOUR}?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  redirect(`${RETOUR}?ok=${encodeURIComponent(ok)}`);
}

export async function actionEdition(form: FormData) {
  const a = await exigerMembre();
  const e = await editionCourante();
  await tenter(() => modifierEdition(e.id, String(form.get('libelle') ?? ''), String(form.get('date') ?? ''), a.id), 'Édition enregistrée.');
}

export async function actionLienPhotos(form: FormData) {
  const a = await exigerMembre();
  const e = await editionCourante();
  await tenter(() => enregistrerLienPhotos(e.id, String(form.get('lien') ?? ''), a.id), 'Lien de l’album photo enregistré.');
}

export async function actionNouvelleEdition(form: FormData) {
  const a = await exigerMembre();
  if (form.get('confirmer') !== 'oui') redirect(`${RETOUR}?erreur=${encodeURIComponent('Cochez la confirmation.')}`);
  await tenter(() => nouvelleEdition(Number(form.get('annee')), String(form.get('libelle') ?? ''), String(form.get('date') ?? ''), a.id), 'Nouvelle édition ouverte.');
}

export async function actionJalon(id: string | null, form: FormData) {
  const a = await exigerMembre();
  const e = await editionCourante();
  await tenter(() => enregistrerJalon(e.id, {
    id: id ?? undefined,
    libelle: String(form.get('libelle') ?? ''),
    echeance: String(form.get('echeance') ?? ''),
    categorie: String(form.get('categorie') ?? ''),
    ordre: Number(form.get('ordre') ?? 0),
  }, a.id), 'Jalon enregistré.');
}

export async function actionSupprimerJalon(id: string) {
  const a = await exigerMembre();
  const e = await editionCourante();
  await tenter(() => supprimerJalon(e.id, id, a.id), 'Jalon supprimé.');
}
