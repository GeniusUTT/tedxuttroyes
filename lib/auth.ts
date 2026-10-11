import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins/email-otp';
import { eq } from 'drizzle-orm';
import { base, schema } from './db';
import { noter } from './journal';
import { envoyer } from './mail';
import { courrielCode } from './mail/gabarits';
import { urlDeBase } from './url';

// Better Auth, sans mot de passe : un code à six chiffres par e-mail. Aucune
// inscription libre (un compte naît d'une invitation acceptée) et aucune
// route HTTP publique : les actions serveur de /espace appellent auth.api
// après leurs propres contrôles (débit, compte actif).

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
    emailAndPassword: { enabled: false },
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
      additionalFields: { totpValideLe: { type: 'date', input: false, required: false } },
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
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 600,
        allowedAttempts: 5,
        storeOTP: 'hashed',
        disableSignUp: true,
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== 'sign-in') return;
          const lien = `${url}/espace/connexion/code/?email=${encodeURIComponent(email)}&code=${otp}`;
          await envoyer({ a: email, ...courrielCode(otp, lien) });
        },
      }),
    ],
  });
}

type Auth = Awaited<ReturnType<typeof construire>>;
const g = globalThis as unknown as { __auth?: Promise<Auth> };

export function auth(): Promise<Auth> {
  g.__auth ??= construire();
  return g.__auth;
}
