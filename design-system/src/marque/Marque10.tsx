import { MARQUE_10E, MARQUE_10E_TAILLE } from "../assets.generated";

export interface Marque10Props {
  /** Le lockup complet plutot que la signature : la marque devient le sujet. */
  plein?: boolean;
  /** Texte alternatif. Vide par defaut : la marque n'est qu'un ornement. */
  alt?: string;
  /** Rang d'apparition (a1 a a7) pour l'animation d'entree du bloc de tete. */
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * La marque de la dixieme edition : le X moire. En signature, elle se glisse sous
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
      src={MARQUE_10E}
      alt={alt}
      width={MARQUE_10E_TAILLE}
      height={MARQUE_10E_TAILLE}
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
 * sur html, cle de session tedx-ouverture), et il sort tout seul par une
 * animation CSS. Il porte deux marques : le dessin qui se trace, une
 * video (logo-10e-intro-1120.mp4) depuis le 2026-08-30, pour une
 * premiere venue ; et le logo deja fini pour la version courte servie
 * ensuite (classe voile-court sur html, cle locale tedx-ouverture-vue).
 * Le CSS n'en montre qu'une. Le paquet pose la balise video sans source,
 * comme pour l'interlude : il n'embarque pas de megaoctets en data URI.
 */
export function VoileOuverture() {
  return (
    <div className="voile" aria-hidden="true">
      <video
        className="voile-mark voile-mark--trace"
        muted
        playsInline
        preload="none"
        width={1120}
        height={1120}
      />
      <img
        className="voile-mark voile-mark--fixe"
        src={MARQUE_10E}
        alt=""
        width={MARQUE_10E_TAILLE}
        height={MARQUE_10E_TAILLE}
      />
    </div>
  );
}
