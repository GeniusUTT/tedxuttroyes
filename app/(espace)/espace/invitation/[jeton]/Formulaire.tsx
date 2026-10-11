'use client';

import { useActionState } from 'react';
import { Bouton } from '../../../composants/Bouton';
import { ChampsMotDePasse } from '../../connexion/Formulaire';
import { actionAccepter, type EtatInvitation } from './actions';

export function FormulaireInvitation({ jeton, email }: { jeton: string; email: string }) {
  const [etat, agir] = useActionState<EtatInvitation, FormData>(actionAccepter.bind(null, jeton), {});
  return (
    <form action={agir} className="formulaire formulaire--etroit">
      {etat.erreur && <p className="esp-message" role="alert">{etat.erreur}</p>}
      <ChampsMotDePasse email={email} />
      <Bouton>Créer mon compte</Bouton>
    </form>
  );
}
