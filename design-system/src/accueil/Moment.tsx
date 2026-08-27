import type { ReactNode } from "react";

export interface MomentProps {
  /** L'annotation de marge : le nom du moment. */
  cote: ReactNode;
  /** Le titre du moment. */
  title?: ReactNode;
  /** Le chapeau sous le titre. */
  lead?: ReactNode;
  /** L'ancre de la section, cible des liens de navigation. */
  id?: string;
  /**
   * Le cote de la ligne ou se range le contenu. « droite » installe le
   * bloc a droite du trait et inverse le duo texte/photo.
   */
  side?: "gauche" | "droite";
  /** La photo du duo. Sans elle, le moment est un simple bloc de texte. */
  photo?: { src: string; alt: string; width: number; height: number };
  /**
   * Le mot qui traverse la ligne au fil du defilement (« Au-delà »,
   * « Jusqu'ici »). Reserve aux deux moments du theme.
   */
  crossWord?: string;
  /**
   * Ce qui se glisse sous le chapeau, dans la colonne de texte : la
   * marque de la dixieme edition signe ainsi le moment de la frise.
   */
  signature?: ReactNode;
  /** Le contenu supplementaire : listes, figures, liens de rebond. */
  children?: ReactNode;
  /** « frise » pour le moment des dix ans, qui deroule l'album. */
  variant?: "default" | "frise";
}

/**
 * Un moment de la page d'accueil : une station sur le parcours de la
 * ligne continue. Chaque moment porte une cote, un titre, un chapeau,
 * et parfois une photo ou un mot qui traverse le trait.
 */
export function Moment({
  cote,
  title,
  lead,
  id,
  side = "gauche",
  photo,
  crossWord,
  signature,
  children,
  variant = "default"
}: MomentProps) {
  const classes = ["mom"];
  if (side === "droite") {
    classes.push("mom--droite");
  }
  if (variant === "frise") {
    classes.push("mom--frise");
  }

  const texte = (
    <div className={side === "droite" ? "colR" : "colL"}>
      {title ? <h2 className="mom-title">{title}</h2> : null}
      {lead ? <p className="lead">{lead}</p> : null}
      {signature}
    </div>
  );

  const figure = photo ? (
    <figure className="mom-photo">
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
      />
    </figure>
  ) : null;

  return (
    <section
      className={classes.join(" ")}
      id={id}
      {...(crossWord ? { "data-line": "cross" } : {})}
      {...(crossWord && side === "droite" ? { "data-cross-dir": "rtl" } : {})}
    >
      <div className="mwrap">
        <p className="cote">{cote}</p>

        {crossWord ? (
          <div
            className={side === "droite" ? "cross-track cross-track--rtl" : "cross-track"}
            aria-hidden="true"
          >
            <span className="cross-word">{crossWord}</span>
          </div>
        ) : null}

        {photo ? (
          <div className={side === "droite" ? "mom-duo mom-duo--rtl" : "mom-duo"}>
            {side === "droite" ? (
              <>
                {figure}
                {texte}
              </>
            ) : (
              <>
                {texte}
                {figure}
              </>
            )}
          </div>
        ) : (
          texte
        )}

        {children}
      </div>
    </section>
  );
}
