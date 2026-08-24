import { Actions, Button } from "@tedxuttroyes/design-system";

/** L'action principale : aplat rouge, jamais plus d'un par bloc. */
export function Principal() {
  return <Button href="#">Réserver ma place</Button>;
}

/** L'action secondaire : contour seul. */
export function Contour() {
  return (
    <Button href="#" variant="ghost">
      Voir le programme
    </Button>
  );
}

/** La paire du hero : le primaire d'abord, le contour ensuite. */
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

/** Taille reduite : la version du bandeau de tete. */
export function Petit() {
  return (
    <Actions>
      <Button href="#" variant="ghost" size="sm">
        Postuler
      </Button>
      <Button href="#" size="sm">
        Réserver
      </Button>
    </Actions>
  );
}

/** Lien sortant : nouvel onglet, mention pour lecteurs d'ecran, fleche. */
export function Sortant() {
  return (
    <Button href="https://www.ted.com/tedx" variant="ghost" external withIcon>
      Le programme TEDx : ted.com/tedx
    </Button>
  );
}
