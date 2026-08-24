import { EditionMeta, PageHead } from "@tedxuttroyes/design-system";
import { Fige } from "./_still";

/** La ligne de metadonnees seule : date, lieu, nombre de talks. */
export function Ligne() {
  return (
    <p className="ed-meta">
      <EditionMeta
        datetime="2016-11-23"
        items={[
          "Mercredi 23 novembre 2016",
          "Université de Technologie de Troyes",
          "7 talks"
        ]}
      />
    </p>
  );
}

/** Deux elements seulement : la separation par point median s'adapte. */
export function DeuxElements() {
  return (
    <p className="ed-meta">
      <EditionMeta items={["Centre de Congrès de l'Aube", "6 talks"]} />
    </p>
  );
}

/** En situation : dans le bloc de tete d'une fiche d'edition. */
export function DansUnPageHead() {
  return (
    <>
      <Fige />
      <PageHead
        cote="Édition n° 09 · 2026"
        title="Un futur à bâtir"
        meta={
          <EditionMeta
            datetime="2026-03-19"
            items={["Jeudi 19 mars 2026", "Centre de Congrès de l'Aube", "6 talks"]}
          />
        }
        lead="La neuvième ligne du registre, celle qui précède la dixième édition."
      />
    </>
  );
}
