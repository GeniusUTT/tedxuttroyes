import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function Faq() {
  return (
    <Cadre actif={{ rubrique: "/faq/", courant: "page" }}>
      <Tete
        titre="FAQ pratique | TEDxUTTroyes 2027"
        description={{ masque: "Horaires, accès, billetterie, accessibilité : tout ce qu'il faut savoir avant la soirée TEDxUTTroyes du ***** ** **** **** au Centre de Congrès de l'Aube, à Troyes.", vrai: "Horaires, accès, billetterie, accessibilité : tout ce qu'il faut savoir avant la soirée TEDxUTTroyes du jeudi 18 mars 2027 au Centre de Congrès de l'Aube, à Troyes." }}
        chemin="/faq/"
        partage={{ ...PARTAGE_2027, description: { masque: "Horaires, accès, billetterie, accessibilité : tout savoir avant la soirée du ** **** ****.", vrai: "Horaires, accès, billetterie, accessibilité : tout savoir avant la soirée du 18 mars 2027." } }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Infos pratiques</p>
          <div className="sec-body">
            <h1 className="page-title a a2">FAQ</h1>
            <p className="lead a a3">Billets, horaires, accès au Centre de Congrès de l'Aube : les réponses aux questions qui reviennent. Il en manque une ? Écrivez-nous.</p>
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="inner">
          <p className="cote">Questions, réponses</p>
          <div className="sec-body">
            <div className="faq-group">
              <h2 className="h-md">Billetterie</h2>
              <details className="faq">
                <summary>Comment réserver ma place ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>La billetterie est hébergée sur Billetweb : cliquez sur « Réserver ma place » depuis n'importe quelle page du site. Votre billet, envoyé par e-mail, sera à présenter à l'entrée, sur téléphone ou imprimé. </p>
                </div>
              </details>
              <details className="faq">
                <summary>Combien coûte un billet ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Tous les tarifs sont détaillés sur la billetterie Billetweb, en cliquant sur « Réserver ma place » depuis n'importe quelle page du site.</p>
                </div>
              </details>
              <details className="faq">
                <summary>Puis-je me faire rembourser ou céder mon billet ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Pour un échange ou un remboursement, écrivez à <a href="mailto:geniusutt@utt.fr">geniusutt@utt.fr</a> : l'équipe de Genius UTT traite chaque demande au cas par cas.</p>
                </div>
              </details>
            </div>
            <div className="faq-group" data-line-flank="">
              <h2 className="h-md">Horaires</h2>
              <details className="faq">
                <summary>À quelle heure faut-il arriver ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Les portes ouvrent à 18h00 avec un mini forum de recrutement dans le hall, et les talks commencent à 19h30 précises. Prévoyez d'être sur place au moins un quart d'heure avant les talks.</p>
                </div>
              </details>
              <details className="faq">
                <summary>À quelle heure se termine la soirée ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>La soirée se termine autour de 22h30, suivie d'un moment d'échange avec les intervenantes et intervenants dans le hall jusqu'à minuit.</p>
                </div>
              </details>
            </div>
            <div className="faq-group">
              <h2 className="h-md">Accès</h2>
              <details className="faq">
                <summary>Comment venir au Centre de Congrès de l'Aube ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Le Centre de Congrès de l'Aube se trouve au 2 rue Pierre Labonde, à Troyes, en plein centre-ville. Comptez environ un quart d'heure à pied depuis la gare de Troyes ; le site est aussi desservi par le réseau de bus TCAT et des parkings publics se trouvent à proximité immédiate.</p>
                </div>
              </details>
              <details className="faq">
                <summary>L'accès est-il possible en fauteuil roulant ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Oui, la salle est accessible aux personnes à mobilité réduite. Signalez votre venue par e-mail à <a href="mailto:geniusutt@utt.fr">geniusutt@utt.fr</a> pour que l'équipe prépare au mieux votre accueil.</p>
                </div>
              </details>
            </div>
            <div className="faq-group" data-line-flank="">
              <h2 className="h-md">Sur place</h2>
              <details className="faq">
                <summary>La soirée est-elle filmée ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Oui. Comme à chaque édition, les talks sont filmés puis publiés sur la chaîne YouTube TEDx Talks. En assistant à l'événement, vous acceptez de pouvoir apparaître à l'image parmi le public.</p>
                </div>
              </details>
              <details className="faq">
                <summary>Y a-t-il un dress code ou un âge minimum ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <p>Une tenue décente et soignée est attendue. L'événement est tout public.</p>
                </div>
              </details>
            </div>
            <div className="faq-group">
              <h2 className="h-md">Le jeu de piste</h2>
              <details className="faq">
                <summary>Il paraît qu'une page du site n'est dans aucun menu ?<svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M6 9l6 6 6-6" /> </svg></summary>
                <div className="faq-a">
                  <ul>
                    <li>Mon premier est le programme de conférences indépendantes sous licence duquel notre soirée dépend. </li>
                    <li>Mon second est notre école bien aimée, à Troyes.</li>
                    <li>Mon troisième est le rang de cette édition dans la série, écrit en chiffres, suivi de la lettre « e ».</li>
                    <li>Mon tout s'écrit tout en minuscules, ses trois morceaux reliés par des traits d'union.</li>
                  </ul>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <Bandeau
        cote="Contact"
        titre="Une autre question ?"
        lead="L'équipe de Genius UTT répond par e-mail, sans formulaire ni robot."
        bouton={{ href: "mailto:geniusutt@utt.fr?subject=Question%20TEDxUTTroyes%202027", texte: "Nous écrire" }}
        note={null}
      />
    </Cadre>
  );
}
