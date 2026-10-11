import { Cadre } from '../../_site/Cadre';
import { Masque } from '../../_site/Masque';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function DevenirSpeaker() {
  return (
    <Cadre>
      <Tete
        titre="Devenir speaker | TEDxUTTroyes 2027"
        description="Une idée qui mérite d'être partagée ? Postulez pour monter sur la scène de TEDxUTTroyes 2027 : dix-huit minutes, 750 personnes, un accompagnement complet par l'équipe."
        chemin="/devenir-speaker/"
        partage={{ ...PARTAGE_2027, description: { masque: "Une idée qui mérite d'être partagée ? Postulez pour monter sur la scène de la dixième édition, le ** **** **** à Troyes.", vrai: "Une idée qui mérite d'être partagée ? Postulez pour monter sur la scène de la dixième édition, le 18 mars 2027 à Troyes." } }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">La scène est à vous</p>
          <div className="sec-body">
            <h1 className="page-title a a2">Devenir speaker</h1>
            <p className="lead a a3">Le <Masque texte="18 mars 2027" />, six personnes monteront sur la scène du Centre de Congrès de l'Aube pour 18 minutes chacune, face à 750 fauteuils. Si vous portez une idée qui mérite d'être partagée, une de ces places peut être la vôtre.</p>
          </div>
        </div>
      </div>

      <section className="sec" aria-labelledby="titre-attendu">
        <div className="inner">
          <p className="cote">Ce qu'on cherche</p>
          <div className="sec-body" data-line-flank="">
            <h2 className="h-md" id="titre-attendu">Une idée, pas un CV</h2>
            <p className="lead">Un talk TEDx ne vend rien et ne promeut personne : il transmet une idée. Peu importe votre notoriété, votre métier ou votre âge. Ce qui compte c'est ce que vous avez compris, découvert ou traversé, et ce que le public de Troyes n'oubliera pas.</p>
            <ul className="facts">
              <li> <strong>Une idée neuve ou un regard neuf</strong> <span className="data">un angle que le public n'a pas déjà entendu cent fois</span> </li>
              <li> <strong>18 minutes, pas une de plus</strong> <span className="data">le format TED, exigeant et libérateur</span> </li>
              <li> <strong>Un lien avec le thème 2027</strong> <span className="data"><Masque texte="franchir ou s'adapter" /> : <Masque texte="la limite" />, sous toutes ses formes</span> </li>
              <li> <strong>De l'envie, pas de l'expérience</strong> <span className="data">l'équipe vous accompagne : coaching, répétitions, écriture</span> </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec sec--alt" aria-labelledby="titre-candidater">
        <div className="inner">
          <p className="cote">Candidater</p>
          <div className="sec-body">
            <h2 className="h-md" id="titre-candidater">10 minutes suffisent</h2>
            <p className="lead">Présentez votre idée en quelques lignes dans le formulaire de candidature : en quoi elle est nouvelle ou nécessaire, et un mot sur vous. Pas de dossier perdu : l'équipe de Genius UTT lit tout et répond à tout le monde.</p>
            <div className="actions" style={{ marginTop: "24px" }}> <a className="btn btn--primary" href="https://docs.google.com/forms/d/e/1FAIpQLSfpEpbedKsx5EaSJMxT01t8cRJHdYnp66uqgxK28zoEEBzZbQ/viewform?usp=header" target="_blank" rel="noopener" data-line="plug">Postuler comme speaker<span className="visually-hidden"> (nouvelle fenêtre)</span></a> </div>
            <p className="notice" style={{ marginTop: "18px" }}>Vous connaissez quelqu'un qui devrait monter sur cette scène ? Transmettez-lui cette page, ou soufflez-nous son nom par e-mail à geniusutt@utt.fr.</p>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
