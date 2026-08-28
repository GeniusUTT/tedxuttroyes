export interface RegisterEntry {
  /** L'annee de l'edition. */
  year: string;
  /** Le theme de l'annee. */
  theme: string;
  /** La page de l'edition. */
  href: string;
  /** La vignette d'archive. */
  thumb?: string;
  /** Le texte alternatif de la vignette. */
  thumbAlt?: string;
  /** Langue du theme, quand il est en anglais (« en »). */
  lang?: string;
}

export interface EditionRegisterProps {
  /** Les editions, de la plus recente a la plus ancienne. */
  entries: RegisterEntry[];
}

/**
 * Le registre des editions : une ligne par annee, l'annee dans la
 * marge, le theme et la vignette a droite. C'est un registre, pas une
 * galerie : les lignes se lisent de haut en bas.
 *
 * La rangee entiere est cliquable depuis le 2026-08-28 : le lien
 * « ouvrir l'edition X » a disparu, le titre porte le seul lien de la
 * rangee et son ::after (dans la feuille) couvre toute la carte. Le nom
 * accessible reprend l'annee, que le titre seul ne dit pas.
 */
export function EditionRegister({ entries }: EditionRegisterProps) {
  return (
    <div className="reg">
      {entries.map((entry) => (
        <article className="reg-row" key={entry.year}>
          <p className="reg-year">{entry.year}</p>
          <div className="reg-main">
            <h3 lang={entry.lang}>
              <a className="reg-link" href={entry.href}>
                {entry.theme}
                <span className="visually-hidden">, édition {entry.year}</span>
              </a>
            </h3>
          </div>
          {entry.thumb ? (
            <div className="reg-media">
              <img
                src={entry.thumb}
                alt={entry.thumbAlt ?? `Vignette d'archive de l'édition ${entry.year}`}
                width={800}
                height={500}
                loading="lazy"
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
