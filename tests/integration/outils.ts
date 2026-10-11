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

export async function dernierCode(email: string): Promise<string> {
  const lignes = (await readFile(process.env.ESPACE_FICHIER_COURRIELS!, 'utf8')).trim().split('\n').map((l) => JSON.parse(l));
  const m = lignes.filter((l) => l.a === email).at(-1);
  const code = m?.texte.match(/\n(\d{6})\n/)?.[1];
  if (!code) throw new Error(`aucun code pour ${email}`);
  return code;
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
