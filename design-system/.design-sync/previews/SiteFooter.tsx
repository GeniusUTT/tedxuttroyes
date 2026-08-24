import { SiteFooter } from "@tedxuttroyes/design-system";

/**
 * Le pied de page du site. La mention « Cet événement TEDx indépendant
 * est organisé sous licence de TED. » en fait partie et n'est pas
 * optionnelle : elle doit figurer sur chaque page.
 */
export function Courant() {
  return <SiteFooter />;
}

/**
 * La variante de l'accueil : la mention de licence est le point final du
 * trace de la ligne continue, qui vient s'y brancher.
 */
export function Finale() {
  return <SiteFooter finale />;
}
