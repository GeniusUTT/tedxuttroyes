import { randomUUID } from 'node:crypto';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import { JALON_FICHE } from './categories';
import { base, schema } from './db';
import { peutCommenter, peutLire, peutValiderJalon, type Contexte } from './droits';
import { noter } from './journal';
import { enArrierePlan, notifier } from './notifications';

// Jalons, commentaires, référents. Les droits sont redemandés à chaque appel.

export class RefusSuivi extends Error {}

type Ctx = Contexte & { editionId: string };

export async function jalons(editionId: string) {
  const b = await base();
  return b.select().from(schema.jalon).where(eq(schema.jalon.editionId, editionId)).orderBy(asc(schema.jalon.ordre), asc(schema.jalon.echeance));
}

export async function etats(speakerIds: string[]) {
  if (!speakerIds.length) return [];
  const b = await base();
  return b.select().from(schema.jalonSpeaker).where(inArray(schema.jalonSpeaker.speakerId, speakerIds));
}

// Une fiche est complète quand le speaker a donné de quoi le joindre et de
// quoi le présenter.
export function ficheComplete(s: { prenom: string; nom: string; emailContact: string; telephone: string; biographie: string; resume: string }): boolean {
  return [s.prenom, s.nom, s.emailContact, s.telephone, s.biographie, s.resume].every((x) => x.trim().length > 0);
}

async function marquerDepose(speakerId: string, jalonIds: string[]) {
  const b = await base();
  for (const jalonId of jalonIds) {
    const [e] = await b.select().from(schema.jalonSpeaker).where(and(eq(schema.jalonSpeaker.speakerId, speakerId), eq(schema.jalonSpeaker.jalonId, jalonId)));
    if (!e) await b.insert(schema.jalonSpeaker).values({ speakerId, jalonId, etat: 'depose' });
    else if (e.etat === 'a_faire') await b.update(schema.jalonSpeaker).set({ etat: 'depose', majLe: new Date() }).where(and(eq(schema.jalonSpeaker.speakerId, speakerId), eq(schema.jalonSpeaker.jalonId, jalonId)));
  }
}

// Appelé après chaque enregistrement de la fiche : une fiche complète passe
// les jalons « fiche » à « déposé », sans jamais défaire une validation.
export async function apresFiche(speakerId: string) {
  const b = await base();
  const [s] = await b.select().from(schema.speaker).where(eq(schema.speaker.id, speakerId));
  if (!s || !ficheComplete(s)) return;
  const lies = await b.select({ id: schema.jalon.id }).from(schema.jalon).where(and(eq(schema.jalon.editionId, s.editionId), eq(schema.jalon.categorie, JALON_FICHE)));
  await marquerDepose(speakerId, lies.map((j) => j.id));
}

// Appelé après chaque dépôt : un document du speaker dans la catégorie
// d'un jalon le passe à « déposé », sans jamais défaire une validation.
export async function apresDepot(acteurId: string, documentId: string) {
  const b = await base();
  const [d] = await b.select().from(schema.document).where(eq(schema.document.id, documentId));
  if (d && d.rattachement === 'speaker' && d.sens === 'du_speaker' && d.speakerId) {
    const lies = await b.select({ id: schema.jalon.id }).from(schema.jalon).where(and(eq(schema.jalon.editionId, d.editionId), eq(schema.jalon.categorie, d.categorie)));
    await marquerDepose(d.speakerId, lies.map((j) => j.id));
  }
  await enArrierePlan(() => notifier({ type: 'depot', documentId, acteurId }));
}

export async function changerEtatJalon(ctx: Ctx, speakerId: string, jalonId: string, etat: 'a_faire' | 'depose' | 'valide') {
  if (!peutValiderJalon(ctx)) throw new RefusSuivi('Action non autorisée.');
  const b = await base();
  const [j] = await b.select().from(schema.jalon).where(and(eq(schema.jalon.id, jalonId), eq(schema.jalon.editionId, ctx.editionId)));
  const [s] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, speakerId), eq(schema.speaker.editionId, ctx.editionId)));
  if (!j || !s) throw new RefusSuivi('Action non autorisée.');
  await b.insert(schema.jalonSpeaker).values({ speakerId, jalonId, etat, valideParId: etat === 'valide' ? ctx.id : null })
    .onConflictDoUpdate({ target: [schema.jalonSpeaker.speakerId, schema.jalonSpeaker.jalonId], set: { etat, valideParId: etat === 'valide' ? ctx.id : null, majLe: new Date() } });
  await noter('jalon.valide', { acteurId: ctx.id, cibleType: 'speaker', cibleId: speakerId, editionId: ctx.editionId, details: { jalon: jalonId, etat } });
}

