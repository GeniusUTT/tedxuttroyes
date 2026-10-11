import { BILLETTERIE, CONTACT, INSTAGRAM, INSTAGRAM_GENIUS, LINKEDIN, LINKEDIN_GENIUS } from './liens';

// Le pied de page, avec la mention de licence que TED exige sur chaque page.

const NOUVELLE_FENETRE = <span className="visually-hidden"> (nouvelle fenêtre)</span>;

// Sur l'accueil, la mention de licence est le dernier point du tracé de la
// ligne (data-line="finale").
export function PiedDePage({ finale = false }: { finale?: boolean }) {
  return (
    <footer className="site-footer">
      <div className="finner">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/img/logo-white.png" alt="TEDxUTTroyes" width="500" height="105" />
            <p className="footer-licence" data-line={finale ? 'finale' : undefined}>Cet événement TEDx indépendant est organisé sous licence de TED.</p>
          </div>
          <nav aria-label="Navigation de pied de page">
            <h2 className="footer-title">Explorer</h2>
            <ul className="footer-list">
              <li><a href="/speakers/">Speakers</a></li>
              <li><a href="/programme/">Programme</a></li>
              <li><a href="/editions/">Éditions passées</a></li>
              <li><a href="/hall-of-fame/">Hall of Fame</a></li>
              <li><a href="/partenaires/">Partenaires</a></li>
              <li><a href="/a-propos/">À propos</a></li>
              <li><a href="/faq/">FAQ pratique</a></li>
            </ul>
          </nav>
          <div>
            <h2 className="footer-title">L'événement</h2>
            <ul className="footer-list">
              <li><a href={BILLETTERIE} target="_blank" rel="noopener">Réserver ma place</a></li>
              <li><a href="/devenir-speaker/">Devenir speaker</a></li>
              <li><a href="https://www.ted.com/tedx" target="_blank" rel="noopener">Le programme TEDx{NOUVELLE_FENETRE}</a></li>
              <li><a href="https://www.youtube.com/@TEDx" target="_blank" rel="noopener">Chaîne TEDx Talks{NOUVELLE_FENETRE}</a></li>
            </ul>
          </div>
          <nav aria-label="Réseaux sociaux">
            <h2 className="footer-title">Suivre</h2>
            <ul className="footer-list">
              <li><a href={INSTAGRAM} target="_blank" rel="noopener">Instagram TEDxUTTroyes{NOUVELLE_FENETRE}</a></li>
              <li><a href={LINKEDIN} target="_blank" rel="noopener">LinkedIn TEDxUTTroyes{NOUVELLE_FENETRE}</a></li>
              <li><a href={INSTAGRAM_GENIUS} target="_blank" rel="noopener">Instagram Genius UTT{NOUVELLE_FENETRE}</a></li>
              <li><a href={LINKEDIN_GENIUS} target="_blank" rel="noopener">LinkedIn Genius UTT{NOUVELLE_FENETRE}</a></li>
            </ul>
          </nav>
          <div className="footer-contact">
            <h2 className="footer-title">Contact</h2>
            <p>Une question, une idée, un partenariat ? L'équipe de Genius UTT répond par e-mail, sans formulaire ni robot.</p>
            <a className="btn btn--ghost btn--sm" href={`mailto:${CONTACT}`}>Nous écrire</a>{' '}
            <a className="footer-mail" href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2027 TEDxUTTroyes · Genius UTT, Université de Technologie de Troyes</span>{' '}
          <a href="/mentions-legales/">Mentions légales</a>{' '}
          <span>Site public sans cookie</span>
        </div>
      </div>
    </footer>
  );
}
