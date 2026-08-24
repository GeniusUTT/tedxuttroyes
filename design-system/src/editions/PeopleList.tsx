export interface Person {
  /** Le nom, tel qu'il s'affiche. */
  name: string;
  /** La page de la personne : /speakers/2016/prenom-nom/. */
  href: string;
  /** Le portrait, carre. */
  photo: string;
  /** Le texte alternatif : « Portrait de Prénom Nom ». */
  alt?: string;
}

export interface PeopleListProps {
  /** Les intervenants de l'edition, dans l'ordre du programme. */
  people: Person[];
}

/** La tribune d'une edition : les portraits des intervenants, chacun ouvrant sa fiche. */
export function PeopleList({ people }: PeopleListProps) {
  return (
    <ul className="ppl">
      {people.map((person) => (
        <li className="ppl-card" key={person.href}>
          <img
            src={person.photo}
            alt={person.alt ?? `Portrait de ${person.name}`}
            width={560}
            height={560}
            loading="lazy"
          />
          <span className="ppl-name">
            <a href={person.href}>{person.name}</a>
          </span>
        </li>
      ))}
    </ul>
  );
}
