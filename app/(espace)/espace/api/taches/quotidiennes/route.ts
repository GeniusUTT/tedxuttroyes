import { egalEnTempsConstant } from '@/lib/chiffrement';
import { tachesQuotidiennes } from '@/lib/taches';

// Appelée une fois par jour par le planificateur (Vercel Cron, ou tout
// autre) avec l'en-tête Authorization: Bearer CRON_SECRET. Sans lui, 404.

export const maxDuration = 60;

export async function GET(r: Request) {
  const attendu = process.env.CRON_SECRET;
  const recu = r.headers.get('authorization') ?? '';
  if (!attendu || !egalEnTempsConstant(recu, `Bearer ${attendu}`)) return new Response('Introuvable', { status: 404 });
  const rapport = await tachesQuotidiennes();
  return Response.json(rapport, { headers: { 'Cache-Control': 'no-store' } });
}
