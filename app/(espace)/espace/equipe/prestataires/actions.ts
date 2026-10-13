'use server';

import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { exigerMembre, exigerSession } from '@/lib/acces';
import { RefusCompte } from '@/lib/comptes';
import { base, schema } from '@/lib/db';
import { contexte, RefusDocument } from '@/lib/documents';
import { inviter, RefusInvitation } from '@/lib/invitations';
import { noter } from '@/lib/journal';
import { creerPrestataire, definirReferentPrestataire, modifierFichePrestataire } from '@/lib/prestataires';
import { supprimerCompte, supprimerPrestataire } from '@/lib/rgpd';

const LISTE = '/espace/equipe/prestataires/';
const dossier = (id: string) => `${LISTE}${id}/`;

function retour(chemin: string, ok?: string, erreur?: string): never {
  redirect(`${chemin}?${ok ? `ok=${encodeURIComponent(ok)}` : `erreur=${encodeURIComponent(erreur ?? '')}`}`);
}

async function tenter(chemin: string, f: () => Promise<unknown>, ok: string): Promise<never> {
  try {
    await f();
  } catch (e) {
    if (e instanceof RefusDocument || e instanceof RefusInvitation || e instanceof RefusCompte) retour(chemin, undefined, e.message);
    throw e;
  }
  retour(chemin, ok);
}

const texte = (form: FormData, cle: string) => String(form.get(cle) ?? '');

// Créer le dossier d'une structure : on arrive aussitôt dessus, pour y
// inviter ses interlocuteurs.
export async function actionCreerPrestataire(form: FormData) {
  const ctx = await contexte(await exigerMembre());
  let id = '';
  try {
    id = await creerPrestataire(ctx, texte(form, 'structure'), texte(form, 'prestation'));
  } catch (e) {
    if (e instanceof RefusDocument) retour(LISTE, undefined, e.message);
    throw e;
  }
  retour(dossier(id), 'Dossier créé. Invitez maintenant les personnes qui y auront accès.');
}

// La fiche s'enregistre depuis le dossier vu par l'équipe ou par le
// prestataire lui-même : on revient d'où l'on vient.
export async function actionFichePrestataire(id: string, chemin: string, form: FormData) {
  const ctx = await contexte(await exigerSession());
  const dest = chemin === '/espace/prestataire/' ? chemin : dossier(id);
  await tenter(dest, () => modifierFichePrestataire(ctx, id, {
    structure: texte(form, 'structure'),
    prestation: texte(form, 'prestation'),
    contact: texte(form, 'contact'),
    emailContact: texte(form, 'emailContact'),
    telephone: texte(form, 'telephone'),
    adresse: texte(form, 'adresse'),
  }), 'Fiche enregistrée.');
}

export async function actionReferentPrestataire(id: string, form: FormData) {
  const ctx = await contexte(await exigerMembre());
  await tenter(dossier(id), () => definirReferentPrestataire(ctx, id, texte(form, 'referent') || null), 'Référent enregistré.');
}

export async function actionInviterPrestataire(id: string, form: FormData) {
  const a = await exigerMembre();
  const ctx = await contexte(a);
  await tenter(dossier(id), () => inviter({
    email: texte(form, 'email'),
    role: 'prestataire',
    editionId: ctx.editionId,
    nomAffiche: texte(form, 'nom'),
    derogation: false,
    parId: a.id,
    prestataireId: id,
  }), 'Invitation envoyée.');
}

// Retirer une personne du dossier, c'est supprimer son compte : il ne sert
// qu'à ce dossier. Les documents qu'elle a déposés restent à la structure.
export async function actionRetirerAcces(id: string, userId: string, form: FormData) {
  const a = await exigerMembre();
  if (form.get('confirmer') !== 'oui') retour(dossier(id), undefined, 'Cochez la confirmation.');
  const b = await base();
  const [lien] = await b.select().from(schema.prestataireCompte)
    .where(and(eq(schema.prestataireCompte.prestataireId, id), eq(schema.prestataireCompte.userId, userId)));
  if (!lien) retour(dossier(id), undefined, 'Compte introuvable.');
  await tenter(dossier(id), async () => {
    await supprimerCompte(userId, a.id);
    await noter('prestataire.acces_retire', { acteurId: a.id, cibleType: 'prestataire', cibleId: id });
  }, 'Accès retiré : le compte est supprimé, ses dépôts restent dans le dossier.');
}

export async function actionSupprimerPrestataire(id: string, form: FormData) {
  const a = await exigerMembre();
  if (form.get('confirmer') !== 'oui') retour(dossier(id), undefined, 'Cochez la confirmation.');
  const ctx = await contexte(a);
  await tenter(LISTE, () => supprimerPrestataire(id, ctx.editionId, a.id), 'Prestataire supprimé. Ses devis, factures et contrats sont archivés.');
}
