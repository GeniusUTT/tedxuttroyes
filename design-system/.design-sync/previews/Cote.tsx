import { Cote, Heading, Lead } from "@tedxuttroyes/design-system";

/** La cote seule : l'annotation de marge, en mono contre la ligne rouge. */
export function Seule() {
  return <Cote>Registre des annonces</Cote>;
}

/** Les cotes du site, telles qu'elles se suivent de page en page. */
export function Repertoire() {
  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <Cote>Infos pratiques</Cote>
      <Cote>Feuille de salle</Cote>
      <Cote>À la tribune</Cote>
      <Cote>Billetterie</Cote>
    </div>
  );
}

/** En situation : la cote annonce le bloc qui la suit. */
export function EnSituation() {
  return (
    <div>
      <Cote>Ce qu'on cherche</Cote>
      <Heading>Une idée, pas un CV</Heading>
      <Lead>
        Un talk TEDx ne vend rien et ne promeut personne : il transmet une idée.
      </Lead>
    </div>
  );
}
