import { eq } from 'drizzle-orm';
import { readdir, readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { connecter, creerCompte, preparer } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { RefusCompte } from '../../lib/comptes';
import { base, fixerBase, schema, type Base } from '../../lib/db';
import { confirmerDepot, contexte, lienTelechargement, preparerDepot } from '../../lib/documents';
import { exporter, supprimerCompte, supprimerSpeaker } from '../../lib/rgpd';
import { stockage } from '../../lib/storage';
import { depaqueter, empaqueter, exporterBase, restaurerBase, tachesQuotidiennes } from '../../lib/taches';

const PDF = new TextEncoder().encode('%PDF-1.7\n% fictif\n');
let editionId = '';

async function compte(email: string, role: 'speaker' | 'membre') {
  await creerCompte(editionId, email, role);
  await connecter(email);
  return (await acteurCourant())!;
}

async function deposer(categorie: string) {
  const ctx = await contexte((await acteurCourant())!);
  const { envoiId } = await preparerDepot(ctx, { rattachement: 'speaker', speakerId: ctx.speakers[0]!, categorie, nom: `${categorie}.pdf`, taille: PDF.length });
  const b = await base();
  const [e] = await b.select().from(schema.envoi).where(eq(schema.envoi.id, envoiId));
  await (await stockage()).ecrire(e!.cle, PDF, 'application/pdf');
  return confirmerDepot(ctx, envoiId, true);
}

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'membre' });
  await b.insert(schema.user).values({ id: 'membre-2', email: 'membre2@exemple.invalid', name: 'Membre 2', emailVerified: true, role: 'membre' });
});

describe('export et suppression', () => {
  it('exporte ses données, puis la suppression archive les documents signés et efface le reste', async () => {
    const sp = await compte('speaker-rgpd@exemple.com', 'speaker');
    const release = await deposer('release');
    const droit = await deposer('droit_image');
    const script = await deposer('script');
    const exp = await exporter(sp.id);
    expect(exp.compte.email).toBe('speaker-rgpd@exemple.com');
    expect(exp.documents.map((d) => d.categorie).sort()).toEqual(['droit_image', 'release', 'script']);

    await supprimerCompte(sp.id, 'systeme');
    const b = await base();
    expect(await b.select().from(schema.user).where(eq(schema.user.id, sp.id))).toHaveLength(0);
    for (const signe of [release, droit]) {
      const [r] = await b.select().from(schema.document).where(eq(schema.document.id, signe.documentId));
      expect(r?.archive).toBe(true);
    }
    expect(await b.select().from(schema.document).where(eq(schema.document.id, script.documentId))).toHaveLength(0);
    expect(await (await stockage()).infos((await b.select().from(schema.version).where(eq(schema.version.id, release.versionId)))[0]!.cleStockage)).toBeTruthy();
    expect(await b.select().from(schema.invitation).where(eq(schema.invitation.email, 'speaker-rgpd@exemple.com'))).toHaveLength(0);
  });

  it('l’archive est lisible par un membre, jamais par un speaker', async () => {
    const b = await base();
    const [r] = await b.select().from(schema.version).innerJoin(schema.document, eq(schema.document.id, schema.version.documentId)).where(eq(schema.document.archive, true));
    const speaker = await compte('autre-speaker@exemple.com', 'speaker');
    expect(await lienTelechargement(await contexte(speaker), r!.version.id)).toBeNull();
    const membre = await compte('membre-rgpd@utt.fr', 'membre');
    expect(await lienTelechargement(await contexte(membre), r!.version.id)).toBeTruthy();
  });

  it('supprimer un speaker efface son compte et son dossier, le retire des listes, archive ses documents signés', async () => {
    await compte('speaker-retire@exemple.com', 'speaker');
    const ctx = await contexte((await acteurCourant())!);
    const speakerId = ctx.speakers[0]!;
    const release = await deposer('release');
    const photo = await deposer('script');
    await supprimerSpeaker(speakerId, editionId, 'systeme');
    const b = await base();
    const [s] = await b.select().from(schema.speaker).where(eq(schema.speaker.id, speakerId));
    expect(s?.supprimeLe).toBeTruthy();
    expect(s?.biographie).toBe('');
    expect(s?.userId).toBeNull();
    expect(await b.select().from(schema.user).where(eq(schema.user.email, 'speaker-retire@exemple.com'))).toHaveLength(0);
    expect((await b.select().from(schema.document).where(eq(schema.document.id, release.documentId)))[0]?.archive).toBe(true);
    expect(await b.select().from(schema.document).where(eq(schema.document.id, photo.documentId))).toHaveLength(0);
    await expect(supprimerSpeaker(speakerId, editionId, 'systeme')).rejects.toThrow(RefusCompte);
  });

  it('le dernier membre ne peut pas supprimer son compte sans passer le relais', async () => {
    const b = await base();
    const membres = (await b.select().from(schema.user).where(eq(schema.user.role, 'membre'))).filter((u) => !u.desactiveLe);
    for (const u of membres.slice(2)) await supprimerCompte(u.id, 'systeme');
    const [dernier] = (await b.select().from(schema.user).where(eq(schema.user.role, 'membre'))).filter((u) => !u.desactiveLe);
    await expect(supprimerCompte(dernier!.id, dernier!.id)).rejects.toThrow(RefusCompte);
  });
});

