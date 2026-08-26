import type { ReactNode } from "react";

/** Les huit entrees de la navigation principale du site. */
export type NavKey =
  | "accueil"
  | "speakers"
  | "programme"
  | "editions"
  | "hall-of-fame"
  | "partenaires"
  | "a-propos"
  | "faq";

export interface NavEntry {
  key: NavKey;
  label: string;
  href: string;
  /** Libelle plus long, utilise dans le pied de page. */
  footerLabel?: string;
}

export const NAV: NavEntry[] = [
  { key: "accueil", label: "Accueil", href: "/" },
  { key: "speakers", label: "Speakers", href: "/speakers/" },
  { key: "programme", label: "Programme", href: "/programme/" },
  { key: "editions", label: "Éditions", href: "/editions/", footerLabel: "Éditions passées" },
  { key: "hall-of-fame", label: "Hall of Fame", href: "/hall-of-fame/" },
  { key: "partenaires", label: "Partenaires", href: "/partenaires/" },
  { key: "a-propos", label: "À propos", href: "/a-propos/" },
  { key: "faq", label: "FAQ", href: "/faq/", footerLabel: "FAQ pratique" }
];

/* PLACEHOLDER : remplacer par le vrai lien HelloAsso de billetterie. */
export const BILLETTERIE_URL =
  "https://www.helloasso.com/associations/geniusutt/evenements/tedxuttroyes-2027-10e-edition";

export const CONTACT_MAIL = "geniusutt@utt.fr";
export const INSTAGRAM_URL = "https://www.instagram.com/tedxuttroyes/";
export const CANDIDATURE_URL = "https://forms.gle/M7vKmPAUq3z3MWJNA";
export const TEDX_PROGRAMME_URL = "https://www.ted.com/tedx";

/** La date de l'evenement, telle qu'elle s'affiche partout sur le site. */
export const DATE_LONGUE = "Jeudi 18 mars 2027";
export const DATE_ISO = "2027-03-18T18:00:00+01:00";
export const LIEU = "Centre de Congrès de l'Aube, Troyes";

/**
 * Texte officiel du programme TEDx, en francais. Exige par la licence :
 * il figure tel quel sur la page d'accueil et sur la page a propos.
 * Ne pas reecrire.
 */
export const TEXTE_TEDX =
  "Dans l'esprit des idées qui méritent d'être partagées, TED a créé un programme appelé TEDx. TEDx est un programme d'événements locaux et indépendants qui rassemblent les gens pour partager une expérience proche de celle de TED. Lors de notre événement TEDxUTTroyes, des talks en direct et des vidéos de conférences TED se combinent pour susciter la réflexion et la discussion au sein d'un groupe. Notre événement TEDxUTTroyes est organisé de manière indépendante, sous licence de TED.";

/**
 * Mention de licence obligatoire dans le pied de page de chaque page.
 * Ne pas retirer, ne pas reformuler.
 */
export const MENTION_LICENCE =
  "Cet événement TEDx indépendant est organisé sous licence de TED.";

export interface WithChildren {
  children?: ReactNode;
}
