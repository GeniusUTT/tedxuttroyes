import { Button, LinkMore, Notice, VisuallyHidden } from "@tedxuttroyes/design-system";

/**
 * Le composant ne se voit pas, c'est sa raison d'etre : il pose un texte
 * lu par les lecteurs d'ecran et par eux seuls. Ici, la mention
 * « (nouvelle fenêtre) » que Button et LinkMore ajoutent d'eux-memes a
 * chaque lien sortant.
 */
export function DansUnLienSortant() {
  return (
    <div style={{ display: "grid", gap: "20px", justifyItems: "start" }}>
      <Button href="https://www.ted.com/tedx" variant="ghost" external withIcon>
        Le programme TEDx : ted.com/tedx
      </Button>
      <LinkMore href="https://www.youtube.com/@TEDx" external>
        voir les talks sur YouTube
      </LinkMore>
      <Notice>
        Les deux liens ci-dessus portent la mention « (nouvelle fenêtre) », invisible à
        l'écran et lue par les lecteurs d'écran.
      </Notice>
    </div>
  );
}

/**
 * Le titre qui nomme une section sans s'afficher : la section est
 * annoncee aux lecteurs d'ecran, la page reste muette a l'oeil.
 */
export function TitreDeSection() {
  return (
    <div>
      <VisuallyHidden as="p">Les six intervenants de l'édition 2027</VisuallyHidden>
      <Notice>
        Au-dessus de cette note se trouve un titre reservé aux lecteurs d'écran : il
        n'occupe aucune place et ne se voit pas.
      </Notice>
    </div>
  );
}
