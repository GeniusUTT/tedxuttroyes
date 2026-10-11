import { notFound } from 'next/navigation';
import { EDITIONS, type Edition } from '../../../../contenu/editions';
import { SPEAKERS } from '../../../../contenu/speakers';
import { BandeauRegistre } from '../../../_site/Bandeau';
import { Cadre } from '../../../_site/Cadre';
import { Masque } from '../../../_site/Masque';
import { PARTAGE_2027, Tete } from '../../../_site/Tete';

// La fiche d'une édition passée : l'affiche, le récit, les speakers, l'équipe,
// la galerie, et les éditions voisines dans le registre.

type Parametres = { edition: string };

export const dynamicParams = false;

export function generateStaticParams(): Parametres[] {
  return EDITIONS.map((e) => ({ edition: `edition-${e.annee}` }));
}

const FLECHE_EXTERNE = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
);
const SUIVANT = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
);
const PRECEDENT = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
);

function Voisines({ precedente, suivante }: { precedente?: Edition; suivante?: Edition }) {
  return (
    <section className="sec" aria-label="Naviguer dans le registre des éditions">
      <div className="inner">
        <p className="cote">Le registre</p>
        <nav className="sec-body ed-nav" aria-label="Éditions voisines">
          {precedente ? (
            <a className="link-more" href={`/editions/edition-${precedente.annee}/`}>
              {PRECEDENT} édition {precedente.annee} : {precedente.theme}
            </a>
          ) : (
            <span className="ed-nav-void">début du registre</span>
          )}{' '}
          <a className="link-more" href="/editions/">tout le registre {SUIVANT}</a>{' '}
          {suivante ? (
            <a className="link-more" href={`/editions/edition-${suivante.annee}/`}>
              édition {suivante.annee} : {suivante.theme} {SUIVANT}
            </a>
          ) : (
            <a className="link-more" href="/">
              édition 2027 : <Masque texte="Franchir ou s'adapter" />&nbsp;? {SUIVANT}
            </a>
          )}
        </nav>
      </div>
    </section>
  );
}

export default async function FicheEdition({ params }: { params: Promise<Parametres> }) {
  const { edition } = await params;
  const rang = EDITIONS.findIndex((x) => `edition-${x.annee}` === edition);
  const e = EDITIONS[rang];
  if (!e) notFound();
  const { annee } = e;
  const titre = `Édition ${annee} : ${e.theme} | TEDxUTTroyes`;

  return (
    <Cadre actif={{ rubrique: '/editions/', courant: 'true' }}>
      <Tete titre={titre} description={e.description} chemin={`/editions/edition-${annee}/`} partage={PARTAGE_2027} />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Édition n° {e.numero} · {annee}</p>
          <div className="sec-body">
            <h1 className="page-title a a2" lang={e.langue}>{e.theme}</h1>
            <p className="ed-meta a a3">
              {e.dateIso ? <time dateTime={e.dateIso}>{e.date}</time> : <span>{e.date}</span>}{' '}
              <span className="sep" aria-hidden="true">·</span>{' '}
              <span>{e.lieu}</span>{' '}
              <span className="sep" aria-hidden="true">·</span>{' '}
              <span>{e.talks}</span>
            </p>
            <p className="lead a a4">{e.lead}</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby={`titre-fiche-${annee}`}>
        <div className="inner">
          <p className="cote">La fiche</p>
          <div className="sec-body ed-fiche">
            <figure className="ed-affiche">
              <img
                src={e.affiche.src}
                alt={e.affiche.alt ?? `Affiche de l'édition ${annee} : ${e.theme}`}
                width={e.affiche.largeur}
                height={e.affiche.hauteur}
              />
              <figcaption>{e.affiche.legende ?? `Document : l'affiche de l'édition ${annee}`}</figcaption>
            </figure>
            <div className="ed-fiche-body">
              <h2 className="h-md" id={`titre-fiche-${annee}`}>{e.titreFiche ?? 'Ce que consignent les archives'}</h2>
              {e.recit.map((p, i) => <p key={i}>{p}</p>)}
              <ul className="facts">
                {e.faits.map((f, i) => (
                  <li key={i}>
                    <strong>{f.fort}</strong> <span className="data">{f.detail}</span>
                  </li>
                ))}
              </ul>
              <p className="more-row">
                <a className="link-more" href={`https://www.youtube.com/results?search_query=TEDxUTTroyes+${annee}`} target="_blank" rel="noopener">
                  voir les talks {annee} sur YouTube<span className="visually-hidden"> (nouvelle fenêtre)</span> {FLECHE_EXTERNE}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--alt" aria-labelledby={`titre-speakers-${annee}`}>
        <div className="inner">
          <p className="cote">À la tribune</p>
          <div className="sec-body">
            <h2 className="h-md" id={`titre-speakers-${annee}`}>Elles et ils ont pris la parole</h2>
            <ul className="ppl" data-line-flank="">
              {e.speakers.map(({ slug, role }) => {
                const s = SPEAKERS.find((x) => x.annee === annee && x.slug === slug);
                if (!s) throw new Error(`Speaker inconnu : ${annee}/${slug}`);
                return (
                  <li key={slug} className="ppl-card">
                    <img
                      src={s.portrait ?? `/assets/img/editions/${annee}/speakers/${slug}.webp`}
                      alt={`Portrait de ${s.nom}`}
                      width="560"
                      height="560"
                      loading="lazy"
                    />{' '}
                    <span className="ppl-name"><a href={`/speakers/${annee}/${slug}/`}>{s.nom}</a></span>
                    {role && <> <span className="ppl-role">{role}</span></>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {e.equipe && (
        <section className="sec" aria-labelledby={`titre-equipe-${annee}`}>
          <div className="inner">
            <p className="cote">En coulisses</p>
            <div className="sec-body">
              <h2 className="h-md" id={`titre-equipe-${annee}`}>L'équipe qui a tenu la ligne</h2>
              <p className="lead">{e.equipe.lead}</p>
              <ul className="ppl ppl--sm">
                {e.equipe.membres.map((m) => (
                  <li key={m.portrait} className="ppl-card">
                    <img src={m.portrait} alt={`Portrait de ${m.nom}`} width={m.largeur} height={m.hauteur} loading="lazy" />{' '}
                    <span className="ppl-name">
                      {m.lien ? (
                        <a href={m.lien} target="_blank" rel="noopener">
                          {m.nom}<span className="visually-hidden"> (LinkedIn, nouvelle fenêtre)</span>
                        </a>
                      ) : (
                        m.nom
                      )}
                    </span>
                    {m.role && <> <span className="ppl-role">{m.role}</span></>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {e.galerie && (
        <section className="sec sec--alt" aria-labelledby={`titre-galerie-${annee}`}>
          <div className="inner">
            <p className="cote">Retour en images</p>
            <div className="sec-body">
              <h2 className="h-md" id={`titre-galerie-${annee}`}>La soirée, telle qu'elle s'est tenue</h2>
              <ul className="gal">
                {e.galerie.photos.map((p) => (
                  <li key={p.src}><img src={p.src} alt={p.alt} width={p.largeur} height={p.hauteur} loading="lazy" /></li>
                ))}
              </ul>
              <p className="gal-credit">{e.galerie.credit}</p>
            </div>
          </div>
        </section>
      )}

      <Voisines precedente={EDITIONS[rang - 1]} suivante={EDITIONS[rang + 1]} />
      <BandeauRegistre />
    </Cadre>
  );
}
