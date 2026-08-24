export interface HofPerson {
  /** Le nom, tel qu'il s'affiche sous le portrait. */
  name: string;
  /** La fiche de la personne. */
  href: string;
  /** Le portrait, carre. */
  photo: string;
  /** Le texte alternatif : « Portrait de Prénom Nom ». */
  alt?: string;
}

export interface HofYearProps {
  /** L'annee de l'edition. */
  year: string;
  /** Le theme de l'annee. */
  theme: string;
  /** La page de l'edition : le titre de l'annee y mene. */
  href: string;
  /** Les intervenants de cette annee. */
  people: HofPerson[];
}

/**
 * Une annee du Hall of Fame : le titre ouvre l'edition, chaque carte
 * ouvre la fiche de la personne. Une section par annee, de la plus
 * recente a la plus ancienne.
 */
export function HofYear({ year, theme, href, people }: HofYearProps) {
  return (
    <section className="hof-year">
      <h2 className="h-md">
        <a className="hof-year-link" href={href}>
          {year} · {theme}
        </a>
      </h2>
      <div className="hof-grid">
        {people.map((person) => (
          <article className="hof-card" key={person.href}>
            <a className="hof-link" href={person.href}>
              <div className="hof-photo">
                <img
                  src={person.photo}
                  alt={person.alt ?? `Portrait de ${person.name}`}
                  width={560}
                  height={560}
                  loading="lazy"
                />
              </div>
              <h3 className="hof-name">{person.name}</h3>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
