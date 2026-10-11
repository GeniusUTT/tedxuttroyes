import { preload } from 'react-dom';
import { Cadre } from '../../_site/Cadre';
import { Tete } from '../../_site/Tete';

// La page cachée du jeu de piste : noindex, hors sitemap, sans aperçu de
// partage, liée de nulle part. Date et thème y sont en clair exprès.

export default function PageCachee() {
  // Le mot de passe s'affiche en mono grasse : sa police part tout de suite.
  preload('/assets/fonts/space-mono-700-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: '' });
  return (
    <Cadre date="claire">
      <Tete
        titre="Vous l'avez trouvée | TEDxUTTroyes 2027"
        robots="noindex, nofollow"
      />

      <div className="sec sec--head">
        <div className="inner">
          <p className="cote a a1">Hors sommaire</p>
          <div className="sec-body">
            <img className="marque-10 marque-10--plein a a2" src="/assets/img/logo-10e-texte.svg" alt="TEDxUTTroyes, dixième édition" width="2160" height="2160" />
            <h1 className="page-title a a3">Vous l'avez trouvée</h1>
            <p className="lead a a4">Cette page n'est dans aucun menu, dans aucun moteur de recherche. Personne n'y arrive par hasard : il fallait résoudre la charade. Voici ce qu'elle vaut : la date et le thème de la dixième édition de TEDxUTTroyes en avant-première. Le mot de passe qui offrait une place, lui, a déjà trouvé preneur.</p>
          </div>
        </div>
      </div>

      <section className="sec">
        <div className="inner">
          <p className="cote">Avant-première</p>
          <div className="sec-body">
            <p className="ticker-label">Le thème de la dixième édition</p>
            <h2 className="mom-title">Franchir ou s'adapter&nbsp;?</h2>
            <p className="hero-fig"><span className="fig-id">La limite </span>: Se franchit ou s'apprivoise mais ne s'ignore jamais.</p>
            <p className="ticker-label">La date</p>
            <p className="ticker-value">Jeudi 18 mars 2027</p>
            <div className="prose" data-line-flank="">
              <p>18h00, Centre de Congrès de l'Aube, à Troyes. Le reste du site ne dira ni l'un ni l'autre avant le samedi 31 octobre 2026 à 18h00 : partout ailleurs, la date et le thème sont encore cachés 🤫.</p>
            </div>
            <p className="notice">Gardez-les pour vous jusqu'à la révélation : la charade doit rester à résoudre pour tout le monde.</p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="inner">
          <p className="cote">Le mot de passe</p>
          <div className="sec-body">
            <p className="notice">La place a déjà été gagnée. Quelqu'un nous a envoyé ce mot de passe avant vous, son billet est réservé : il n'y a plus de place à réclamer ici.</p>
            <p className="ticker-value" style={{ whiteSpace: "normal" }}>« Genius mieux que la Junior »</p>
            <div className="prose">
              <p>Il n'a été donné nulle part ailleurs et il ne valait qu'une fois : la place revenait à la première personne qui nous l'envoyait, et c'est fait. Il ne sert donc plus à rien, sinon à prouver que vous êtes arrivé jusqu'ici. Vous gardez l'avant-première ci-dessus, et le plaisir d'avoir résolu la charade.</p>
              <p>La place offerte correspondait au tarif normal VIP. Les billets, eux, restent en vente sur la billetterie.</p>
            </div>
            <div className="actions"> <a className="btn btn--primary" href="mailto:geniusutt@utt.fr?subject=TEDxUTTroyes%202027" data-line="plug">Nous écrire par e-mail</a> <a className="btn btn--ghost" href="https://www.instagram.com/tedxuttroyes/" target="_blank" rel="noopener">Nous écrire sur Instagram<span className="visually-hidden"> (nouvelle fenêtre)</span></a> </div>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
