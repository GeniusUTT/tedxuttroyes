export interface EditionMetaProps {
  /** Les elements de la ligne : date, lieu, nombre de talks. */
  items: string[];
  /** La date en ISO, quand le premier element est une date. */
  datetime?: string;
}

/**
 * La ligne de metadonnees d'une edition : les elements separes par des
 * points medians. A poser dans le PageHead (prop meta) ou seule dans une
 * fiche.
 */
export function EditionMeta({ items, datetime }: EditionMetaProps) {
  return (
    <>
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 ? (
            <span className="sep" aria-hidden="true">
              ·
            </span>
          ) : null}
          {index === 0 && datetime ? <time dateTime={datetime}>{item}</time> : <span>{item}</span>}
        </span>
      ))}
    </>
  );
}
