import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function IndexDesSpeakers() {
  return (
    <Cadre actif={{ rubrique: "/speakers/", courant: "page" }}>
      <Tete
        titre="Les speakers | TEDxUTTroyes 2027"
        description={{ masque: "Six intervenantes et intervenants prendront la parole le ** **** **** pour la dixième édition de TEDxUTTroyes. Les noms sont sous embargo : les annonces arrivent.", vrai: "Six intervenantes et intervenants prendront la parole le 18 mars 2027 pour la dixième édition de TEDxUTTroyes. Les noms sont sous embargo : les annonces arrivent." }}
        chemin="/speakers/"
        partage={{ ...PARTAGE_2027, description: { masque: "Six noms sous embargo. Chaque annonce lèvera une barre noire, d'ici au ** **** ****.", vrai: "Six noms sous embargo. Chaque annonce lèvera une barre noire, d'ici au 18 mars 2027." } }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">La scène 2027</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Speakers</h1>
            <p className="lead a a3" data-reveal="Six fiches, six limites racontées en dix-huit minutes maximum. Les noms restent sous embargo : chaque annonce lèvera une barre noire, d'ici au printemps 2027.">Six fiches, six idées racontées en dix-huit minutes maximum. Les noms restent sous embargo : chaque annonce lèvera une barre noire, d'ici au jour J.</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-speakers">
        <div className="inner">
          <p className="cote">Registre des annonces</p>
          <div className="sec-body">
            <h2 className="visually-hidden" id="titre-speakers">Les six intervenants de l'édition 2027</h2>
            <ol className="sgrid" data-line-flank="">
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 01</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "4.5ch" }} /><span className="redact" style={{ width: "7ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "100%" }} /><span className="redact" style={{ width: "88%" }} /><span className="redact" style={{ width: "61%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "13ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 02</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "6ch" }} /><span className="redact" style={{ width: "5ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "94%" }} /><span className="redact" style={{ width: "100%" }} /><span className="redact" style={{ width: "47%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "10ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 03</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "5ch" }} /><span className="redact" style={{ width: "8.5ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "100%" }} /><span className="redact" style={{ width: "72%" }} /><span className="redact" style={{ width: "84%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "15ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 04</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "7ch" }} /><span className="redact" style={{ width: "4ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "86%" }} /><span className="redact" style={{ width: "100%" }} /><span className="redact" style={{ width: "55%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "11ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 05</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "5.5ch" }} /><span className="redact" style={{ width: "6.5ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "100%" }} /><span className="redact" style={{ width: "91%" }} /><span className="redact" style={{ width: "38%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "14ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
              <li className="sp-card">
                <div className="sp-photo" aria-hidden="true"><span className="sp-photo-mark">portrait sous embargo</span></div>
                <span className="sp-id">Intervenant·e 06</span>
                <p className="sp-name" aria-hidden="true"><span className="redact" style={{ width: "4ch" }} /><span className="redact" style={{ width: "9ch" }} /></p>
                <span className="visually-hidden">Nom sous embargo</span>
                <p className="sp-bio" aria-hidden="true"><span className="redact" style={{ width: "96%" }} /><span className="redact" style={{ width: "79%" }} /><span className="redact" style={{ width: "66%" }} /></p>
                <p className="sp-talk"><span className="sp-talk-k">Talk</span> <span className="redact" style={{ width: "12ch" }} aria-hidden="true" /><span className="visually-hidden">titre sous embargo</span></p>
                <span className="sp-status">annonce : à venir</span>
              </li>
            </ol>
            <p className="notice">Pour être prévenu à chaque levée d'embargo : le compte Instagram <a href="https://www.instagram.com/tedxuttroyes/" target="_blank" rel="noopener">@tedxuttroyes<span className="visually-hidden"> (nouvelle fenêtre)</span></a>.</p>
          </div>
        </div>
      </section>

      <section className="sec sec--alt" aria-labelledby="titre-postuler">
        <div className="inner">
          <p className="cote">La scène est à vous</p>
          <div className="sec-body">
            <h2 className="h-md" id="titre-postuler">Et si un de ces six noms était le vôtre&nbsp;?</h2>
            <p className="lead">Le comité de programme cherche des idées qui méritent d'être partagées, pas des CV. Racontez-nous la vôtre : l'équipe accompagne chaque speaker jusqu'à la scène.</p>
            <div className="actions" style={{ marginTop: "24px" }}> <a className="btn btn--primary" href="/devenir-speaker/">Postuler comme speaker</a> </div>
          </div>
        </div>
      </section>

      <Bandeau
        titre="Chaque année, la salle se remplit vite."
        lead="750 fauteuils, six inconnues, une soirée. Réserver maintenant, c'est parier sur dix éditions d'exigence."
        autres={<><a className="btn btn--ghost" href="/programme/">Voir le programme</a></>}
      />
    </Cadre>
  );
}
