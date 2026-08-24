import { Facts } from "@tedxuttroyes/design-system";

/** Les constats sur la salle, comme au bloc lieu de l'accueil. */
export function Lieu() {
  return (
    <Facts
      items={[
        { strong: "Jusqu'à 750 personnes", data: "configuration auditorium" },
        {
          strong: "À un quart d'heure à pied de la gare",
          data: "bus TCAT et parkings publics à proximité"
        }
      ]}
    />
  );
}

/** La fiche d'identite d'une edition passee. */
export function Edition() {
  return (
    <Facts
      items={[
        { strong: "23 novembre 2016", data: "édition n° 1 sur 10" },
        {
          strong: "Université de Technologie de Troyes",
          data: "le lieu de cette édition"
        },
        { strong: "7 talks", data: "publiés sur la chaîne TEDx Talks" }
      ]}
    />
  );
}

/** Ce qu'attend le comite d'un candidat speaker : quatre constats. */
export function Attendus() {
  return (
    <Facts
      items={[
        {
          strong: "Une idée neuve ou un regard neuf",
          data: "un angle que le public n'a pas déjà entendu cent fois"
        },
        {
          strong: "Dix-huit minutes, pas une de plus",
          data: "le format TED, exigeant et libérateur"
        },
        {
          strong: "Un lien avec le thème 2027",
          data: "franchir ou s'adapter : la limite, sous toutes ses formes"
        },
        {
          strong: "De l'envie, pas de l'expérience",
          data: "l'équipe vous accompagne : coaching, répétitions, écriture"
        }
      ]}
    />
  );
}
