import { Button, Icon, LinkMore } from "@tedxuttroyes/design-system";

/**
 * Les trois seules icones du site, au trait, a la couleur du texte
 * courant : chevron droit, chevron bas, fleche sortante.
 */
export function LesTrois() {
  return (
    <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
      <Icon name="chevron-right" />
      <Icon name="chevron-down" />
      <Icon name="external" />
    </div>
  );
}

/** En situation : le chevron ferme un lien de rebond. */
export function DansUnLien() {
  return <LinkMore href="/editions/">Ouvrir le registre des éditions</LinkMore>;
}

/** En situation : la fleche sortante ferme un bouton vers l'exterieur. */
export function DansUnBouton() {
  return (
    <Button href="https://www.ted.com/tedx" variant="ghost" external withIcon>
      Le programme TEDx : ted.com/tedx
    </Button>
  );
}
