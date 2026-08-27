import type { ReactNode } from "react";

import { MARQUE_10E, MARQUE_10E_TAILLE } from "../assets.generated";

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
  /** Le filigrane des dix ans derriere le texte. Pose par defaut. */
  marque?: boolean;
}

/** Le bloc de la page 404 : le code en grand, la sortie de secours dessous. */
export function ErrorHero({
  code = "404",
  title,
  lead,
  children,
  cote = "Erreur 404",
  marque = true
}: ErrorHeroProps) {
  return (
    <div className="error-hero">
      {marque ? (
        <img
          className="error-mark"
          src={MARQUE_10E}
          alt=""
          width={MARQUE_10E_TAILLE}
          height={MARQUE_10E_TAILLE}
        />
      ) : null}
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
