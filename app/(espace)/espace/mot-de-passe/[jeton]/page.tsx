import type { Metadata } from 'next';
import Link from 'next/link';
import { compteDuJeton } from '@/lib/connexion';
import { Cadre, Section } from '../../../composants/Cadre';
import { FormulaireNouveauMotDePasse } from '../../connexion/Formulaire';

export const metadata: Metadata = { title: 'Choisir un mot de passe' };

// Le lien de l'e-mail mène ici : rien ne se passe tant que la personne n'a
// pas saisi son mot de passe, une messagerie qui ouvre le lien pour
// l'analyser ne consomme donc rien.
export default async function NouveauMotDePasse({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const compte = await compteDuJeton(jeton);
  if (!compte) {
    return (
      <Cadre cote="Espace" titre="Lien expiré" chapo="Ce lien a expiré ou a déjà servi.">
        <Section cote="Et maintenant">
          <p><Link className="btn btn--primary" href="/espace/connexion/oubli/">Demander un nouveau lien</Link></p>
        </Section>
      </Cadre>
    );
  }
  return (
    <Cadre cote="Espace" titre="Votre mot de passe" chapo={<>Pour le compte <strong>{compte.email}</strong>. C’est lui qui vous servira à chaque connexion.</>}>
      <Section cote="Nouveau mot de passe">
        <FormulaireNouveauMotDePasse jeton={jeton} email={compte.email} />
      </Section>
    </Cadre>
  );
}
