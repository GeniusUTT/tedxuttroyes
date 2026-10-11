import { DOMAINE_MEMBRES } from '@/lib/regles';
import { actionInviter } from '../espace/equipe/comptes/actions';
import { Bouton } from './Bouton';

// Inviter quelqu'un : sur la page Comptes (rôle au choix), et sur la page
// Speakers (rôle fixé à speaker). L'action revient sur la page d'origine.
export function FormulaireInvitation({ chemin, role }: { chemin: string; role?: 'speaker' }) {
  return (
    <form action={actionInviter.bind(null, chemin)} className="formulaire">
      <div className="champs">
        <div className="champ"><label htmlFor="inv-email">Adresse e-mail</label><input id="inv-email" name="email" type="email" required /></div>
        <div className="champ"><label htmlFor="inv-nom">Nom affiché</label><input id="inv-nom" name="nom" type="text" placeholder="Prénom Nom" /></div>
        {role ? <input type="hidden" name="role" value={role} /> : (
          <div className="champ">
            <label htmlFor="inv-role">Rôle</label>
            <select id="inv-role" name="role" defaultValue="speaker">
              <option value="speaker">Speaker</option>
              <option value="membre">Membre de l’équipe</option>
            </select>
          </div>
        )}
      </div>
      {!role && <label className="case"><input type="checkbox" name="derogation" value="oui" /> Dérogation : inviter un membre hors du domaine {DOMAINE_MEMBRES}</label>}
      <p className="muet">La personne reçoit un lien valable sept jours, où elle choisit son mot de passe.</p>
      <Bouton>Envoyer l’invitation</Bouton>
    </form>
  );
}
