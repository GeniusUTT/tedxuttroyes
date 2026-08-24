import { Button, Hero } from "@tedxuttroyes/design-system";
import { HERO_FOND } from "./_images";
import { Fige, ScriptActif } from "./_still";

/**
 * Le seuil de l'accueil : la question se tient a cheval sur la ligne
 * rouge, « Franchir » s'arretant au bord et « ou s'adapter ? » repartant
 * de l'autre cote. Seule la typographie display franchit la ligne.
 */
export function Seuil() {
  return (
    <>
      <Fige />
      <ScriptActif />
      <Hero
        word="Franchir"
        sub={"ou s'adapter ?"}
        fig="la limite. Se franchit ou s'apprivoise mais ne s'ignore jamais."
        tickerValue="J-221 · 14:08:36"
        background={{ src: HERO_FOND, width: 1400, height: 933 }}
      >
        <Button href="#">Réserver ma place</Button>
        <Button href="#" variant="ghost">
          Voir le programme
        </Button>
      </Hero>
    </>
  );
}

/** Sans photo de fond : le titre seul sur le noir. */
export function SansFond() {
  return (
    <>
      <Fige />
      <ScriptActif />
      <Hero
        word="Franchir"
        sub={"ou s'adapter ?"}
        fig="la limite. Se franchit ou s'apprivoise mais ne s'ignore jamais."
        tickerValue="J-221 · 14:08:36"
      >
        <Button href="#">Réserver ma place</Button>
      </Hero>
    </>
  );
}

/** Sans telescripteur : quand le compte a rebours n'a plus lieu d'etre. */
export function SansTelescripteur() {
  return (
    <>
      <Fige />
      <ScriptActif />
      <Hero
        word="Franchir"
        sub={"ou s'adapter ?"}
        ticker={false}
        background={{ src: HERO_FOND, width: 1400, height: 933 }}
      >
        <Button href="#">Réserver ma place</Button>
      </Hero>
    </>
  );
}
