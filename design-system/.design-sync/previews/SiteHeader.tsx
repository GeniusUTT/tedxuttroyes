import { SiteHeader } from "@tedxuttroyes/design-system";

/**
 * Le bandeau de tete : logo, huit entrees, deux boutons. L'entree de la
 * page courante est marquee par un filet rouge.
 */
export function Accueil() {
  return <SiteHeader current="accueil" />;
}

/** Sur une page interieure : c'est « Speakers » qui porte la marque. */
export function PageSpeakers() {
  return <SiteHeader current="speakers" />;
}

/** Sans page courante : aucune entree n'est marquee. */
export function SansMarque() {
  return <SiteHeader />;
}
