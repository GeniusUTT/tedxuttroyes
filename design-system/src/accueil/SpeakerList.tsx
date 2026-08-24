import { Redact } from "../base/Redact";
import { VisuallyHidden } from "../base/VisuallyHidden";

export interface SpeakerListEntry {
  /** Le rang, tel qu'il s'affiche : « Intervenant·e 01 ». */
  id: string;
  /** Le nom, une fois l'annonce faite. Absent : la ligne reste caviardee. */
  name?: string;
  /** La vignette carree, une fois l'annonce faite. */
  photo?: string;
  /** Les largeurs des deux barres de caviardage du nom. */
  redactions?: [string, string];
}

export interface SpeakerListProps {
  /** Les six lignes du registre des annonces. */
  entries: SpeakerListEntry[];
  /** Le libelle de la liste, pour les lecteurs d'ecran. */
  ariaLabel?: string;
}

/**
 * Le registre des annonces de l'accueil : une ligne par intervenant,
 * caviardee tant que l'annonce n'est pas faite. La ligne continue plie
 * autour de ce bloc (ancre avoid), au lieu de le traverser.
 */
export function SpeakerList({
  entries,
  ariaLabel = "Les six intervenantes et intervenants de 2027, annonces à venir"
}: SpeakerListProps) {
  return (
    <ol
      className="slist"
      data-line="avoid"
      data-line-margin="28"
      data-line-margin-m="14"
      aria-label={ariaLabel}
    >
      {entries.map((entry) => {
        const annonce = Boolean(entry.name);
        const bars = entry.redactions ?? ["4.5ch", "7ch"];

        return (
          <li className={annonce ? "sl-row sl-row--live" : "sl-row"} key={entry.id}>
            {annonce && entry.photo ? (
              <span className="sl-photo">
                <img src={entry.photo} alt="" width={120} height={120} loading="lazy" />
              </span>
            ) : (
              <span className="sl-photo" aria-hidden="true" />
            )}

            <span className="sp-id">{entry.id}</span>

            {annonce ? (
              <span className="sl-name">{entry.name}</span>
            ) : (
              <>
                <span className="sl-name" aria-hidden="true">
                  <Redact width={bars[0]} />
                  <Redact width={bars[1]} />
                </span>
                <VisuallyHidden>Nom sous embargo</VisuallyHidden>
              </>
            )}

            <span className={annonce ? "sp-status sp-status--live" : "sp-status"}>
              {annonce ? "annoncé·e" : "annonce : à venir"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
