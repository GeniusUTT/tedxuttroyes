import { ArchiveStrip } from "@tedxuttroyes/design-system";
import { LIEU, PUBLIC, SCENE, TALK } from "./_images";

/**
 * La bande d'archives : des tirages alignes comme des pieces versees a
 * un dossier. La legende porte le credit photo.
 */
export function Bande() {
  return (
    <ArchiveStrip
      photos={[
        { src: SCENE, alt: "La scène du TEDxUTTroyes 2024", width: 1400, height: 933 },
        { src: PUBLIC, alt: "Le public de l'édition 2023", width: 1400, height: 933 },
        { src: TALK, alt: "Un talk de l'édition 2024", width: 1400, height: 933 },
        { src: LIEU, alt: "Le Centre de Congrès de l'Aube", width: 1280, height: 957 }
      ]}
      caption="Pièces versées au dossier : les éditions 2023 et 2024 · photographies ©argentique utt"
    />
  );
}

/** Sans legende : la bande seule. */
export function SansLegende() {
  return (
    <ArchiveStrip
      photos={[
        { src: SCENE, alt: "La scène du TEDxUTTroyes 2024", width: 1400, height: 933 },
        { src: PUBLIC, alt: "Le public de l'édition 2023", width: 1400, height: 933 }
      ]}
    />
  );
}
