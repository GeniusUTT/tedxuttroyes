export interface SheetEntry {
  /** L'heure, au format du site : « 19h30 ». */
  time: string;
  /** L'intitule du creneau. */
  title: string;
  /** Ce qui s'y passe, une ou deux phrases. */
  desc?: string;
}

export interface SheetProps {
  /** Les creneaux, dans l'ordre de la soiree. */
  entries: SheetEntry[];
}

/**
 * La feuille de salle de la page programme : l'heure a gauche, le
 * creneau a droite. Version sobre du deroule, sans photos ni pastilles
 * (celle de l'accueil, animee, est le composant Timeline).
 */
export function Sheet({ entries }: SheetProps) {
  return (
    <ol className="sheet">
      {entries.map((entry, index) => (
        <li className="sheet-row" key={index}>
          <span className="sheet-time">{entry.time}</span>
          <div>
            <p className="sheet-title">{entry.title}</p>
            {entry.desc ? <p className="sheet-desc">{entry.desc}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
