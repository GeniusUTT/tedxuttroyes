export interface RedactProps {
  /**
   * La largeur de la barre : une longueur CSS. Le site utilise des
   * caracteres (« 4.5ch », « 7ch ») pour les noms et des pourcentages
   * (« 88% ») pour les lignes de biographie.
   */
  width: string;
}

/**
 * La barre de caviardage : ce qui reste d'un nom sous embargo. Un
 * aplat, pas un fond flou : l'information est retiree, pas masquee.
 */
export function Redact({ width }: RedactProps) {
  return <span className="redact" style={{ width }} />;
}
