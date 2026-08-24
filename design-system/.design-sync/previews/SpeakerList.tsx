import { SpeakerList } from "@tedxuttroyes/design-system";
import { PORTRAIT_A, PORTRAIT_B } from "./_images";

/**
 * Le registre des annonces de l'accueil : une ligne par intervenant,
 * caviardee tant que l'annonce n'est pas faite. La ligne continue plie
 * autour de ce bloc au lieu de le traverser.
 */
export function SousEmbargo() {
  return (
    <SpeakerList
      entries={[
        { id: "Intervenant·e 01", redactions: ["4.5ch", "7ch"] },
        { id: "Intervenant·e 02", redactions: ["6ch", "5ch"] },
        { id: "Intervenant·e 03", redactions: ["5ch", "8.5ch"] },
        { id: "Intervenant·e 04", redactions: ["7.5ch", "4ch"] },
        { id: "Intervenant·e 05", redactions: ["5.5ch", "6.5ch"] },
        { id: "Intervenant·e 06", redactions: ["4ch", "9ch"] }
      ]}
    />
  );
}

/** Les premieres annonces tombees : le registre se decouvre. */
export function AnnoncesEnCours() {
  return (
    <SpeakerList
      entries={[
        { id: "Intervenant·e 01", name: "Alban Michon", photo: PORTRAIT_A },
        { id: "Intervenant·e 02", name: "Daniella Tchana", photo: PORTRAIT_B },
        { id: "Intervenant·e 03", redactions: ["5ch", "8.5ch"] },
        { id: "Intervenant·e 04", redactions: ["7.5ch", "4ch"] },
        { id: "Intervenant·e 05", redactions: ["5.5ch", "6.5ch"] },
        { id: "Intervenant·e 06", redactions: ["4ch", "9ch"] }
      ]}
    />
  );
}
