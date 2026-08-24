import { Heading, Lead } from "@tedxuttroyes/design-system";

/** Le titre de section courant. */
export function Section() {
  return <Heading>Une idée, pas un CV</Heading>;
}

/** Avec son chapeau, comme dans une section. */
export function AvecChapeau() {
  return (
    <div>
      <Heading>Devenir partenaire</Heading>
      <Lead>
        Associez votre structure à 750 spectateurs le soir même, à des talks vus bien
        au-delà de Troyes ensuite, et à dix ans d'histoire locale.
      </Lead>
    </div>
  );
}

/** Un titre en anglais : la langue est portee par l'attribut lang. */
export function EnAnglais() {
  return (
    <Heading lang="en">Thinking outside the box</Heading>
  );
}

/** Niveau 3 : les sous-titres d'un long document. */
export function Niveau3() {
  return <Heading level={3}>Tous les talks, en accès libre</Heading>;
}