describe('tâche quotidienne et sauvegarde', () => {
  it('purge les envois expirés et sauvegarde la base', async () => {
    const r = await tachesQuotidiennes();
    expect(String(r.sauvegarde)).toMatch(/^sauvegardes\/\d{4}-\d{2}-\d{2}\.json\.gz$/);
  });

  it('purge les membres inactifs depuis douze mois, sans descendre sous deux membres', async () => {
    const b = await base();
    const vieux = new Date(Date.now() - 400 * 24 * 3600 * 1000);
    await b.insert(schema.user).values({ id: 'inactif', email: 'inactif@utt.fr', name: 'Inactif', emailVerified: true, role: 'membre', derniereConnexion: vieux, createdAt: vieux });
    await tachesQuotidiennes();
    expect(await b.select().from(schema.user).where(eq(schema.user.id, 'inactif'))).toHaveLength(0);
    expect((await b.select().from(schema.user).where(eq(schema.user.role, 'membre'))).filter((u) => !u.desactiveLe).length).toBeGreaterThanOrEqual(2);
  });

  it('une sauvegarde se restaure dans une base neuve, à l’identique', async () => {
    const avant = await exporterBase();
    const paquet = empaqueter(avant);
    const origine = await base();
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const neuve = drizzle({ client: new PGlite(), schema, casing: 'snake_case' });
    fixerBase(neuve as unknown as Base);
    // Même chemin que scripts/restaurer.ts : migrations sans amorçage. Un
    // amorçage avant la restauration poserait une édition et des jalons neufs
    // à côté de ceux de la sauvegarde.
    const { migrer } = await import('../../scripts/migrer');
    await migrer({ amorcer: false });
    await restaurerBase(depaqueter(paquet));
    const apres = await exporterBase();
    fixerBase(origine);
    for (const t of Object.keys(avant)) expect(apres[t]!.length, t).toBe(avant[t]!.length);
    expect(JSON.stringify(apres.user)).toBe(JSON.stringify(avant.user));
  });

  it('une sauvegarde d’avant le 2026-10-11 se restaure : admins devenus membres, documents de pôle écartés', async () => {
    const origine = await base();
    const donnees = await exporterBase();
    const [e] = donnees.edition as { id: string }[];
    const vieux = {
      ...donnees,
      user: [{ id: 'vieil-admin', email: 'vieil-admin@utt.fr', name: 'Vieil Admin', emailVerified: true, image: null, role: 'admin', desactiveLe: null, derniereConnexion: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }],
      document: [{ id: 'doc-pole', editionId: e!.id, rattachement: 'pole', speakerId: null, poleId: 'p', categorie: 'document', sens: 'interne', titre: 'Note de pôle', lienExterne: null, archive: false, creeParId: null, createdAt: new Date().toISOString(), modifieLe: new Date().toISOString(), supprimeLe: null, supprimeParId: null }],
      version: [{ id: 'v-pole', documentId: 'doc-pole', numero: 1, cleStockage: 'x/pole', nomOrigine: 'n.pdf', typeMime: 'application/pdf', taille: 1, deposeParId: null, deposeLe: new Date().toISOString(), droitsAttestesLe: null }],
      speaker: [], invitation: [], preference: [], commentaire: [], jalon: [], jalonSpeaker: [], journal: [],
    } as Record<string, Record<string, unknown>[]>;
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    fixerBase(drizzle({ client: new PGlite(), schema, casing: 'snake_case' }) as unknown as Base);
    const { migrer } = await import('../../scripts/migrer');
    await migrer({ amorcer: false });
    await restaurerBase(vieux);
    const b = await base();
    const [u] = await b.select().from(schema.user).where(eq(schema.user.id, 'vieil-admin'));
    const docs = await b.select().from(schema.document);
    fixerBase(origine);
    expect(u?.role).toBe('membre');
    expect(docs).toHaveLength(0);
  });
});

