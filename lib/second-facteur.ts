import { eq } from 'drizzle-orm';
import { chiffrer, dechiffrer } from './chiffrement';
import { base, schema } from './db';
import { noter } from './journal';
import { consommer, LIMITES } from './limite';
import { nouveauSecret, uriOtpauth, verifierCode } from './totp';

// Second facteur des admins : une application d'authentification (TOTP).
// La validation vaut pour la session en cours ; une nouvelle connexion la
// redemande. Cinq essais par tranche de dix minutes.

export class RefusTotp extends Error {}

export async function etat(userId: string): Promise<'absent' | 'en_attente' | 'actif'> {
  const b = await base();
  const [t] = await b.select().from(schema.totp).where(eq(schema.totp.userId, userId));
  if (!t) return 'absent';
  return t.confirmeLe ? 'actif' : 'en_attente';
}

// Crée (ou reprend) un secret non confirmé et renvoie l'URI à scanner.
export async function preparer(userId: string, email: string): Promise<{ uri: string; secret: string }> {
  const b = await base();
  const [t] = await b.select().from(schema.totp).where(eq(schema.totp.userId, userId));
  if (t?.confirmeLe) throw new RefusTotp('Le second facteur est déjà actif.');
  let secret: string;
  if (t) secret = dechiffrer(t.secretChiffre);
  else {
    secret = nouveauSecret();
    await b.insert(schema.totp).values({ userId, secretChiffre: chiffrer(secret) });
  }
  return { uri: uriOtpauth(secret, email), secret };
}

export async function valider(userId: string, sessionId: string, code: string): Promise<void> {
  if (!(await consommer(`totp:${userId}`, LIMITES.totpParCompte.max, LIMITES.totpParCompte.fenetre))) {
    throw new RefusTotp("Trop d'essais. Réessayez dans dix minutes.");
  }
  const b = await base();
  const [t] = await b.select().from(schema.totp).where(eq(schema.totp.userId, userId));
  if (!t) throw new RefusTotp('Aucun second facteur à valider.');
  const pas = verifierCode(dechiffrer(t.secretChiffre), code.replace(/\s/g, ''), t.dernierPas ?? null);
  if (pas === null) {
    await noter('totp.echec', { acteurId: userId });
    throw new RefusTotp('Code incorrect.');
  }
  const premiere = !t.confirmeLe;
  await b.update(schema.totp).set({ dernierPas: pas, confirmeLe: t.confirmeLe ?? new Date() }).where(eq(schema.totp.userId, userId));
  await b.update(schema.session).set({ totpValideLe: new Date() }).where(eq(schema.session.id, sessionId));
  await noter(premiere ? 'totp.active' : 'totp.valide', { acteurId: userId });
}

export async function reinitialiser(userId: string) {
  const b = await base();
  await b.delete(schema.totp).where(eq(schema.totp.userId, userId));
}
