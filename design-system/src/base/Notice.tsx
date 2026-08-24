import type { ReactNode } from "react";

export interface NoticeProps {
  /** L'avertissement, une phrase. */
  children: ReactNode;
}

/**
 * La note de bas de bloc : une precision de second plan (feuille de
 * salle indicative, embargo en cours). En mono, discrete.
 */
export function Notice({ children }: NoticeProps) {
  return <p className="notice">{children}</p>;
}
