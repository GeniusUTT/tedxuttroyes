import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { VisuallyHidden } from "./VisuallyHidden";

export interface ButtonProps {
  /** Le libelle du bouton. */
  children: ReactNode;
  /** Destination : le site n'a que des boutons liens, jamais de <button>. */
  href: string;
  /** Aplat rouge (primary) ou contour (ghost). */
  variant?: "primary" | "ghost";
  /** Taille reduite, utilisee dans le header. */
  size?: "md" | "sm";
  /**
   * Ouvre dans un nouvel onglet, ajoute rel="noopener" et la mention
   * « (nouvelle fenêtre) » reservee aux lecteurs d'ecran.
   */
  external?: boolean;
  /** Ajoute la fleche sortante apres le libelle. */
  withIcon?: boolean;
  className?: string;
}

/**
 * Le bouton du site : aplat rouge pour l'action principale, contour
 * pour le reste. Aucun arrondi, aucune ombre (direction artistique).
 */
export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  external = false,
  withIcon = false,
  className
}: ButtonProps) {
  const classes = ["btn", `btn--${variant}`];
  if (size === "sm") {
    classes.push("btn--sm");
  }
  if (className) {
    classes.push(className);
  }

  return (
    <a
      className={classes.join(" ")}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
      {external ? <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden> : null}
      {withIcon ? <Icon name="external" /> : null}
    </a>
  );
}
