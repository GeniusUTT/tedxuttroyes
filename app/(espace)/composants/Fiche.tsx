import type { schema } from '@/lib/db';
import { Bouton } from './Bouton';

type Speaker = typeof schema.speaker.$inferSelect;

// La fiche d'un speaker : ses coordonnées, son talk, sa biographie. Le
// speaker la remplit, l'équipe peut la compléter ; seule l'équipe choisit le
// nom affiché dans les listes (sinon, prénom et nom).
export function FormulaireFiche({ s, action, equipe = false }: { s: Speaker; action: (form: FormData) => Promise<void>; equipe?: boolean }) {
  return (
    <form action={action} className="formulaire">
      <fieldset>
        <legend>Coordonnées</legend>
        <div className="champs">
          <div className="champ"><label htmlFor="prenom">Prénom</label><input id="prenom" name="prenom" type="text" autoComplete="given-name" defaultValue={s.prenom} maxLength={80} /></div>
          <div className="champ"><label htmlFor="nom">Nom</label><input id="nom" name="nom" type="text" autoComplete="family-name" defaultValue={s.nom} maxLength={80} /></div>
          <div className="champ"><label htmlFor="emailContact">Adresse e-mail</label><input id="emailContact" name="emailContact" type="email" autoComplete="email" defaultValue={s.emailContact} maxLength={254} /></div>
          <div className="champ"><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" autoComplete="tel" defaultValue={s.telephone} maxLength={40} /></div>
        </div>
        {equipe && (
          <div className="champ"><label htmlFor="nomAffiche">Nom affiché dans l’espace</label><input id="nomAffiche" name="nomAffiche" type="text" defaultValue={s.nomAffiche} maxLength={120} /><p className="aide">Vide : prénom et nom.</p></div>
        )}
      </fieldset>
      <div className="champ">
        <label htmlFor="titreProvisoire">Titre du talk</label>
        <input id="titreProvisoire" name="titreProvisoire" type="text" defaultValue={s.titreProvisoire} maxLength={200} />
        <p className="aide">Provisoire : il pourra changer jusqu’à l’annonce.</p>
      </div>
      <div className="champ">
        <label htmlFor="resume">Résumé du talk</label>
        <textarea id="resume" name="resume" defaultValue={s.resume} maxLength={3000} />
        <p className="aide">Quelques lignes : l’idée que vous voulez transmettre, ce que le public retiendra.</p>
      </div>
      <div className="champ">
        <label htmlFor="biographie">Biographie complète</label>
        <textarea id="biographie" name="biographie" defaultValue={s.biographie} maxLength={5000} className="long" />
        <p className="aide">Votre parcours, tel que vous voulez qu’il soit présenté sur le site et sur nos réseaux.</p>
      </div>
      <Bouton>Enregistrer la fiche</Bouton>
    </form>
  );
}
