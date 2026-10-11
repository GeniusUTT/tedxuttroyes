import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { base, schema } from './db';
import { RefusCompte } from './comptes';
import { noter } from './journal';
import { retraitAdminPermis } from './regles';
import { stockage } from './storage';

// Export et suppression d'un compte. La suppression efface tout ce qui est
// personnel, sauf la Speaker Release : elle fonde le droit de diffuser la
// vidéo, elle passe dans une archive réservée aux admins, sans limite de
// durée. Le contenu publié sur le site public n'est pas concerné.

export async function exporter(userId: string) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) throw new RefusCompte('Compte introuvable.');
  const poles = await b.select({ nom: schema.pole.nom, edition: schema.membrePole.editionId }).from(schema.membrePole)
    .innerJoin(schema.pole, eq(schema.pole.id, schema.membrePole.poleId)).where(eq(schema.membrePole.userId, userId));
  const speakers = await b.select().from(schema.speaker).where(eq(schema.speaker.userId, userId));
  const docs = speakers.length
    ? await b.select().from(schema.document).where(and(inArray(schema.document.speakerId, speakers.map((s) => s.id)), eq(schema.document.archive, false)))
    : [];
  const deposes = await b.select().from(schema.version).where(eq(schema.version.deposeParId, userId));
  const versions = docs.length ? await b.select().from(schema.version).where(inArray(schema.version.documentId, docs.map((d) => d.id))) : [];
  const commentaires = await b.select({ texte: schema.commentaire.texte, le: schema.commentaire.createdAt, document: schema.commentaire.documentId })
    .from(schema.commentaire).where(eq(schema.commentaire.auteurId, userId));
  const sessions = await b.select({ creeLe: schema.session.createdAt, expire: schema.session.expiresAt, ip: schema.session.ipAddress, navigateur: schema.session.userAgent })
    .from(schema.session).where(eq(schema.session.userId, userId));
  const [preferences] = await b.select().from(schema.preference).where(eq(schema.preference.userId, userId));
  const journal = await b.select({ le: schema.journal.le, action: schema.journal.action, cible: schema.journal.cibleType }).from(schema.journal)
    .where(and(eq(schema.journal.acteurId, userId), gte(schema.journal.le, new Date(Date.now() - 366 * 24 * 3600 * 1000)))).orderBy(desc(schema.journal.le));
  const fichier = (v: typeof schema.version.$inferSelect) => ({ nom: v.nomOrigine, taille: v.taille, deposeLe: v.deposeLe, telecharger: `/espace/api/fichiers/${v.id}/` });
  await noter('compte.export', { acteurId: userId, cibleType: 'user', cibleId: userId });
  return {
    exporteLe: new Date().toISOString(),
    compte: { nom: u.name, email: u.email, role: u.role, creeLe: u.createdAt, derniereConnexion: u.derniereConnexion },
    poles,
    fiches: speakers.map((s) => ({ nomAffiche: s.nomAffiche, biographie: s.biographie, titreProvisoire: s.titreProvisoire })),
    documents: docs.map((d) => ({ titre: d.titre, categorie: d.categorie, lien: d.lienExterne, versions: versions.filter((v) => v.documentId === d.id).map(fichier) })),
    fichiersDeposes: deposes.map(fichier),
    commentaires,
    sessions,
    preferences: preferences ? { notifDepot: preferences.notifDepot, notifCommentaire: preferences.notifCommentaire } : null,
    journal,
  };
}

async function effacerVersions(documentIds: string[]) {
  if (!documentIds.length) return;
  const b = await base();
  const s = await stockage();
  const versions = await b.select({ cle: schema.version.cleStockage }).from(schema.version).where(inArray(schema.version.documentId, documentIds));
  for (const v of versions) await s.supprimer(v.cle);
  await b.delete(schema.document).where(inArray(schema.document.id, documentIds));
}

export async function supprimerCompte(userId: string, parId: string | null) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) return;
  if (u.role === 'admin' && !u.desactiveLe) {
    const actifs = (await b.select({ id: schema.user.id, d: schema.user.desactiveLe }).from(schema.user).where(eq(schema.user.role, 'admin'))).filter((x) => !x.d).length;
    if (!retraitAdminPermis(actifs, true)) throw new RefusCompte('Il faut au moins deux admins actifs : nommez-en un autre avant de supprimer celui-ci.');
  }
  const speakers = await b.select().from(schema.speaker).where(eq(schema.speaker.userId, userId));
  for (const s of speakers) {
    const docs = await b.select().from(schema.document).where(eq(schema.document.speakerId, s.id));
    const releases = docs.filter((d) => d.categorie === 'release' && !d.supprimeLe);
    if (releases.length) await b.update(schema.document).set({ archive: true }).where(inArray(schema.document.id, releases.map((d) => d.id)));
    await effacerVersions(docs.filter((d) => !releases.includes(d)).map((d) => d.id));
    await b.delete(schema.jalonSpeaker).where(eq(schema.jalonSpeaker.speakerId, s.id));
    await b.update(schema.speaker).set({ biographie: '', titreProvisoire: '', referentId: null, updatedAt: new Date() }).where(eq(schema.speaker.id, s.id));
  }
  await b.update(schema.speaker).set({ referentId: null }).where(eq(schema.speaker.referentId, userId));
  await b.delete(schema.invitation).where(eq(schema.invitation.email, u.email));
  await b.delete(schema.user).where(eq(schema.user.id, userId));
  await noter('compte.supprime', { acteurId: parId, cibleType: 'user', cibleId: userId, details: { role: u.role, releasesArchivees: speakers.length > 0 } });
}
