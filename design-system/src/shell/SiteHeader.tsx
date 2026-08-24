import { LOGO_HEIGHT, LOGO_TEDXUTTROYES, LOGO_WIDTH } from "../assets.generated";
import { BILLETTERIE_URL, DATE_LONGUE, LIEU, NAV } from "../types";
import type { NavKey } from "../types";

export interface SiteHeaderProps {
  /** La page courante : son entree de navigation porte aria-current. */
  current?: NavKey;
}

/**
 * Le bandeau de tete du site : logo, navigation, deux boutons, et le
 * menu mobile qui va avec (le bouton burger le pilote). Les deux
 * partent ensemble : le menu porte l'identifiant que le bouton vise.
 */
export function SiteHeader({ current }: SiteHeaderProps) {
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="/" aria-label="TEDxUTTroyes, retour à l'accueil">
            <img
              src={LOGO_TEDXUTTROYES}
              alt="TEDxUTTroyes"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
          </a>

          <nav className="nav-desktop" aria-label="Navigation principale">
            {NAV.map((entry) => (
              <a
                key={entry.key}
                href={entry.href}
                {...(current === entry.key ? { "aria-current": "page" as const } : {})}
              >
                {entry.label}
              </a>
            ))}
            <a className="btn btn--ghost btn--sm" href="/devenir-speaker/">
              Postuler
            </a>
            {/* PLACEHOLDER : remplacer par le vrai lien HelloAsso de billetterie */}
            <a
              className="btn btn--primary btn--sm"
              href={BILLETTERIE_URL}
              target="_blank"
              rel="noopener"
            >
              Réserver
            </a>
          </nav>

          <button
            className="nav-toggle"
            type="button"
            aria-expanded="false"
            aria-controls="menu-mobile"
            aria-label="Menu"
          >
            <span className="bar" aria-hidden="true" />
            <span className="bar" aria-hidden="true" />
            <span className="bar" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className="mobile-menu"
        id="menu-mobile"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
        hidden
      >
        <nav aria-label="Navigation mobile">
          <ul className="mobile-menu-list">
            {NAV.map((entry, index) => (
              <li key={entry.key} style={{ ["--i" as string]: index }}>
                <a
                  href={entry.href}
                  {...(current === entry.key ? { "aria-current": "page" as const } : {})}
                >
                  {entry.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu-foot">
          <a className="btn btn--ghost" href="/devenir-speaker/">
            Postuler comme speaker
          </a>
          {/* PLACEHOLDER : remplacer par le vrai lien HelloAsso de billetterie */}
          <a
            className="btn btn--primary"
            href={BILLETTERIE_URL}
            target="_blank"
            rel="noopener"
          >
            Réserver ma place
          </a>
          <p className="mobile-menu-date">
            {DATE_LONGUE} · 18h00 · {LIEU}
          </p>
        </div>
      </div>
    </>
  );
}
