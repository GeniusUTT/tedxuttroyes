import { Cadre } from '../../_site/Cadre';
import { CONTACT } from '../../_site/liens';
import { Tete } from '../../_site/Tete';

const CONTACT_LIEN = <a href={`mailto:${CONTACT}`}>{CONTACT}</a>;

export default function MentionsLegales() {
  return (
    <Cadre>
      <Tete
        titre="Mentions légales | TEDxUTTroyes"
        description="Mentions légales du site tedxuttroyes.fr : éditeur, hébergeur, propriété intellectuelle et données personnelles."
        chemin="/mentions-legales/"
        robots="noindex, follow"
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Le cadre</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Mentions légales</h1>
          </div>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="inner">
          <p className="cote">Document</p>
          <div className="sec-body">
            <div className="prose" data-line-flank="">
              <h2>Éditeur du site</h2>
              <p>Le site tedxuttroyes.fr est édité par l'association <strong>Genius UTT</strong>, association étudiante de l'Université de Technologie de Troyes, 12 rue Marie Curie, 10300 Troyes. <strong>83064160100018</strong></p>
              <p>Directeur ou directrice de la publication : <strong>Baptiste HUSTAIX</strong></p>
              <p>Contact : {CONTACT_LIEN}</p>

              <h2>Hébergement</h2>
              <p>Le site est hébergé par Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis (vercel.com). Les pages sont servies depuis son réseau, au plus près du visiteur.</p>

              <h2>Propriété intellectuelle</h2>
              <p>TED et TEDx sont des marques de TED Conferences LLC. Cet événement TEDx indépendant est organisé sous licence de TED.</p>
              <p>Les contenus de ce site (textes, visuels, identité graphique) sont la propriété de leurs auteurs respectifs et ne peuvent être réutilisés sans autorisation.</p>

              <h2>Données personnelles et cookies</h2>
              <p>Le site public ne dépose aucun cookie. Aucune bannière de consentement n'est donc nécessaire.</p>
              <p>Pour savoir quelles pages sont lues, le site utilise Vercel Web Analytics, l'outil de mesure d'audience de son hébergeur (Vercel Inc., États-Unis, adhérent au Data Privacy Framework). La mesure fonctionne sans cookie et sans rien écrire sur votre appareil : à chaque page vue, le script, servi depuis tedxuttroyes.fr, transmet l'adresse de la page, le site d'où vous venez, votre pays, ainsi que le type de navigateur, de système et d'appareil. Pour compter les visiteurs sans les identifier, Vercel calcule à partir de votre adresse IP et de votre navigateur une empreinte qu'il efface au bout de vingt-quatre heures ; l'adresse IP elle-même n'est pas conservée. Seules des statistiques agrégées sont consultées par l'équipe, sur le fondement de son intérêt légitime à connaître l'audience du site.</p>
              <p>Seule exception, sans rapport avec vos données : la page d'accueil s'ouvre sur une brève animation du logo de la dixième édition. Pour ne pas vous la rejouer à chaque passage, des indicateurs techniques sont écrits dans la mémoire de votre navigateur : le premier, dans la mémoire de session (<span lang="en">sessionStorage</span>), disparaît à la fermeture de l'onglet et évite de rejouer l'animation d'une page à l'autre ; le second, dans la mémoire locale (<span lang="en">localStorage</span>), retient seulement que vous avez déjà vu l'animation, pour vous en servir une version courte lors d'une prochaine visite. Un troisième indicateur, dans la même mémoire locale, retient de la même façon l'instant où le message d'accueil sur la ligne rouge vous a été présenté, pour ne pas vous le remontrer pendant vingt-quatre heures. Aucun des trois ne quitte votre appareil et aucun ne contient d'information vous concernant.</p>
              <p>La page d'accueil affiche une carte interactive fournie par Mapbox (Mapbox Inc., États-Unis). Les données cartographiques ne sont chargées depuis les serveurs de Mapbox qu'au moment où la carte approche de l'écran ; Mapbox reçoit alors votre adresse IP et des données techniques liées à l'affichage de la carte. Sans JavaScript, un plan dessiné localement s'affiche à la place et aucune requête n'est envoyée.</p>
              <p>Les pages d'archives des speakers intègrent un lecteur vidéo YouTube en mode de confidentialité renforcée (youtube-nocookie.com, Google Ireland Ltd.). Le lecteur est chargé en différé : au moment où il s'affiche puis lors de la lecture, Google reçoit votre adresse IP et des données techniques. Tant que la vidéo n'est pas lue, aucun cookie n'est déposé.</p>
              <p>La billetterie est opérée par Billetweb, sur son propre site : Billetweb est responsable des traitements de données qu'il réalise. Les e-mails envoyés à l'adresse de contact ne sont utilisés que pour vous répondre.</p>

              <h2>Espace connecté de l'équipe et des speakers</h2>
              <p>Une partie du site, l'espace connecté, sert à l'équipe d'organisation et aux speakers pour préparer les talks : calendrier, documents à fournir (Speaker Release, droit à l'image, photos, script, slides, documents logistiques), échanges avec l'équipe. Elle n'est accessible que sur invitation et ne concerne que ces personnes. Le responsable du traitement est l'association Genius UTT.</p>
              <p>Données traitées : nom, adresse e-mail, rôle, mot de passe (conservé sous forme d'empreinte, jamais en clair) ; pour les speakers, la fiche (prénom, nom, adresse e-mail et téléphone de contact, titre et résumé du talk, biographie) et, après l'événement, le lien de la vidéo du talk ; les documents déposés et leurs versions, les retours échangés, l'état des jalons ; les sessions de connexion (date, navigateur, adresse IP) ; un journal des actions (connexions, dépôts, téléchargements, suppressions). Finalités : organiser l'événement avec les speakers, communiquer sur leur talk, et sécuriser l'accès. Base légale : l'exécution de la relation qui nous lie aux speakers et aux membres, et notre intérêt légitime à sécuriser l'espace.</p>
              <p>Durées de conservation : les comptes speakers sont supprimés douze mois après l'édition, les comptes de l'équipe douze mois après leur dernière connexion (ou plus tôt, à la passation) ; le journal est conservé douze mois ; les justificatifs de transport sont supprimés trois mois après l'édition ; une session dure sept jours. La Speaker Release et le droit à l'image signés, qui fondent le droit de diffuser la vidéo d'un talk et les photos de la soirée, sont conservés tant que le talk et les photos sont en ligne, y compris après la suppression du compte, dans une archive réservée à l'équipe. Les contenus publiés sur ce site (nom, biographie, photo d'un speaker) ne sont pas concernés par la suppression d'un compte.</p>
              <p>Prestataires : Vercel Inc. (hébergement de l'application, États-Unis, adhérent au Data Privacy Framework, fonctions exécutées à Francfort) ; Neon (base de données, hébergée à Francfort) ; Scaleway SAS (stockage des documents à Paris et envoi des e-mails d'invitation et de mot de passe, France). Les documents ne sont jamais accessibles par une adresse publique : chaque téléchargement passe par une vérification de vos droits.</p>
              <p>Un seul cookie est déposé, et uniquement après connexion à l'espace : le cookie de session <code>__Host-tedx-session</code>, strictement nécessaire, valable sept jours. Il n'est soumis à aucun consentement.</p>
              <p>Vous pouvez télécharger vos données et supprimer votre compte depuis la page « Mon compte » de l'espace. Pour exercer vos autres droits (accès, rectification, opposition, limitation), écrivez à {CONTACT_LIEN}. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).</p>
            </div>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
