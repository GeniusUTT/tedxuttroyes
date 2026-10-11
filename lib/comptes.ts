import { and, eq, isNull, ne } from 'drizzle-orm';
import { base, schema } from './db';
import { noter } from './journal';
import { emailValide, normaliserEmail, retraitAdminPermis, type Role } from './regles';

// Gestion des comptes par un admin. Toute décision qui retire un droit
// (désactivation, changement de rôle, changement d'adresse) ferme aussitôt
// toutes les sessions du compte : rien ne survit à la décision.

export class RefusCompte extends Error {}

export async function fermerSessions(userId: string) {
  const b = await base();
  await b.delete(schema.session).where(eq(schema.session.userId, userId));
}

async function adminsActifs(): Promise<number> {
  const b = await base();
  const r = await b.select({ id: schema.user.id }).from(schema.user)
    .where(and(eq(schema.user.role, 'admin'), isNull(schema.user.desactiveLe)));
  return r.length;
}

async function lire(userId: string) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) throw new RefusCompte('Compte introuvable.');
  return u;
}

function estAdminActif(u: { role: Role; desactiveLe: Date | null }) {
  return u.role === 'admin' && !u.desactiveLe;
}

export async function changerRole(userId: string, role: Role, parId: string) {
  const u = await lire(userId);
  if (u.role === role) return;
  if (role !== 'admin' && !retraitAdminPermis(await adminsActifs(), estAdminActif(u))) {
    throw new RefusCompte('Il faut au moins deux admins actifs : nommez-en un autre avant de retirer celui-ci.');
  }
  const b = await base();
  await b.update(schema.user).set({ role, updatedAt: new Date() }).where(eq(schema.user.id, userId));
  await fermerSessions(userId);
  await noter('compte.role', { acteurId: parId, cibleType: 'user', cibleId: userId, details: { avant: u.role, apres: role } });
}

export async function desactiver(userId: string, parId: string) {
  const u = await lire(userId);
  if (u.desactiveLe) return;
  if (!retraitAdminPermis(await adminsActifs(), estAdminActif(u))) {
    throw new RefusCompte('Il faut au moins deux admins actifs : impossible de désactiver celui-ci.');
  }
  const b = await base();
  await b.update(schema.user).set({ desactiveLe: new Date(), updatedAt: new Date() }).where(eq(schema.user.id, userId));
  await fermerSessions(userId);
  await noter('compte.desactive', { acteurId: parId, cibleType: 'user', cibleId: userId });
}

export async function reactiver(userId: string, parId: string) {
  const b = await base();
  await b.update(schema.user).set({ desactiveLe: null, updatedAt: new Date() }).where(eq(schema.user.id, userId));
  await noter('compte.reactive', { acteurId: parId, cibleType: 'user', cibleId: userId });
}

export async function changerEmail(userId: string, nouvelle: string, parId: string) {
  const email = normaliserEmail(nouvelle);
  if (!emailValide(email)) throw new RefusCompte('Adresse invalide.');
  const b = await base();
  const [pris] = await b.select({ id: schema.user.id }).from(schema.user).where(and(eq(schema.user.email, email), ne(schema.user.id, userId)));
  if (pris) throw new RefusCompte("Cette adresse est déjà celle d'un autre compte.");
  await b.update(schema.user).set({ email, updatedAt: new Date() }).where(eq(schema.user.id, userId));
  await fermerSessions(userId);
  await noter('compte.email', { acteurId: parId, cibleType: 'user', cibleId: userId });
}

export async function definirPoles(userId: string, editionId: string, poles: string[], parId: string) {
  const b = await base();
  await b.transaction(async (tx) => {
    await tx.delete(schema.membrePole).where(and(eq(schema.membrePole.userId, userId), eq(schema.membrePole.editionId, editionId)));
    if (poles.length) await tx.insert(schema.membrePole).values(poles.map((poleId) => ({ userId, poleId, editionId })));
  });
  await noter('compte.poles', { acteurId: parId, cibleType: 'user', cibleId: userId, editionId, details: { poles } });
}
