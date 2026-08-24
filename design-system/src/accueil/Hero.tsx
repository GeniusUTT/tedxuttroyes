import type { ReactNode } from "react";
import { Ticker } from "./Ticker";
import { DATE_ISO, DATE_LONGUE, LIEU } from "../types";

/* React 18 ne connait pas encore fetchPriority : on pose l'attribut tel
   qu'il s'ecrit en HTML, comme sur le site. */
const PRIORITE_HAUTE = { fetchpriority: "high" } as Record<string, string>;

export interface HeroProps {
  /** Le premier versant du theme, qui s'arrete au bord de la ligne. */
  word: string;
  /** La suite de la question, de l'autre cote de la ligne. */
  sub: ReactNode;
  /** L'annotation de marge. */
  cote?: string;
  /** La legende de figure sous le titre. */
  fig?: ReactNode;
  /** L'identifiant de figure, en rouge : « fig. 01 ». */
  figId?: string;
  /** La photo d'archive du fond, assombrie par la feuille. */
  background?: { src: string; alt?: string; width: number; height: number };
  /** La date affichee. */
  date?: string;
  /** La date en ISO, pour l'element time. */
  datetime?: string;
  /** L'heure affichee. */
  heure?: string;
  /** Le lieu affiche. */
  lieu?: string;
  /** Les boutons du hero : un Actions avec deux Button. */
  children?: ReactNode;
  /** Poser le telescripteur du compte a rebours sous les boutons. */
  ticker?: boolean;
  /** La valeur du telescripteur. */
  tickerValue?: string;
}

/**
 * Le seuil de la page d'accueil : la question se tient a cheval sur la
 * ligne rouge, le premier mot s'arretant au bord. Seule la typographie
 * display a le droit de franchir la ligne.
 */
export function Hero({
  word,
  sub,
  cote = "Dixième édition",
  fig,
  figId = "fig. 01",
  background,
  date = DATE_LONGUE,
  datetime = DATE_ISO,
  heure = "18h00",
  lieu = LIEU,
  children,
  ticker = true,
  tickerValue
}: HeroProps) {
  return (
    <section className="hero" aria-label={`TEDxUTTroyes 2027, ${cote.toLowerCase()}`}>
      {background ? (
        <div className="hero-bg" aria-hidden="true">
          <img
            src={background.src}
            alt=""
            width={background.width}
            height={background.height}
            {...PRIORITE_HAUTE}
          />
        </div>
      ) : null}

      <div className="mwrap">
        <p className="cote a a1">{cote}</p>
        <h1 className="hero-title">
          <span className="hero-word a a2">{word}</span>
          <span className="hero-sub a a3">{sub}</span>
        </h1>
        {fig ? (
          <p className="hero-fig a a4">
            <span className="fig-id">{figId}</span>
            {" : "}
            {fig}
          </p>
        ) : null}
        <p className="hero-meta a a5">
          <time dateTime={datetime}>{date}</time>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <span>{heure}</span>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <span>{lieu}</span>
        </p>
        {children ? <div className="actions a a6">{children}</div> : null}
        {ticker ? (
          <>
            <p className="visually-hidden">
              Le compte à rebours est lancé : l'événement commence le {date.toLowerCase()} à{" "}
              {heure}.
            </p>
            <Ticker step={7} value={tickerValue} />
          </>
        ) : null}
      </div>
    </section>
  );
}
