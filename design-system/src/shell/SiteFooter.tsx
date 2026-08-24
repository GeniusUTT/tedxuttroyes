import { LOGO_HEIGHT, LOGO_TEDXUTTROYES, LOGO_WIDTH } from "../assets.generated";
import {
  BILLETTERIE_URL,
  CONTACT_MAIL,
  MENTION_LICENCE,
  NAV,
  TEDX_PROGRAMME_URL
} from "../types";
import { VisuallyHidden } from "../base/VisuallyHidden";

export interface SiteFooterProps {
  /**
   * Ancre du trace de la ligne continue : reserve a l'accueil, ou la
   * mention de licence est le point final du trait.
   */
  finale?: boolean;
}

/**
 * Le pied de page du site. La mention de licence TED en fait partie et
 * n'est pas optionnelle : elle doit figurer sur chaque page.
 */
export function SiteFooter({ finale = false }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="finner">
        <div className="footer-grid">
          <div className="footer-brand">
            <img
              src={LOGO_TEDXUTTROYES}
              alt="TEDxUTTroyes"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
            />
            <p className="footer-licence" {...(finale ? { "data-line": "finale" } : {})}>
              {MENTION_LICENCE}
            </p>
          </div>

          <nav aria-label="Navigation de pied de page">
            <h2 className="footer-title">Explorer</h2>
            <ul className="footer-list">
              {NAV.filter((entry) => entry.key !== "accueil").map((entry) => (
                <li key={entry.key}>
                  <a href={entry.href}>{entry.footerLabel ?? entry.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="footer-title">L'événement</h2>
            <ul className="footer-list">
              <li>
                <a href={BILLETTERIE_URL} target="_blank" rel="noopener">
                  Réserver ma place
                </a>
              </li>
              <li>
                <a href="/devenir-speaker/">Devenir speaker</a>
              </li>
              <li>
                <a href={TEDX_PROGRAMME_URL} target="_blank" rel="noopener">
                  Le programme TEDx
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@TEDx" target="_blank" rel="noopener">
                  Chaîne TEDx Talks
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
            </ul>
          </div>

          <nav aria-label="Réseaux sociaux">
            <h2 className="footer-title">Suivre</h2>
            <ul className="footer-list">
              <li>
                <a
                  href="https://www.instagram.com/tedxuttroyes/"
                  target="_blank"
                  rel="noopener"
                >
                  Instagram TEDxUTTroyes
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/tedx-uttroyes/"
                  target="_blank"
                  rel="noopener"
                >
                  LinkedIn TEDxUTTroyes
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/geniusutt/" target="_blank" rel="noopener">
                  Instagram Genius UTT
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/genius-utt/"
                  target="_blank"
                  rel="noopener"
                >
                  LinkedIn Genius UTT
                  <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
                </a>
              </li>
            </ul>
          </nav>

          <div className="footer-contact">
            <h2 className="footer-title">Contact</h2>
            <p>
              Une question, une idée, un partenariat ? L'équipe de Genius UTT répond par
              e-mail, sans formulaire ni robot.
            </p>
            <a className="btn btn--ghost btn--sm" href={`mailto:${CONTACT_MAIL}`}>
              Nous écrire
            </a>
            <a className="footer-mail" href={`mailto:${CONTACT_MAIL}`}>
              {CONTACT_MAIL}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2027 TEDxUTTroyes · Genius UTT, Université de Technologie de Troyes
          </span>
          <a href="/mentions-legales/">Mentions légales</a>
          <span>Site statique, sans cookies ni traceurs</span>
        </div>
      </div>
    </footer>
  );
}
