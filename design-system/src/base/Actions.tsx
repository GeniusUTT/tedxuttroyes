import type { ReactNode } from "react";

export interface ActionsProps {
  /** Un ou deux boutons, jamais plus. */
  children: ReactNode;
  /** Ajoute la classe more-row : le groupe est decale sous un bloc de texte. */
  moreRow?: boolean;
}

/** La rangee de boutons : le primaire d'abord, le contour ensuite. */
export function Actions({ children, moreRow = false }: ActionsProps) {
  return <div className={moreRow ? "actions more-row" : "actions"}>{children}</div>;
}
