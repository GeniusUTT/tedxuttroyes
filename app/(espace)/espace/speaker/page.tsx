import type { Metadata } from 'next';
import { exigerRole } from '@/lib/acces';
import { Cadre } from '../../composants/Cadre';

export const metadata: Metadata = { title: 'Mon dossier' };

export default async function Speaker() {
  const a = await exigerRole('speaker');
  return (
    <Cadre acteur={a} actif="/espace/speaker/">
      <p className="cote">Mon dossier</p>
      <h1>Bonjour {a.nom}</h1>
      <p className="chapo">C’est ici que vous déposerez vos documents et que l’équipe vous répondra.</p>
    </Cadre>
  );
}
