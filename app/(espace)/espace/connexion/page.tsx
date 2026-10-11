import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { acteurCourant } from '@/lib/acces';
import { Cadre } from '../../composants/Cadre';
import { FormulaireEmail } from './Formulaire';

export const metadata: Metadata = { title: 'Connexion' };

export default async function Connexion() {
  if (await acteurCourant()) redirect('/espace/');
  return (
    <Cadre etroit>
      <p className="cote">Espace connecté</p>
      <h1>Connexion</h1>
      <p className="chapo">Aucun mot de passe : saisissez votre adresse, nous vous envoyons un code à six chiffres.</p>
      <FormulaireEmail />
      <p className="muet" style={{ marginTop: 24 }}>L’espace est réservé à l’équipe et aux speakers de TEDxUTTroyes, sur invitation.</p>
    </Cadre>
  );
}
