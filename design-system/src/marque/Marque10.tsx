import { MARQUE_10ANS, MARQUE_10ANS_TAILLE } from "../assets.generated";

export interface Marque10Props {
  /** Le lockup complet plutot que la signature : la marque devient le sujet. */
  plein?: boolean;
  /** Texte alternatif. Vide par defaut : la marque n'est qu'un ornement. */
  alt?: string;
  /** Rang d'apparition (a1 a a7) pour l'animation d'entree du bloc de tete. */
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * La marque des dix ans : le X moire. En signature, elle se glisse sous
 * un chapeau et ne fait qu'ajouter de la hauteur. En version pleine, elle
 * porte le bloc, comme sur la page cachee.
 *
 * Le paquet embarque la version statique. Sur le site, la version pleine
 * charge logo-10ans-texte.svg, qui ajoute le mot a la marque.
 */
export function Marque10({ plein, alt = "", step }: Marque10Props) {
  const classes = ["marque-10"];
  if (plein) {
    classes.push("marque-10--plein");
  }
  if (step) {
    classes.push("a", `a${step}`);
  }
  return (
    <img
      className={classes.join(" ")}
      src={MARQUE_10ANS}
      alt={alt}
      width={MARQUE_10ANS_TAILLE}
      height={MARQUE_10ANS_TAILLE}
      loading="lazy"
    />
  );
}

/**
 * Le voile d'ouverture de l'accueil : la marque en plein ecran, sur le
 * noir, le temps que l'animation se resolve.
 *
 * Le paquet n'en rejoue que le markup. Sur le site, le voile n'est pose
 * qu'une fois par onglet par un script en ligne du head (classe voile-on
 * sur html, cle de session tedx-ouverture), il porte la version animee
 * logo-10ans-intro.svg, et il sort tout seul par une animation CSS.
 */
export function VoileOuverture() {
  return (
    <div className="voile" aria-hidden="true">
      <img
        className="voile-mark"
        src={MARQUE_10ANS}
        alt=""
        width={MARQUE_10ANS_TAILLE}
        height={MARQUE_10ANS_TAILLE}
      />
    </div>
  );
}
