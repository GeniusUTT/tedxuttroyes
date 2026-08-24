import type { ReactNode } from "react";

export interface CoteProps {
  /** Le libelle de la cote, court et en mono. */
  children: ReactNode;
  /** Rang d'apparition (a1 a a7) pour l'animation d'entree du bloc de tete. */
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * La cote : l'annotation technique posee dans la marge gauche, contre
 * la ligne rouge. Chaque section du site en porte une.
 */
export function Cote({ children, step }: CoteProps) {
  const classes = ["cote"];
  if (step) {
    classes.push("a", `a${step}`);
  }
  return <p className={classes.join(" ")}>{children}</p>;
}
