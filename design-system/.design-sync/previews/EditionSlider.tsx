import { EditionSlider } from "@tedxuttroyes/design-system";

import { AFFICHE_2016, AFFICHE_2023, AFFICHE_2024 } from "./_images";

/**
 * Le carrousel d'affiches, en mobile seulement : l'album complet et sa
 * bande d'archives sont masques sous 1024 px et remplaces par ce
 * balayage en scroll-snap, sans JavaScript.
 *
 * La carte force la largeur mobile, sans quoi le composant reste masque
 * par la feuille, exactement comme sur le site en grand ecran.
 */
export function Carrousel() {
  return (
    <div style={{ width: "380px" }}>
      <style>{`.ed-slider { display: block; }`}</style>
      <EditionSlider
        posters={[
          {
            src: AFFICHE_2016,
            alt: "Affiche de l'édition 2016 : Shape the future",
            width: 840,
            height: 840
          },
          {
            src: AFFICHE_2023,
            alt: "Affiche de l'édition 2023 : Impacting our world",
            width: 840,
            height: 1188
          },
          {
            src: AFFICHE_2024,
            alt: "Affiche de l'édition 2024 : Le monde de demain",
            width: 840,
            height: 1188
          }
        ]}
      />
    </div>
  );
}
