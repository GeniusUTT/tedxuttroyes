import type { ReactNode } from "react";

export interface SpeakerGridProps {
  /** Les fiches, des SpeakerCard. Six a chaque edition. */
  children: ReactNode;
}

/** La grille des fiches speakers : un registre d'annonces, pas un mur de portraits. */
export function SpeakerGrid({ children }: SpeakerGridProps) {
  return <ol className="sgrid">{children}</ol>;
}
