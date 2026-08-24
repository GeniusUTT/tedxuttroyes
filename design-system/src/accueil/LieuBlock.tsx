import type { ReactNode } from "react";
import { Facts } from "../base/Facts";
import type { Fact } from "../base/Facts";
import { LinkMore } from "../base/LinkMore";
import { PlanLieu } from "./PlanLieu";

export interface LieuBlockProps {
  /** La photo du lieu. */
  photo: { src: string; alt: string; width: number; height: number };
  /** Le mot pose sur la photo. */
  mot?: string;
  /** Les constats sur la salle : jauge, acces. */
  facts?: Fact[];
  /** Le nom du lieu. */
  nom?: string;
  /** L'adresse, ligne par ligne. */
  adresse?: string[];
  /** L'intitule au dessus de l'adresse. */
  kicker?: string;
  /** Le lien vers la carte. */
  carteHref?: string;
  /** La legende de la figure. */
  caption?: ReactNode;
  /** L'identifiant de figure, en rouge : « fig. 02 ». */
  figId?: string;
}

/**
 * Le releve de terrain du lieu : la photo, le plan de situation et la
 * fiche d'identite du batiment au meme niveau, trois pieces d'un meme
 * dossier. La ligne continue ne traverse pas ce bloc, elle plie autour.
 */
export function LieuBlock({
  photo,
  mot = "Le lieu",
  facts,
  nom = "Centre de Congrès de l'Aube",
  adresse = ["2 rue Pierre Labonde", "10000 Troyes"],
  kicker = "Adresse relevée",
  carteHref,
  caption,
  figId = "fig. 02"
}: LieuBlockProps) {
  return (
    <figure
      className="m3-lieu"
      data-line="avoid"
      data-line-margin="28"
      data-line-margin-m="14"
    >
      <div className="lieu-trio">
        <div className="lieu-photo">
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
          />
          {mot ? (
            <p className="lieu-mot" aria-hidden="true">
              {mot}
            </p>
          ) : null}
        </div>

        <div className="lieu-scene">
          <PlanLieu />
        </div>

        <div className="lieu-info">
          {facts && facts.length > 0 ? <Facts items={facts} /> : null}
          <div className="lieu-fiche">
            <p className="lieu-fiche-kicker">{kicker}</p>
            <p className="lieu-fiche-nom">{nom}</p>
            <p className="lieu-fiche-adresse">
              {adresse.map((ligne, index) => (
                <span key={ligne}>
                  {index > 0 ? <br /> : null}
                  {ligne}
                </span>
              ))}
            </p>
            {carteHref ? (
              <LinkMore href={carteHref} external>
                Voir sur la carte
              </LinkMore>
            ) : null}
          </div>
        </div>
      </div>

      {caption ? (
        <figcaption>
          <span className="fig-id">{figId}</span> : {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