export async function definirReferent(ctx: Ctx, speakerId: string, referentId: string | null) {
  if (!peutValiderJalon(ctx)) throw new RefusSuivi('Action non autorisée.');
  const b = await base();
  if (referentId) {
    const [u] = await b.select().from(schema.user).where(eq(schema.user.id, referentId));
    if (!u || u.role !== 'membre' || u.desactiveLe) throw new RefusSuivi('Référent invalide.');
  }
  await b.update(schema.speaker).set({ referentId, updatedAt: new Date() }).where(and(eq(schema.speaker.id, speakerId), eq(schema.speaker.editionId, ctx.editionId)));
  await noter('speaker.modifie', { acteurId: ctx.id, cibleType: 'speaker', cibleId: speakerId, details: { referent: referentId } });
}

async function documentAccessible(ctx: Ctx, documentId: string) {
  const b = await base();
  const [d] = await b.select().from(schema.document).where(and(eq(schema.document.id, documentId), isNull(schema.document.supprimeLe)));
  if (!d || d.editionId !== ctx.editionId || !peutLire(ctx, d)) return null;
  return d;
}

export async function commentaires(ctx: Ctx, documentId: string) {
  if (!(await documentAccessible(ctx, documentId))) return [];
  const b = await base();
  return b.select({ c: schema.commentaire, nom: schema.user.name, role: schema.user.role }).from(schema.commentaire)
    .leftJoin(schema.user, eq(schema.user.id, schema.commentaire.auteurId))
    .where(and(eq(schema.commentaire.documentId, documentId), isNull(schema.commentaire.supprimeLe)))
    .orderBy(asc(schema.commentaire.createdAt));
}

export async function commenter(ctx: Ctx, documentId: string, texte: string) {
  const d = await documentAccessible(ctx, documentId);
  const t = texte.trim();
  if (!d || !peutCommenter(ctx, d)) throw new RefusSuivi('Action non autorisée.');
  if (!t) throw new RefusSuivi('Le retour est vide.');
  const b = await base();
  const id = randomUUID();
  await b.insert(schema.commentaire).values({ id, documentId, auteurId: ctx.id, texte: t.slice(0, 5000) });
  await noter('commentaire.cree', { acteurId: ctx.id, cibleType: 'document', cibleId: documentId, editionId: d.editionId });
  await enArrierePlan(() => notifier({ type: 'commentaire', documentId, acteurId: ctx.id }));
  return id;
}

export async function supprimerCommentaire(ctx: Ctx, id: string) {
  const b = await base();
  const [c] = await b.select().from(schema.commentaire).where(eq(schema.commentaire.id, id));
  if (!c || !(await documentAccessible(ctx, c.documentId)) || (c.auteurId !== ctx.id && ctx.role !== 'membre')) throw new RefusSuivi('Action non autorisée.');
  await b.update(schema.commentaire).set({ supprimeLe: new Date() }).where(eq(schema.commentaire.id, id));
  await noter('commentaire.supprime', { acteurId: ctx.id, cibleType: 'commentaire', cibleId: id });
  return c.documentId;
}

export async function preferences(userId: string) {
  const b = await base();
  const [p] = await b.select().from(schema.preference).where(eq(schema.preference.userId, userId));
  return p ?? { userId, notifDepot: true, notifCommentaire: true };
}

export async function enregistrerPreferences(userId: string, notifDepot: boolean, notifCommentaire: boolean) {
  const b = await base();
  await b.insert(schema.preference).values({ userId, notifDepot, notifCommentaire })
    .onConflictDoUpdate({ target: schema.preference.userId, set: { notifDepot, notifCommentaire } });
}
