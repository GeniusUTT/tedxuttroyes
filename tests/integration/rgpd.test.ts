import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { dernierCode, lienInvitation, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { demanderCode, seConnecter } from '../../lib/connexion';
import { base, fixerBase, schema, type Base } from '../../lib/db';
import { confirmerDepot, contexte, lienTelechargement, preparerDepot } from '../../lib/documents';
import { accepter, inviter } from '../../lib/invitations';
import { exporter, supprimerCompte } from '../../lib/rgpd';
import { stockage } from '../../lib/storage';
import { depaqueter, empaqueter, exporterBase, restaurerBase, tachesQuotidiennes } from '../../lib/taches';

const PDF = new TextEncoder().encode('%PDF-1.7\n% fictif\n');
let editionId = '';

async function compte(email: string, role: 'speaker' | 'membre' | 'admin') {
  await inviter({ email, role, editionId, poles: [], nomAffiche: 'Personne Fictive', derogation: false, parId: 'systeme' });
  await accepter(await lienInvitation(email));
  requete.cookies = new Map();
  await demanderCode(email);
  await seConnecter(email, await dernierCode(email));
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
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'admin' });
  await b.insert(schema.user).values({ id: 'admin-2', email: 'admin2@exemple.invalid', name: 'Admin 2', emailVerified: true, role: 'admin' });
});

describe('export et suppression', () => {
  it('exporte ses données, puis la suppression archive la Release et efface le reste', async () => {
    const sp = await compte('speaker-rgpd@exemple.com', 'speaker');
    const release = await deposer('release');
    const script = await deposer('script');
    const exp = await exporter(sp.id);
    expect(exp.compte.email).toBe('speaker-rgpd@exemple.com');
    expect(exp.documents.map((d) => d.categorie).sort()).toEqual(['release', 'script']);

    await supprimerCompte(sp.id, 'systeme');
    const b = await base();
    expect(await b.select().from(schema.user).where(eq(schema.user.id, sp.id))).toHaveLength(0);
    const [r] = await b.select().from(schema.document).where(eq(schema.document.id, release.documentId));
    expect(r?.archive).toBe(true);
    expect(await b.select().from(schema.document).where(eq(schema.document.id, script.documentId))).toHaveLength(0);
    expect(await (await stockage()).infos((await b.select().from(schema.version).where(eq(schema.version.id, release.versionId)))[0]!.cleStockage)).toBeTruthy();
    expect(await b.select().from(schema.invitation).where(eq(schema.invitation.email, 'speaker-rgpd@exemple.com'))).toHaveLength(0);
  });

  it('l’archive n’est lisible que par un admin', async () => {
    const b = await base();
    const [r] = await b.select().from(schema.version).innerJoin(schema.document, eq(schema.document.id, schema.version.documentId)).where(eq(schema.document.archive, true));
    const membre = await compte('membre-rgpd@utt.fr', 'membre');
    expect(await lienTelechargement(await contexte(membre), r!.version.id)).toBeNull();
    const admin = await compte('admin-rgpd@utt.fr', 'admin');
    expect(await lienTelechargement(await contexte(admin), r!.version.id)).toBeTruthy();
  });
});

describe('tâche quotidienne et sauvegarde', () => {
  it('purge les envois expirés et sauvegarde la base', async () => {
    const r = await tachesQuotidiennes();
    expect(String(r.sauvegarde)).toMatch(/^sauvegardes\/\d{4}-\d{2}-\d{2}\.json\.gz$/);
  });

  it('purge les membres inactifs depuis douze mois, sans descendre sous deux admins', async () => {
    const b = await base();
    const vieux = new Date(Date.now() - 400 * 24 * 3600 * 1000);
    await b.insert(schema.user).values({ id: 'inactif', email: 'inactif@utt.fr', name: 'Inactif', emailVerified: true, role: 'membre', derniereConnexion: vieux, createdAt: vieux });
    await tachesQuotidiennes();
    expect(await b.select().from(schema.user).where(eq(schema.user.id, 'inactif'))).toHaveLength(0);
  });

  it('une sauvegarde se restaure dans une base neuve, à l’identique', async () => {
    const avant = await exporterBase();
    const paquet = empaqueter(avant);
    const origine = await base();
    const { PGlite } = await import('@electric-sql/pglite');
    const { drizzle } = await import('drizzle-orm/pglite');
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    const neuve = drizzle({ client: new PGlite(), schema, casing: 'snake_case' });
    await migrate(neuve, { migrationsFolder: 'drizzle' });
    fixerBase(neuve as unknown as Base);
    await restaurerBase(depaqueter(paquet));
    const apres = await exporterBase();
    fixerBase(origine);
    for (const t of Object.keys(avant)) expect(apres[t]!.length, t).toBe(avant[t]!.length);
    expect(JSON.stringify(apres.user)).toBe(JSON.stringify(avant.user));
  });
});
