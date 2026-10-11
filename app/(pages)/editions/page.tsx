import { EDITIONS } from '../../../contenu/editions';
import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { Masque } from '../../_site/Masque';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

// Le registre des éditions passées, de la plus récente à la plus ancienne. Une
// rangée sur trois porte data-line-flank : la ligne change de côté en mobile.

export default function RegistreDesEditions() {
  return (
    <Cadre actif={{ rubrique: "/editions/", courant: "page" }}>
      <Tete
        titre="Le registre des éditions | TEDxUTTroyes"
        description={{ masque: "Neuf éditions de TEDxUTTroyes consignées depuis 2016, leurs thèmes et leurs talks en vidéo, en attendant la dixième ligne du registre : le ** **** ****.", vrai: "Neuf éditions de TEDxUTTroyes consignées depuis 2016, leurs thèmes et leurs talks en vidéo, en attendant la dixième ligne du registre : le 18 mars 2027." }}
        chemin="/editions/"
        partage={{ ...PARTAGE_2027, description: "Neuf éditions consignées depuis 2016 et des dizaines de talks en accès libre." }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Depuis 2016</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Le registre des éditions</h1>
            <p className="lead a a3">Neuf éditions consignées et des dizaines de talks en accès libre. De quoi mesurer le chemin parcouru avant d'écrire la dixième ligne.</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-editions">
        <div className="inner">
          <p className="cote">Archives</p>
          <div className="sec-body">
            <h2 className="visually-hidden" id="titre-editions">Les neuf éditions passées</h2>
            <div className="reg">
              {[...EDITIONS].reverse().map((e, i) => (
                <article key={e.annee} className="reg-row" data-line-flank={i % 3 === 0 ? '' : undefined}>
                  <p className="reg-year">{e.annee}</p>
                  <div className="reg-main">
                    <h3 lang={e.langue}><a className="reg-link" href={`/editions/edition-${e.annee}/`}>{e.theme}<span className="visually-hidden">, édition {e.annee}</span></a></h3>
                  </div>
                  <div className="reg-media"> <img src={`/assets/img/editions/${e.annee}/vignette.webp`} alt={`Vignette d'archive de l'édition ${e.annee}`} width="800" height="500" loading="lazy" /> </div>
                </article>
              ))}
            </div>
            <p className="notice">2018 et 2020 manquent au registre : ces années-là, l'événement n'a pas eu lieu. Même une scène d'idées rencontre ses limites.</p>
          </div>
        </div>
      </section>

      <section className="sec sec--alt">
        <div className="inner">
          <p className="cote">En vidéo</p>
          <div className="sec-body">
            <h2 className="h-md">Tous les talks, en accès libre</h2>
            <p className="lead">Chaque talk de TEDxUTTroyes est filmé puis publié sur la chaîne YouTube TEDx Talks, aux côtés de ceux de milliers d'événements TEDx dans le monde.</p>
            <div className="actions" style={{ marginTop: "24px" }}> <a className="btn btn--ghost" href="https://www.youtube.com/@TEDx" target="_blank" rel="noopener">Ouvrir la chaîne TEDx Talks<span className="visually-hidden"> (nouvelle fenêtre)</span> <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg> </a> </div>
          </div>
        </div>
      </section>

      <Bandeau
        titre="Le registre attend sa dixième ligne."
        lead={<>Elle s'écrira le <Masque texte="18 mars 2027" />, devant 750 personnes.</>}
      />
    </Cadre>
  );
}
