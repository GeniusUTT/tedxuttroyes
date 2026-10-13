import { createHash, randomUUID } from 'node:crypto';
import { and, asc, desc, eq, inArray, isNull, max } from 'drizzle-orm';
import { editionCourante, type Acteur } from './acces';
import { categorie, extensionDe, FORMATS, lienValide, pourPrestataire, signatureValide, type Rattachement } from './categories';
import { base, schema } from './db';
import { peutDeposer, peutLire, peutModifierFicheSpeaker, peutSupprimer, peutValiderJalon, type Cible, type Contexte, type RefDocument } from './droits';
import { noter } from './journal';
import { stockage } from './storage';
import { emailValide, normaliserEmail, telephoneValide } from './regles';
import { apresDepot, apresFiche } from './suivi';

// Dépôt, versions, téléchargement. Chaque fonction reçoit le contexte de
// l'acteur et redemande ses droits : rien ne se fie à ce que la page a
// affiché. Un document interdit et un document inexistant se répondent
// pareil.

export class RefusDocument extends Error {}

const MO = 1024 * 1024;
const NON_AUTORISE = 'Action non autorisée.';

export async function contexte(a: Acteur): Promise<Contexte & { prestataires: string[]; editionId: string; annee: number }> {
  const e = await editionCourante();
  const b = await base();
  const speakers = a.role === 'speaker'
    ? (await b.select({ id: schema.speaker.id }).from(schema.speaker)
      .where(and(eq(schema.speaker.userId, a.id), eq(schema.speaker.editionId, e.id), isNull(schema.speaker.supprimeLe)))).map((s) => s.id)
    : [];
  const prestataires = a.role === 'prestataire'
    ? (await b.select({ id: schema.prestataire.id }).from(schema.prestataireCompte)
      .innerJoin(schema.prestataire, eq(schema.prestataire.id, schema.prestataireCompte.prestataireId))
      .where(and(eq(schema.prestataireCompte.userId, a.id), eq(schema.prestataire.editionId, e.id), isNull(schema.prestataire.supprimeLe)))).map((p) => p.id)
    : [];
  return { id: a.id, role: a.role, speakers, prestataires, editionId: e.id, annee: e.annee };
}

type Ctx = Awaited<ReturnType<typeof contexte>>;

export type DocumentAvecVersions = typeof schema.document.$inferSelect & { versions: (typeof schema.version.$inferSelect)[] };

export async function documents(ctx: Ctx, f: { rattachement: Rattachement; speakerId?: string; prestataireId?: string }): Promise<DocumentAvecVersions[]> {
  const b = await base();
  const conditions = [eq(schema.document.editionId, ctx.editionId), eq(schema.document.rattachement, f.rattachement), isNull(schema.document.supprimeLe)];
  if (f.speakerId) conditions.push(eq(schema.document.speakerId, f.speakerId));
  if (f.prestataireId) conditions.push(eq(schema.document.prestataireId, f.prestataireId));
  const docs = (await b.select().from(schema.document).where(and(...conditions)).orderBy(asc(schema.document.categorie), desc(schema.document.modifieLe)))
    .filter((d) => peutLire(ctx, d));
  if (!docs.length) return [];
  const versions = await b.select().from(schema.version).where(inArray(schema.version.documentId, docs.map((d) => d.id))).orderBy(desc(schema.version.numero));
  return docs.map((d) => ({ ...d, versions: versions.filter((v) => v.documentId === d.id) }));
}

export async function documentLisible(ctx: Ctx, id: string) {
  const b = await base();
  const [d] = await b.select().from(schema.document).where(and(eq(schema.document.id, id), isNull(schema.document.supprimeLe)));
  if (!d || d.editionId !== ctx.editionId || !peutLire(ctx, d)) return null;
  const versions = await b.select().from(schema.version).where(eq(schema.version.documentId, d.id)).orderBy(desc(schema.version.numero));
  return { ...d, versions };
}

async function speakerDeLEdition(ctx: Ctx, speakerId: string | null | undefined) {
  if (!speakerId) return false;
  const b = await base();
  const [s] = await b.select({ id: schema.speaker.id }).from(schema.speaker)
    .where(and(eq(schema.speaker.id, speakerId), eq(schema.speaker.editionId, ctx.editionId), isNull(schema.speaker.supprimeLe)));
  return !!s;
}

