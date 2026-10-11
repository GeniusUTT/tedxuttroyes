'use server';

import { and, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { RefusCompte } from '@/lib/comptes';
import { seDeconnecter } from '@/lib/connexion';
import { base, schema } from '@/lib/db';
import { noter } from '@/lib/journal';
import { consommer, LIMITES } from '@/lib/limite';
import { definirMotDePasse, verifierMotDePasse } from '@/lib/motdepasse';
import { motDePasseRefuse } from '@/lib/regles';
import { supprimerCompte } from '@/lib/rgpd';

const RETOUR = '/espace/compte/';
const erreur = (m: string): never => redirect(`${RETOUR}?erreur=${encodeURIComponent(m)}`);

export async function deconnexion() {
  const a = await exigerSession();
  await seDeconnecter(a.id);
  redirect('/espace/connexion/');
}

// Changer son mot de passe : l'ancien d'abord (une session laissée ouverte
// ne suffit pas à le changer), puis les autres sessions sont fermées.
export async function changerMotDePasse(form: FormData) {
  const a = await exigerSession();
  if (!(await consommer(`essai:email:${a.email}`, LIMITES.essaiParEmail.max, LIMITES.essaiParEmail.fenetre))) erreur('Trop d’essais. Réessayez dans un quart d’heure.');
  const actuel = String(form.get('actuel') ?? ''), mdp = String(form.get('mdp') ?? ''), confirmation = String(form.get('confirmation') ?? '');
  if (!(await verifierMotDePasse(a.id, actuel))) erreur('Le mot de passe actuel est incorrect.');
  if (mdp !== confirmation) erreur('Les deux nouveaux mots de passe ne sont pas identiques.');
  const refus = motDePasseRefuse(mdp, a.email);
  if (refus) erreur(refus);
  await definirMotDePasse(a.id, mdp);
  const b = await base();
  await b.delete(schema.session).where(and(eq(schema.session.userId, a.id), ne(schema.session.id, a.sessionId)));
  await noter('compte.mot_de_passe', { acteurId: a.id, cibleType: 'user', cibleId: a.id });
  redirect(`${RETOUR}?ok=${encodeURIComponent('Mot de passe changé. Vos autres sessions ont été fermées.')}`);
}

// On ne ferme que ses propres sessions : le filtre sur userId est la garde.
export async function fermerSession(id: string) {
  const a = await exigerSession();
  const b = await base();
  await b.delete(schema.session).where(and(eq(schema.session.id, id), eq(schema.session.userId, a.id)));
  await noter('session.fermee', { acteurId: a.id, cibleType: 'session', cibleId: id });
  redirect(`${RETOUR}?ok=${encodeURIComponent('Session fermée.')}`);
}

export async function fermerAutresSessions() {
  const a = await exigerSession();
  const b = await base();
  await b.delete(schema.session).where(and(eq(schema.session.userId, a.id), ne(schema.session.id, a.sessionId)));
  await noter('session.fermee', { acteurId: a.id, details: { toutes_les_autres: true } });
  redirect(`${RETOUR}?ok=${encodeURIComponent('Les autres sessions sont fermées.')}`);
}

// Supprimer son propre compte. La règle des deux membres actifs vaut aussi
// ici : le dernier membre ne peut pas partir sans passer le relais.
export async function supprimerMonCompte(form: FormData) {
  const a = await exigerSession();
  if (form.get('confirmer') !== 'oui') erreur('Cochez la confirmation.');
  try {
    await supprimerCompte(a.id, a.id);
  } catch (e) {
    if (e instanceof RefusCompte) erreur(e.message);
    throw e;
  }
  redirect('/espace/connexion/');
}
