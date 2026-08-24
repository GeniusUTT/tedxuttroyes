import { Actions, Button } from "@tedxuttroyes/design-system";

/** La paire courante : l'aplat rouge, puis le contour. */
export function Paire() {
  return (
    <Actions>
      <Button href="#">Réserver ma place</Button>
      <Button href="#" variant="ghost">
        Voir le programme
      </Button>
    </Actions>
  );
}

/** Une seule action : le cas le plus frequent des bandeaux. */
export function ActionSeule() {
  return (
    <Actions>
      <Button href="#">Proposer un partenariat</Button>
    </Actions>
  );
}

/** Decalee sous un bloc de texte (more-row). */
export function Decalee() {
  return (
    <Actions moreRow>
      <Button href="https://www.ted.com/tedx" variant="ghost" external withIcon>
        Le programme TEDx : ted.com/tedx
      </Button>
    </Actions>
  );
}
