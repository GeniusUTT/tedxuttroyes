import type { ReactNode } from "react";

export interface VisuallyHiddenProps {
  children: ReactNode;
  /** Rendre un <p> au lieu d'un <span> (paragraphe hors ecran). */
  as?: "span" | "p";
}

/** Texte reserve aux lecteurs d'ecran : invisible, jamais retire du DOM. */
export function VisuallyHidden({ children, as = "span" }: VisuallyHiddenProps) {
  const Tag = as;
  return <Tag className="visually-hidden">{children}</Tag>;
}
