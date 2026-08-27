import { FaqItem } from "@tedxuttroyes/design-system";

/**
 * Une question : un depliant natif, sans JavaScript. Le chevron tourne a
 * l'ouverture.
 */
export function Question() {
  return (
    <FaqItem question="Comment réserver ma place ?">
      <p>
        La billetterie est hébergée sur Billetweb : cliquez sur « Réserver ma place »
        depuis n'importe quelle page du site. Votre billet, envoyé par e-mail, sera à
        présenter à l'entrée, sur téléphone ou imprimé.
      </p>
    </FaqItem>
  );
}

/** Plusieurs questions a la suite : le filet les separe. */
export function Serie() {
  return (
    <div>
      <FaqItem question="À quelle heure faut-il arriver ?">
        <p>
          Les portes ouvrent à 18h00 avec un mini forum de recrutement dans le hall, et
          les talks commencent à 19h30 précises.
        </p>
      </FaqItem>
      <FaqItem question="À quelle heure se termine la soirée ?">
        <p>
          La soirée se termine autour de 22h30, suivie d'un moment d'échange avec les
          intervenantes et intervenants dans le hall.
        </p>
      </FaqItem>
      <FaqItem question="La soirée est-elle filmée ?">
        <p>
          Oui. Comme à chaque édition, les talks sont filmés puis publiés sur la chaîne
          YouTube TEDx Talks.
        </p>
      </FaqItem>
    </div>
  );
}

/** Une reponse avec un lien de contact. */
export function AvecLien() {
  return (
    <FaqItem question="L'accès est-il possible en fauteuil roulant ?">
      <p>
        Oui, la salle est accessible aux personnes à mobilité réduite. Signalez votre
        venue par e-mail à <a href="mailto:geniusutt@utt.fr">geniusutt@utt.fr</a> pour que
        l'équipe prépare au mieux votre accueil.
      </p>
    </FaqItem>
  );
}
