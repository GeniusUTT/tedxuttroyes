import { INSTAGRAM } from './liens';

// L'invitation à suivre le compte Instagram (demande de Baptiste le
// 2026-11-02, à la place de l'icône de l'en-tête) : une carte fixe, en bas
// de l'écran sur téléphone, en bas à droite en bureau. Du HTML et rien
// d'autre : elle naît cachée (hidden), et c'est main-v10.js qui la montre
// après un écran défilé, trace son contour rouge, gère le partage et
// retient sa fermeture pendant sept jours (clé tedx-invite-vue, décrite
// dans les mentions légales). Elle vit hors de .jscroll sur l'accueil : un
// élément fixe posé dedans suivrait le wrapper translaté.
//
// Absente de la page cachée (un partage publierait son adresse) et de
// l'espace connecté.

export function Invitation() {
  return (
    <aside className="invite" id="invite" aria-labelledby="invite-titre" hidden>
      <svg className="invite-trait" aria-hidden="true" focusable="false">
        <rect x="0" y="0" width="100%" height="100%" />
      </svg>
      <p className="invite-cote">Instagram · @tedxuttroyes</p>
      <p className="invite-titre" id="invite-titre">Suivez la dixième édition</p>
      <p className="invite-texte">Annonces des speakers, coulisses et derniers préparatifs : tout passe d'abord par notre compte.</p>
      <div className="invite-actions">
        <a className="btn btn--primary btn--sm invite-suivre" href={INSTAGRAM} target="_blank" rel="noopener">
          S'abonner<span className="visually-hidden"> au compte Instagram @tedxuttroyes (nouvelle fenêtre)</span>
        </a>
        <button className="btn btn--ghost btn--sm invite-partage" type="button">Partager</button>
      </div>
      <p className="invite-etat" role="status" aria-live="polite" />
      <button className="invite-fermer" type="button" aria-label="Fermer l'invitation">
        <svg className="icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      </button>
    </aside>
  );
}
