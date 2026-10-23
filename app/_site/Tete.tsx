import { SITE } from './liens';

// Le titre, la description et l'aperçu de partage d'une page. Pas l'API
// Metadata de Next : une balise masquée jusqu'au 3 novembre porte sa version
// d'origine dans data-reveal (voir reveal-v3.js), ce que l'API ne sait pas
// écrire. React place ces balises dans le <head> de lui-même.

// Un texte sous embargo : ce qu'on montre aujourd'hui, ce qui reviendra le
// 3 novembre. Une simple chaîne quand rien n'est masqué.
export type Voile = string | { masque: string; vrai: string };

function Meta({ cle, valeur }: { cle: { name: string } | { property: string }; valeur: Voile }) {
  if (typeof valeur === 'string') return <meta {...cle} content={valeur} />;
  return <meta {...cle} content={valeur.masque} data-reveal-attr="content" data-reveal={valeur.vrai} />;
}

export type Partage = {
  titre?: Voile;
  description?: Voile;
  image: string;
  largeur?: number;
  hauteur?: number;
  alt?: Voile;
  type?: 'website' | 'article' | 'profile';
  // Grande image par défaut ; « summary » pour un portrait carré.
  carte?: 'summary' | 'summary_large_image';
};

// L'aperçu de partage de la dixième édition, commun à la plupart des pages.
// L'image porte la date masquée : le 3 novembre, il faudra la remplacer par
// og-2027-revele.jpg, ce que reveal-v3.js ne peut pas faire sur un JPEG.
export const PARTAGE_2027: Partage = {
  image: '/assets/img/og/og-2027-v2.jpg',
  largeur: 1200,
  hauteur: 630,
  alt: {
    masque: "TEDxUTTroyes 2027, dixième édition, au Centre de Congrès de l'Aube, Troyes.",
    vrai: "TEDxUTTroyes 2027, dixième édition : Franchir ou s'adapter ? Jeudi 18 mars 2027 au Centre de Congrès de l'Aube, Troyes.",
  },
};

export function Tete({
  titre,
  description,
  chemin,
  robots,
  partage,
}: {
  titre: Voile;
  description?: Voile;
  chemin?: string;
  robots?: string;
  partage?: Partage;
}) {
  const image = partage && (partage.image.startsWith('http') ? partage.image : SITE + partage.image);
  return (
    <>
      {typeof titre === 'string' ? <title>{titre}</title> : <title data-reveal={titre.vrai}>{titre.masque}</title>}
      {description && <Meta cle={{ name: 'description' }} valeur={description} />}
      {chemin && <link rel="canonical" href={SITE + chemin} />}
      {robots && <meta name="robots" content={robots} />}
      {partage && image && (
        <>
          <meta property="og:type" content={partage.type ?? 'website'} />
          <meta property="og:site_name" content="TEDxUTTroyes" />
          <meta property="og:locale" content="fr_FR" />
          {chemin && <meta property="og:url" content={SITE + chemin} />}
          <Meta cle={{ property: 'og:title' }} valeur={partage.titre ?? titre} />
          {(partage.description ?? description) && (
            <Meta cle={{ property: 'og:description' }} valeur={(partage.description ?? description)!} />
          )}
          <meta property="og:image" content={image} />
          {partage.largeur && <meta property="og:image:width" content={String(partage.largeur)} />}
          {partage.hauteur && <meta property="og:image:height" content={String(partage.hauteur)} />}
          {partage.alt && <Meta cle={{ property: 'og:image:alt' }} valeur={partage.alt} />}
          <meta name="twitter:card" content={partage.carte ?? 'summary_large_image'} />
          <Meta cle={{ name: 'twitter:title' }} valeur={partage.titre ?? titre} />
          {(partage.description ?? description) && (
            <Meta cle={{ name: 'twitter:description' }} valeur={(partage.description ?? description)!} />
          )}
          <meta name="twitter:image" content={image} />
        </>
      )}
    </>
  );
}

// Les données structurées d'une page (schema.org), telles quelles.
export function JsonLd({ donnees }: { donnees: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(donnees) }} />;
}