async function prestataireDeLEdition(ctx: Ctx, prestataireId: string | null | undefined) {
  if (!prestataireId) return false;
  const b = await base();
  const [p] = await b.select({ id: schema.prestataire.id }).from(schema.prestataire)
    .where(and(eq(schema.prestataire.id, prestataireId), eq(schema.prestataire.editionId, ctx.editionId), isNull(schema.prestataire.supprimeLe)));
  return !!p;
}

export type DemandeDepot = {
  rattachement: Rattachement;
  speakerId?: string | null;
  prestataireId?: string | null;
  categorie: string;
  titre?: string;
  documentId?: string | null;
  nom: string;
  taille: number;
};

export async function preparerDepot(ctx: Ctx, d: DemandeDepot) {
  const cat = categorie(d.categorie);
  if (!cat) throw new RefusDocument('Catégorie inconnue.');
  const b = await base();
  let cible: Cible & { speakerId: string | null; prestataireId: string | null };
  let titre = (d.titre ?? '').trim().slice(0, 200) || cat.libelle;
  if (d.documentId) {
    const doc = await documentLisible(ctx, d.documentId);
    if (!doc || doc.categorie !== cat.slug || doc.lienExterne) throw new RefusDocument(NON_AUTORISE);
    cible = { rattachement: doc.rattachement, speakerId: doc.speakerId, prestataireId: doc.prestataireId, sens: doc.sens };
    titre = doc.titre;
  } else if (d.rattachement === 'prestataire') {
    cible = { rattachement: 'prestataire', speakerId: null, prestataireId: d.prestataireId ?? null, sens: cat.sens };
  } else {
    cible = { rattachement: d.rattachement, speakerId: d.speakerId ?? null, prestataireId: null, sens: cat.sens };
  }
  // Un modèle à signer ne se dépose que pour tous les speakers ; tout le
  // reste ne se range que dans un dossier. Les catégories des prestataires
  // ne vont que dans un dossier prestataire, et réciproquement.
  const coherent =
    (cible.rattachement === 'speaker' && !cat.estModele && !pourPrestataire(cat.sens) && (await speakerDeLEdition(ctx, cible.speakerId))) ||
    (cible.rattachement === 'tous_speakers' && cat.sens === 'vers_speaker' && cible.speakerId === null) ||
    (cible.rattachement === 'prestataire' && pourPrestataire(cat.sens) && cible.speakerId === null && (await prestataireDeLEdition(ctx, cible.prestataireId)));
  if (!coherent || !peutDeposer(ctx, cible)) throw new RefusDocument(NON_AUTORISE);
  const ext = extensionDe(d.nom);
  if (!ext || !cat.formats.includes(ext)) throw new RefusDocument(`Format non accepté pour « ${cat.libelle} ». Formats possibles : ${[...new Set(cat.formats)].join(', ')}.`);
  if (!(d.taille > 0) || d.taille > cat.maxMo * MO) throw new RefusDocument(`Fichier trop lourd : ${cat.maxMo} Mo au plus pour « ${cat.libelle} ».`);
  const id = randomUUID();
  const cle = `${ctx.annee}/${randomUUID()}`;
  const typeMime = FORMATS[ext];
  await b.insert(schema.envoi).values({
    id,
    userId: ctx.id,
    documentId: d.documentId ?? null,
    editionId: ctx.editionId,
    rattachement: cible.rattachement,
    speakerId: cible.speakerId,
    prestataireId: cible.prestataireId,
    categorie: cat.slug,
    sens: cat.sens,
    titre,
    cle,
    nomOrigine: d.nom.slice(0, 200),
    typeMime,
    tailleMax: cat.maxMo * MO,
    expireLe: new Date(Date.now() + 30 * 60 * 1000),
  });
  const s = await stockage();
  return { envoiId: id, formulaire: await s.formulaireEnvoi(cle, typeMime, cat.maxMo * MO, 15 * 60) };
}

