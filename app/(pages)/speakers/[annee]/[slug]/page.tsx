import { notFound } from 'next/navigation';
import { COTES, SPEAKERS } from '../../../../../contenu/speakers';
import { BandeauRegistre } from '../../../../_site/Bandeau';
import { Cadre } from '../../../../_site/Cadre';
import { SITE } from '../../../../_site/liens';
import { JsonLd, Tete } from '../../../../_site/Tete';

// La fiche d'un speaker d'une édition passée : portrait, biographie, talk.

type Parametres = { annee: string; slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Parametres[] {
  return SPEAKERS.map((s) => ({ annee: String(s.annee), slug: s.slug }));
}

const FLECHE_EXTERNE = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg>
);
const CHEVRON = (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
);

export default async function FicheSpeaker({ params }: { params: Promise<Parametres> }) {
  const { annee, slug } = await params;
  const s = SPEAKERS.find((x) => String(x.annee) === annee && x.slug === slug);
  if (!s) notFound();

  const chemin = `/speakers/${s.annee}/${s.slug}/`;
  const portrait = s.portrait ?? `/assets/img/editions/${s.annee}/speakers/${s.slug}.webp`;
  const titre = `${s.nom} | TEDxUTTroyes ${s.annee}`;
  const auTedx = `${s.prenom} au TEDxUTTroyes ${s.annee}`;

  return (
    <Cadre>
      <Tete
        titre={titre}
        description={s.description}
        chemin={chemin}
        partage={{ type: 'profile', image: portrait, carte: 'summary' }}
      />
      <JsonLd
        donnees={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: s.nom,
          url: SITE + chemin,
          image: SITE + portrait,
          performerIn: { '@type': 'Event', name: `TEDxUTTroyes ${s.annee}` },
        }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">{COTES[s.annee]}</p>
          <div className="sec-body">
            <h1 className="page-title a a2">{s.nom}</h1>
            {s.lead && <p className="lead a a3">{s.lead}</p>}
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-bio">
        <div className="inner">
          <p className="cote">Présentation</p>
          <div className="sec-body ed-fiche">
            <figure className="ed-affiche" data-line-flank="">
              <img src={portrait} alt={`Portrait de ${s.nom}`} width="560" height="560" loading="lazy" />
              <figcaption>{s.nom} · TEDxUTTroyes {s.annee}</figcaption>
            </figure>
            <div className="ed-fiche-body">
              <h2 className="visually-hidden" id="titre-bio">Biographie</h2>
              {s.domaine && <p className="ed-meta">{s.domaine}</p>}
              {s.avertissement && <p className="notice">{s.avertissement}</p>}
              {s.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec--alt" aria-labelledby="titre-talk">
        <div className="inner">
          <p className="cote">Le talk</p>
          <div className="sec-body">
            <h2 className="h-md" id="titre-talk">{auTedx}</h2>
            {s.titreTalk && <p className="lead">{s.titreTalk}</p>}
            {s.video ? (
              <>
                <div className="talk-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${s.video}`}
                    title={`Vidéo : ${auTedx}`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="actions" style={{ marginTop: 24 }}>
                  <a className="btn btn--ghost" href={`https://www.youtube.com/watch?v=${s.video}`} target="_blank" rel="noopener">
                    Voir le talk sur YouTube<span className="visually-hidden"> (nouvelle fenêtre)</span> {FLECHE_EXTERNE}
                  </a>
                </div>
              </>
            ) : (
              s.texteTalk?.map((p, i) => <p key={i}>{p}</p>)
            )}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="inner">
          <p className="cote">Registre</p>
          <div className="sec-body">
            <nav className="ed-nav" data-line-flank="" aria-label="Navigation dans les archives">
              <a className="link-more" href={`/editions/edition-${s.annee}/`}>Retour à l'édition {s.annee} {CHEVRON}</a>{' '}
              <a className="link-more" href="/editions/">Toutes les éditions {CHEVRON}</a>
            </nav>
          </div>
        </div>
      </section>

      <BandeauRegistre />
    </Cadre>
  );
}
