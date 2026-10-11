import { and, eq, isNull, ne } from 'drizzle-orm';
import { base, schema } from './db';
import { noter } from './journal';
import { emailValide, normaliserEmail, retraitMembrePermis, type Role } from './regles';

// Gestion des comptes par un membre. Toute décision qui retire un droit
// (désactivation, changement d'adresse) ferme aussitôt toutes les sessions
// du compte : rien ne survit à la décision.

export class RefusCompte extends Error {}

export async function fermerSessions(userId: string) {
  const b = await base();
  await b.delete(schema.session).where(eq(schema.session.userId, userId));
}

export async function membresActifs(): Promise<number> {
  const b = await base();
  const r = await b.select({ id: schema.user.id }).from(schema.user)
    .where(and(eq(schema.user.role, 'membre'), isNull(schema.user.desactiveLe)));
  return r.length;
}

async function lire(userId: string) {
  const b = await base();
  const [u] = await b.select().from(schema.user).where(eq(schema.user.id, userId));
  if (!u) throw new RefusCompte('Compte introuvable.');
  return u;
}

export function estMembreActif(u: { role: Role; desactiveLe: Date | null }) {
  return u.role === 'membre' && !u.desactiveLe;
}

export async function desactiver(userId: string, parId: string) {
  const u = await lire(userId);
  if (u.desactiveLe) return;
  if (!retraitMembrePermis(await membresActifs(), estMembreActif(u))) {
    throw new RefusCompte('Il faut au moins deux membres actifs : impossible de désactiver celui-ci.');
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
