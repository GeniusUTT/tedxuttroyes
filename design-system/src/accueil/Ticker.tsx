export interface TickerProps {
  /** L'intitule, a gauche du compteur. */
  label?: string;
  /**
   * La valeur affichee. Sur le site, main.js la recalcule chaque
   * seconde a partir d'une cible figee en UTC ; ici elle est posee
   * telle quelle, pour que le rendu soit reproductible.
   */
  value?: string;
  /** Rang d'apparition dans le hero (a1 a a7). */
  step?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * Le telescripteur du compte a rebours : une seule ligne en mono, pas
 * de blocs de chiffres. Masque aux lecteurs d'ecran, un texte cache
 * annonce l'echeance a leur place (le hero s'en charge).
 */
export function Ticker({ label = "Temps restant", value = "J-000 · 00:00:00", step }: TickerProps) {
  const classes = ["ticker"];
  if (step) {
    classes.push("a", `a${step}`);
  }
  return (
    <div className={classes.join(" ")} aria-hidden="true">
      <span className="ticker-label">{label}</span>
      <span className="ticker-value" id="ticker-value">
        {value}
      </span>
    </div>
  );
}
