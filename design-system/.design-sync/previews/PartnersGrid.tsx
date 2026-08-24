import { PartnersGrid } from "@tedxuttroyes/design-system";
import { LOGO_FONDATION, LOGO_TCAT, LOGO_TROYES, LOGO_UTT } from "./_images";

/**
 * La grille des partenaires. Regle TEDx : la feuille plafonne la taille
 * des logos pour qu'ils restent plus petits que le logo de l'evenement.
 * Ne jamais poser cette grille sur la page d'accueil.
 */
export function Grille() {
  return (
    <PartnersGrid
      partners={[
        {
          name: "Université de Technologie de Troyes",
          logo: LOGO_UTT,
          href: "https://www.utt.fr/",
          width: 233,
          height: 240
        },
        {
          name: "Fondation UTT",
          logo: LOGO_FONDATION,
          href: "https://fondation-utt.odoo.com/",
          width: 600,
          height: 169
        },
        {
          name: "Troyes Champagne Métropole",
          logo: LOGO_TROYES,
          href: "https://troyes-champagne-metropole.fr/",
          width: 500,
          height: 196
        },
        {
          name: "TCAT, transports en commun de l'agglomération troyenne",
          logo: LOGO_TCAT,
          href: "https://tcat.fr/",
          width: 240,
          height: 240
        }
      ]}
    />
  );
}

/** Deux partenaires seulement : la grille reste alignee a gauche. */
export function DeuxPartenaires() {
  return (
    <PartnersGrid
      partners={[
        {
          name: "Université de Technologie de Troyes",
          logo: LOGO_UTT,
          href: "#",
          width: 233,
          height: 240
        },
        {
          name: "Fondation UTT",
          logo: LOGO_FONDATION,
          href: "#",
          width: 600,
          height: 169
        }
      ]}
    />
  );
}
