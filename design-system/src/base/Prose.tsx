import type { ReactNode } from "react";

export interface ProseProps {
  /** Du HTML de texte long : h2, p, ul, strong, a. */
  children: ReactNode;
}

/**
 * Le bloc de texte long (a propos, mentions legales) : les titres et
 * paragraphes sont mis en forme par la feuille, sans classe sur chaque
 * element.
 */
export function Prose({ children }: ProseProps) {
  return <div className="prose">{children}</div>;
}
