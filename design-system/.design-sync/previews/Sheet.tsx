import { Notice, Sheet } from "@tedxuttroyes/design-system";

/** La feuille de salle complete : l'heure a gauche, le creneau a droite. */
export function FeuilleDeSalle() {
  return (
    <Sheet
      entries={[
        {
          time: "18h00",
          title: "Ouverture des portes et mini forum de recrutement",
          desc: "Contrôle des billets, vestiaire, puis rencontre dans le hall avec les entreprises partenaires et les associations : stages, alternances, premiers emplois."
        },
        {
          time: "19h30",
          title: "Ouverture de la soirée",
          desc: "Le thème est posé : franchir ou s'adapter ?"
        },
        {
          time: "19h45",
          title: "Première session de talks",
          desc: "Trois prises de parole en direct, une vidéo de conférence TED."
        },
        {
          time: "20h50",
          title: "Entracte",
          desc: "Trente minutes pour confronter les premières idées, un verre à la main."
        },
        {
          time: "21h20",
          title: "Seconde session de talks",
          desc: "Trois prises de parole pour finir de faire le tour de la ligne."
        },
        {
          time: "22h30",
          title: "Pôt VIP",
          desc: "Un moment privilégié pour rencontrer les intervenantes et intervenants."
        }
      ]}
    />
  );
}

/** Un extrait, avec la note qui rappelle que les horaires sont indicatifs. */
export function AvecNote() {
  return (
    <div>
      <Sheet
        entries={[
          { time: "19h30", title: "Ouverture de la soirée" },
          {
            time: "19h45",
            title: "Première session de talks",
            desc: "Trois prises de parole en direct, une vidéo de conférence TED."
          }
        ]}
      />
      <Notice>
        Feuille de salle indicative : les horaires précis seront confirmés à l'approche du
        18 mars.
      </Notice>
    </div>
  );
}
