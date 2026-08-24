import type { ReactNode } from "react";

export interface EditionFicheProps {
  /** L'affiche ou le visuel de l'edition. */
  poster: { src: string; alt: string; width: number; height: number };
  /** La legende sous l'affiche : « Document : ... ». */
  caption?: ReactNode;
  /** Le corps de la fiche : titre, paragraphes, constats, liens. */
  children: ReactNode;
  /** Charger l'image en differe (fiches d'archives, portraits). */
  lazy?: boolean;
}

/**
 * La fiche d'une edition passee : l'affiche a gauche, le dossier a
 * droite. Sert aussi de gabarit aux pages de speakers d'archive (le
 * portrait remplace l'affiche).
 *
 * Se pose dans une Section avec bodyClassName="ed-fiche".
 */
export function EditionFiche({ poster, caption, children, lazy = false }: EditionFicheProps) {
  return (
    <>
      <figure className="ed-affiche">
        <img
          src={poster.src}
          alt={poster.alt}
          width={poster.width}
          height={poster.height}
          {...(lazy ? { loading: "lazy" as const } : {})}
        />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
      <div className="ed-fiche-body">{children}</div>
    </>
  );
}
