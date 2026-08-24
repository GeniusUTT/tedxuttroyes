import type { CSSProperties } from "react";

export interface AlbumEntry {
  /** L'annee de l'edition. */
  year: string;
  /** Le theme de l'annee. */
  theme: string;
  /** L'affiche de l'edition. */
  poster: { src: string; alt: string; width: number; height: number };
  /** Langue du theme, quand il est en anglais (« en »). */
  lang?: string;
}

export interface AlbumProps {
  /** Les editions passees, de la plus ancienne a la plus recente. */
  entries: AlbumEntry[];
  /** L'edition a venir : le point final du fil, sans affiche. */
  end?: { year: string; theme: string; note: string };
  /** Le libelle de la liste, pour les lecteurs d'ecran. */
  ariaLabel?: string;
}

/**
 * L'album des editions : les affiches pendent sur le fil rouge comme
 * des tirages sur une corde, le theme sous chacune. La derniere station
 * est l'edition a venir, d'ou le trait redescend vers la billetterie.
 * Les affiches se revelent au passage de la pointe.
 */
export function Album({
  entries,
  end,
  ariaLabel = "L'album des éditions TEDxUTTroyes"
}: AlbumProps) {
  return (
    <ol className="album" data-line="turn" aria-label={ariaLabel}>
      {entries.map((entry, index) => (
        <li
          className="alb-item"
          key={entry.year}
          style={{ "--c": index + 1, "--th": (index * 0.08).toFixed(2) } as CSSProperties}
        >
          <figure className="alb-img">
            <img
              src={entry.poster.src}
              alt={entry.poster.alt}
              width={entry.poster.width}
              height={entry.poster.height}
              loading="lazy"
            />
          </figure>
          <span className="alb-dot" aria-hidden="true" />
          <span className="alb-lbl">
            <span className="fr-y">{entry.year}</span>
            <span className="fr-t" lang={entry.lang}>
              {entry.theme}
            </span>
          </span>
        </li>
      ))}

      {end ? (
        <li
          className="alb-item alb-item--end"
          style={
            {
              "--c": entries.length + 1,
              "--th": (entries.length * 0.08).toFixed(2)
            } as CSSProperties
          }
        >
          <span className="alb-end-label">
            <span className="fr-y">{end.year}</span>
            <span className="fr-t">{end.theme}</span>
            <span className="fr-end-note">{end.note}</span>
          </span>
          <span className="alb-dot alb-dot--end" data-line="drop" aria-hidden="true" />
        </li>
      ) : null}
    </ol>
  );
}
