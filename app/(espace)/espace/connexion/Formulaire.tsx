'use client';

import { useActionState } from 'react';
import { Bouton } from '../../composants/Bouton';
import { actionDemander, type Etat } from './actions';

export function FormulaireEmail() {
  const [etat, agir] = useActionState<Etat, FormData>(actionDemander, {});
  return (
    <form action={agir}>
      {etat.erreur && <p className="message" role="alert">{etat.erreur}</p>}
      <div className="champ">
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <Bouton>Recevoir un code</Bouton>
    </form>
  );
}
