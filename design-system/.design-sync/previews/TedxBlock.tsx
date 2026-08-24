import { TedxBlock } from "@tedxuttroyes/design-system";

/**
 * Le bloc de conformite TEDx : le texte officiel « Qu'est-ce que
 * TEDx ? » et le lien vers ted.com/tedx. Sa presence sur la page
 * d'accueil est exigee par la licence. Le texte ne se reecrit pas et le
 * lien ne se retire pas : le composant les porte lui-meme, aucune prop
 * ne permet de les changer.
 */
export function Conformite() {
  return <TedxBlock />;
}

/** Seuls la cote, le titre et l'ancre sont ajustables. */
export function TitreAjuste() {
  return <TedxBlock cote="Le programme" title="TEDx, en deux mots" id="programme-tedx" />;
}
