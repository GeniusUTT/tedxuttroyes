import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { Masque } from '../../_site/Masque';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function Programme() {
  return (
    <Cadre actif={{ rubrique: "/programme/", courant: "page" }}>
      <Tete
        titre="Programme de la soirée | TEDxUTTroyes 2027"
        description={{ masque: "La feuille de salle du ** **** **** au Centre de Congrès de l'Aube : portes à 18h00, mini forum de recrutement, six talks en deux sessions, entracte et pot VIP.", vrai: "La feuille de salle du 18 mars 2027 au Centre de Congrès de l'Aube : portes à 18h00, mini forum de recrutement, six talks en deux sessions, entracte et pot VIP." }}
        chemin="/programme/"
        partage={{ ...PARTAGE_2027, description: { masque: "Portes à 18h00 avec un mini forum de recrutement, premier talk à 19h30, dernier talk à 22h30. La feuille de salle du ** **** ****.", vrai: "Portes à 18h00 avec un mini forum de recrutement, premier talk à 19h30, dernier talk à 22h30. La feuille de salle du 18 mars 2027." } }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1"><Masque texte="Jeudi 18 mars 2027" /></p>
          <div className="sec-body">
            <h1 className="page-title a a2">Le programme</h1>
            <p className="lead a a3">Portes à 18h00 avec un mini forum de recrutement, premier talk à 19h30, dernier talk à 22h30. Entre les deux : six talks, un entracte pour en débattre et profiter d'une surprise.</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-programme">
        <div className="inner">
          <p className="cote">Feuille de salle</p>
          <div className="sec-body">
            <h2 className="visually-hidden" id="titre-programme">Déroulé de la soirée</h2>
            <ol className="sheet" data-line-flank="">
              <li className="sheet-row">
                <span className="sheet-time">18h00</span>
                <div>
                  <p className="sheet-title">Ouverture des portes et mini forum de recrutement</p>
                  <p className="sheet-desc">Contrôle des billets, vestiaire, puis rencontre dans le hall avec les entreprises partenaires et les associations : stages, alternances, premiers emplois. CV bienvenus.</p>
                </div>
              </li>
              <li className="sheet-row">
                <span className="sheet-time">19h30</span>
                <div>
                  <p className="sheet-title">Ouverture de la soirée</p>
                  <p className="sheet-desc">Le thème est posé : <Masque texte="franchir ou s'adapter" />&nbsp;?</p>
                </div>
              </li>
              <li className="sheet-row">
                <span className="sheet-time">19h45</span>
                <div>
                  <p className="sheet-title">Première session de talks</p>
                  <p className="sheet-desc">Trois premières prises de parole.</p>
                </div>
              </li>
              <li className="sheet-row">
                <span className="sheet-time">20h50</span>
                <div>
                  <p className="sheet-title">Entracte</p>
                  <p className="sheet-desc">Trente minutes pour confronter les premières idées, après une petite surprise.</p>
                </div>
              </li>
              <li className="sheet-row">
                <span className="sheet-time">21h20</span>
                <div>
                  <p className="sheet-title">Seconde session de talks</p>
                  <p className="sheet-desc">Trois prises de parole pour finir de faire le tour de la ligne.</p>
                </div>
              </li>
              <li className="sheet-row">
                <span className="sheet-time">22h30</span>
                <div>
                  <p className="sheet-title">Pot VIP</p>
                  <p className="sheet-desc">Un moment privilégié pour rencontrer les intervenantes et intervenants autour d'un verre.</p>
                </div>
              </li>
            </ol>
            <p className="notice">Feuille de salle indicative : les horaires précis seront confirmés à l'approche du <Masque texte="18 mars" />.</p>
          </div>
        </div>
      </section>

      <Bandeau
        titre="La soirée commence à 18h00. Votre décision peut commencer maintenant."
        autres={<><a className="btn btn--ghost" href="/faq/">Lire la FAQ pratique</a></>}
      />
    </Cadre>
  );
}
