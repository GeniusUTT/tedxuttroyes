import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { cookies, headers } from 'next/headers';
import { ipDe } from './acces';
import { auth } from './auth';
import { fermerSessions } from './comptes';
import { base, schema } from './db';
import { noter } from './journal';
import { consommer, LIMITES } from './limite';
import { envoyer } from './mail';
import { courrielReinitialisation } from './mail/gabarits';
import { consommerJetonReinitialisation, creerJetonReinitialisation, definirMotDePasse, lireJetonReinitialisation } from './motdepasse';
import { emailValide, motDePasseRefuse, normaliserEmail } from './regles';
import { urlDeBase } from './url';

// Se connecter, demander un lien pour (re)définir son mot de passe, le
// définir. Les réponses ne disent jamais si une adresse a un compte : les
// speakers non annoncés sont sous embargo, la page de connexion ne doit pas
// dire qui en a un.

export type Resultat = { ok: true } | { ok: false; message: string };

export const REPONSE_DEMANDE = 'Si cette adresse a un compte, un lien vient de lui être envoyé. Il est valable une heure.';
const REFUS = 'Adresse ou mot de passe incorrect.';

// Ouvre la session et pose le cookie. Better Auth vérifie le mot de passe
// (en temps constant, y compris pour une adresse inconnue) et le crochet de
// session refuse un compte désactivé.
async function ouvrirSession(email: string, mdp: string): Promise<boolean> {
  try {
    const a = await auth();
    const r = await a.api.signInEmail({ body: { email, password: mdp, rememberMe: true }, headers: await headers(), returnHeaders: true });
    await appliquerCookies(r.headers);
    return true;
  } catch (e) {
    if (e instanceof APIError) return false;
    throw e;
  }
}

export async function seConnecter(brut: string, mdp: string): Promise<Resultat> {
  const email = normaliserEmail(brut);
  const ip = await ipDe();
  const parIp = await consommer(`essai:ip:${ip}`, LIMITES.essaiParIp.max, LIMITES.essaiParIp.fenetre);
  const parEmail = await consommer(`essai:email:${email}`, LIMITES.essaiParEmail.max, LIMITES.essaiParEmail.fenetre);
  if (!parIp || !parEmail) return { ok: false, message: 'Trop d’essais. Réessayez dans un quart d’heure, ou redéfinissez votre mot de passe.' };
  if (!emailValide(email) || !mdp) return { ok: false, message: REFUS };
  if (await ouvrirSession(email, mdp)) return { ok: true };
  const b = await base();
  const [u] = await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email));
  await noter('connexion.echec', { acteurId: u?.id ?? null });
  return { ok: false, message: REFUS };
}

// « Mot de passe oublié » et première connexion d'un compte qui n'en a pas
// encore : même lien, même page.
export async function demanderReinitialisation(brut: string): Promise<Resultat> {
  const email = normaliserEmail(brut);
  if (!emailValide(email)) return { ok: false, message: 'Adresse invalide.' };
  const ip = await ipDe();
  const parEmail = await consommer(`lien:email:${email}`, LIMITES.lienParEmail.max, LIMITES.lienParEmail.fenetre);
  const parIp = await consommer(`lien:ip:${ip}`, LIMITES.lienParIp.max, LIMITES.lienParIp.fenetre);
  if (!parEmail || !parIp) return { ok: false, message: 'Trop de demandes. Réessayez dans une heure.' };
  const b = await base();
  const [u] = await b.select({ id: schema.user.id, desactiveLe: schema.user.desactiveLe }).from(schema.user).where(eq(schema.user.email, email));
  if (u && !u.desactiveLe) {
    const jeton = await creerJetonReinitialisation(u.id);
    await envoyer({ a: email, ...courrielReinitialisation(`${urlDeBase()}/espace/mot-de-passe/${jeton}/`) });
  }
  await noter('connexion.lien_demande', { acteurId: u?.id ?? null });
  return { ok: true };
}

export async function compteDuJeton(jeton: string): Promise<{ id: string; email: string } | null> {
  const userId = await lireJetonReinitialisation(jeton);
  if (!userId) return null;
  const b = await base();
  const [u] = await b.select({ id: schema.user.id, email: schema.user.email, desactiveLe: schema.user.desactiveLe }).from(schema.user).where(eq(schema.user.id, userId));
  return u && !u.desactiveLe ? { id: u.id, email: u.email } : null;
}

// Pose le nouveau mot de passe, ferme toutes les sessions existantes (un
// mot de passe changé parce qu'il a fui ne doit rien laisser ouvert), puis
// connecte la personne.
export async function reinitialiser(jeton: string, mdp: string, confirmation: string): Promise<Resultat> {
  const compte = await compteDuJeton(jeton);
  if (!compte) return { ok: false, message: 'Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.' };
  if (mdp !== confirmation) return { ok: false, message: 'Les deux mots de passe ne sont pas identiques.' };
  const refus = motDePasseRefuse(mdp, compte.email);
  if (refus) return { ok: false, message: refus };
  await definirMotDePasse(compte.id, mdp);
  await consommerJetonReinitialisation(jeton);
  await fermerSessions(compte.id);
  await noter('compte.mot_de_passe', { acteurId: compte.id, cibleType: 'user', cibleId: compte.id });
  await ouvrirSession(compte.email, mdp);
  return { ok: true };
}

// Après une invitation acceptée : le compte vient de recevoir son mot de
// passe, on ouvre directement la session.
export async function connecterApresInvitation(email: string, mdp: string) {
  await ouvrirSession(email, mdp);
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
