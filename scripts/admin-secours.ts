// Procédure de secours : recréer un admin quand plus personne ne peut entrer
// (passation, appareils perdus). Il faut l'URL directe de la base de
// production, jamais commise :
//
//   npx tsx --env-file=.env.secours scripts/admin-secours.ts prenom.nom@geniusutt.fr "Prénom Nom"
//
// Le compte devient admin et actif, son second facteur est remis à zéro (il
// le reconfigurera à sa prochaine connexion) et ses sessions sont fermées.
// L'opération est inscrite au journal.

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { fermerSessions } from '../lib/comptes';
import { base, schema } from '../lib/db';
import { noter } from '../lib/journal';
import { emailValide, normaliserEmail } from '../lib/regles';
import { reinitialiser } from '../lib/second-facteur';

async function principal() {
  const [brut, nom] = process.argv.slice(2);
  const email = normaliserEmail(brut ?? '');
  if (!emailValide(email)) {
    console.error('Usage : admin-secours.ts <adresse> ["Nom affiché"]');
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.email, email));
  let id = u?.id;
  if (u) {
    await b.update(schema.user).set({ role: 'admin', desactiveLe: null, updatedAt: new Date() }).where(eq(schema.user.id, u.id));
  } else {
    id = randomUUID();
    await b.insert(schema.user).values({ id, email, name: nom || email.slice(0, email.indexOf('@')), emailVerified: true, role: 'admin' });
  }
  await reinitialiser(id!);
  await fermerSessions(id!);
  await noter('admin.secours', { cibleType: 'user', cibleId: id!, details: { cree: !u } });
  console.info(`${email} est admin. Connexion : /espace/connexion/ ; le second facteur sera demandé à la première visite de l'administration.`);
}

principal().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
