import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { VisuallyHidden } from "./VisuallyHidden";

export interface LinkMoreProps {
  /** Le libelle, en minuscules dans la plupart des pages. */
  children: ReactNode;
  href: string;
  /** Lien sortant : nouvel onglet, rel noopener et fleche sortante. */
  external?: boolean;
}

/**
 * Le lien de rebond du site : libelle suivi d'un chevron (interne) ou
 * d'une fleche sortante (externe). C'est la seule forme de « lire la
 * suite » du site.
 */
export function LinkMore({ children, href, external = false }: LinkMoreProps) {
  return (
    <a
      className="link-more"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
      {external ? <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden> : null}
      <Icon name={external ? "external" : "chevron-right"} />
    </a>
  );
}
