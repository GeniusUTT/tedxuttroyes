import { readFile, rm } from 'node:fs/promises';
import { vi } from 'vitest';

// Contexte de requête simulé pour les modules qui lisent next/headers :
// en-têtes entrants (cookie de session, IP) et pot de cookies sortants.

export const requete = {
  ip: '203.0.113.1',
  cookies: new Map<string, string>(),
};

export function entetes(): Headers {
  const h = new Headers({ 'x-real-ip': requete.ip });
  if (requete.cookies.size) h.set('cookie', [...requete.cookies].map(([k, v]) => `${k}=${v}`).join('; '));
  return h;
}

vi.mock('next/headers', () => ({
  headers: async () => entetes(),
  cookies: async () => ({
    get: (n: string) => (requete.cookies.has(n) ? { name: n, value: requete.cookies.get(n)! } : undefined),
    getAll: () => [...requete.cookies].map(([name, value]) => ({ name, value })),
    has: (n: string) => requete.cookies.has(n),
    set: (n: string | { name: string; value: string; maxAge?: number }, v?: string, o?: { maxAge?: number }) => {
      const nom = typeof n === 'string' ? n : n.name;
      const val = typeof n === 'string' ? v ?? '' : n.value;
      const age = typeof n === 'string' ? o?.maxAge : n.maxAge;
      if (age === 0 || val === '') requete.cookies.delete(nom);
      else requete.cookies.set(nom, val);
    },
    delete: (n: string) => requete.cookies.delete(n),
  }),
}));

vi.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NEXT_NOT_FOUND'); },
  redirect: (u: string) => { throw new Error(`NEXT_REDIRECT ${u}`); },
}));

export async function preparer() {
  await rm(process.env.ESPACE_FICHIER_COURRIELS!, { force: true });
  const { migrer } = await import('../../scripts/migrer');
  await migrer();
}

export async function courrielsPour(email: string): Promise<number> {
  try {
    const t = await readFile(process.env.ESPACE_FICHIER_COURRIELS!, 'utf8');
    return t.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((l) => l.a === email).length;
  } catch {
    return 0;
  }
}

export async function lienInvitation(email: string): Promise<string> {
  const lignes = (await readFile(process.env.ESPACE_FICHIER_COURRIELS!, 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
  const m = lignes.filter((l) => l.a === email && /Invitation/.test(l.sujet)).at(-1);
  const jeton = m?.texte.match(/\/espace\/invitation\/([^/\s]+)\//)?.[1];
  if (!jeton) throw new Error(`aucune invitation pour ${email}`);
  return jeton;
}

export async function lienReinitialisation(email: string): Promise<string> {
  const lignes = (await readFile(process.env.ESPACE_FICHIER_COURRIELS!, 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
  const m = lignes.filter((l) => l.a === email && /mot de passe/.test(l.sujet)).at(-1);
  const jeton = m?.texte.match(/\/espace\/mot-de-passe\/([^/\s]+)\//)?.[1];
  if (!jeton) throw new Error(`aucun lien de mot de passe pour ${email}`);
  return jeton;
}

// Le mot de passe de tous les comptes fictifs.
export const MDP = 'une phrase de passe fictive';

// Un compte naît d'une invitation acceptée, mot de passe compris.
export async function creerCompte(editionId: string, email: string, role: 'speaker' | 'membre', nom = 'Personne Fictive') {
  const { inviter, accepter } = await import('../../lib/invitations');
  await inviter({ email, role, editionId, nomAffiche: nom, derogation: false, parId: 'systeme' });
  await accepter(await lienInvitation(email), MDP, MDP);
}

// Ouvre une session neuve : les cookies de la requête simulée sont remplacés.
export async function connecter(email: string, mdp = MDP) {
  requete.cookies = new Map();
  const { seConnecter } = await import('../../lib/connexion');
  return seConnecter(email, mdp);
}
