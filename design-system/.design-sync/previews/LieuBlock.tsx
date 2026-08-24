import { LieuBlock } from "@tedxuttroyes/design-system";
import { LIEU } from "./_images";

/**
 * Le releve de terrain du lieu : la photo, le plan de situation et la
 * fiche d'identite du batiment au meme niveau, trois pieces d'un meme
 * dossier. La ligne continue ne traverse pas ce bloc, elle plie autour.
 *
 * La carte Mapbox du site n'a pas sa place ici : le plan SVG dessine a
 * la main est la version du paquet, sans requete externe.
 */
export function ReleveDeTerrain() {
  return (
    <LieuBlock
      photo={{
        src: LIEU,
        alt: "La foule devant le Centre de Congrès de l'Aube, à Troyes",
        width: 1280,
        height: 957
      }}
      facts={[
        { strong: "Jusqu'à 750 personnes", data: "configuration auditorium" },
        {
          strong: "À un quart d'heure à pied de la gare",
          data: "bus TCAT et parkings publics à proximité"
        }
      ]}
      carteHref="https://www.google.com/maps/search/?api=1&query=Centre+de+Congr%C3%A8s+de+l%27Aube+Troyes"
      caption="le Centre de Congrès de l'Aube, photo et plan de situation"
    />
  );
}

/** Sans constats ni legende : la fiche d'adresse seule a cote du plan. */
export function FicheSeule() {
  return (
    <LieuBlock
      photo={{
        src: LIEU,
        alt: "La foule devant le Centre de Congrès de l'Aube, à Troyes",
        width: 1280,
        height: 957
      }}
      carteHref="#"
    />
  );
}
