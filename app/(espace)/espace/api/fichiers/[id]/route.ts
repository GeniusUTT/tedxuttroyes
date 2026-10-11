import { acteurCourant } from '@/lib/acces';
import { contexte, lienTelechargement } from '@/lib/documents';

// Tout téléchargement passe ici : session, droits, journal, puis
// redirection vers une URL signée de soixante secondes. Aucune URL durable.

const INTROUVABLE = () => new Response('Introuvable', { status: 404, headers: { 'Cache-Control': 'private, no-store' } });

export async function GET(_r: Request, { params }: { params: Promise<{ id: string }> }) {
  const a = await acteurCourant();
  if (!a) return INTROUVABLE();
  const { id } = await params;
  const url = await lienTelechargement(await contexte(a), id);
  if (!url) return INTROUVABLE();
  return new Response(null, { status: 302, headers: { Location: url, 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' } });
}