export async function confirmerDepot(ctx: Ctx, envoiId: string, attestation: boolean) {
  const b = await base();
  const [e] = await b.select().from(schema.envoi).where(and(eq(schema.envoi.id, envoiId), eq(schema.envoi.userId, ctx.id)));
  if (!e || e.expireLe < new Date()) throw new RefusDocument('Envoi introuvable ou expiré : recommencez.');
  const cat = categorie(e.categorie)!;
  const cible = { rattachement: e.rattachement, speakerId: e.speakerId, prestataireId: e.prestataireId, sens: e.sens };
  if (!peutDeposer(ctx, cible)) throw new RefusDocument(NON_AUTORISE);
  if (cat.attestation && !attestation) throw new RefusDocument('Cochez l’attestation sur les droits des images, musiques et vidéos.');
  const s = await stockage();
  const infos = await s.infos(e.cle);
  if (!infos) throw new RefusDocument('Le fichier n’est pas arrivé : recommencez l’envoi.');
  const ext = extensionDe(e.nomOrigine)!;
  const rejeter = async (message: string): Promise<never> => {
    await s.supprimer(e.cle);
    await b.delete(schema.envoi).where(eq(schema.envoi.id, e.id));
    throw new RefusDocument(message);
  };
  if (infos.taille > e.tailleMax || !signatureValide(ext, await s.debut(e.cle, 4100))) {
    await rejeter('Le contenu du fichier ne correspond pas à son format.');
  }
  // Les documents à signer et leurs modèles : on calcule l'empreinte du
  // fichier entier (10 Mo au plus), et un fichier identique au modèle vierge
  // est refusé. C'est l'erreur la plus courante : renvoyer le fichier
  // téléchargé, sans l'avoir signé.
  let empreinteFichier: string | null = null;
  if (cat.modele || cat.estModele) {
    empreinteFichier = createHash('sha256').update(await s.lire(e.cle)).digest('hex');
    if (cat.modele && (await empreintesDuModele(e.editionId, cat.modele)).includes(empreinteFichier)) {
      await noter('document.modele_refuse', { acteurId: ctx.id, cibleType: 'speaker', cibleId: e.speakerId ?? undefined, editionId: e.editionId, details: { categorie: cat.slug } });
      await rejeter('Ce fichier est le modèle vierge, sans signature. Signez-le, puis déposez la version signée.');
    }
  }
  const versionId = randomUUID();
  let documentId = e.documentId;
  await b.transaction(async (tx) => {
    if (!documentId && cat.unique) {
      const [existant] = await tx.select({ id: schema.document.id }).from(schema.document)
        .where(and(
          eq(schema.document.editionId, e.editionId),
          eq(schema.document.rattachement, e.rattachement),
          e.speakerId ? eq(schema.document.speakerId, e.speakerId) : isNull(schema.document.speakerId),
          e.prestataireId ? eq(schema.document.prestataireId, e.prestataireId) : isNull(schema.document.prestataireId),
          eq(schema.document.categorie, cat.slug),
          isNull(schema.document.supprimeLe),
        ));
      documentId = existant?.id ?? null;
    }
    if (!documentId) {
      documentId = randomUUID();
      await tx.insert(schema.document).values({
        id: documentId, editionId: e.editionId, rattachement: e.rattachement, speakerId: e.speakerId, prestataireId: e.prestataireId,
        categorie: cat.slug, sens: e.sens, titre: e.titre, creeParId: ctx.id,
      });
    }
    const [m] = await tx.select({ n: max(schema.version.numero) }).from(schema.version).where(eq(schema.version.documentId, documentId));
    await tx.insert(schema.version).values({
      id: versionId, documentId, numero: (m?.n ?? 0) + 1, cleStockage: e.cle, nomOrigine: e.nomOrigine, typeMime: e.typeMime,
      taille: infos.taille, deposeParId: ctx.id, droitsAttestesLe: cat.attestation ? new Date() : null, empreinte: empreinteFichier,
    });
    await tx.update(schema.document).set({ modifieLe: new Date() }).where(eq(schema.document.id, documentId));
    await tx.delete(schema.envoi).where(eq(schema.envoi.id, e.id));
  });
  await noter('document.depose', { acteurId: ctx.id, cibleType: 'document', cibleId: documentId!, editionId: e.editionId, details: { categorie: cat.slug, version: versionId } });
  await apresDepot(ctx.id, documentId!);
  return { documentId: documentId!, versionId };
}

// Les empreintes de toutes les versions du modèle vierge, pour l'édition :
// un speaker peut avoir téléchargé une version antérieure.
export async function empreintesDuModele(editionId: string, slugModele: string): Promise<string[]> {
  const b = await base();
  const r = await b.select({ e: schema.version.empreinte }).from(schema.version)
    .innerJoin(schema.document, eq(schema.document.id, schema.version.documentId))
    .where(and(eq(schema.document.editionId, editionId), eq(schema.document.categorie, slugModele), eq(schema.document.rattachement, 'tous_speakers'), isNull(schema.document.supprimeLe)));
  return r.map((x) => x.e).filter((x): x is string => !!x);
}

