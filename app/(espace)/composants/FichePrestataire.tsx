import type { schema } from '@/lib/db';
import { Bouton } from './Bouton';

type Prestataire = typeof schema.prestataire.$inferSelect;

// La fiche d'un prestataire : la structure, sa prestation, la personne à
// joindre et l'adresse de facturation. Les personnes du dossier la
// remplissent, l'équipe peut la compléter.
export function FormulaireFichePrestataire({ p, action }: { p: Prestataire; action: (form: FormData) => Promise<void> }) {
  return (
    <form action={action} className="formulaire">
      <fieldset>
        <legend>La structure</legend>
        <div className="champs">
          <div className="champ"><label htmlFor="structure">Nom de la structure</label><input id="structure" name="structure" type="text" autoComplete="organization" defaultValue={p.structure} maxLength={120} required /></div>
          <div className="champ"><label htmlFor="prestation">Prestation</label><input id="prestation" name="prestation" type="text" defaultValue={p.prestation} maxLength={200} placeholder="Régie son et lumière, traiteur, impression…" /></div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Contact</legend>
        <div className="champs">
          <div className="champ"><label htmlFor="contact">Personne à joindre</label><input id="contact" name="contact" type="text" autoComplete="name" defaultValue={p.contact} maxLength={120} /></div>
          <div className="champ"><label htmlFor="emailContact">Adresse e-mail</label><input id="emailContact" name="emailContact" type="email" autoComplete="email" defaultValue={p.emailContact} maxLength={254} /></div>
          <div className="champ"><label htmlFor="telephone">Téléphone</label><input id="telephone" name="telephone" type="tel" autoComplete="tel" defaultValue={p.telephone} maxLength={40} /></div>
        </div>
      </fieldset>
      <div className="champ">
        <label htmlFor="adresse">Adresse de facturation</label>
        <textarea id="adresse" name="adresse" defaultValue={p.adresse} maxLength={500} />
      </div>
      <Bouton>Enregistrer la fiche</Bouton>
    </form>
  );
}
