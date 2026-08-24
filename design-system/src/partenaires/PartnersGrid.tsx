export interface Partner {
  /** Le nom du partenaire : il sert de texte alternatif au logo. */
  name: string;
  /** Le logo, en WebP de preference. */
  logo: string;
  /** Le site officiel du partenaire. */
  href: string;
  /** Dimensions natives du logo. */
  width: number;
  height: number;
}

export interface PartnersGridProps {
  /** Les partenaires de l'edition. */
  partners: Partner[];
}

/**
 * La grille des partenaires. Regle TEDx : la feuille plafonne la taille
 * des logos pour qu'ils restent plus petits que le logo de l'evenement.
 * Ne pas contourner ce plafond, et ne jamais poser cette grille sur la
 * page d'accueil.
 */
export function PartnersGrid({ partners }: PartnersGridProps) {
  return (
    <ul className="partners-grid">
      {partners.map((partner) => (
        <li className="partner-tile" key={partner.href}>
          <a href={partner.href} target="_blank" rel="noopener noreferrer">
            <img
              src={partner.logo}
              alt={partner.name}
              width={partner.width}
              height={partner.height}
              loading="lazy"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
