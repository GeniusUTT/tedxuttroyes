import type { Metadata } from 'next';
import { editionCourante, exigerRole, polesDe } from '@/lib/acces';
import { Cadre } from '../../composants/Cadre';

export const metadata: Metadata = { title: 'Équipe' };

export default async function Equipe() {
  const a = await exigerRole('membre', 'admin');
  const e = await editionCourante();
  const poles = await polesDe(a.id, e.id);
  return (
    <Cadre acteur={a} actif="/espace/equipe/">
      <p className="cote">Équipe · {e.libelle}</p>
      <h1>Bonjour {a.nom}</h1>
      <p className="chapo">{poles.length ? `Vos pôles : ${poles.map((p) => p.nom).join(', ')}.` : 'Aucun pôle ne vous est encore attribué : vous voyez le tableau des speakers et l’espace commun.'}</p>
    </Cadre>
  );
}
