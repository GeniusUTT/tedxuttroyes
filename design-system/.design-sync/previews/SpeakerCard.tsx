import { SpeakerCard, SpeakerGrid } from "@tedxuttroyes/design-system";
import { PORTRAIT_A } from "./_images";

/**
 * L'etat par defaut : tant que le nom n'est pas renseigne, la fiche
 * reste sous embargo. Le portrait est remplace par une mention, le nom
 * et la bio par des barres de caviardage.
 */
export function SousEmbargo() {
  return (
    <SpeakerGrid>
      <SpeakerCard id="Intervenant·e 01" />
    </SpeakerGrid>
  );
}

/** L'annonce faite : renseigner name suffit a lever l'embargo. */
export function Annonce() {
  return (
    <SpeakerGrid>
      <SpeakerCard
        id="Intervenant·e 01"
        name="Alban Michon"
        bio="Explorateur polaire et plongeur, il raconte ce que la glace apprend à ceux qui passent dessous."
        talk="Sous la glace, la limite se déplace"
        photo={{ src: PORTRAIT_A, alt: "Portrait d'Alban Michon" }}
      />
    </SpeakerGrid>
  );
}

/** Le registre en cours d'annonce : les barres tombent une par une. */
export function RegistreMixte() {
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
        redactions={{ name: ["6ch", "5ch"], bio: ["94%", "100%", "47%"], talk: "10ch" }}
      />
      <SpeakerCard
        id="Intervenant·e 03"
        redactions={{ name: ["5ch", "8.5ch"], bio: ["100%", "72%", "84%"], talk: "15ch" }}
      />
    </SpeakerGrid>
  );
}
