import { FinalCta } from "@tedxuttroyes/design-system";

/**
 * La prise : le point d'arrivee de la ligne continue. Le trait descend
 * des dix ans, entre dans le bouton par la gauche et l'allume. C'est le
 * seul endroit du site ou la ligne s'arrete.
 */
export function Prise() {
  return (
    <FinalCta title="La salle s'arrête à 750 fauteuils. C'est la seule limite de la soirée que personne ne franchira." />
  );
}

/** Un constat plus court, et un libelle de bouton different. */
export function ConstatCourt() {
  return (
    <FinalCta
      title="Le registre attend sa dixième ligne."
      cta="Prendre ma place"
      note="Billetterie hébergée sur Billetweb. Aucune donnée n'est collectée sur ce site."
    />
  );
}
