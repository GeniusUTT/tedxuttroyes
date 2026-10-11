import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';
import { auth } from './auth';
import { base, schema } from './db';
import type { Role } from './regles';

// Les gardes de l'espace. Le proxy ne fait que renvoyer vers la connexion un
// visiteur sans cookie : le rôle, le pôle et la propriété sont revérifiés
// ici, dans chaque page, action et route. Un accès refusé répond 404, pour ne
// pas confirmer qu'une ressource existe.

export type Acteur = {
  id: string;
  email: string;
  nom: string;
  role: Role;
  sessionId: string;
  totpValide: boolean;
};

export const acteurCourant = cache(async (): Promise<Acteur | null> => {
  const a = await auth();
  const s = await a.api.getSession({ headers: await headers() });
  if (!s) return null;
  const u = s.user as typeof s.user & { role: Role; desactiveLe?: Date | null };
  if (u.desactiveLe) return null;
  const sess = s.session as typeof s.session & { totpValideLe?: Date | null };
  return { id: u.id, email: u.email, nom: u.name, role: u.role, sessionId: sess.id, totpValide: !!sess.totpValideLe };
});

export async function exigerSession(): Promise<Acteur> {
  const a = await acteurCourant();
  if (!a) redirect('/espace/connexion/');
  return a;
}

export async function exigerRole(...roles: Role[]): Promise<Acteur> {
  const a = await exigerSession();
  if (!roles.includes(a.role)) notFound();
  return a;
}

// Un admin n'agit qu'après son second facteur, validé dans cette session.
export async function exigerAdmin(): Promise<Acteur> {
  const a = await exigerRole('admin');
  if (!a.totpValide) redirect('/espace/admin/verification/');
  return a;
}

export const editionCourante = cache(async () => {
  const b = await base();
  const [e] = await b.select().from(schema.edition).where(eq(schema.edition.courante, true)).limit(1);
  if (!e) throw new Error('Aucune édition courante');
  return e;
});

export async function polesDe(userId: string, editionId: string): Promise<{ id: string; slug: string; nom: string }[]> {
  const b = await base();
  return b
    .select({ id: schema.pole.id, slug: schema.pole.slug, nom: schema.pole.nom })
    .from(schema.membrePole)
    .innerJoin(schema.pole, eq(schema.pole.id, schema.membrePole.poleId))
    .where(and(eq(schema.membrePole.userId, userId), eq(schema.membrePole.editionId, editionId)))
    .orderBy(schema.pole.ordre);
}

export async function ipDe(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
}
