'use server';

import { and, eq, ne } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { seDeconnecter } from '@/lib/connexion';
import { base, schema } from '@/lib/db';
import { noter } from '@/lib/journal';

export async function deconnexion() {
  const a = await exigerSession();
  await seDeconnecter(a.id);
  redirect('/espace/connexion/');
}

// On ne ferme que ses propres sessions : le filtre sur userId est la garde.
export async function fermerSession(id: string) {
  const a = await exigerSession();
  const b = await base();
  await b.delete(schema.session).where(and(eq(schema.session.id, id), eq(schema.session.userId, a.id)));
  await noter('session.fermee', { acteurId: a.id, cibleType: 'session', cibleId: id });
  redirect('/espace/compte/?ok=Session%20ferm%C3%A9e.');
}

export async function fermerAutresSessions() {
  const a = await exigerSession();
  const b = await base();
  await b.delete(schema.session).where(and(eq(schema.session.userId, a.id), ne(schema.session.id, a.sessionId)));
  await noter('session.fermee', { acteurId: a.id, details: { toutes_les_autres: true } });
  redirect('/espace/compte/?ok=Les%20autres%20sessions%20sont%20ferm%C3%A9es.');
}
