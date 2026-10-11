'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { confirmerDepot, contexte, enregistrerLienVideo, modifierFiche, preparerDepot, RefusDocument, supprimerDocument, type DemandeDepot } from '@/lib/documents';
import type { FormulaireEnvoi } from '@/lib/storage';

export type Preparation = { ok: true; envoiId: string; formulaire: FormulaireEnvoi } | { ok: false; erreur: string };
export type Resultat = { ok: true } | { ok: false; erreur: string };

async function ctx() {
  return contexte(await exigerSession());
}

export async function actionPreparer(d: DemandeDepot): Promise<Preparation> {
  try {
    const r = await preparerDepot(await ctx(), d);
    return { ok: true, ...r };
  } catch (e) {
    if (e instanceof RefusDocument) return { ok: false, erreur: e.message };
    throw e;
  }
}

export async function actionConfirmer(envoiId: string, attestation: boolean, chemin: string): Promise<Resultat> {
  try {
    await confirmerDepot(await ctx(), envoiId, attestation);
  } catch (e) {
    if (e instanceof RefusDocument) return { ok: false, erreur: e.message };
    throw e;
  }
  revalidatePath(chemin);
  return { ok: true };
}

export async function actionSupprimer(documentId: string, retour: string) {
  try {
    await supprimerDocument(await ctx(), documentId);
  } catch (e) {
    if (e instanceof RefusDocument) redirect(`${retour}?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  redirect(`${retour}?ok=${encodeURIComponent('Document supprimé.')}`);
}

export async function actionLienVideo(speakerId: string, retour: string, form: FormData) {
  try {
    await enregistrerLienVideo(await ctx(), speakerId, String(form.get('lien') ?? ''));
  } catch (e) {
    if (e instanceof RefusDocument) redirect(`${retour}?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  redirect(`${retour}?ok=${encodeURIComponent('Lien de la vidéo enregistré.')}`);
}

const texte = (form: FormData, cle: string) => String(form.get(cle) ?? '');

export async function actionFiche(speakerId: string, retour: string, form: FormData) {
  try {
    await modifierFiche(await ctx(), speakerId, {
      prenom: texte(form, 'prenom'),
      nom: texte(form, 'nom'),
      emailContact: texte(form, 'emailContact'),
      telephone: texte(form, 'telephone'),
      titreProvisoire: texte(form, 'titreProvisoire'),
      resume: texte(form, 'resume'),
      biographie: texte(form, 'biographie'),
      nomAffiche: form.has('nomAffiche') ? texte(form, 'nomAffiche') : undefined,
    });
  } catch (e) {
    if (e instanceof RefusDocument) redirect(`${retour}?erreur=${encodeURIComponent(e.message)}`);
    throw e;
  }
  redirect(`${retour}?ok=${encodeURIComponent('Fiche enregistrée.')}`);
}
