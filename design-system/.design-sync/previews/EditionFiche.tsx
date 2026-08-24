import {
  EditionFiche,
  Facts,
  Heading,
  LinkMore,
  Section
} from "@tedxuttroyes/design-system";
import { AFFICHE_2016, PORTRAIT_D } from "./_images";

/**
 * La fiche d'une edition passee : l'affiche a gauche, le dossier a
 * droite. Se pose dans une Section avec bodyClassName="ed-fiche".
 */
export function FicheEdition() {
  return (
    <Section cote="La fiche" bodyClassName="ed-fiche">
      <EditionFiche
        poster={{
          src: AFFICHE_2016,
          alt: "La scène de la première édition : le thème Shape the future",
          width: 840,
          height: 840
        }}
        caption="Document : la scène de la première édition, le 23 novembre 2016"
      >
        <Heading>Le thème</Heading>
        <p>
          Axée sur l'action et l'impact de nos choix actuels, cette édition se penche sur
          la manière dont nous modelons activement le monde de demain.
        </p>
        <Facts
          items={[
            { strong: "23 novembre 2016", data: "édition n° 1 sur 10" },
            { strong: "7 talks", data: "publiés sur la chaîne TEDx Talks" }
          ]}
        />
        <p className="more-row">
          <LinkMore href="#" external>
            voir les talks 2016 sur YouTube
          </LinkMore>
        </p>
      </EditionFiche>
    </Section>
  );
}

/**
 * Le meme gabarit sert aux fiches de speakers d'archive : le portrait
 * remplace l'affiche.
 */
export function FicheSpeaker() {
  return (
    <Section cote="Présentation" bodyClassName="ed-fiche">
      <EditionFiche
        lazy
        poster={{
          src: PORTRAIT_D,
          alt: "Portrait de Gilles Mautin",
          width: 560,
          height: 560
        }}
        caption="Gilles Mautin · TEDxUTTroyes 2016"
      >
        <p className="ed-meta">Domaine : recherche</p>
        <p>
          Chercheur, il a ouvert la première édition de TEDxUTTroyes en novembre 2016,
          devant une salle qui découvrait le format.
        </p>
      </EditionFiche>
    </Section>
  );
}
