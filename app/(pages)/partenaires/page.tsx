import { Cadre } from '../../_site/Cadre';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function Partenaires() {
  return (
    <Cadre actif={{ rubrique: "/partenaires/", courant: "page" }}>
      <Tete
        titre="Partenaires | TEDxUTTroyes 2027"
        description="Ils rendent possible la dixième édition de TEDxUTTroyes, événement à but non lucratif. Découvrez les partenaires 2027 et rejoignez l'aventure."
        chemin="/partenaires/"
        partage={{ ...PARTAGE_2027, description: "Chaque édition tient debout grâce à des partenaires qui partagent le goût des idées. La liste 2027 s'écrit." }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Ils s'engagent</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Partenaires</h1>
            <p className="lead a a3">TEDxUTTroyes ne vend rien : l'événement est à but non lucratif, porté par les bénévoles de Genius UTT. Chaque édition tient debout grâce à des partenaires qui partagent le goût des idées. La liste 2027 est en cours d'écriture.</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-partenaires">
        <div className="inner">
          <p className="cote">Édition 2026</p>
          <div className="sec-body">
            <h2 className="visually-hidden" id="titre-partenaires">Les partenaires de l'édition 2027</h2>
            <ul className="partners-grid" data-line-flank="">
              <li className="partner-tile"> <a href="https://www.utt.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-utt.webp" alt="Université de Technologie de Troyes" width="233" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://fondation-utt.odoo.com/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-fondation-utt.webp" alt="Fondation UTT" width="600" height="169" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.instagram.com/geniusutt/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-genius-utt.webp" alt="Genius UTT" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://bde.utt.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-bde.webp" alt="BDE Genius UTT" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://troyes-champagne-metropole.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-troyes.webp" alt="Troyes Champagne Métropole" width="500" height="196" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.aubassadeurs.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-aube.webp" alt="Les Aubassadeurs, l'Aube puissance dix" width="406" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://tcat.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-tcat.webp" alt="TCAT, transports en commun de l'agglomération troyenne" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.crous-reims.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-crous-reims.webp" alt="Crous de Reims" width="200" height="200" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.etudiant.gouv.fr/fr/cvec-une-demarche-de-rentree-incontournable-955" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-cvec.webp" alt="CVEC, contribution de vie étudiante et de campus" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.jcdecaux.fr/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-jcdecaux.webp" alt="JCDecaux" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://volvocars-concessions.com/troyes" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-volvo.webp" alt="Volvo" width="485" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.amplitude-auto.com/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-amplitude.webp" alt="Amplitude" width="450" height="112" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.instagram.com/cheersutt/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-cheers.webp" alt="Cheers" width="240" height="240" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.instagram.com/argentiqueutt/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-argentique.webp" alt="Argentique, club photo de l'UTT" width="200" height="200" loading="lazy" /></a> </li>
              <li className="partner-tile"> <a href="https://www.instagram.com/mediautt/" target="_blank" rel="noopener noreferrer"><img src="/assets/img/partenaires/logo-media.webp" alt="Média UTT" width="248" height="240" loading="lazy" /></a> </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="inner">
          <p className="cote">Rejoindre l'aventure</p>
          <div className="sec-body">
            <h2 className="h-md">Devenir partenaire</h2>
            <p className="lead">Associez votre structure à 750 spectateurs le soir même, à des talks vus bien au-delà de Troyes ensuite, et à dix éditions d'histoire locale. Mécénat, dotation matérielle, compétences : chaque coup de main déplace la ligne.</p>
            <div className="actions" style={{ marginTop: "24px" }}> <a className="btn btn--primary" href="mailto:geniusutt@utt.fr?subject=Partenariat%20TEDxUTTroyes%202027" data-line="plug">Proposer un partenariat</a> </div>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
