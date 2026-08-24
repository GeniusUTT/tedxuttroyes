import {
  Actions,
  Button,
  Facts,
  Heading,
  Lead,
  Notice,
  Section
} from "@tedxuttroyes/design-system";

/** La section courante : cote dans la marge, contenu a droite. */
export function Courante() {
  return (
    <Section cote="Ce qu'on cherche">
      <Heading>Une idée, pas un CV</Heading>
      <Lead>
        Un talk TEDx ne vend rien et ne promeut personne : il transmet une idée. Peu
        importe votre notoriété, votre métier ou votre âge.
      </Lead>
      <Facts
        items={[
          {
            strong: "Dix-huit minutes, pas une de plus",
            data: "le format TED, exigeant et libérateur"
          },
          {
            strong: "Un lien avec le thème 2027",
            data: "franchir ou s'adapter : la limite, sous toutes ses formes"
          }
        ]}
      />
    </Section>
  );
}

/** La variante alternee : fond legerement plus clair, une section sur deux. */
export function FondAlterne() {
  return (
    <Section cote="Candidater" variant="alt">
      <Heading>Trois paragraphes suffisent</Heading>
      <Lead>
        Présentez votre idée en quelques lignes dans le formulaire de candidature : en quoi
        elle est nouvelle ou nécessaire, et un mot sur vous.
      </Lead>
      <Actions>
        <Button href="#">Postuler comme speaker</Button>
      </Actions>
    </Section>
  );
}

/** Deux sections a la suite : l'alternance de fond se lit. */
export function Alternance() {
  return (
    <div>
      <Section cote="Feuille de salle">
        <Heading>La soirée, réglée au quart d'heure</Heading>
        <Notice>
          Feuille de salle indicative : les horaires précis seront confirmés à l'approche
          du 18 mars.
        </Notice>
      </Section>
      <Section cote="En vidéo" variant="alt">
        <Heading>Tous les talks, en accès libre</Heading>
        <Lead>
          Chaque talk de TEDxUTTroyes est filmé puis publié sur la chaîne YouTube TEDx
          Talks.
        </Lead>
      </Section>
    </div>
  );
}
