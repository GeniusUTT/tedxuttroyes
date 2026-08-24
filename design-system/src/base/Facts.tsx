export interface Fact {
  /** La donnee, en fort. */
  strong: string;
  /** La precision, en mono sous la donnee. */
  data: string;
}

export interface FactsProps {
  /** Deux a quatre constats, pas davantage. */
  items: Fact[];
}

/**
 * La liste de constats : une donnee forte, sa precision technique
 * dessous. Utilisee sur le lieu, les fiches d'edition et la page
 * devenir speaker.
 */
export function Facts({ items }: FactsProps) {
  return (
    <ul className="facts">
      {items.map((item, index) => (
        <li key={index}>
          <strong>{item.strong}</strong>
          <span className="data">{item.data}</span>
        </li>
      ))}
    </ul>
  );
}
