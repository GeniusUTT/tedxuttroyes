import { SpeakerCard, SpeakerGrid } from "@tedxuttroyes/design-system";
import { PORTRAIT_A, PORTRAIT_B } from "./_images";

/** Le registre au complet, tel qu'il se presente avant les annonces. */
export function SixFichesSousEmbargo() {
  return (
    <SpeakerGrid>
      <SpeakerCard id="Intervenant·e 01" />
      <SpeakerCard
        id="Intervenant·e 02"
        redactions={{ name: ["6ch", "5ch"], bio: ["94%", "100%", "47%"], talk: "10ch" }}
      />
      <SpeakerCard
        id="Intervenant·e 03"
        redactions={{ name: ["5ch", "8.5ch"], bio: ["100%", "72%", "84%"], talk: "15ch" }}
      />
      <SpeakerCard
        id="Intervenant·e 04"
        redactions={{ name: ["7ch", "4ch"], bio: ["86%", "100%", "55%"], talk: "11ch" }}
      />
      <SpeakerCard
        id="Intervenant·e 05"
        redactions={{ name: ["5.5ch", "6.5ch"], bio: ["100%", "91%", "38%"], talk: "14ch" }}
      />
      <SpeakerCard
        id="Intervenant·e 06"
        redactions={{ name: ["4ch", "9ch"], bio: ["96%", "79%", "66%"], talk: "12ch" }}
      />
    </SpeakerGrid>
  );
}

/** Les annonces tombent une par une : la grille accueille les deux etats. */
export function AnnoncesEnCours() {
  return (
    <SpeakerGrid>
      <SpeakerCard
        id="Intervenant·e 01"
        name="Alban Michon"
        bio="Explorateur polaire et plongeur, il raconte ce que la glace apprend à ceux qui passent dessous."
        talk="Sous la glace, la limite se déplace"
        photo={{ src: PORTRAIT_A, alt: "Portrait d'Alban Michon" }}
      />
      <SpeakerCard
        id="Intervenant·e 02"
        name="Daniella Tchana"
        bio="Ingénieure et fondatrice, elle travaille sur l'accès à l'énergie dans les villes qui grandissent trop vite."
        talk="Bâtir sans attendre le réseau"
        photo={{ src: PORTRAIT_B, alt: "Portrait de Daniella Tchana" }}
      />
      <SpeakerCard
        id="Intervenant·e 03"
        redactions={{ name: ["5ch", "8.5ch"], bio: ["100%", "72%", "84%"], talk: "15ch" }}
      />
    </SpeakerGrid>
  );
}