// La migration du 2026-10-11 reprend les données de production : on rejoue
// les quatre premières migrations, on pose des données d'avant, puis la
// cinquième.
describe('migration de l’espace recentré sur les speakers', () => {
  it('les admins deviennent membres, les documents de pôle disparaissent, les catégories retirées sont supprimées', async () => {
    const { PGlite } = await import('@electric-sql/pglite');
    const db = new PGlite();
    const fichiers = (await readdir('drizzle')).filter((f) => f.endsWith('.sql')).sort();
    const jouer = async (f: string) => {
      for (const instr of (await readFile(`drizzle/${f}`, 'utf8')).split('--> statement-breakpoint')) if (instr.trim()) await db.exec(instr);
    };
    for (const f of fichiers.slice(0, 4)) await jouer(f);
    await db.exec(`
      INSERT INTO edition (id, annee, libelle, courante) VALUES ('e', 2027, 'TEDxUTTroyes 2027', true);
      INSERT INTO pole (id, slug, nom) VALUES ('p', 'logistique', 'Logistique');
      INSERT INTO "user" (id, name, email, role) VALUES ('a', 'Admin Fictif', 'admin@utt.fr', 'admin'), ('m', 'Membre Fictif', 'membre@utt.fr', 'membre');
      INSERT INTO membre_pole (user_id, pole_id, edition_id) VALUES ('m', 'p', 'e');
      INSERT INTO invitation (id, email, role, edition_id, jeton_empreinte, expire_le) VALUES ('i', 'futur@utt.fr', 'admin', 'e', 'j', now());
      INSERT INTO speaker (id, edition_id, nom_affiche) VALUES ('s', 'e', 'Speaker Fictif');
      INSERT INTO document (id, edition_id, rattachement, pole_id, categorie, sens, titre) VALUES ('dp', 'e', 'pole', 'p', 'document', 'interne', 'Note');
      INSERT INTO document (id, edition_id, rattachement, categorie, sens, titre) VALUES ('dc', 'e', 'commun', 'document', 'interne', 'Commun');
      INSERT INTO version (id, document_id, numero, cle_stockage, nom_origine, type_mime, taille) VALUES ('vp', 'dp', 1, 'k1', 'n.pdf', 'application/pdf', 1);
      INSERT INTO document (id, edition_id, rattachement, speaker_id, categorie, sens, titre) VALUES ('dft', 'e', 'speaker', 's', 'fiche_technique', 'du_speaker', 'FT'), ('dpo', 'e', 'speaker', 's', 'portrait', 'du_speaker', 'Portrait'), ('dsl', 'e', 'speaker', 's', 'slides', 'du_speaker', 'Slides');
      INSERT INTO jalon (id, edition_id, libelle, echeance, categorie) VALUES ('jr', 'e', 'Répétition filmée', now(), 'video_repetition');
    `);
    await jouer(fichiers[4]!);
    const lignes = async (sql: string) => (await db.query<Record<string, unknown>>(sql)).rows;
    expect(await lignes(`SELECT id, role FROM "user" ORDER BY id`)).toEqual([{ id: 'a', role: 'membre' }, { id: 'm', role: 'membre' }]);
    expect(await lignes(`SELECT role FROM invitation`)).toEqual([{ role: 'membre' }]);
    expect(await lignes(`SELECT id FROM document WHERE id IN ('dp', 'dc')`)).toEqual([]);
    expect(await lignes(`SELECT id FROM version`)).toEqual([]);
    const [ft] = await lignes(`SELECT supprime_le FROM document WHERE id = 'dft'`);
    expect(ft!.supprime_le).toBeTruthy();
    expect(await lignes(`SELECT categorie FROM document WHERE id = 'dpo'`)).toEqual([{ categorie: 'photo_hd' }]);
    expect(await lignes(`SELECT categorie, supprime_le FROM document WHERE id = 'dsl'`)).toEqual([{ categorie: 'slides', supprime_le: null }]);
    expect(await lignes(`SELECT categorie FROM jalon`)).toEqual([{ categorie: null }]);
    expect(await lignes(`SELECT to_regclass('pole') AS t`)).toEqual([{ t: null }]);
    await db.close();
  });
});
