// Procédure de secours : recréer un membre quand plus personne ne peut
// entrer (passation, mots de passe perdus, boîtes inaccessibles). Il faut
// l'URL directe de la base de production, jamais commise :
//
//   npx tsx --env-file=.env.secours scripts/secours.ts prenom.nom@geniusutt.fr "Prénom Nom"
//
// Le compte devient membre et actif, ses sessions sont fermées, et le script
// affiche un lien d'une heure pour choisir le mot de passe (ESPACE_URL donne
// l'adresse du site, https://tedxuttroyes.fr par défaut). Aucun e-mail ne
// part. L'opération est inscrite au journal.
//
// Pour les parcours de test seulement, SECOURS_MOT_DE_PASSE pose directement
// un mot de passe au lieu d'afficher le lien.

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { fermerSessions } from '../lib/comptes';
import { base, schema } from '../lib/db';
import { noter } from '../lib/journal';
import { creerJetonReinitialisation, definirMotDePasse } from '../lib/motdepasse';
import { emailValide, motDePasseRefuse, normaliserEmail } from '../lib/regles';

async function principal() {
  const [brut, nom] = process.argv.slice(2);
  const email = normaliserEmail(brut ?? '');
  if (!emailValide(email)) {
    console.error('Usage : secours.ts <adresse> ["Nom affiché"]');
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.email, email));
  let id = u?.id;
  if (u) {
    await b.update(schema.user).set({ role: 'membre', desactiveLe: null, updatedAt: new Date() }).where(eq(schema.user.id, u.id));
  } else {
    id = randomUUID();
    await b.insert(schema.user).values({ id, email, name: nom || email.slice(0, email.indexOf('@')), emailVerified: true, role: 'membre' });
  }
  await fermerSessions(id!);
  await noter('compte.secours', { cibleType: 'user', cibleId: id!, details: { cree: !u } });
  const impose = process.env.SECOURS_MOT_DE_PASSE;
  if (impose) {
    const refus = motDePasseRefuse(impose, email);
    if (refus) throw new Error(refus);
    await definirMotDePasse(id!, impose);
    console.info(`${email} est membre, avec le mot de passe fourni.`);
    return;
  }
  const site = (process.env.ESPACE_URL ?? 'https://tedxuttroyes.fr').replace(/\/$/, '');
  const jeton = await creerJetonReinitialisation(id!);
  console.info(`${email} est membre. Lien pour choisir le mot de passe, valable une heure :`);
  console.info(`${site}/espace/mot-de-passe/${jeton}/`);
}

principal().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
