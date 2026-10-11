import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Acteur } from '@/lib/acces';
import { FondMarque } from '../../_site/Cadre';
import { EnTete } from '../../_site/EnTete';
import { PiedDePage } from '../../_site/PiedDePage';
import { deconnexion } from '../espace/compte/actions';

// Le gabarit d'une page de l'espace, calqué sur celui d'une page intérieure
// du site public : en-tête et menu du site (le bouton « Espace » marqué
// comme rubrique courante), filigrane, une section de tête (marge technique
// en mono à gauche de la dorsale, titre et chapô à droite), des sections,
// le pied de page avec la mention de licence. La navigation propre à
// l'espace vit sous le titre, en mono, comme une ligne de relevé.

const NAV: Record<Acteur['role'], [string, string][]> = {
  speaker: [['/espace/speaker/', 'Mon dossier'], ['/espace/calendrier/', 'Calendrier'], ['/espace/compte/', 'Mon compte']],
  membre: [['/espace/equipe/', 'Speakers'], ['/espace/calendrier/', 'Calendrier'], ['/espace/equipe/comptes/', 'Comptes'], ['/espace/equipe/edition/', 'Édition'], ['/espace/compte/', 'Mon compte']],
};

export function Cadre({ acteur, actif, cote, titre, chapo, avant, children }: {
  acteur?: Acteur | null;
  actif?: string;
  cote: ReactNode;
  titre: ReactNode;
  chapo?: ReactNode;
  // Sous le chapô, avant la navigation (un message d'état, un formulaire court).
  avant?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <EnTete espace date="aucune" />
      <FondMarque />
      <main id="contenu">
        <div className="sec sec--head">
          <div className="inner">
            <p className="cote">{cote}</p>
            <div className="sec-body">
              <h1 className="page-title">{titre}</h1>
              {chapo && <p className="lead">{chapo}</p>}
              {avant}
              {acteur && (
                <nav className="esp-nav" aria-label="Espace">
                  <ul>
                    {NAV[acteur.role].map(([href, txt]) => (
                      <li key={href}><Link href={href} aria-current={actif === href ? 'page' : undefined}>{txt}</Link></li>
                    ))}
                    <li>
                      <form action={deconnexion}><button type="submit">Se déconnecter</button></form>
                    </li>
                  </ul>
                  <p className="esp-qui">{acteur.nom} · {acteur.role === 'membre' ? 'équipe' : 'speaker'}</p>
                </nav>
              )}
            </div>
          </div>
        </div>
        {children}
      </main>
      <PiedDePage />
    </>
  );
}

// Une section de page : le libellé dans la marge technique, le contenu à
// droite de la dorsale. « alt » pose le fond légèrement plus clair des
// sections alternées du site.
export function Section({ cote, titre, id, alt, children }: { cote: ReactNode; titre?: ReactNode; id?: string; alt?: boolean; children: ReactNode }) {
  return (
    <section className={alt ? 'sec sec--alt' : 'sec'} id={id}>
      <div className="inner">
        <p className="cote">{cote}</p>
        <div className="sec-body">
          {titre && <h2 className="h-md">{titre}</h2>}
          {children}
        </div>
      </div>
    </section>
  );
}

export function Message({ ok, erreur }: { ok?: string | null; erreur?: string | null }) {
  if (erreur) return <p className="esp-message" role="alert">{erreur}</p>;
  if (ok) return <p className="esp-message esp-message--ok" role="status">{ok}</p>;
  return null;
}
