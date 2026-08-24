import { EditionMeta, PageHead } from "@tedxuttroyes/design-system";
import { Fige } from "./_still";

/** Le bloc de tete courant : cote, titre, chapeau. */
export function Courant() {
  return (
    <>
      <Fige />
      <PageHead
        cote="Infos pratiques"
        title="FAQ"
        lead="Billets, horaires, accès au Centre de Congrès de l'Aube : les réponses aux questions qui reviennent. Il en manque une ? Écrivez-nous."
      />
    </>
  );
}

/** Sans chapeau : les pages de document, comme les mentions legales. */
export function TitreSeul() {
  return (
    <>
      <Fige />
      <PageHead cote="Le cadre" title="Mentions légales" />
    </>
  );
}

/**
 * Avec ligne de metadonnees : les fiches d'edition posent la date, le
 * lieu et le nombre de talks entre le titre et le chapeau.
 */
export function AvecMeta() {
  return (
    <>
      <Fige />
      <PageHead
        cote="Édition n° 01 · 2016"
        title="Shape the future"
        lang="en"
        meta={
          <EditionMeta
            datetime="2016-11-23"
            items={[
              "Mercredi 23 novembre 2016",
              "Université de Technologie de Troyes",
              "7 talks"
            ]}
          />
        }
        lead="La première ligne du registre. En 2016, une poignée d'étudiants de l'UTT obtient la licence TEDx et installe une scène rouge à Troyes."
      />
    </>
  );
}

/** Titre long : le display passe a la ligne sans franchir la cote. */
export function TitreLong() {
  return (
    <>
      <Fige />
      <PageHead
        cote="Depuis 2016"
        title="Le registre des éditions"
        lead="Neuf éditions consignées, deux années blanches, des dizaines de talks en accès libre. De quoi mesurer le chemin parcouru avant d'écrire la dixième ligne."
      />
    </>
  );
}
