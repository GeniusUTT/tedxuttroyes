import { and, desc, eq, gte, inArray, isNull } from 'drizzle-orm';
import { base, schema } from './db';
import { estMembreActif, membresActifs, RefusCompte } from './comptes';
import { noter } from './journal';
import { retraitMembrePermis } from './regles';
import { stockage } from './storage';

// Export, suppression d'un compte, suppression d'un speaker. Effacer un
// speaker efface tout ce qui est personnel, sauf les deux documents signés :
// la Speaker Release fonde le droit de diffuser la vidéo, le droit à l'image
// celui d'utiliser les photos et les images de la soirée. Ils passent dans
// une archive réservée à l'équipe, sans limite de durée. Le contenu publié
// sur le site public n'est pas concerné.
//
// Un prestataire supprimé garde de même ses pièces comptables (devis,
// factures, contrats), archivées pour la trésorerie ; le reste de son
// dossier est effacé.

export const ARCHIVES = ['release', 'droit_image'];
export const ARCHIVES_PRESTATAIRE = ['devis', 'facture', 'contrat', 'contrat_signe'];

export async function exporter(userId: string) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) throw new RefusCompte('Compte introuvable.');
  const speakers = await b.select().from(schema.speaker).where(eq(schema.speaker.userId, userId));
  const docs = speakers.length
    ? await b.select().from(schema.document).where(and(inArray(schema.document.speakerId, speakers.map((s) => s.id)), eq(schema.document.archive, false)))
    : [];
  const structures = await b.select({ p: schema.prestataire }).from(schema.prestataireCompte)
    .innerJoin(schema.prestataire, eq(schema.prestataire.id, schema.prestataireCompte.prestataireId))
    .where(eq(schema.prestataireCompte.userId, userId));
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
    fiches: speakers.map((s) => ({
      nomAffiche: s.nomAffiche, prenom: s.prenom, nom: s.nom, emailContact: s.emailContact, telephone: s.telephone,
      titre: s.titreProvisoire, resume: s.resume, biographie: s.biographie, lienVideo: s.lienVideo,
    })),
    prestataires: structures.map(({ p }) => ({
      structure: p.structure, prestation: p.prestation, contact: p.contact, emailContact: p.emailContact, telephone: p.telephone, adresse: p.adresse,
    })),
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

// Vide un dossier speaker : documents signés archivés, tout le reste effacé
// (fichiers compris), fiche remise à blanc. La ligne reste, marquée
// supprimée, pour nommer les documents archivés.
async function effacerDossier(speakerId: string) {
  const b = await base();
  const docs = await b.select().from(schema.document).where(eq(schema.document.speakerId, speakerId));
  const signes = docs.filter((d) => ARCHIVES.includes(d.categorie) && !d.supprimeLe);
  if (signes.length) await b.update(schema.document).set({ archive: true }).where(inArray(schema.document.id, signes.map((d) => d.id)));
  await effacerVersions(docs.filter((d) => !signes.includes(d)).map((d) => d.id));
  await b.delete(schema.jalonSpeaker).where(eq(schema.jalonSpeaker.speakerId, speakerId));
  await b.update(schema.speaker).set({
    prenom: '', nom: '', emailContact: '', telephone: '', biographie: '', titreProvisoire: '', resume: '',
    lienVideo: null, referentId: null, supprimeLe: new Date(), updatedAt: new Date(),
  }).where(eq(schema.speaker.id, speakerId));
  return signes.length;
}

export async function supprimerCompte(userId: string, parId: string | null) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) return;
  if (!retraitMembrePermis(await membresActifs(), estMembreActif(u))) {
    throw new RefusCompte('Il faut au moins deux membres actifs : invitez-en un autre avant de supprimer celui-ci.');
  }
  const speakers = await b.select().from(schema.speaker).where(eq(schema.speaker.userId, userId));
  let archives = 0;
  for (const s of speakers) archives += await effacerDossier(s.id);
  await b.update(schema.speaker).set({ referentId: null }).where(eq(schema.speaker.referentId, userId));
  await b.update(schema.prestataire).set({ referentId: null }).where(eq(schema.prestataire.referentId, userId));
  await b.delete(schema.invitation).where(eq(schema.invitation.email, u.email));
  await b.delete(schema.user).where(eq(schema.user.id, userId));
  await noter('compte.supprime', { acteurId: parId, cibleType: 'user', cibleId: userId, details: { role: u.role, documentsArchives: archives } });
}

// Retirer un speaker de l'édition : son compte s'il en a un, son dossier
// dans tous les cas.
export async function supprimerSpeaker(speakerId: string, editionId: string, parId: string) {
  const b = await base();
  const [s] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, speakerId), eq(schema.speaker.editionId, editionId)));
  if (!s || s.supprimeLe) throw new RefusCompte('Speaker introuvable.');
  if (s.userId) await supprimerCompte(s.userId, parId);
  else await effacerDossier(s.id);
  await noter('speaker.supprime', { acteurId: parId, cibleType: 'speaker', cibleId: speakerId, editionId });
}

// Supprimer un prestataire : les comptes de toutes les personnes qui y ont
// accès, ses invitations en attente, ses documents (pièces comptables
// archivées) et sa fiche. La ligne reste, avec le nom de la structure, pour
// nommer l'archive.
export async function supprimerPrestataire(prestataireId: string, editionId: string, parId: string | null) {
  const b = await base();
  const [p] = await b.select().from(schema.prestataire).where(and(eq(schema.prestataire.id, prestataireId), eq(schema.prestataire.editionId, editionId)));
  if (!p || p.supprimeLe) throw new RefusCompte('Prestataire introuvable.');
  const comptes = await b.select({ userId: schema.prestataireCompte.userId }).from(schema.prestataireCompte).where(eq(schema.prestataireCompte.prestataireId, prestataireId));
  for (const { userId } of comptes) await supprimerCompte(userId, parId);
  await b.update(schema.invitation).set({ revoqueeLe: new Date() })
    .where(and(eq(schema.invitation.prestataireId, prestataireId), isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)));
  const docs = await b.select().from(schema.document).where(eq(schema.document.prestataireId, prestataireId));
  const gardes = docs.filter((d) => ARCHIVES_PRESTATAIRE.includes(d.categorie) && !d.supprimeLe);
  if (gardes.length) await b.update(schema.document).set({ archive: true }).where(inArray(schema.document.id, gardes.map((d) => d.id)));
  await effacerVersions(docs.filter((d) => !gardes.includes(d)).map((d) => d.id));
  await b.update(schema.prestataire).set({
    contact: '', emailContact: '', telephone: '', adresse: '', referentId: null, supprimeLe: new Date(), updatedAt: new Date(),
  }).where(eq(schema.prestataire.id, prestataireId));
  await noter('prestataire.supprime', { acteurId: parId, cibleType: 'prestataire', cibleId: prestataireId, editionId, details: { documentsArchives: gardes.length } });
}
