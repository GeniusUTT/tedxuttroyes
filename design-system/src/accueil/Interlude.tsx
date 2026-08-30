export interface InterludeProps {
  /** Le message, seul texte du panneau. */
  children?: React.ReactNode;
}

/**
 * L'interlude : un ecran entier qui recouvre le contenu entre le seuil
 * et le diptyque du theme, le temps d'un message.
 *
 * La disposition : la ligne de la page coupe l'ecran en deux, la marque
 * animee a sa gauche, le texte a sa droite. Sous 768 px la scene
 * s'empile. Le panneau ne peint aucun fond : c'est le noir de la page,
 * decouvert par InterludeEspace, qui fait l'ecran, et c'est ce qui
 * laisse voir la vraie ligne.
 *
 * Le paquet n'en rejoue que le markup. Sur le site, le panneau est fixe
 * et trois choses suivent la course de InterludeEspace, pose dans le
 * flux : l'opacite du panneau (il se leve, tient, part), le zoom qui
 * epaissit LA ligne du site (--ligne-zoom sur html, pas un trait de
 * decor), et la video, dont la position dans le temps suit la position
 * dans la page.
 *
 * La video ne part pas avec le paquet : elle pese 12,7 Mo et le paquet
 * embarque ses visuels en data URI. La colonne de gauche y reste donc
 * vide, exclusion assumee dans verify.mjs.
 *
 * aria-hidden : le message porte sur un dispositif purement visuel (le
 * trait rouge), il n'a rien a dire a un lecteur d'ecran, comme le voile.
 */
export function Interlude({ children }: InterludeProps) {
  const defaut = (
    <>
      La ligne sera votre guide
      <br />
      pour toute la durée de la 10e édition
    </>
  );

  return (
    <div className="interlude" aria-hidden="true">
      <div className="interlude-scene">
        <div className="interlude-col interlude-col--logo">
          <video className="interlude-mark" muted playsInline preload="none" width={576} height={576} />
        </div>
        <div className="interlude-col interlude-col--texte">
          <h2 className="interlude-titre">{children ?? defaut}</h2>
        </div>
      </div>
    </div>
  );
}

/**
 * L'espaceur de l'interlude : aucun contenu, il ne sert qu'a donner au
 * parcours la hauteur de defilement pendant laquelle le panneau tient
 * l'ecran, et le vide qui fait l'ecran noir. Il se pose dans le flux,
 * entre le seuil et le theme. Toute la duree de la sequence tient dans
 * sa hauteur, ses marges portant la place avant et apres.
 */
export function InterludeEspace() {
  return <div className="interlude-espace" aria-hidden="true" />;
}
