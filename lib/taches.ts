import { and, eq, inArray, isNull, lt, sql } from 'drizzle-orm';
import { getTableColumns, getTableName } from 'drizzle-orm';
import { gunzipSync, gzipSync } from 'node:zlib';
import { base, schema } from './db';
import { RefusCompte } from './comptes';
import { noter } from './journal';
import { supprimerCompte, supprimerPrestataire } from './rgpd';
import { stockage, type Stockage } from './storage';

// La tâche quotidienne : purges selon les durées de conservation, puis
// sauvegarde de la base. Une seule tâche, une fois par jour : c'est ce que
// permet l'offre Hobby de Vercel, et n'importe quel planificateur peut
// l'appeler ailleurs.

const JOUR = 24 * 3600 * 1000;
const MOIS = 30 * JOUR;

// Tables sauvegardées, dans l'ordre où elles se restaurent. Les sessions,
// codes, compteurs de débit et envois en cours sont éphémères : ils ne sont
// pas sauvegardés.
export const TABLES_SAUVEGARDEES = [
  schema.edition, schema.user, schema.speaker, schema.prestataire, schema.prestataireCompte, schema.invitation, schema.preference, schema.document, schema.version, schema.commentaire, schema.jalon, schema.jalonSpeaker, schema.journal,
] as const;

export async function stockageSauvegardes(): Promise<{ s: Stockage; prefixe: string }> {
  if ((process.env.STORAGE_DRIVER ?? 's3') === 'local') return { s: await stockage(), prefixe: 'sauvegardes/' };
  const { StockageS3 } = await import('./storage/s3');
  return { s: new StockageS3(process.env.S3_BUCKET_SAUVEGARDES), prefixe: 'base/' };
}

export async function exporterBase(): Promise<Record<string, unknown[]>> {
  const b = await base();
  const sortie: Record<string, unknown[]> = {};
  for (const t of TABLES_SAUVEGARDEES) sortie[getTableName(t)] = await b.select().from(t as never);
  return sortie;
}

// Une sauvegarde d'avant le 2026-10-11 porte encore des admins, des pôles et
// des documents d'équipe : les admins redeviennent membres, les documents de
// pôle et de l'espace commun ne sont pas restaurés (les tables qui les
// portaient n'existent plus).
function compatible(table: string, l: Record<string, unknown>): boolean {
  if ((table === 'user' || table === 'invitation') && l.role === 'admin') l.role = 'membre';
  if (table === 'document' && (l.rattachement === 'pole' || l.rattachement === 'commun')) return false;
  return true;
}

export async function restaurerBase(donnees: Record<string, Record<string, unknown>[]>) {
  const b = await base();
  const ecartes = new Set<unknown>();
  for (const t of TABLES_SAUVEGARDEES) {
    const nom = getTableName(t);
    const toutes = donnees[nom] ?? [];
    for (const l of toutes) if (!compatible(nom, l)) ecartes.add(l.id);
    const lignes = toutes.filter((l) => !ecartes.has(l.id) && !(nom === 'version' || nom === 'commentaire' ? ecartes.has(l.documentId) : false));
    const colonnes = getTableColumns(t);
    const dates = Object.entries(colonnes).filter(([, c]) => c.columnType === 'PgTimestamp').map(([k]) => k);
    for (let i = 0; i < lignes.length; i += 200) {
      const lot = lignes.slice(i, i + 200).map((l) => {
        const x = { ...l };
        for (const k of dates) if (x[k]) x[k] = new Date(x[k] as string);
        return x;
      });
      if (lot.length) await b.insert(t as never).values(lot as never).onConflictDoNothing();
    }
  }
}

export function empaqueter(donnees: Record<string, unknown[]>): Uint8Array {
  return gzipSync(JSON.stringify({ format: 1, le: new Date().toISOString(), tables: donnees }));
}

export function depaqueter(octets: Uint8Array): Record<string, Record<string, unknown>[]> {
  return JSON.parse(gunzipSync(octets).toString('utf8')).tables;
}

async function effacerDocuments(ids: string[]) {
  if (!ids.length) return 0;
  const b = await base();
  const s = await stockage();
  for (const v of await b.select({ cle: schema.version.cleStockage }).from(schema.version).where(inArray(schema.version.documentId, ids))) await s.supprimer(v.cle);
  await b.delete(schema.document).where(inArray(schema.document.id, ids));
  return ids.length;
}

