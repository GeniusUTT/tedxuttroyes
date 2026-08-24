export interface DataLine {
  /** Le chiffre, seul et sans unite dans le libelle. */
  value: string;
  /** Ce que compte ce chiffre. */
  label: string;
}

export interface DataLinesProps {
  /** Trois chiffres au plus : au dela, ce n'est plus un releve. */
  lines: DataLine[];
  /** Le libelle de la liste, pour les lecteurs d'ecran. */
  ariaLabel?: string;
  /**
   * Le cote de la ligne continue autour duquel le bloc se range.
   * « right » installe le bloc a droite du trait.
   */
  side?: "left" | "right";
}

/**
 * Les chiffres de l'edition, en lignes de donnees. La ligne continue
 * plie autour du bloc (ancre avoid) au lieu de le traverser.
 */
export function DataLines({
  lines,
  ariaLabel = "L'édition en chiffres",
  side = "right"
}: DataLinesProps) {
  return (
    <ul
      className="data-lines"
      data-line="avoid"
      data-line-side={side}
      data-line-margin="28"
      data-line-margin-m="14"
      aria-label={ariaLabel}
    >
      {lines.map((line) => (
        <li key={line.label}>
          <strong>{line.value}</strong>
          <span>{line.label}</span>
        </li>
      ))}
    </ul>
  );
}
