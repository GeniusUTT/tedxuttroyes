import { Bandeau } from '../../_site/Bandeau';
import { Cadre } from '../../_site/Cadre';
import { PARTAGE_2027, Tete } from '../../_site/Tete';

export default function APropos() {
  return (
    <Cadre actif={{ rubrique: "/a-propos/", courant: "page" }}>
      <Tete
        titre="À propos de TED et de TEDx | TEDxUTTroyes"
        description="TED, TEDx et TEDxUTTroyes : qui organise l'événement troyen, dans quel esprit et sous quelle licence. Un événement local, une conviction mondiale."
        chemin="/a-propos/"
        partage={{ ...PARTAGE_2027, description: "TED, TEDx et TEDxUTTroyes : qui organise l'événement troyen, dans quel esprit et sous quelle licence." }}
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">L'esprit</p>
          <div className="sec-body">
            <h1 className="page-title a a2">À propos</h1>
            <p className="lead a a3">Un événement local, une licence internationale, une même conviction : les idées méritent d'être partagées.</p>
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="inner">
          <p className="cote">TED, TEDx, Troyes</p>
          <div className="sec-body">
            <div className="prose" data-line-flank="">
              <h2>À propos de TED</h2>
              <p>TED est une organisation à but non lucratif consacrée aux idées qui méritent d'être partagées, le plus souvent sous la forme de talks courts et percutants de moins de 18 minutes. TED a vu le jour en 1984, comme une conférence à la croisée de la technologie, du divertissement et du design. Les talks couvrent aujourd'hui presque tous les sujets, de la science aux grands enjeux mondiaux en passant par le business, dans plus de 100 langues.</p>
              <p>Parallèlement, les événements TEDx, organisés de manière indépendante, contribuent à faire circuler les idées dans les communautés locales, partout dans le monde.</p>
              <h2>À propos de TEDx</h2>
              <p>Dans l'esprit des idées qui méritent d'être partagées, TED a créé un programme appelé TEDx. TEDx est un programme d'événements locaux et indépendants qui rassemblent les gens pour partager une expérience proche de celle de TED. Lors de notre événement TEDxUTTroyes, des talks sur scène et des vidéos publiées sur la chaîne YouTube de TEDx se combinent pour susciter la réflexion et la discussion au sein d'un groupe. Le TEDxUTTroyes est organisé de manière indépendante, sous licence de TED.</p>
              <h2>À propos de TEDxUTTroyes</h2>
              <p>TEDxUTTroyes est organisé par les étudiantes et étudiants de <strong>Genius UTT</strong>, association de l'Université de Technologie de Troyes. Depuis 2016, l'équipe fait monter sur la scène troyenne des scientifiques, des sportifs, des entrepreneurs et des artistes, avec une exigence constante : des idées fortes, racontées simplement.</p>
              <p data-reveal-html={"La dixième édition se tiendra le jeudi 18 mars 2027 au Centre de Congrès de l'Aube, autour du thème de la limite : franchir ou s'adapter&nbsp;?"}> La dixième édition se tiendra le ***** ** **** **** au Centre de Congrès de l'Aube, autour du thème de ** ****** : ******** ** *'*******&nbsp;? Thème et date seront révélés le samedi 31 octobre 2026.</p>
            </div>
            <div className="actions" style={{ marginTop: "36px" }}> <a className="btn btn--ghost" href="https://www.ted.com/tedx" target="_blank" rel="noopener">Le programme TEDx : ted.com/tedx<span className="visually-hidden"> (nouvelle fenêtre)</span> <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M7 17L17 7M9 7h8v8" /> </svg> </a> <a className="btn btn--ghost" href="https://www.ted.com" target="_blank" rel="noopener">Découvrir TED : ted.com<span className="visually-hidden"> (nouvelle fenêtre)</span> <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M7 17L17 7M9 7h8v8" /> </svg> </a> </div>
          </div>
        </div>
      </section>

      <Bandeau
        titre="Les talks se regardent en ligne. Les idées se vivent en salle."
      />
    </Cadre>
  );
}
