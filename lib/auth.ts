import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { base, schema } from './db';
import { noter } from './journal';
import { MDP_MAX, MDP_MIN } from './regles';
import { urlDeBase } from './url';

// Better Auth, par adresse et mot de passe (depuis le 2026-10-11 ; un code
// par e-mail auparavant). Aucune inscription libre : un compte naît d'une
// invitation, où la personne choisit son mot de passe. Aucune route HTTP
// publique : les actions serveur de /espace appellent auth.api après leurs
// propres contrôles (débit, compte actif). Le mot de passe est haché par la
// fonction par défaut de Better Auth (scrypt), la même que lib/motdepasse.ts
// emploie pour le poser.

export const NOM_COOKIE = '__Host-tedx-session';
export const DUREE_SESSION_S = 7 * 24 * 3600;

async function construire() {
  const db = await base();
  const url = urlDeBase();
  return betterAuth({
    appName: 'TEDxUTTroyes',
    baseURL: url,
    basePath: '/espace/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [url],
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        rateLimit: schema.rateLimit,
      },
    }),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      autoSignIn: false,
      minPasswordLength: MDP_MIN,
      maxPasswordLength: MDP_MAX,
    },
    user: {
      additionalFields: {
        role: { type: 'string', input: false, defaultValue: 'membre' },
        desactiveLe: { type: 'date', input: false, required: false },
        derniereConnexion: { type: 'date', input: false, required: false },
      },
    },
    session: {
      expiresIn: DUREE_SESSION_S,
      updateAge: 24 * 3600,
      cookieCache: { enabled: false },
    },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
    advanced: {
      useSecureCookies: false,
      cookies: { session_token: { name: NOM_COOKIE } },
      defaultCookieAttributes: { secure: true, httpOnly: true, sameSite: 'lax', path: '/' },
    },
    databaseHooks: {
      session: {
        create: {
          // Un compte désactivé n'ouvre plus de session, quoi qu'il arrive.
          before: async (s) => {
            const [u] = await db.select({ desactiveLe: schema.user.desactiveLe }).from(schema.user).where(eq(schema.user.id, s.userId));
            if (!u || u.desactiveLe) return false;
            return { data: s };
          },
          after: async (s) => {
            await db.update(schema.user).set({ derniereConnexion: new Date() }).where(eq(schema.user.id, s.userId));
            await noter('connexion', { acteurId: s.userId, cibleType: 'session', cibleId: s.id });
          },
        },
      },
    },
  });
}

type Auth = Awaited<ReturnType<typeof construire>>;
const g = globalThis as unknown as { __auth?: Promise<Auth> };

export function auth(): Promise<Auth> {
  g.__auth ??= construire();
  return g.__auth;
}
