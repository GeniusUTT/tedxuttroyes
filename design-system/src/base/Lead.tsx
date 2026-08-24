import type { ReactNode } from "react";

export interface LeadProps {
  /** Le chapeau, un paragraphe. */
  children: ReactNode;
  /** Rang d'apparition (a1 a a7) pour l'animation d'entree. */
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/** Le chapeau de section : plus grand que le corps, jamais en gras. */
export function Lead({ children, step }: LeadProps) {
  const classes = ["lead"];
  if (step) {
    classes.push("a", `a${step}`);
  }
  return <p className={classes.join(" ")}>{children}</p>;
}
