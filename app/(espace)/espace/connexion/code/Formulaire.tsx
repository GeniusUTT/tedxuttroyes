'use client';

import { useActionState } from 'react';
import { Bouton } from '../../../composants/Bouton';
import { actionConnecter, type Etat } from '../actions';

export function FormulaireCode({ email, code }: { email: string; code: string }) {
  const [etat, agir] = useActionState<Etat, FormData>(actionConnecter, {});
  return (
    <form action={agir}>
      {etat.erreur && <p className="message" role="alert">{etat.erreur}</p>}
      <div className="champ">
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={email} readOnly={!!email} />
      </div>
      <div className="champ">
        <label htmlFor="code">Code reçu par e-mail</label>
        <input id="code" name="code" type="text" className="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required defaultValue={code} autoFocus={!code} />
      </div>
      <Bouton>Se connecter</Bouton>
    </form>
  );
}
