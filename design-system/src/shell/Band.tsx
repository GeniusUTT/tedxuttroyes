import type { ReactNode } from "react";

export interface BandProps {
  /** Le constat, en une phrase qui tient debout seule. */
  title: ReactNode;
  /** Les boutons du bandeau : un Actions avec un ou deux Button. */
  children?: ReactNode;
  /** L'annotation de marge. « Billetterie » dans la plupart des pages. */
  cote?: ReactNode;
  /** Le developpement sous le constat. */
  lead?: ReactNode;
  /** La note de bas de bandeau, en mono. */
  note?: ReactNode;
}

/**
 * Le bandeau de constat qui ferme presque toutes les pages : une phrase
 * qui pose un fait, un bouton, une note. Fond dense, pas d'image.
 */
export function Band({ title, children, cote = "Billetterie", lead, note }: BandProps) {
  return (
    <section className="band">
      <div className="inner">
        {cote ? <p className="cote">{cote}</p> : null}
        <div className="sec-body">
          <h2 className="band-title">{title}</h2>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
          {note ? <p className="band-note">{note}</p> : null}
        </div>
      </div>
    </section>
  );
}
