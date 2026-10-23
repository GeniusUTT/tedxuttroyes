import type { ReactNode } from 'react';
import { BILLETTERIE } from './liens';
import { Masque } from './Masque';

// Le bandeau du bas de page. Son bouton porte data-line="plug" : c'est la
// prise où la ligne vient se brancher (voir line-v10.js).

export function Bandeau({
  cote = 'Billetterie',
  titre,
  lead,
  bouton = { href: BILLETTERIE, texte: 'Réserver ma place' },
  autres,
  note = "Billetterie hébergée sur Billetweb. Aucune donnée n'est collectée sur ce site.",
}: {
  cote?: string;
  titre: ReactNode;
  lead?: ReactNode;
  bouton?: { href: string; texte: string };
  // Les boutons secondaires, à côté de la prise.
  autres?: ReactNode;
  note?: string | null;
}) {
  const externe = bouton.href.startsWith('https://');
  return (
    <section className="band">
      <div className="inner">
        <p className="cote">{cote}</p>
        <div className="sec-body">
          <h2 className="band-title">{titre}</h2>
          {lead && <p className="lead">{lead}</p>}
          <div className="actions">
            <a className="btn btn--primary" href={bouton.href} {...(externe && { target: '_blank', rel: 'noopener' })} data-line="plug">
              {bouton.texte}
            </a>
            {autres && <> {autres}</>}
          </div>
          {note && <p className="band-note">{note}</p>}
        </div>
      </div>
    </section>
  );
}

// Le bandeau des archives (fiches speakers et éditions) : la dixième ligne
// du registre, date et thème sous embargo jusqu'au 3 novembre.
export function BandeauRegistre() {
  return (
    <Bandeau
      titre={<>La dixième ligne du registre s'écrira le <Masque texte="18 mars 2027" />.</>}
      lead={<><Masque texte="Franchir ou s'adapter" />&nbsp;? 750 fauteuils au Centre de Congrès de l'Aube pour en décider.</>}
    />
  );
}
