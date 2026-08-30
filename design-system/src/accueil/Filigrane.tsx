/**
 * Le filigrane de la dixieme edition : le X moire en fond, du premier
 * versant du theme jusqu'a la billetterie, parcouru du haut vers sa base
 * au fil du defilement.
 *
 * Le paquet pose la balise, pas le mouvement : la position verticale de
 * la zone et le deplacement de l'image viennent de main.js sur le site.
 * Ici l'image est embarquee en data URI par build.mjs, comme le reste
 * des marques.
 *
 * aria-hidden : c'est un decor, il n'a rien a dire a un lecteur d'ecran.
 */
import { MARQUE_10E } from "../assets.generated";

export function Filigrane() {
  return (
    <div className="fond-marque" aria-hidden="true">
      <img src={MARQUE_10E} alt="" width={600} height={600} decoding="async" />
    </div>
  );
}
