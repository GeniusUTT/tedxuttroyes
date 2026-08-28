export interface RepereProps {
  /** Le kicker mono de la boite. */
  kicker?: string;
  /** La phrase, telle qu'elle est servie avant le devoilement. */
  children?: string;
}

/**
 * Le repere d'ouverture de l'accueil : une phrase posee au milieu de
 * l'ecran, qui dit ce que le trait rouge fait la.
 *
 * Le paquet n'en rejoue que le markup. Sur le site, la boite est fixe et
 * en pointer-events: none (elle ne peut ni pousser le seuil hors du
 * premier ecran, ni intercepter un clic), et main.js pose repere-off sur
 * html au premier defilement, ce qui la fait fondre. Le paquet ne rejoue
 * pas ce declenchement : la boite y reste visible.
 *
 * La phrase est a deux temps sur le site : la version servie ne nomme pas
 * le theme, masque jusqu'au 31 octobre 2026, et un data-reveal porte
 * celle qui le nomme. Le paquet, hors ligne, ne sert que la premiere.
 */
export function Repere({
  kicker = "Repère",
  children = "Suivez la ligne rouge : elle vous guide de page en page jusqu'au jour J."
}: RepereProps) {
  return (
    <div className="repere">
      <div className="repere-box">
        <p className="cote">{kicker}</p>
        <p className="repere-t">{children}</p>
      </div>
    </div>
  );
}
