import { HofYear } from "@tedxuttroyes/design-system";
import {
  PORTRAIT_A,
  PORTRAIT_B,
  PORTRAIT_C,
  PORTRAIT_D,
  PORTRAIT_JEANMICHEL,
  PORTRAIT_NICOLAS
} from "./_images";

/* Chaque portrait est celui de la personne nommee : un registre de voix
   qui associe un visage a un autre nom n'a aucune valeur. */

/**
 * Une annee du Hall of Fame : le titre ouvre l'edition, chaque carte
 * ouvre la fiche de la personne.
 */
export function UneAnnee() {
  return (
    <HofYear
      year="2026"
      theme="Un futur à bâtir"
      href="/editions/edition-2026/"
      people={[
        { name: "Alban Michon", href: "#", photo: PORTRAIT_A },
        { name: "Daniella Tchana", href: "#", photo: PORTRAIT_B },
        { name: "Franck Robin", href: "#", photo: PORTRAIT_C },
        { name: "Jean-Michel Adélaïde", href: "#", photo: PORTRAIT_JEANMICHEL }
      ]}
    />
  );
}

/** Deux annees a la suite, comme sur la page. */
export function DeuxAnnees() {
  return (
    <div>
      <HofYear
        year="2026"
        theme="Un futur à bâtir"
        href="#"
        people={[
          { name: "Alban Michon", href: "#", photo: PORTRAIT_A },
          { name: "Daniella Tchana", href: "#", photo: PORTRAIT_B }
        ]}
      />
      <HofYear
        year="2016"
        theme="Shape the future"
        href="#"
        people={[{ name: "Gilles Mautin", href: "#", photo: PORTRAIT_D }]}
      />
    </div>
  );
}

/** Un nom long : la carte accepte les patronymes qui debordent. */
export function NomLong() {
  return (
    <HofYear
      year="2026"
      theme="Un futur à bâtir"
      href="#"
      people={[
        { name: "Nicolas Dehandschoewercker", href: "#", photo: PORTRAIT_NICOLAS },
        { name: "Jean-Michel Adélaïde", href: "#", photo: PORTRAIT_JEANMICHEL }
      ]}
    />
  );
}
