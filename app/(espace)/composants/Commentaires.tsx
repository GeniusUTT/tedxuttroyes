import type { Contexte } from '@/lib/droits';

// Les retours arrivent au lot 4 : ce composant les affichera.
export async function Commentaires(_p: { documentId: string; ctx: Contexte }) {
  return <p className="muet">Les retours de l’équipe s’afficheront ici.</p>;
}
