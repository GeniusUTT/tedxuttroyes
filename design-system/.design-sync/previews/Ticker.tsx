import { Ticker } from "@tedxuttroyes/design-system";
import { ScriptActif } from "./_still";

/**
 * Le compte a rebours en telescripteur : une seule ligne en mono, jamais
 * des blocs de chiffres. Sur le site, main.js recalcule la valeur chaque
 * seconde depuis une cible figee en UTC ; ici elle est posee en prop,
 * pour que la carte soit reproductible.
 *
 * Le composant est masque tant que la classe `.js` n'est pas posee sur
 * la page : sans JavaScript, le site prefere ne rien afficher plutot
 * qu'un compteur fige.
 */
export function CompteARebours() {
  return (
    <>
      <ScriptActif />
      <Ticker value="J-221 · 14:08:36" />
    </>
  );
}

/** A quelques heures de l'ouverture. */
export function DernierJour() {
  return (
    <>
      <ScriptActif />
      <Ticker value="J-0 · 03:12:44" />
    </>
  );
}

/** Le soir meme : l'intitule change, le compteur laisse place a l'heure. */
export function LeSoirMeme() {
  return (
    <>
      <ScriptActif />
      <Ticker label="C'est ce soir" value="Ouverture des portes 18h00" />
    </>
  );
}
