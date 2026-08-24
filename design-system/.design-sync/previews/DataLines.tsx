import { DataLines } from "@tedxuttroyes/design-system";

/**
 * Les chiffres de l'edition, en lignes de donnees. La ligne continue
 * plie autour du bloc au lieu de le traverser. Trois chiffres au plus :
 * au dela, ce n'est plus un releve.
 */
export function Chiffres() {
  return (
    <DataLines
      lines={[
        { value: "61", label: "talks partagés sur la scène troyenne depuis 2016" },
        { value: "2500", label: "intervenantes et intervenants passés par le plateau" },
        { value: "750", label: "fauteuils le 18 mars 2027, pas un de plus" }
      ]}
      ariaLabel="La dixième édition en chiffres"
    />
  );
}

/** Deux chiffres, ranges a gauche de la ligne. */
export function AGauche() {
  return (
    <DataLines
      side="left"
      lines={[
        { value: "9", label: "éditions consignées au registre depuis 2016" },
        { value: "18", label: "minutes par talk, pas une de plus" }
      ]}
    />
  );
}
