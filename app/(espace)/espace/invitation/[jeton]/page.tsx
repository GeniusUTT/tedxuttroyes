import type { Metadata } from 'next';
import Link from 'next/link';
import { lireInvitation } from '@/lib/invitations';
import { Cadre, Section } from '../../../composants/Cadre';
import { FormulaireInvitation } from './Formulaire';

export const metadata: Metadata = { title: 'Invitation' };

const ROLES = { speaker: 'speaker', membre: 'membre de l’équipe', prestataire: 'prestataire' } as const;

export default async function Invitation({ params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const inv = await lireInvitation(jeton);
  if (!inv || inv.etat !== 'valide') {
    return (
      <Cadre cote="Invitation" titre="Lien plus valable" chapo={`${inv?.etat === 'expiree' ? 'Cette invitation a expiré.' : 'Cette invitation a déjà servi ou a été annulée.'} Demandez à l’équipe de vous en renvoyer une.`}>
        <Section cote="Déjà un compte">
          <p><Link className="btn btn--primary" href="/espace/connexion/">Se connecter</Link></p>
        </Section>
      </Cadre>
    );
  }
  return (
    <Cadre
      cote="Invitation"
      titre="Bienvenue"
      chapo={<>Vous êtes invité dans l’espace TEDxUTTroyes en tant que {ROLES[inv.role]}, avec l’adresse <strong>{inv.email}</strong>. Choisissez votre mot de passe : votre compte est créé, et vous y entrez aussitôt.</>}
    >
      <Section cote="Votre compte">
        <FormulaireInvitation jeton={jeton} email={inv.email} />
      </Section>
    </Cadre>
  );
}
