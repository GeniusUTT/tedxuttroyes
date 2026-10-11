'use client';

import { useActionState } from 'react';
import { MDP_MIN } from '@/lib/regles';
import { Bouton } from '../../composants/Bouton';
import { actionConnecter, actionDemanderLien, actionReinitialiser, type Etat } from './actions';

function Etats({ etat }: { etat: Etat }) {
  if (etat.erreur) return <p className="esp-message" role="alert">{etat.erreur}</p>;
  if (etat.ok) return <p className="esp-message esp-message--ok" role="status">{etat.ok}</p>;
  return null;
}

export function FormulaireConnexion() {
  const [etat, agir] = useActionState<Etat, FormData>(actionConnecter, {});
  return (
    <form action={agir} className="formulaire formulaire--etroit">
      <Etats etat={etat} />
      <div className="champ">
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div className="champ">
        <label htmlFor="mdp">Mot de passe</label>
        <input id="mdp" name="mdp" type="password" autoComplete="current-password" required />
      </div>
      <Bouton>Se connecter</Bouton>
    </form>
  );
}

export function FormulaireLien() {
  const [etat, agir] = useActionState<Etat, FormData>(actionDemanderLien, {});
  return (
    <form action={agir} className="formulaire formulaire--etroit">
      <Etats etat={etat} />
      <div className="champ">
        <label htmlFor="email">Adresse e-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </div>
      <Bouton>Recevoir le lien</Bouton>
    </form>
  );
}

// Choisir son mot de passe : après un lien de réinitialisation, et (avec
// une autre action) à l'acceptation d'une invitation.
export function ChampsMotDePasse({ email }: { email: string }) {
  return (
    <>
      <input type="email" name="identifiant" autoComplete="username" value={email} readOnly hidden />
      <div className="champ">
        <label htmlFor="mdp">Mot de passe</label>
        <input id="mdp" name="mdp" type="password" autoComplete="new-password" minLength={MDP_MIN} maxLength={128} required autoFocus />
        <p className="aide">{MDP_MIN} caractères au moins. Une phrase facile à retenir fait un excellent mot de passe.</p>
      </div>
      <div className="champ">
        <label htmlFor="confirmation">Le même, une seconde fois</label>
        <input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={MDP_MIN} maxLength={128} required />
      </div>
    </>
  );
}

export function FormulaireNouveauMotDePasse({ jeton, email }: { jeton: string; email: string }) {
  const [etat, agir] = useActionState<Etat, FormData>(actionReinitialiser.bind(null, jeton), {});
  return (
    <form action={agir} className="formulaire formulaire--etroit">
      <Etats etat={etat} />
      <ChampsMotDePasse email={email} />
      <Bouton>Enregistrer et se connecter</Bouton>
    </form>
  );
}
