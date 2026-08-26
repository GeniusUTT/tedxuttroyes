import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { VoileOuverture } from "../marque/Marque10";
import type { NavKey } from "../types";

export interface PageShellProps {
  /** Les sections de la page, dans l'ordre. */
  children: ReactNode;
  /** La page courante, pour marquer l'entree active de la navigation. */
  current?: NavKey;
  /**
   * « page » pour toutes les pages interieures (classe parcours : le
   * trait y serpente entre deux rails, pose par line.js). « journey »
   * pour l'accueil : la dorsale rouge et les reglages de hero propres
   * au parcours complet s'activent. Dans les deux cas le paquet ne
   * rejoue que le markup et le repli CSS, pas la choregraphie.
   */
  variant?: "page" | "journey";
  /**
   * Le pied de page. Il porte la mention de licence TED, obligatoire :
   * ne le retirer que pour reproduire la page 404, seule page du site
   * qui s'en passe.
   */
  footer?: boolean;
  /**
   * Le voile d'ouverture des dix ans, reserve a l'accueil. Le paquet
   * n'en pose que le markup : sur le site, c'est un script en ligne du
   * head qui decide de l'afficher, une seule fois par onglet.
   */
  voile?: boolean;
}

/**
 * La page complete : lien d'evitement, header, contenu, pied de page.
 * C'est le point de depart de toute nouvelle page du site : il garantit
 * la mention de licence TED et la ligne de cote rouge, qui ne sont pas
 * optionnelles.
 */
export function PageShell({
  children,
  current,
  variant = "page",
  footer = true,
  voile = false
}: PageShellProps) {
  return (
    <div className={variant === "journey" ? "journey" : "parcours"}>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      {voile ? <VoileOuverture /> : null}
      <SiteHeader current={current} />
      <main id="contenu">{children}</main>
      {footer ? <SiteFooter finale={variant === "journey"} /> : null}
    </div>
  );
}
