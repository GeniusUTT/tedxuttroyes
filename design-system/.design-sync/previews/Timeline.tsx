import { Timeline } from "@tedxuttroyes/design-system";
import { OUVERTURE, PLANNING, SCENE, TALK } from "./_images";

/**
 * Le deroule illustre de l'accueil : la ligne continue sert de rail et
 * chaque creneau s'allume quand la pointe du trait franchit sa pastille.
 * Les photos sont les seules images arrondies du site : ce sont des
 * illustrations du programme, pas des documents.
 */
export function Deroule() {
  return (
    <Timeline
      entries={[
        {
          time: "18h00",
          title: "Ouverture des portes et mini forum de recrutement",
          desc: "Dans le hall, les entreprises partenaires et les associations rencontrent le public : stages, alternances, premiers emplois.",
          photo: { src: PLANNING, width: 240, height: 120 }
        },
        {
          time: "19h30",
          title: "Ouverture de la soirée",
          desc: "Le thème est posé : franchir ou s'adapter ?",
          photo: { src: OUVERTURE, width: 240, height: 120 }
        },
        {
          time: "19h45",
          title: "Première session de talks",
          desc: "Trois prises de parole en direct, une vidéo de conférence TED.",
          photo: { src: TALK, width: 320, height: 213 }
        },
        {
          time: "21h20",
          title: "Seconde session de talks",
          desc: "Trois prises de parole pour finir de faire le tour de la ligne.",
          photo: { src: SCENE, width: 320, height: 213 }
        }
      ]}
    />
  );
}

/** Sans photos : le deroule se lit en heure, titre et description. */
export function SansPhotos() {
  return (
    <Timeline
      entries={[
        {
          time: "20h50",
          title: "Entracte",
          desc: "Trente minutes pour confronter les premières idées, un verre à la main."
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
