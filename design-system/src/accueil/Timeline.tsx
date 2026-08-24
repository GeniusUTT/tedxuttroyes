export interface TimelineEntry {
  /** L'heure du creneau : « 19h30 ». */
  time: string;
  /** L'intitule du creneau. */
  title: string;
  /** Ce qui s'y passe. */
  desc?: string;
  /** L'illustration du creneau. Coupee en 2/1, legerement arrondie. */
  photo?: { src: string; width: number; height: number };
}

export interface TimelineProps {
  /** Les creneaux, dans l'ordre de la soiree. */
  entries: TimelineEntry[];
  /** Le libelle de la liste, pour les lecteurs d'ecran. */
  ariaLabel?: string;
}

/**
 * Le deroule illustre de l'accueil : la ligne continue sert de rail et
 * chaque creneau s'allume quand la pointe du trait franchit sa
 * pastille. Les photos sont les seules images arrondies du site : ce
 * sont des illustrations du programme, pas des documents.
 */
export function Timeline({
  entries,
  ariaLabel = "Le déroulé de la soirée du 18 mars 2027"
}: TimelineProps) {
  return (
    <ol className="tl" aria-label={ariaLabel}>
      {entries.map((entry, index) => (
        <li className="tl-row" key={index}>
          <div className="tl-left">
            {entry.photo ? (
              <figure className="tl-ph" aria-hidden="true">
                <img
                  src={entry.photo.src}
                  alt=""
                  width={entry.photo.width}
                  height={entry.photo.height}
                  loading="lazy"
                />
              </figure>
            ) : null}
            <span className="tl-time">{entry.time}</span>
          </div>
          <span className="tl-dot" aria-hidden="true" />
          <div className="tl-body">
            <p className="tl-title">{entry.title}</p>
            {entry.desc ? <p className="tl-desc">{entry.desc}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
