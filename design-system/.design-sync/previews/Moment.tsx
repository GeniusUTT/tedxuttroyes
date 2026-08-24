import { Moment } from "@tedxuttroyes/design-system";
import { PUBLIC, SCENE } from "./_images";

/**
 * Un moment de l'accueil : une station sur le parcours de la ligne
 * continue. Le mot traverse le trait au fil du defilement.
 */
export function AGauche() {
  return (
    <Moment
      id="franchir"
      cote="Franchir"
      crossWord="Au-delà"
      title="Décider que la ligne était provisoire"
      lead="Le record tombe, le prototype décolle, une voix s'élève là où personne ne parlait. Franchir, c'est regarder la limite en face et passer outre : le mur devient une marche, la frontière un point de départ."
      photo={{
        src: PUBLIC,
        alt: "Le public de TEDxUTTroyes dans l'auditorium",
        width: 3200,
        height: 2133
      }}
    />
  );
}

/**
 * Le moment installe a droite de la ligne : le mot arrive du bord droit
 * et vient buter contre le trait sans le franchir.
 */
export function ADroite() {
  return (
    <Moment
      id="s-adapter"
      side="droite"
      cote="S'adapter"
      crossWord="Jusqu'ici"
      title="Ce qui ne se franchit pas"
      lead="Le corps compose avec la maladie, la ville avec sa rivière, l'ingénieur avec la matière. S'adapter, c'est faire de la ligne un appui : plier sans rompre, transformer la contrainte en méthode."
      photo={{
        src: SCENE,
        alt: "La scène de TEDxUTTroyes",
        width: 2560,
        height: 1440
      }}
    />
  );
}

/** Sans photo ni mot : un simple bloc de texte sur le parcours. */
export function TexteSeul() {
  return (
    <Moment
      cote="Speakers"
      title="Six noms s'apprêtent à franchir"
      lead="Le 18 mars, six talks racontent la limite depuis la scène troyenne : dix-huit minutes chacun, pas une de plus. Les annonces tomberont une par une d'ici mars."
    />
  );
}
