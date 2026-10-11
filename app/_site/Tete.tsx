import { SITE } from './liens';

// Le titre, la description et l'aperçu de partage d'une page. Pas l'API
// Metadata de Next : une balise masquée jusqu'au 31 octobre porte sa version
// d'origine dans data-reveal (voir reveal-v2.js), ce que l'API ne sait pas
// écrire. React place ces balises dans le <head> de lui-même.

// Un texte sous embargo : ce qu'on montre aujourd'hui, ce qui reviendra le
// 31 octobre. Une simple chaîne quand rien n'est masqué.
export type Voile = string | { masque: string; vrai: string };

function Meta({ cle, valeur }: { cle: { name: string } | { property: string }; valeur: Voile }) {
  if (typeof valeur === 'string') return <meta {...cle} content={valeur} />;
  return <meta {...cle} content={valeur.masque} data-reveal-attr="content" data-reveal={valeur.vrai} />;
}

export type Partage = {
  titre?: string;
  description?: Voile;
  image: string;
  largeur?: number;
  hauteur?: number;
  alt?: Voile;
  type?: 'website' | 'article' | 'profile';
};

export function Tete({
  titre,
  description,
  chemin,
  robots,
  partage,
}: {
  titre: string;
  description?: Voile;
  chemin?: string;
  robots?: string;
  partage?: Partage;
}) {
  const image = partage && (partage.image.startsWith('http') ? partage.image : SITE + partage.image);
  return (
    <>
      <title>{titre}</title>
      {description && <Meta cle={{ name: 'description' }} valeur={description} />}
      {chemin && <link rel="canonical" href={SITE + chemin} />}
      {robots && <meta name="robots" content={robots} />}
      {partage && image && (
        <>
          <meta property="og:type" content={partage.type ?? 'website'} />
          <meta property="og:site_name" content="TEDxUTTroyes" />
          <meta property="og:locale" content="fr_FR" />
          {chemin && <meta property="og:url" content={SITE + chemin} />}
          <meta property="og:title" content={partage.titre ?? titre} />
          {(partage.description ?? description) && (
            <Meta cle={{ property: 'og:description' }} valeur={(partage.description ?? description)!} />
          )}
          <meta property="og:image" content={image} />
          {partage.largeur && <meta property="og:image:width" content={String(partage.largeur)} />}
          {partage.hauteur && <meta property="og:image:height" content={String(partage.hauteur)} />}
          {partage.alt && <Meta cle={{ property: 'og:image:alt' }} valeur={partage.alt} />}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={partage.titre ?? titre} />
          {(partage.description ?? description) && (
            <Meta cle={{ name: 'twitter:description' }} valeur={(partage.description ?? description)!} />
          )}
          <meta name="twitter:image" content={image} />
        </>
      )}
    </>
  );
}
