import { PlanLieu } from "@tedxuttroyes/design-system";

/**
 * Le plan de situation, dessine a la main : le quartier du Centre de
 * Congres de l'Aube reduit a ses rues, son canal et deux reperes.
 *
 * C'est la version par defaut du bloc lieu, celle qui s'affiche sans
 * JavaScript et sans WebGL. La carte Mapbox du site vient par dessus ;
 * elle n'a pas sa place dans le paquet, qui n'emet aucune requete
 * externe.
 *
 * Le SVG se pose en absolu dans son conteneur : celui-ci doit donc etre
 * positionne et dimensionne, sinon le plan remplit toute la carte et le
 * cadrage `slice` avale la moitie des rues.
 */
export function Plan() {
  return (
    <div style={{ position: "relative", width: "300px", height: "412px" }}>
      <PlanLieu />
    </div>
  );
}

/** Au gabarit du bloc lieu de l'accueil. */
export function AuGabaritDuSite() {
  return (
    <div style={{ position: "relative", width: "364px", height: "418px" }}>
      <PlanLieu />
    </div>
  );
}
