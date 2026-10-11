import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { acteurCourant } from '@/lib/acces';
import { Cadre, Section } from '../../composants/Cadre';
import { FormulaireConnexion } from './Formulaire';

export const metadata: Metadata = { title: 'Connexion' };

export default async function Connexion() {
  if (await acteurCourant()) redirect('/espace/');
  return (
    <Cadre cote="Espace" titre="Connexion" chapo="L’espace des speakers et de l’équipe de TEDxUTTroyes : calendrier, documents à fournir, échanges avec l’équipe. Sur invitation uniquement.">
      <Section cote="Identifiants">
        <FormulaireConnexion />
        <p className="muet">
          Première connexion, ou mot de passe oublié ? <Link href="/espace/connexion/oubli/">Recevoir un lien pour le choisir</Link>.
        </p>
      </Section>
    </Cadre>
  );
}
