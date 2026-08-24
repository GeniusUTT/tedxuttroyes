import type { ReactNode } from "react";
import { Icon } from "../base/Icon";

export interface FaqItemProps {
  /** La question, telle qu'elle se pose. */
  question: ReactNode;
  /** La reponse : un ou deux paragraphes. */
  children: ReactNode;
}

/**
 * Une question de la FAQ : un depliant natif (details), sans JavaScript.
 * Le chevron tourne a l'ouverture.
 */
export function FaqItem({ question, children }: FaqItemProps) {
  return (
    <details className="faq">
      <summary>
        {question}
        <Icon name="chevron-down" />
      </summary>
      <div className="faq-a">{children}</div>
    </details>
  );
}
