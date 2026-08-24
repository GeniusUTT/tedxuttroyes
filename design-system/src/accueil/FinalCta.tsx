import type { ReactNode } from "react";
import { BILLETTERIE_URL } from "../types";

export interface FinalCtaProps {
  /** Le constat qui ferme la page, en une phrase. */
  title: ReactNode;
  /** Le libelle du bouton. */
  cta?: string;
  /** La destination du bouton : la billetterie. */
  href?: string;
  /** La note sous le bouton. */
  note?: ReactNode;
  /** L'annotation de marge. */
  cote?: ReactNode;
  /** L'ancre de la section. */
  id?: string;
}

/**
 * La prise : le point d'arrivee de la ligne continue. Le trait descend
 * des dix ans, entre dans le bouton par la gauche et l'allume. C'est le
 * seul endroit du site ou la ligne s'arrete.
 */
export function FinalCta({
  title,
  cta = "Réserver ma place",
  href = BILLETTERIE_URL,
  note = "Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site.",
  cote = "Billetterie",
  id = "billetterie"
}: FinalCtaProps) {
  return (
    <section className="final-cta" id={id}>
      <div className="mwrap">
        <p className="cote">{cote}</p>
        <div className="colL">
          <h2 className="final-title">{title}</h2>
        </div>
        <div className="final-plug">
          {/* PLACEHOLDER : remplacer par le vrai lien HelloAsso de billetterie */}
          <a
            className="btn btn--primary"
            data-line="plug"
            href={href}
            target="_blank"
            rel="noopener"
          >
            {cta}
          </a>
          {note ? <p className="final-note">{note}</p> : null}
        </div>
      </div>
    </section>
  );
}
