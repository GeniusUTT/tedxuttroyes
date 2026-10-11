import type { Viewport } from 'next';
import { Cadre } from './_site/Cadre';
import { Document } from './_site/Document';
import { SCRIPTS } from './_site/liens';
import { Tete } from './_site/Tete';

// La 404 du site, pour toute adresse que ni le site public ni l'espace ne
// connaissent. Le site a plusieurs layouts racine (pages, espace) : seul ce
// fichier peut couvrir toutes les adresses, et il est rendu en entier côté
// serveur, là où un not-found.tsx de groupe n'envoyait qu'une coquille vide
// à remplir par JavaScript. Il ne passe par aucun layout, d'où le Document ;
// Next y ajoute de lui-même la balise robots noindex.
// La notice signale la page cachée sans la lier : le jeu de piste doit
// rester résoluble par la FAQ.

export const viewport: Viewport = { themeColor: '#080808' };

export default function Introuvable() {
  return (
    <Document corps="parcours" scripts={[SCRIPTS.devoilement, SCRIPTS.principal, SCRIPTS.ligne]}>
      <Cadre>
        <Tete
          titre="Page introuvable | TEDxUTTroyes"
          description="La page demandée n'existe pas ou plus sur tedxuttroyes.fr."
        />

        <div className="error-hero">
          <div className="inner">
            <p className="cote">Erreur 404</p>
            <div className="sec-body">
              <p className="error-code" aria-hidden="true">404</p>
              <h1>Cette page est hors limite</h1>
              <p className="lead">L'adresse demandée n'existe pas, ou n'existe plus. Reprenons depuis la ligne de départ.</p>
              <div className="actions">
                <a className="btn btn--primary" href="/" data-line="plug">Retour à l'accueil</a>{' '}
                <a className="btn btn--ghost" href="/faq/">Consulter la FAQ</a>
              </div>
              <p className="notice">Une page de ce site n'est dans aucun menu, et elle donne une place pour la dixième édition. <a href="/faq/">La FAQ dit comment la trouver.</a></p>
            </div>
          </div>
        </div>
      </Cadre>
    </Document>
  );
}
