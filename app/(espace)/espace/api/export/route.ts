import { acteurCourant } from '@/lib/acces';
import { exporter } from '@/lib/rgpd';

// Export de ses propres données (RGPD) : un fichier JSON, avec pour chaque
// document le lien de téléchargement contrôlé.
export async function GET() {
  const a = await acteurCourant();
  if (!a) return new Response('Introuvable', { status: 404 });
  const donnees = await exporter(a.id);
  return new Response(JSON.stringify(donnees, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="tedxuttroyes-mes-donnees-${new Date().toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
