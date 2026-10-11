import type { Metadata } from 'next';
import Link from 'next/link';
import { Cadre, Section } from '../../../composants/Cadre';
import { FormulaireLien } from '../Formulaire';

export const metadata: Metadata = { title: 'Mot de passe' };

export default function Oubli() {
  return (
    <Cadre cote="Espace" titre="Mot de passe" chapo="Mot de passe oublié, ou compte créé avant le passage aux mots de passe : saisissez votre adresse, nous vous envoyons un lien pour en choisir un.">
      <Section cote="Lien par e-mail">
        <FormulaireLien />
        <p className="muet">Le lien est valable une heure. Pas de message ? Vérifiez vos indésirables. <Link href="/espace/connexion/">Retour à la connexion</Link></p>
      </Section>
    </Cadre>
  );
}
