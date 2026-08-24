import type { ReactNode } from "react";

export interface SectionProps {
  /** Le contenu de la section (titres, textes, listes). */
  children: ReactNode;
  /** L'annotation de marge, en mono contre la ligne rouge. */
  cote?: ReactNode;
  /** « alt » pose le fond legerement plus clair (une section sur deux). */
  variant?: "default" | "alt";
  id?: string;
  ariaLabel?: string;
  /** Identifiant du titre qui nomme la section. */
  ariaLabelledby?: string;
  /**
   * Classe ajoutee au corps de section, pour les gabarits qui en ont un
   * (« ed-fiche » pour la fiche d'edition, « ed-nav » pour la navigation
   * du registre).
   */
  bodyClassName?: string;
}

/**
 * La section courante du site : la cote dans la marge, le contenu a
 * droite de la ligne. C'est le conteneur de presque tout le site.
 */
export function Section({
  children,
  cote,
  variant = "default",
  id,
  ariaLabel,
  ariaLabelledby,
  bodyClassName
}: SectionProps) {
  const classes = variant === "alt" ? "sec sec--alt" : "sec";
  const bodyClasses = bodyClassName ? `sec-body ${bodyClassName}` : "sec-body";

  return (
    <section
      className={classes}
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      <div className="inner">
        {cote ? <p className="cote">{cote}</p> : null}
        <div className={bodyClasses}>{children}</div>
      </div>
    </section>
  );
}
