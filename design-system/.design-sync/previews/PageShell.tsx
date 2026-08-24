import {
  Actions,
  Band,
  Button,
  Heading,
  Lead,
  PageHead,
  PageShell,
  Section
} from "@tedxuttroyes/design-system";
import { Fige } from "./_still";

/**
 * La page complete : lien d'evitement, bandeau de tete, contenu, pied de
 * page. C'est le point de depart de toute nouvelle page du site. Le pied
 * de page porte la mention de licence TED, qui est obligatoire.
 */
export function PageInterieure() {
  return (
    <>
      <Fige />
      <PageShell current="a-propos">
        <PageHead
          cote="L'esprit"
          title="À propos"
          lead="Un événement local, une licence internationale, une même conviction : les idées méritent d'être partagées."
        />
        <Section cote="TED, TEDx, Troyes">
          <Heading>Une scène troyenne depuis 2016</Heading>
          <Lead>
            TEDxUTTroyes est organisé par les étudiantes et étudiants de Genius UTT,
            association de l'Université de Technologie de Troyes.
          </Lead>
        </Section>
        <Band title="Les talks se regardent en ligne. Les idées se vivent en salle.">
          <Actions>
            <Button href="#">Réserver ma place</Button>
          </Actions>
        </Band>
      </PageShell>
    </>
  );
}

/**
 * Sans pied de page : le seul cas du site est la page 404. Ne pas
 * l'utiliser ailleurs, la mention de licence doit figurer partout.
 */
export function SansPied() {
  return (
    <>
      <Fige />
      <PageShell footer={false}>
        <PageHead cote="Le cadre" title="Mentions légales" />
      </PageShell>
    </>
  );
}
