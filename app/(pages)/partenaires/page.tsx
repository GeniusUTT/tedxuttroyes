import { Cadre } from '../../_site/Cadre';
import { PARTAGE_2027, Tete } from '../../_site/Tete';
import { PARTENAIRES, type Logo } from '../../../contenu/partenaires';

// Une surface égale pour chaque logo, quelle que soit sa forme : un carré
// prend 64 x 64 (SURFACE), un logo large s'allonge en s'aplatissant, et
// aucun ne dépasse 64 px de haut (règle TEDx : sous le logo de l'événement).
// Le résultat part dans width et height ; la feuille ne fait que le réduire
// quand la tuile est trop étroite, sans toucher à la proportion.
const SURFACE = 64 * 64;
const PLAFOND = 64;

function taille({ largeur, hauteur }: Logo) {
  const ratio = largeur / hauteur;
  const h = Math.min(PLAFOND, Math.sqrt(SURFACE / ratio));
  return { largeur: Math.round(h * ratio), hauteur: Math.round(h) };
}

export default function Partenaires() {
  return (
    <Cadre actif={{ rubrique: "/partenaires/", courant: "page" }}>
      <Tete
        titre="Partenaires | TEDxUTTroyes 2027"
        description="Ils rendent possible TEDxUTTroyes, événement à but non lucratif : les partenaires de chaque édition depuis 2016, et comment rejoindre l'aventure pour la dixième."
        chemin="/partenaires/"
        partage={{ ...PARTAGE_2027, description: "Chaque édition tient debout grâce à des partenaires qui partagent le goût des idées. La liste 2027 s'écrit." }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Ils s'engagent</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Partenaires</h1>
            <p className="lead a a3">TEDxUTTroyes ne vend rien : l'événement est à but non lucratif, porté par les bénévoles de Genius UTT. Chaque édition tient debout grâce à des partenaires qui partagent le goût des idées. La liste 2027 est en cours d'écriture ; voici, édition par édition, celles et ceux qui ont rendu les précédentes possibles, tels que les archives de l'association les ont gardés.</p>
          </div>
        </div>
      </div>

      {PARTENAIRES.map(({ annee, logos }, i) => (
        <section className="sec" aria-labelledby={`titre-partenaires-${annee}`} key={annee}>
          <div className="inner">
            <p className="cote">Édition {annee}</p>
            <div className="sec-body">
              <h2 className="visually-hidden" id={`titre-partenaires-${annee}`}>Les partenaires de l'édition {annee}</h2>
              <ul className="partners-grid" data-line-flank={i % 2 === 0 ? "" : undefined}>
                {logos.map((logo) => {
                  const { largeur, hauteur } = taille(logo);
                  const image = <img src={logo.fichier} alt={logo.nom} width={largeur} height={hauteur} loading="lazy" />;
                  return (
                    <li className="partner-tile" key={logo.fichier}>
                      {logo.lien ? <a href={logo.lien} target="_blank" rel="noopener noreferrer">{image}</a> : image}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      ))}

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
