import { BILLETTERIE, INSTAGRAM, NOS_LIENS } from './liens';
import { Masque } from './Masque';

// L'en-tête et le menu mobile du site public. main-v9.js les anime (header au
// défilement, ouverture du menu) : rien ici n'est interactif côté React.

const NAVIGATION = [
  { href: '/', texte: 'Accueil' },
  { href: '/speakers/', texte: 'Speakers' },
  { href: '/programme/', texte: 'Programme' },
  { href: '/editions/', texte: 'Éditions' },
  { href: '/hall-of-fame/', texte: 'Hall of Fame' },
  { href: '/partenaires/', texte: 'Partenaires' },
  { href: '/a-propos/', texte: 'À propos' },
  { href: '/faq/', texte: 'FAQ' },
] as const;

export type Rubrique = (typeof NAVIGATION)[number]['href'];

// « page » quand on est sur la page même de la rubrique, « true » quand on
// est plus bas dans la rubrique (une fiche édition sous Éditions).
export type Actif = { rubrique: Rubrique; courant: 'page' | 'true' };

// La date dans le pied du menu mobile : masquée jusqu'au 3 novembre, en
// clair sur la page cachée, absente sur quelques pages.
export type DateDuMenu = 'masquee' | 'claire' | 'aucune';

const DATE = 'Jeudi 18 mars 2027';
const LIEU = " · 18h00 · Centre de Congrès de l'Aube, Troyes";

// L'espace connecté reprend cet en-tête tel quel : « espace » marque alors
// son bouton comme la rubrique courante.
export function EnTete({ actif, date = 'masquee', espace = false }: { actif?: Actif; date?: DateDuMenu; espace?: boolean }) {
  const courant = (href: string) => (actif?.rubrique === href ? actif.courant : undefined);
  const dansEspace = espace ? 'page' as const : undefined;
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="TEDxUTTroyes, retour à l'accueil">
            <img src="/assets/img/logo-white.png" alt="TEDxUTTroyes" width="500" height="105" />
          </a>

          <nav className="nav-desktop" aria-label="Navigation principale">
            {NAVIGATION.map((l) => (
              <a key={l.href} href={l.href} aria-current={courant(l.href)}>{l.texte}</a>
            ))}
            <a className="btn btn--ghost btn--sm" href={NOS_LIENS} target="_blank" rel="noopener">Nos liens</a>
            <a className="btn btn--ghost btn--sm" href="/espace/" aria-current={dansEspace}>Espace</a>
            <a className="btn btn--primary btn--sm" href={BILLETTERIE} target="_blank" rel="noopener">Réserver</a>
          </nav>

          <div className="header-end">
            <a className="nav-ig" href={INSTAGRAM} target="_blank" rel="noopener" aria-label="Instagram TEDxUTTroyes (nouvelle fenêtre)">
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" />
                <circle cx="12" cy="12" r="4.2" />
                <path d="M17 7h.01" />
              </svg>
            </a>
            <button className="nav-toggle" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="Menu">
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
              <span className="bar" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" id="menu-mobile" role="dialog" aria-modal="true" aria-label="Menu de navigation" hidden>
        <nav aria-label="Navigation mobile">
          <ul className="mobile-menu-list">
            {NAVIGATION.map((l, i) => (
              <li key={l.href} style={{ '--i': i } as React.CSSProperties}>
                <a href={l.href} aria-current={courant(l.href)}>{l.texte}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-foot">
          <a className="btn btn--ghost" href={NOS_LIENS} target="_blank" rel="noopener">Nos liens</a>
          <a className="btn btn--ghost" href="/espace/" aria-current={dansEspace}>Espace speakers et équipe</a>
          <a className="btn btn--primary" href={BILLETTERIE} target="_blank" rel="noopener">Réserver ma place</a>
          {date !== 'aucune' && (
            <p className="mobile-menu-date">
              {date === 'masquee' ? <Masque texte={DATE} /> : DATE}
              {LIEU}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
