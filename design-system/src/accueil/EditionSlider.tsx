export interface SliderPoster {
  /** L'affiche de l'edition. */
  src: string;
  /** Le texte alternatif : « Affiche de l'édition 2016 : Shape the future ». */
  alt: string;
  width: number;
  height: number;
}

export interface EditionSliderProps {
  /** Les affiches, de la plus ancienne a la plus recente. */
  posters: SliderPoster[];
  /** Le libelle du carrousel, pour les lecteurs d'ecran. */
  ariaLabel?: string;
}

/**
 * Le carrousel d'affiches, en mobile seulement : l'album complet et sa
 * bande d'archives sont masques sous 1024 px, remplaces par ce balayage
 * en scroll-snap, sans JavaScript.
 */
export function EditionSlider({
  posters,
  ariaLabel = "Les affiches des éditions passées"
}: EditionSliderProps) {
  return (
    <div className="ed-slider" aria-label={ariaLabel}>
      <ol className="ed-slides">
        {posters.map((poster) => (
          <li key={poster.src}>
            <img
              src={poster.src}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              loading="lazy"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