export async function tachesQuotidiennes(maintenant = new Date()) {
  const b = await base();
  const s = await stockage();
  const rapport: Record<string, number | string> = {};

  // 1. Envois jamais confirmés, données éphémères expirées.
  const envois = await b.select().from(schema.envoi).where(lt(schema.envoi.expireLe, maintenant));
  for (const e of envois) await s.supprimer(e.cle);
  if (envois.length) await b.delete(schema.envoi).where(inArray(schema.envoi.id, envois.map((e) => e.id)));
  rapport.envois = envois.length;
  await b.delete(schema.session).where(lt(schema.session.expiresAt, maintenant));
  await b.delete(schema.verification).where(lt(schema.verification.expiresAt, maintenant));
  await b.delete(schema.limite).where(lt(schema.limite.fenetreDebut, new Date(maintenant.getTime() - JOUR)));
  await b.delete(schema.rateLimit).where(lt(schema.rateLimit.lastRequest, maintenant.getTime() - JOUR));

  // 2. Journal : douze mois.
  const j = await b.delete(schema.journal).where(lt(schema.journal.le, new Date(maintenant.getTime() - 12 * MOIS - 5 * JOUR))).returning({ id: schema.journal.id });
  rapport.journal = j.length;

  // 3. Justificatifs de transport : trois mois après l'édition. Comptes
  //    speakers et dossiers prestataires (comptes compris, pièces
  //    comptables archivées) : douze mois après l'édition.
  const editions = await b.select().from(schema.edition);
  let transport = 0, speakers = 0, prestataires = 0;
  for (const e of editions) {
    if (!e.dateEvenement) continue;
    const age = maintenant.getTime() - e.dateEvenement.getTime();
    if (age > 3 * MOIS) {
      const docs = await b.select({ id: schema.document.id }).from(schema.document)
        .where(and(eq(schema.document.editionId, e.id), eq(schema.document.categorie, 'transport')));
      transport += await effacerDocuments(docs.map((d) => d.id));
    }
    if (age > 12 * MOIS) {
      const r = await b.select({ userId: schema.speaker.userId }).from(schema.speaker).where(eq(schema.speaker.editionId, e.id));
      for (const { userId } of r) if (userId) { await supprimerCompte(userId, null); speakers++; }
      const p = await b.select({ id: schema.prestataire.id }).from(schema.prestataire)
        .where(and(eq(schema.prestataire.editionId, e.id), isNull(schema.prestataire.supprimeLe)));
      for (const { id } of p) { await supprimerPrestataire(id, e.id, null); prestataires++; }
    }
  }
  rapport.transport = transport;
  rapport.speakers = speakers;
  rapport.prestataires = prestataires;

  // 4. Membres : douze mois après leur dernière connexion.
  const inactifs = await b.select({ id: schema.user.id }).from(schema.user)
    .where(and(sql`${schema.user.role} <> 'speaker'`, lt(sql`coalesce(${schema.user.derniereConnexion}, ${schema.user.createdAt})`, new Date(maintenant.getTime() - 12 * MOIS))));
  let membres = 0;
  for (const { id } of inactifs) {
    try {
      await supprimerCompte(id, null);
      membres++;
    } catch (e) {
      if (!(e instanceof RefusCompte)) throw e;
    }
  }
  rapport.membres = membres;
  await noter('purge', { details: rapport });

  // 5. Sauvegarde du jour, et effacement de celles de plus de trente jours.
  const { s: seau, prefixe } = await stockageSauvegardes();
  const cle = `${prefixe}${maintenant.toISOString().slice(0, 10)}.json.gz`;
  await seau.ecrire(cle, empaqueter(await exporterBase()), 'application/gzip');
  let anciennes = 0;
  for (const o of await seau.lister(prefixe)) {
    if (maintenant.getTime() - o.date.getTime() > 30 * JOUR) { await seau.supprimer(o.cle); anciennes++; }
  }
  rapport.sauvegarde = cle;
  rapport.sauvegardesEffacees = anciennes;
  await noter('sauvegarde', { details: { cle } });
  return rapport;
}
