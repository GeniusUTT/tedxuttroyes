import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import { and, eq, like } from 'drizzle-orm';
import { empreinte, jetonAleatoire } from './chiffrement';
import { base, schema } from './db';
import { DUREE_REINITIALISATION_MS } from './regles';

// Le mot de passe d'un compte et les liens pour le (re)définir. Rien ici ne
// lit la requête : les scripts de secours s'en servent aussi.
//
// Le mot de passe vit où Better Auth le cherche : une ligne « credential »
// de la table account, hachée par la même fonction que la sienne. Les liens
// de réinitialisation vivent dans la table verification de Better Auth,
// purgée chaque nuit : le jeton n'y est qu'en empreinte, il sert une fois
// et expire au bout d'une heure.

const FOURNISSEUR = 'credential';
const PREFIXE = 'reinitialisation:';

export async function definirMotDePasse(userId: string, mdp: string) {
  const b = await base();
  const hache = await hashPassword(mdp);
  const [compte] = await b.select({ id: schema.account.id }).from(schema.account)
    .where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, FOURNISSEUR)));
  if (compte) {
    await b.update(schema.account).set({ password: hache, updatedAt: new Date() }).where(eq(schema.account.id, compte.id));
  } else {
    await b.insert(schema.account).values({ id: randomUUID(), accountId: userId, providerId: FOURNISSEUR, userId, password: hache });
  }
}

export async function aUnMotDePasse(userId: string): Promise<boolean> {
  const b = await base();
  const [c] = await b.select({ p: schema.account.password }).from(schema.account)
    .where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, FOURNISSEUR)));
  return !!c?.p;
}

export async function creerJetonReinitialisation(userId: string): Promise<string> {
  const b = await base();
  await b.delete(schema.verification).where(and(like(schema.verification.identifier, `${PREFIXE}%`), eq(schema.verification.value, userId)));
  const jeton = jetonAleatoire();
  await b.insert(schema.verification).values({
    id: randomUUID(),
    identifier: PREFIXE + empreinte(jeton, 'reinitialisation'),
    value: userId,
    expiresAt: new Date(Date.now() + DUREE_REINITIALISATION_MS),
  });
  return jeton;
}

// L'identifiant du compte, si le jeton est connu et n'a pas expiré.
export async function lireJetonReinitialisation(jeton: string): Promise<string | null> {
  if (!/^[\w-]{20,100}$/.test(jeton)) return null;
  const b = await base();
  const [v] = await b.select().from(schema.verification).where(eq(schema.verification.identifier, PREFIXE + empreinte(jeton, 'reinitialisation')));
  if (!v || v.expiresAt.getTime() <= Date.now()) return null;
  return v.value;
}

export async function consommerJetonReinitialisation(jeton: string) {
  const b = await base();
  await b.delete(schema.verification).where(eq(schema.verification.identifier, PREFIXE + empreinte(jeton, 'reinitialisation')));
}

export async function verifierMotDePasse(userId: string, mdp: string): Promise<boolean> {
  const b = await base();
  const [c] = await b.select({ p: schema.account.password }).from(schema.account)
    .where(and(eq(schema.account.userId, userId), eq(schema.account.providerId, FOURNISSEUR)));
  if (!c?.p) return false;
  return verifyPassword({ hash: c.p, password: mdp });
}
