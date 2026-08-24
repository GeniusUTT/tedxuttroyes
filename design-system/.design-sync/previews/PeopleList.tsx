import { Heading, PeopleList } from "@tedxuttroyes/design-system";
import { PORTRAIT_A, PORTRAIT_B, PORTRAIT_C, PORTRAIT_D } from "./_images";

/** La tribune d'une edition : chaque portrait ouvre la fiche. */
export function Tribune() {
  return (
    <PeopleList
      people={[
        {
          name: "Alban Michon",
          href: "/speakers/2026/alban-michon/",
          photo: PORTRAIT_A
        },
        {
          name: "Daniella Tchana",
          href: "/speakers/2026/daniella-tchana/",
          photo: PORTRAIT_B
        },
        {
          name: "Franck Robin",
          href: "/speakers/2026/franck-robin/",
          photo: PORTRAIT_C
        },
        {
          name: "Gilles Mautin",
          href: "/speakers/2016/gilles-mautin/",
          photo: PORTRAIT_D
        }
      ]}
    />
  );
}

/** En situation, sous le titre de la section « À la tribune ». */
export function EnSituation() {
  return (
    <div>
      <Heading>Elles et ils ont pris la parole</Heading>
      <PeopleList
        people={[
          { name: "Alban Michon", href: "#", photo: PORTRAIT_A },
          { name: "Daniella Tchana", href: "#", photo: PORTRAIT_B },
          { name: "Franck Robin", href: "#", photo: PORTRAIT_C }
        ]}
      />
    </div>
  );
}
