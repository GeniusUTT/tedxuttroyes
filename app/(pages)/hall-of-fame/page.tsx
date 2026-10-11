import { EDITIONS } from '../../../contenu/editions';
import { SPEAKERS, type Speaker } from '../../../contenu/speakers';
import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { Masque } from '../../_site/Masque';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

// Toutes les voix passées sur la scène, année par année, de la plus récente à
// la plus ancienne et par ordre alphabétique dans chaque année. Une année sur
// deux porte data-line-flank : la ligne change de côté en mobile.

function speakersDe(annee: number): Speaker[] {
  return SPEAKERS.filter((s) => s.annee === annee).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

function portraitDe(s: Speaker): string {
  return s.portrait ?? `/assets/img/editions/${s.annee}/speakers/${s.slug}.webp`;
}

// « Portrait d'Alban Michon », « Portrait de Daniella Tchana ».
function altPortrait(nom: string): string {
  return /^[AEIOUYÉÈÊaeiouyéèê]/.test(nom) ? `Portrait d'${nom}` : `Portrait de ${nom}`;
}

export default function HallOfFame() {
  return (
    <Cadre actif={{ rubrique: "/hall-of-fame/", courant: "page" }}>
      <Tete
        titre="Hall of Fame | TEDxUTTroyes"
        description="Toutes les voix passées par la scène de TEDxUTTroyes : 61 interventions consignées de 2016 à 2026, portrait, bio et édition pour chacune."
        chemin="/hall-of-fame/"
        partage={{ ...PARTAGE_2027, description: "Toutes les voix passées par la scène de TEDxUTTroyes : 61 interventions consignées de 2016 à 2026." }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Registre des voix</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Hall of Fame</h1>
            <p className="lead a a3">Toutes les voix que le TEDxUTTroyes a eu la chance de recevoir sur sa scène, année par année : 61 interventions consignées de 2016 à 2026. Encore un grand merci à eux pour leur confiance !</p>
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="inner">
          <p className="cote">Archives</p>
          <div className="sec-body">
            {[...EDITIONS].reverse().map((e, i) => (
              <section key={e.annee} className="hof-year" data-line-flank={i % 2 === 0 ? '' : undefined}>
                <h2 className="h-md"><a className="hof-year-link" href={`/editions/edition-${e.annee}/`}>{e.annee} · {e.langue ? <span lang={e.langue}>{e.theme}</span> : e.theme}</a></h2>
                <div className="hof-grid">
                  {speakersDe(e.annee).map((s) => (
                    <article key={s.slug} className="hof-card">
                      <a className="hof-link" href={`/speakers/${s.annee}/${s.slug}/`}>
                        {' '}
                        <div className="hof-photo"> <img src={portraitDe(s)} alt={altPortrait(s.nom)} width="560" height="560" loading="lazy" /> </div>{' '}
                        <h3 className="hof-name">{s.nom}</h3>{' '}
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <Bandeau
        titre="Soixante et une voix sont passées par cette scène."
        lead={<>La dixième édition en ajoutera six, le <Masque texte="18 mars 2027" />, devant 750 personnes.</>}
      />
    </Cadre>
  );
}
