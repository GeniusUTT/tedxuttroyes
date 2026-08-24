import { Redact } from "../base/Redact";
import { VisuallyHidden } from "../base/VisuallyHidden";

export interface SpeakerCardProps {
  /** Le rang, tel qu'il s'affiche : « Intervenant·e 01 ». */
  id: string;
  /**
   * Le nom, une fois l'annonce faite. Tant qu'il est absent, la fiche
   * reste sous embargo : barres de caviardage et statut « à venir ».
   */
  name?: string;
  /** La mini bio, une ou deux phrases. */
  bio?: string;
  /** Le titre du talk. */
  talk?: string;
  /** Le portrait. Absent tant que l'annonce n'est pas faite. */
  photo?: { src: string; alt: string };
  /**
   * Les largeurs des barres de caviardage, quand la fiche est sous
   * embargo : deux pour le nom, trois pour la bio, une pour le talk.
   * Varier ces largeurs d'une fiche a l'autre : un registre caviarde
   * n'a jamais deux lignes identiques.
   */
  redactions?: { name: [string, string]; bio: [string, string, string]; talk: string };
}

const DEFAUT = {
  name: ["4.5ch", "7ch"] as [string, string],
  bio: ["100%", "88%", "61%"] as [string, string, string],
  talk: "13ch"
};

/**
 * La fiche speaker de la page speakers. Deux etats : sous embargo (le
 * nom est caviarde, le portrait remplace par une mention) et annoncee.
 * Le passage de l'un a l'autre se fait en renseignant name.
 */
export function SpeakerCard({
  id,
  name,
  bio,
  talk,
  photo,
  redactions = DEFAUT
}: SpeakerCardProps) {
  const annonce = Boolean(name);

  return (
    <li className={annonce ? "sp-card sp-card--live" : "sp-card"}>
      {annonce && photo ? (
        <div className="sp-photo">
          <img src={photo.src} alt={photo.alt} width={600} height={750} loading="lazy" />
        </div>
      ) : (
        <div className="sp-photo" aria-hidden="true">
          <span className="sp-photo-mark">portrait sous embargo</span>
        </div>
      )}

      <span className="sp-id">{id}</span>

      {annonce ? (
        <p className="sp-name">{name}</p>
      ) : (
        <>
          <p className="sp-name" aria-hidden="true">
            <Redact width={redactions.name[0]} />
            <Redact width={redactions.name[1]} />
          </p>
          <VisuallyHidden>Nom sous embargo</VisuallyHidden>
        </>
      )}

      {annonce ? (
        <p className="sp-bio">{bio}</p>
      ) : (
        <p className="sp-bio" aria-hidden="true">
          <Redact width={redactions.bio[0]} />
          <Redact width={redactions.bio[1]} />
          <Redact width={redactions.bio[2]} />
        </p>
      )}

      <p className="sp-talk">
        <span className="sp-talk-k">Talk</span>{" "}
        {annonce ? (
          talk
        ) : (
          <>
            <Redact width={redactions.talk} />
            <VisuallyHidden>titre sous embargo</VisuallyHidden>
          </>
        )}
      </p>

      <span className={annonce ? "sp-status sp-status--live" : "sp-status"}>
        {annonce ? "annoncé·e" : "annonce : à venir"}
      </span>
    </li>
  );
}
