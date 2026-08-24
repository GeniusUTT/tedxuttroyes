import { LinkMore } from "@tedxuttroyes/design-system";

/** Le rebond interne : libelle en minuscules, chevron. */
export function Interne() {
  return <LinkMore href="/editions/">Ouvrir le registre des éditions</LinkMore>;
}

/** Le rebond sortant : nouvel onglet, fleche au lieu du chevron. */
export function Sortant() {
  return (
    <LinkMore href="https://www.youtube.com/@TEDx" external>
      voir les talks 2016 sur YouTube
    </LinkMore>
  );
}

/** Plusieurs rebonds a la suite, comme au bas d'une fiche d'edition. */
export function Serie() {
  return (
    <div style={{ display: "grid", gap: "14px", justifyItems: "start" }}>
      <LinkMore href="/speakers/">Ouvrir les six fiches</LinkMore>
      <LinkMore href="/programme/">Lire la feuille de salle complète</LinkMore>
      <LinkMore href="/editions/edition-2017/">
        édition 2017 : To the Limits and Beyond
      </LinkMore>
    </div>
  );
}
