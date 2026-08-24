import type { ReactNode } from "react";

export interface FaqGroupProps {
  /** Le theme du groupe : Billetterie, Horaires, Accès, Sur place. */
  title: ReactNode;
  /** Les questions du groupe, des FaqItem. */
  children: ReactNode;
}

/** Un groupe de questions de la FAQ, sous son intitule. */
export function FaqGroup({ title, children }: FaqGroupProps) {
  return (
    <div className="faq-group">
      <h2 className="h-md">{title}</h2>
      {children}
    </div>
  );
}
