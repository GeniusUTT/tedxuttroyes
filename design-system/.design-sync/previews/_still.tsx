/* Deux rappels de l'environnement du site, pour que les cartes d'apercu
   montrent ce qu'un visiteur voit vraiment. Rien n'est invente ici : les
   deux reproduisent un comportement que le site produit lui-meme. */

/**
 * Les blocs de tete et le hero portent les classes d'apparition `.a a1`
 * a `.a a7` : opacite 0, puis fondu avec un delai qui va jusqu'a une
 * seconde. Une carte d'apercu est une image fixe, capturee avant la fin
 * du fondu : le texte y paraitrait delave.
 *
 * Ce composant rejoue exactement la regle que le site applique deja sous
 * prefers-reduced-motion (section 21 de main.css) : animation coupee,
 * opacite pleine. La carte montre donc l'etat final, celui que le
 * visiteur voit une seconde apres le chargement.
 */
export function Fige() {
  return <style>{`.a { animation: none !important; opacity: 1 !important; }`}</style>;
}

/**
 * Le telescripteur du compte a rebours est masque par defaut
 * (`.ticker { display: none }`) et ne s'affiche que sous `.js`, la
 * classe que le site pose lui-meme en tete de page. C'est de
 * l'amelioration progressive : sans JavaScript, pas de compte a rebours
 * fige et faux.
 *
 * La carte d'apercu n'execute pas le script du site : ce composant pose
 * la meme classe, pour que le telescripteur soit visible comme il l'est
 * chez un visiteur.
 */
export function ScriptActif() {
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("js");
  }
  return null;
}
