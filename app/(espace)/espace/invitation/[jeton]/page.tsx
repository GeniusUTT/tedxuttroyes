import type { Metadata } from 'next';
import { lireInvitation } from '@/lib/invitations';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message } from '../../../composants/Cadre';
import { actionAccepter } from './actions';

export const metadata: Metadata = { title: 'Invitation' };

const ROLES = { speaker: 'speaker', membre: 'membre de l’équipe', admin: 'admin' } as const;

export default async function Invitation({ params, searchParams }: { params: Promise<{ jeton: string }>; searchParams: Promise<{ erreur?: string }> }) {
  const { jeton } = await params;
  const { erreur } = await searchParams;
  const inv = await lireInvitation(jeton);
  if (!inv || inv.etat !== 'valide') {
    return (
      <Cadre etroit>
        <p className="cote">Invitation</p>
        <h1>Lien plus valable</h1>
        <p>{inv?.etat === 'expiree' ? 'Cette invitation a expiré.' : 'Cette invitation a déjà servi ou a été annulée.'} Demandez à un admin de vous en renvoyer une.</p>
        <p><a href="/espace/connexion/">Vous avez déjà un compte ? Connexion</a></p>
      </Cadre>
    );
  }
  return (
    <Cadre etroit>
      <p className="cote">Invitation</p>
      <h1>Bienvenue dans l’espace</h1>
      <Message erreur={erreur} />
      <p className="chapo">Vous êtes invité en tant que {ROLES[inv.role]}, avec l’adresse <strong>{inv.email}</strong>.</p>
      <p>En acceptant, votre compte est créé et un code de connexion vous est envoyé. Aucun mot de passe à retenir.</p>
      <form action={actionAccepter.bind(null, jeton)}>
        <Bouton>Accepter l’invitation</Bouton>
      </form>
    </Cadre>
  );
}
