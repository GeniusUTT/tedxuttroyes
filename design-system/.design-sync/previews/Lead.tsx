import { Lead } from "@tedxuttroyes/design-system";

/** Le chapeau de section : plus grand que le corps, jamais en gras. */
export function Chapeau() {
  return (
    <Lead>
      Le 18 mars 2027, six personnes monteront sur la scène du Centre de Congrès de
      l'Aube pour dix-huit minutes chacune, face à 750 fauteuils. Si vous portez une idée
      qui mérite d'être partagée, une de ces places peut être la vôtre.
    </Lead>
  );
}

/** Court : une seule phrase, sous un titre de bandeau. */
export function Court() {
  return <Lead>Elle s'écrira le 18 mars 2027, devant 750 personnes.</Lead>;
}

/** Avec une citation : le titre du talk, entre guillemets francais. */
export function Citation() {
  return <Lead>« Apprendre à entreprendre : quelle drôle d'idée »</Lead>;
}
