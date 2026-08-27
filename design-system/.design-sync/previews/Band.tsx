import { Actions, Band, Button } from "@tedxuttroyes/design-system";

/** Le bandeau de billetterie qui ferme presque toutes les pages. */
export function Billetterie() {
  return (
    <Band
      title="La dixième ligne du registre s'écrira le 18 mars 2027."
      lead="Franchir ou s'adapter ? 750 fauteuils au Centre de Congrès de l'Aube pour en décider."
      note="Billetterie hébergée sur Billetweb. Aucune donnée n'est collectée sur ce site."
    >
      <Actions>
        <Button href="#">Réserver ma place</Button>
      </Actions>
    </Band>
  );
}

/** Deux actions : reserver, ou aller lire le programme. */
export function DeuxActions() {
  return (
    <Band
      title="Chaque année, la salle se remplit avant la fin des annonces."
      lead="750 fauteuils, six inconnues, une soirée. Réserver maintenant, c'est parier sur dix ans d'exigence."
      note="Billetterie hébergée sur Billetweb. Aucune donnée n'est collectée sur ce site."
    >
      <Actions>
        <Button href="#">Réserver ma place</Button>
        <Button href="#" variant="ghost">
          Voir le programme
        </Button>
      </Actions>
    </Band>
  );
}

/** Une autre cote que « Billetterie » : le bandeau de contact de la FAQ. */
export function Contact() {
  return (
    <Band
      cote="Contact"
      title="Une autre question ?"
      lead="L'équipe de Genius UTT répond par e-mail, sans formulaire ni robot."
    >
      <Actions>
        <Button href="mailto:geniusutt@utt.fr">Nous écrire</Button>
      </Actions>
    </Band>
  );
}

/** Le constat seul, sans developpement ni note. */
export function ConstatSeul() {
  return (
    <Band title="Les talks se regardent en ligne. Les idées se vivent en salle.">
      <Actions>
        <Button href="#">Réserver ma place</Button>
      </Actions>
    </Band>
  );
}
