import type { ReactNode } from "react";

export interface ErrorHeroProps {
  /** Le code, en grand chiffre de releve. */
  code?: string;
  /** Le titre de la page d'erreur. */
  title: ReactNode;
  /** L'explication. */
  lead?: ReactNode;
  /** Les boutons de retour : un Actions avec deux Button. */
  children?: ReactNode;
  /** L'annotation de marge. */
  cote?: ReactNode;
}

/** Le bloc de la page 404 : le code en grand, la sortie de secours dessous. */
export function ErrorHero({
  code = "404",
  title,
  lead,
  children,
  cote = "Erreur 404"
}: ErrorHeroProps) {
  return (
    <div className="error-hero">
      <div className="inner">
        <p className="cote">{cote}</p>
        <div className="sec-body">
          <p className="error-code" aria-hidden="true">
            {code}
          </p>
          <h1>{title}</h1>
          {lead ? <p className="lead">{lead}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
