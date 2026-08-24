import { LinkMore } from "../base/LinkMore";

export interface EditionNavLink {
  label: string;
  href: string;
}

export interface EditionNavProps {
  /** Les rebonds : le registre, l'edition precedente, la suivante. */
  links: EditionNavLink[];
  /**
   * La mention qui remplace un lien manquant, aux deux bouts du
   * registre : « début du registre », « fin du registre ».
   */
  voidLabel?: string;
  /** Le libelle de la zone de navigation, pour les lecteurs d'ecran. */
  ariaLabel?: string;
}

/**
 * La navigation d'une fiche d'edition : ou aller depuis cette annee.
 * Se pose dans une Section avec bodyClassName="ed-nav", ou seule.
 */
export function EditionNav({
  links,
  voidLabel,
  ariaLabel = "Éditions voisines"
}: EditionNavProps) {
  return (
    <nav className="ed-nav" aria-label={ariaLabel}>
      {voidLabel ? <span className="ed-nav-void">{voidLabel}</span> : null}
      {links.map((link) => (
        <LinkMore key={link.href} href={link.href}>
          {link.label}
        </LinkMore>
      ))}
    </nav>
  );
}
