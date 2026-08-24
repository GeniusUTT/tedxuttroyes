import type { ReactNode } from "react";

export interface PageHeadProps {
  /** L'annotation de marge : la rubrique, l'edition, la date. */
  cote: ReactNode;
  /** Le titre de la page, en display. Un seul h1 par page. */
  title: ReactNode;
  /** Le chapeau sous le titre. */
  lead?: ReactNode;
  /**
   * La ligne de metadonnees des fiches d'edition (date, lieu, nombre de
   * talks), inseree entre le titre et le chapeau.
   */
  meta?: ReactNode;
  /** Langue du titre, quand le theme est en anglais (« en »). */
  lang?: string;
}

/**
 * Le bloc de tete de chaque page interieure : cote, titre, chapeau.
 * Les elements apparaissent l'un apres l'autre (classes a1, a2, a3).
 */
export function PageHead({ cote, title, lead, meta, lang }: PageHeadProps) {
  return (
    <div className="sec sec--head">
      <div className="inner">
        <p className="cote a a1">{cote}</p>
        <div className="sec-body">
          <h1 className="page-title a a2" lang={lang}>
            {title}
          </h1>
          {meta ? <p className="ed-meta a a3">{meta}</p> : null}
          {lead ? <p className={meta ? "lead a a4" : "lead a a3"}>{lead}</p> : null}
        </div>
      </div>
    </div>
  );
}
