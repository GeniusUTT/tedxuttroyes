import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { ipDe } from './acces';
import { auth } from './auth';
import { base, schema } from './db';
import { noter } from './journal';
import { consommer, LIMITES } from './limite';
import { emailValide, normaliserEmail } from './regles';

// Demander un code, se connecter. La réponse à une demande de code est la
// même que l'adresse ait un compte ou non : les speakers non annoncés sont
// sous embargo, la page de connexion ne doit pas dire qui en a un.

export type Resultat = { ok: true } | { ok: false; message: string };

export const REPONSE_DEMANDE = 'Si cette adresse a un compte, un code vient de lui être envoyé. Il est valable 10 minutes.';

export async function demanderCode(brut: string): Promise<Resultat> {
  const email = normaliserEmail(brut);
  if (!emailValide(email)) return { ok: false, message: 'Adresse invalide.' };
  const ip = await ipDe();
  const parEmail = await consommer(`code:email:${email}`, LIMITES.codeParEmail.max, LIMITES.codeParEmail.fenetre);
  const parIp = await consommer(`code:ip:${ip}`, LIMITES.codeParIp.max, LIMITES.codeParIp.fenetre);
  if (!parEmail || !parIp) return { ok: false, message: 'Trop de demandes de code. Réessayez dans une heure.' };
  const b = await base();
  const [u] = await b.select({ id: schema.user.id, desactiveLe: schema.user.desactiveLe }).from(schema.user).where(eq(schema.user.email, email));
  if (u && !u.desactiveLe) {
    const a = await auth();
    await a.api.sendVerificationOTP({ body: { email, type: 'sign-in' } });
  }
  await noter('connexion.code_demande', { acteurId: u?.id ?? null });
  return { ok: true };
}

export async function seConnecter(brut: string, code: string): Promise<Resultat> {
  const email = normaliserEmail(brut);
  const ip = await ipDe();
  if (!(await consommer(`essai:ip:${ip}`, LIMITES.essaiParIp.max, LIMITES.essaiParIp.fenetre))) {
    return { ok: false, message: `Trop d'essais depuis cette connexion. Réessayez dans dix minutes.` };
  }
  if (!emailValide(email) || !/^\d{6}$/.test(code)) return { ok: false, message: 'Code incorrect ou expiré.' };
  try {
    const a = await auth();
    const r = await a.api.signInEmailOTP({ body: { email, otp: code }, headers: await headers(), returnHeaders: true });
    await appliquerCookies(r.headers);
    return { ok: true };
  } catch (e) {
    if (!(e instanceof APIError)) throw e;
    const b = await base();
    const [u] = await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
    const motif = String(e.body?.code ?? e.status);
    await noter('connexion.echec', { acteurId: u?.id ?? null, details: { motif } });
    if (motif === 'TOO_MANY_ATTEMPTS') return { ok: false, message: `Trop d'essais pour ce code : demandez-en un nouveau.` };
    return { ok: false, message: 'Code incorrect ou expiré.' };
  }
}

export async function seDeconnecter(acteurId: string) {
  const a = await auth();
  const r = await a.api.signOut({ headers: await headers(), returnHeaders: true });
  await appliquerCookies(r.headers);
  await noter('deconnexion', { acteurId });
}

// Recopie les Set-Cookie renvoyés par Better Auth dans la réponse Next.js.
async function appliquerCookies(h: Headers) {
  const pot = await cookies();
  for (const ligne of h.getSetCookie()) {
    const [paire, ...attributs] = ligne.split(';').map((x) => x.trim());
    const i = paire!.indexOf('=');
    const nom = paire!.slice(0, i), valeur = decodeURIComponent(paire!.slice(i + 1));
    const o: { maxAge?: number; path?: string; httpOnly?: boolean; secure?: boolean; sameSite?: 'lax' | 'strict' | 'none' } = {};
    for (const a of attributs) {
      const [k, v] = a.split('=');
      const cle = k!.toLowerCase();
      if (cle === 'max-age') o.maxAge = Number(v);
      else if (cle === 'path') o.path = v;
      else if (cle === 'httponly') o.httpOnly = true;
      else if (cle === 'secure') o.secure = true;
      else if (cle === 'samesite') o.sameSite = v!.toLowerCase() as 'lax';
    }
    pot.set(nom, valeur, o);
  }
}
