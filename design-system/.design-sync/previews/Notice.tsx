import { Notice } from "@tedxuttroyes/design-system";

/** L'avertissement de bas de bloc, en mono, discret. */
export function Avertissement() {
  return (
    <Notice>
      Feuille de salle indicative : les horaires précis seront confirmés à l'approche du
      18 mars.
    </Notice>
  );
}

/** Une lacune assumee du registre. */
export function Lacune() {
  return (
    <Notice>
      2018 et 2020 manquent au registre : ces années-là, l'événement n'a pas eu lieu. Même
      une scène d'idées rencontre ses limites.
    </Notice>
  );
}

/** Une invitation, au bas d'une page de candidature. */
export function Invitation() {
  return (
    <Notice>
      Vous connaissez quelqu'un qui devrait monter sur cette scène ? Transmettez-lui cette
      page, ou soufflez-nous son nom par e-mail.
    </Notice>
  );
}