// Le lien du talk sur la chaîne TEDx, posé par l'équipe après l'événement.
// Vide pour le retirer.
export async function enregistrerLienVideo(ctx: Ctx, speakerId: string, url: string) {
  if (!peutValiderJalon(ctx) || !(await speakerDeLEdition(ctx, speakerId))) throw new RefusDocument(NON_AUTORISE);
  const lien = url.trim();
  if (lien && !lienValide(lien)) throw new RefusDocument('Le lien doit commencer par https://.');
  const b = await base();
  await b.update(schema.speaker).set({ lienVideo: lien || null, updatedAt: new Date() }).where(eq(schema.speaker.id, speakerId));
  await noter('speaker.modifie', { acteurId: ctx.id, cibleType: 'speaker', cibleId: speakerId, editionId: ctx.editionId, details: { lienVideo: !!lien } });
}

// Renvoie une URL signée de soixante secondes, ou null : même réponse pour
// un identifiant inconnu, supprimé ou interdit.
export async function lienTelechargement(ctx: Ctx, versionId: string): Promise<string | null> {
  const b = await base();
  const [r] = await b.select({ v: schema.version, d: schema.document }).from(schema.version)
    .innerJoin(schema.document, eq(schema.document.id, schema.version.documentId))
    .where(eq(schema.version.id, versionId));
  if (!r || r.d.supprimeLe || r.d.editionId !== ctx.editionId || !peutLire(ctx, r.d as RefDocument)) return null;
  await noter('document.lu', { acteurId: ctx.id, cibleType: 'version', cibleId: versionId, editionId: r.d.editionId });
  const s = await stockage();
  return s.urlLecture(r.v.cleStockage, r.v.nomOrigine, r.v.typeMime, 60);
}

export async function supprimerDocument(ctx: Ctx, documentId: string) {
  const doc = await documentLisible(ctx, documentId);
  if (!doc || !peutSupprimer(ctx, doc)) throw new RefusDocument(NON_AUTORISE);
  const b = await base();
  await b.update(schema.document).set({ supprimeLe: new Date(), supprimeParId: ctx.id }).where(eq(schema.document.id, documentId));
  await noter('document.supprime', { acteurId: ctx.id, cibleType: 'document', cibleId: documentId, editionId: doc.editionId });
  return doc;
}

export type Fiche = {
  prenom: string;
  nom: string;
  emailContact: string;
  telephone: string;
  titreProvisoire: string;
  resume: string;
  biographie: string;
  // Réservé à l'équipe : le nom tel qu'il apparaît dans les listes, posé à
  // l'invitation. Sans lui, prénom et nom le remplacent.
  nomAffiche?: string;
};

export async function modifierFiche(ctx: Ctx, speakerId: string, f: Fiche) {
  if (!peutModifierFicheSpeaker(ctx, speakerId) || !(await speakerDeLEdition(ctx, speakerId))) throw new RefusDocument(NON_AUTORISE);
  const emailContact = normaliserEmail(f.emailContact);
  if (emailContact && !emailValide(emailContact)) throw new RefusDocument('L’adresse e-mail de contact est invalide.');
  if (!telephoneValide(f.telephone)) throw new RefusDocument('Le numéro de téléphone est invalide.');
  const prenom = f.prenom.trim().slice(0, 80), nom = f.nom.trim().slice(0, 80);
  const b = await base();
  const [actuel] = await b.select({ nomAffiche: schema.speaker.nomAffiche }).from(schema.speaker).where(eq(schema.speaker.id, speakerId));
  const choisi = ctx.role === 'membre' ? (f.nomAffiche ?? '').trim().slice(0, 120) : '';
  await b.update(schema.speaker).set({
    nomAffiche: choisi || `${prenom} ${nom}`.trim() || actuel?.nomAffiche || 'Sans nom',
    prenom,
    nom,
    emailContact,
    telephone: f.telephone.trim().slice(0, 40),
    titreProvisoire: f.titreProvisoire.trim().slice(0, 200),
    resume: f.resume.trim().slice(0, 3000),
    biographie: f.biographie.trim().slice(0, 5000),
    updatedAt: new Date(),
  }).where(eq(schema.speaker.id, speakerId));
  await noter('speaker.modifie', { acteurId: ctx.id, cibleType: 'speaker', cibleId: speakerId, editionId: ctx.editionId });
  await apresFiche(speakerId);
}
