// Lancé avant chaque build : applique les migrations, pose les données de
// base (édition courante, jalons par défaut), puis, sur une prévisualisation seulement,
// remplace les adresses et les noms copiés de la production par des valeurs
// fictives. Sans base configurée, il ne fait rien : le site public se
// construit quand même.

import { eq, like, not, sql } from 'drizzle-orm';
import { migrate as migrerNeon } from 'drizzle-orm/neon-serverless/migrator';
import { base, schema } from '../lib/db';
import { definirMotDePasse } from '../lib/motdepasse';

const JALONS = [
  { libelle: 'Coordonnées, biographie et résumé du talk', echeance: new Date('2026-11-30T23:00:00Z'), categorie: 'fiche' },
  { libelle: 'Photos haute qualité', echeance: new Date('2026-11-30T23:00:00Z'), categorie: 'photo_hd' },
  { libelle: 'Premier jet du script', echeance: new Date('2026-12-15T23:00:00Z'), categorie: 'script' },
  { libelle: 'Version finale des slides', echeance: new Date('2027-03-04T23:00:00Z'), categorie: 'slides' },
  { libelle: 'Speaker Release signée', echeance: new Date('2027-03-04T23:00:00Z'), categorie: 'release' },
  { libelle: 'Droit à l’image signé', echeance: new Date('2027-03-04T23:00:00Z'), categorie: 'droit_image' },
];

// amorcer : faux pour une restauration, qui doit retrouver la base telle
// qu'elle était, sans édition neuve posée avant elle.
export async function migrer({ amorcer: avecAmorce = true }: { amorcer?: boolean } = {}) {
  const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
  if (!url) {
    console.warn('[migrer] aucune base configurée : migrations ignorées.');
    return;
  }
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = url;
  const b = await base();
  if (url.startsWith('pglite:')) {
    const { migrate } = await import('drizzle-orm/pglite/migrator');
    await migrate(b as never, { migrationsFolder: 'drizzle' });
  } else {
    await migrerNeon(b, { migrationsFolder: 'drizzle' });
  }
  if (!avecAmorce) {
    console.info('[migrer] migrations appliquées, sans amorçage.');
    return;
  }
  await amorcer();
  await amorcerMembres();
  await anonymiserSiPrevisualisation(url);
  console.info('[migrer] base à jour.');
}

export async function amorcer() {
  const b = await base();
  const [courante] = await b.select().from(schema.edition).where(eq(schema.edition.courante, true));
  if (!courante) {
    await b.insert(schema.edition).values({
      id: crypto.randomUUID(),
      annee: 2027,
      libelle: 'TEDxUTTroyes 2027, dixième édition',
      courante: true,
      dateEvenement: new Date('2027-03-18T17:00:00Z'),
    }).onConflictDoNothing();
  }
  const [e] = await b.select().from(schema.edition).where(eq(schema.edition.courante, true));
  const jalons = await b.select({ id: schema.jalon.id }).from(schema.jalon).where(eq(schema.jalon.editionId, e!.id));
  if (!jalons.length) {
    // Échéances par défaut, à ajuster par l'équipe depuis la page Édition.
    await b.insert(schema.jalon).values(JALONS.map((j, i) => ({ id: crypto.randomUUID(), editionId: e!.id, ordre: i + 1, ...j })));
  }
}

// Premiers membres : ESPACE_ADMINS_INITIAUX (le nom date du temps des
// admins) liste des adresses séparées par des virgules. Ne sert qu'à
// démarrer : rien n'est fait dès qu'un membre existe, la suite passe par les
// invitations. Ces comptes n'ont pas de mot de passe : ils le choisissent
// par « Mot de passe oublié » sur la page de connexion.
export async function amorcerMembres() {
  await amorcerMembresEssai();
  const liste = (process.env.ESPACE_ADMINS_INITIAUX ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!liste.length) return;
  const b = await base();
  const [deja] = await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.role, 'membre')).limit(1);
  if (deja) return;
  for (const email of liste) {
    await b.insert(schema.user).values({ id: crypto.randomUUID(), email, name: email.slice(0, email.indexOf('@')), emailVerified: true, role: 'membre' }).onConflictDoNothing();
  }
  console.info(`[migrer] ${liste.length} membre(s) initial(aux) créé(s).`);
}

// Membres fictifs pour rejouer les parcours sur une prévisualisation, qui a
// sa propre branche de base. Jamais en production, même si la variable y
// était posée par erreur.
async function amorcerMembresEssai() {
  if (process.env.VERCEL_ENV !== 'preview') return;
  const liste = (process.env.ESPACE_ADMINS_ESSAI ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!liste.length) return;
  const b = await base();
  for (const email of liste) {
    await b.insert(schema.user).values({ id: crypto.randomUUID(), email, name: `Essai ${email.slice(0, email.indexOf('@'))}`, emailVerified: true, role: 'membre' }).onConflictDoNothing();
    // Le mot de passe des parcours rejoués sur la prévisualisation.
    const mdp = process.env.ESPACE_MDP_ESSAI;
    if (mdp) {
      const [u] = await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
      if (u) await definirMotDePasse(u.id, mdp);
    }
  }
  console.info(`[migrer] ${liste.length} membre(s) d'essai présents sur la prévisualisation.`);
}

// La branche Neon d'une prévisualisation est une copie de la production. On
// n'y touche que si l'on est sûr de ne pas être sur la production : rôle de
// déploiement « preview » et hôte de base différent de celui de production.
async function anonymiserSiPrevisualisation(url: string) {
  if (process.env.VERCEL_ENV !== 'preview') return;
  const hoteProd = process.env.ESPACE_HOTE_BASE_PRODUCTION;
  const hote = new URL(url).hostname;
  if (!hoteProd || hote === hoteProd || hote.replace('-pooler', '') === hoteProd.replace('-pooler', '')) {
    console.warn('[migrer] prévisualisation sans garantie de branche distincte : anonymisation ignorée.');
    return;
  }
  const b = await base();
  const fictive = sql`'p-' || left(md5(${schema.user.id}), 10) || '@exemple.invalid'`;
  await b.update(schema.user).set({ email: fictive, name: sql`'Personne ' || left(md5(${schema.user.id}), 4)` })
    .where(not(like(schema.user.email, '%@exemple.invalid')));
  await b.update(schema.speaker).set({
    nomAffiche: sql`'Speaker ' || left(md5(${schema.speaker.id}), 4)`,
    prenom: '', nom: '', emailContact: '', telephone: '', biographie: '', titreProvisoire: '', resume: '',
  });
  await b.update(schema.prestataire).set({
    structure: sql`'Prestataire ' || left(md5(${schema.prestataire.id}), 4)`,
    contact: '', emailContact: '', telephone: '', adresse: '',
  });
  await b.update(schema.invitation).set({ email: sql`'i-' || left(md5(${schema.invitation.id}), 10) || '@exemple.invalid'` });
  await b.delete(schema.session);
  console.info('[migrer] prévisualisation anonymisée.');
}

if (process.argv[1]?.endsWith('migrer.ts')) {
  migrer().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
}
