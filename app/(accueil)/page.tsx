import { Bandeau } from '../_site/Bandeau';
import { FondMarque } from '../_site/Cadre';
import { EnTete } from '../_site/EnTete';
import { BILLETTERIE, INSTAGRAM, LINKEDIN, SITE } from '../_site/liens';
import { Masque } from '../_site/Masque';
import { PiedDePage } from '../_site/PiedDePage';
import { JsonLd, PARTAGE_2027, Tete } from '../_site/Tete';

// L'accueil. Un seul trait rouge le parcourt de haut en bas : line-v10.js lit
// les ancres data-line (cross, avoid, turn, drop, plug, finale) et les deux
// sondes, puis dessine le trait au fil du défilement. Déplacer ou retirer un
// bloc qui porte data-line change le tracé : vérifier le rendu au défilement
// après toute retouche.
//
// Hors de .jscroll, et avant lui, les couches fixes : voile d'ouverture,
// interlude, filigrane. Posées dedans, elles se caleraient sur le wrapper
// translaté du défilement virtuel.

// N'est posé que si le voile joue sa version longue : sans cela, la vidéo
// serait téléchargée à chaque page pour un voile que personne ne verra.
const SOURCE_DU_VOILE =
  'try { var vm = document.querySelector(".voile-mark--trace"), vh = document.documentElement; if (vm && vh.classList.contains("voile-on") && !vh.classList.contains("voile-court")) { vm.src = vm.getAttribute("data-src") } } catch (e) { }';

// Les deux versants du thème tels qu'ils reviendront le 31 octobre (voir
// reveal-v2.js). En HTML brut et non en JSX : le navigateur range le contenu
// d'un <template> à part, React ne l'y retrouverait pas à l'hydratation et
// referait toute la page, effaçant au passage le voile et la ligne.
const VERSANT_1 =
  "<h2 class=\"mom-title\">Décider que la ligne était provisoire</h2> <p class=\"lead\">Le record tombe, le prototype décolle, une voix s'élève là où personne ne parlait. Franchir, c'est regarder la limite en face et passer outre : le mur devient une marche, la frontière un point de départ. C'est le premier versant du thème 2027 : l'audace d'aller de l'autre côté, et ce que ce geste coûte à celles et ceux qui le font.</p>";
const VERSANT_2 =
  "<h2 class=\"mom-title\">Ce qui ne se franchit pas</h2> <p class=\"lead\">Le corps compose avec la maladie, la ville avec sa rivière, l'ingénieur avec la matière. S'adapter, c'est faire de la ligne un appui : plier sans rompre, transformer la contrainte en méthode. C'est le second versant du thème : certaines limites ne se dépassent pas, elles s'apprivoisent, et ce renoncement apparent demande autant de courage que le dépassement.</p>";

export default function Accueil() {
  return (
    <>
      <Tete
        titre={{ masque: 'TEDxUTTroyes 2027, dixième édition', vrai: "TEDxUTTroyes 2027 : Franchir ou s'adapter ?" }}
        description={{
          masque: "La dixième édition de TEDxUTTroyes se tiendra au Centre de Congrès de l'Aube, à Troyes, à 18h00. Le thème et la date seront révélés le samedi 31 octobre 2026.",
          vrai: "La dixième édition de TEDxUTTroyes explore la limite : franchir ou s'adapter ? Jeudi 18 mars 2027, 18h00, Centre de Congrès de l'Aube, Troyes.",
        }}
        chemin="/"
        partage={{
          ...PARTAGE_2027,
          description: {
            masque: "Le thème et la date de la dixième édition seront révélés le samedi 31 octobre 2026. Centre de Congrès de l'Aube, Troyes.",
            vrai: "La dixième édition de TEDxUTTroyes explore la limite. Jeudi 18 mars 2027, 18h00, Centre de Congrès de l'Aube, Troyes.",
          },
        }}
      />
      <JsonLd
        donnees={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: 'TEDxUTTroyes 2027, dixième édition',
          description: "Dixième édition de TEDxUTTroyes : talks en direct et vidéos de conférences TED au Centre de Congrès de l'Aube, à Troyes.",
          startDate: '2027-03-18T18:00:00+01:00',
          doorTime: '2027-03-18T18:00:00+01:00',
          endDate: '2027-03-19T00:00:00+01:00',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: "Centre de Congrès de l'Aube",
            address: {
              '@type': 'PostalAddress',
              streetAddress: '2 rue Pierre Labonde',
              addressLocality: 'Troyes',
              postalCode: '10000',
              addressCountry: 'FR',
            },
            geo: { '@type': 'GeoCoordinates', latitude: 48.298433, longitude: 4.077912 },
          },
          image: [`${SITE}/assets/img/og/og-2027.jpg`],
          organizer: { '@type': 'Organization', name: 'TEDxUTTroyes', url: `${SITE}/`, sameAs: [INSTAGRAM, LINKEDIN] },
          offers: { '@type': 'Offer', url: BILLETTERIE, priceCurrency: 'EUR', availability: 'https://schema.org/PreOrder' },
          maximumAttendeeCapacity: 750,
        }}
      />

      <a className="skip-link" href="#contenu">Aller au contenu</a>

      <div className="voile" aria-hidden="true">
        <video className="voile-mark voile-mark--trace" data-src="/assets/video/logo-10e-intro-1120.mp4" autoPlay muted playsInline preload="auto" width="1120" height="1120" />
        <img className="voile-mark voile-mark--fixe" src="/assets/img/logo-10e.svg" alt="" width="2160" height="2160" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: SOURCE_DU_VOILE }} />

      <div className="interlude" aria-hidden="true">
        <div className="interlude-scene">
          <div className="interlude-col interlude-col--logo">
            <video className="interlude-mark" data-src="/assets/video/logo-10e-texte-scrub-576.mp4" data-src-petit="/assets/video/logo-10e-texte-scrub-384.mp4" muted playsInline preload="none" width="576" height="576" />
          </div>
          <div className="interlude-col interlude-col--texte">
            <h2 className="interlude-titre">Suivez cette ligne,<br /> elle vous guidera<br /> tout au long de votre visite</h2>
          </div>
        </div>
      </div>

      <EnTete actif={{ rubrique: '/', courant: 'page' }} />
      <FondMarque />

      <div className="jscroll">
        <main id="contenu">
        <span className="probe" id="probe-a" aria-hidden="true" />

        <span className="probe" id="probe-b" aria-hidden="true" />

        <section className="hero" aria-label="TEDxUTTroyes 2027, dixième édition">
          <div className="hero-bg" aria-hidden="true"> <img src="/assets/img/editions/2024/galerie/05.webp" alt="" width="1400" height="933" fetchPriority="high" /> </div>
          <div className="mwrap">
            <p className="cote a a1">Dixième édition</p>
            <h1 className="hero-title"> <span className="hero-word a a2" aria-hidden="true" data-reveal-unhide="" data-reveal="Franchir">********</span> <span className="hero-sub a a3" aria-hidden="true" data-reveal-unhide="" data-reveal="ou s'adapter ?">** *'*******&nbsp;?</span> <span className="visually-hidden" data-reveal-drop="">Le thème de la dixième édition est sous embargo : il sera révélé le samedi 31 octobre 2026.</span> </h1>
            <p className="hero-fig a a4" aria-hidden="true" data-reveal-unhide="" data-reveal-html={"<span class=\"fig-id\">La limite </span>: Se franchit ou s'apprivoise mais ne s'ignore jamais."}> <span className="fig-id">** ****** </span>: ** ******** ** *'*********** **** ** *'****** *******. </p>
            <p className="hero-meta a a5"> <time dateTime="2027-03-18T18:00:00+01:00"><Masque texte="Jeudi 18 mars 2027" /></time> <span className="sep" aria-hidden="true">·</span> <span>18h00</span> <span className="sep" aria-hidden="true">·</span> <span>Centre de Congrès de l'Aube, Troyes</span> </p>
            <div className="actions a a6"> <a className="btn btn--primary" href="https://www.billetweb.fr/tedxuttroyes-2027-10e-edition" target="_blank" rel="noopener">Réserver ma place</a> <a className="btn btn--ghost" href="/programme/">Voir le programme</a> </div>
            <p className="visually-hidden" data-reveal="Le compte à rebours est lancé : l'événement commence le jeudi 18 mars 2027 à 18h00.">Le compte à rebours est lancé : la date et le thème de la dixième édition seront révélés le samedi 31 octobre 2026 à 18h00. </p>
            <div className="ticker a a7" aria-hidden="true"> <span className="ticker-label" data-reveal="Temps restant">Révélation de la date et du thème</span> <span className="ticker-value" id="ticker-value">J-000 · 00:00:00</span> </div>
            <div className="ticker-cal a a7">
              <details className="cal">
                <summary className="btn btn--ghost btn--sm" data-reveal="Ajouter la soirée à mon agenda">Ajouter la révélation à mon agenda</summary>
                <ul className="cal-list">
                  <li><a href={"https://calendar.google.com/calendar/render?action=TEMPLATE&text=TEDxUTTroyes%202027%20%3A%20r%C3%A9v%C3%A9lation%20de%20la%20date%20et%20du%20th%C3%A8me&dates=20261031T170000Z%2F20261031T180000Z&details=La%20dixi%C3%A8me%20%C3%A9dition%20de%20TEDxUTTroyes%20l%C3%A8ve%20le%20voile%20sur%20sa%20date%20et%20son%20th%C3%A8me%20%3A%20rendez-vous%20sur%20https%3A%2F%2Ftedxuttroyes.fr%2F&location=https%3A%2F%2Ftedxuttroyes.fr%2F"} target="_blank" rel="noopener" data-reveal-attr="href" data-reveal={"https://calendar.google.com/calendar/render?action=TEMPLATE&text=TEDxUTTroyes%202027%20%3A%20Franchir%20ou%20s%27adapter%20%3F&dates=20270318T170000Z%2F20270318T230000Z&details=Dixi%C3%A8me%20%C3%A9dition%20de%20TEDxUTTroyes%2C%20autour%20du%20th%C3%A8me%20de%20la%20limite%20%3A%20franchir%20ou%20s%27adapter%20%3F%0A%0A18h00%20%3A%20ouverture%20des%20portes%20et%20mini%20forum%20de%20recrutement%0A19h30%20%3A%20ouverture%20de%20la%20soir%C3%A9e%2C%20six%20talks%20en%20deux%20sessions%20et%20un%20entracte%0A22h30%20%3A%20pot%20VIP%2C%20rencontre%20avec%20les%20intervenantes%20et%20intervenants%20jusqu%27%C3%A0%20minuit%0A%0A750%20places%20au%20Centre%20de%20Congr%C3%A8s%20de%20l%27Aube%2C%20%C3%A0%20Troyes.%0AProgramme%20%3A%20https%3A%2F%2Ftedxuttroyes.fr%2Fprogramme%2F%0ABilletterie%20%3A%20https%3A%2F%2Fwww.billetweb.fr%2Ftedxuttroyes-2027-10e-edition&location=Centre%20de%20Congr%C3%A8s%20de%20l%27Aube%2C%202%20rue%20Pierre%20Labonde%2C%2010000%20Troyes"}>Google Agenda<span className="visually-hidden"> (nouvelle fenêtre)</span></a></li>
                  <li><a href="/assets/agenda/revelation.ics" data-reveal-attr="href" data-reveal="/assets/agenda/tedxuttroyes-2027.ics">Apple Calendrier</a></li>
                  <li><a href="/assets/agenda/revelation.ics" data-reveal-attr="href" data-reveal="/assets/agenda/tedxuttroyes-2027.ics">Samsung Calendrier</a></li>
                </ul>
              </details>
            </div>
          </div>
        </section>

        <div className="interlude-espace" aria-hidden="true" />

        <section className="mom" id="moment-2" data-line="cross">
          <div className="mwrap">
            <p className="cote" aria-hidden="true" data-reveal-unhide="" data-reveal="Franchir">********</p>
            <div className="cross-track" aria-hidden="true"> <span className="cross-word"><Masque texte="Au-delà" masque="*******" /></span> </div>
            <div className="mom-duo">
              <template data-reveal-target="#versant-1" dangerouslySetInnerHTML={{ __html: VERSANT_1 }} />
              <div className="colL" id="versant-1">
                <h2 className="mom-title"><span aria-hidden="true"><span className="redact" style={{ width: "7ch" }} /> <span className="redact" style={{ width: "3ch" }} /> <span className="redact" style={{ width: "2ch" }} /> <span className="redact" style={{ width: "5ch" }} /> <span className="redact" style={{ width: "5ch" }} /> <span className="redact" style={{ width: "10ch" }} /></span><span className="visually-hidden">Titre sous embargo</span></h2>
                <p className="lead" aria-hidden="true"><span className="redact" style={{ display: "block", height: "0.6em", width: "100%" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "100%", marginTop: "12px" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "100%", marginTop: "12px" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "58%", marginTop: "12px" }} /></p>
                <span className="visually-hidden">Texte sous embargo</span>
              </div>
              <figure className="mom-photo"> <img src="/assets/img/2-1600.webp" srcSet="/assets/img/2-800.webp 800w, /assets/img/2-1600.webp 1600w" sizes="(min-width: 1024px) 720px, calc(94vw - 40px)" alt="Le public de TEDxUTTroyes dans l'auditorium du Centre de Congrès de l'Aube" width="1600" height="1066" loading="lazy" /> </figure>
            </div>
          </div>
        </section>

        <section className="mom mom--droite" id="moment-3" data-line="cross" data-cross-dir="rtl">
          <div className="mwrap">
            <p className="cote" aria-hidden="true" data-reveal-unhide="" data-reveal="S'adapter">*'*******</p>
            <div className="cross-track cross-track--rtl" aria-hidden="true"> <span className="cross-word"><Masque texte="Jusqu'ici" /></span> </div>
            <div className="mom-duo mom-duo--rtl">
              <figure className="mom-photo"> <img src="/assets/img/1-1600.webp" srcSet="/assets/img/1-800.webp 800w, /assets/img/1-1600.webp 1600w" sizes="(min-width: 1024px) 720px, calc(94vw - 40px)" alt="Jamy Gourmaud sur la scène de TEDxUTTroyes, devant les lettres rouges" width="1600" height="900" loading="lazy" /> </figure>
              <template data-reveal-target="#versant-2" dangerouslySetInnerHTML={{ __html: VERSANT_2 }} />
              <div className="colR" id="versant-2">
                <h2 className="mom-title"><span aria-hidden="true"><span className="redact" style={{ width: "2ch" }} /> <span className="redact" style={{ width: "3ch" }} /> <span className="redact" style={{ width: "2ch" }} /> <span className="redact" style={{ width: "2ch" }} /> <span className="redact" style={{ width: "8ch" }} /> <span className="redact" style={{ width: "3ch" }} /></span><span className="visually-hidden">Titre sous embargo</span></h2>
                <p className="lead" aria-hidden="true"><span className="redact" style={{ display: "block", height: "0.6em", width: "100%" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "100%", marginTop: "12px" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "100%", marginTop: "12px" }} /><span className="redact" style={{ display: "block", height: "0.6em", width: "72%", marginTop: "12px" }} /></p>
                <span className="visually-hidden">Texte sous embargo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mom" id="speakers">
          <div className="mwrap">
            <p className="cote">Speakers</p>
            <div className="colL">
              <h2 className="mom-title" data-reveal="Six noms s'apprêtent à franchir">Six noms s'apprêtent à monter sur scène </h2>
              <p className="lead" data-reveal="Le 18 mars, six talks racontent la limite depuis la scène troyenne : 18 minutes chacun, pas une de plus. Les annonces tomberont une par une d'ici mars."> Le ** ****, six talks se succèdent sur la scène troyenne : 18 minutes chacun, pas une de plus. Les annonces tomberont une par une d'ici au jour J.</p>
            </div>
            <ol className="slist" data-line="avoid" data-line-flank="" data-line-margin="28" data-line-margin-m="14" aria-label="Les six intervenantes et intervenants de 2027, annonces à venir">
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 01</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "4.5ch" }} /><span className="redact" style={{ width: "7ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 02</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "6ch" }} /><span className="redact" style={{ width: "5ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 03</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "5ch" }} /><span className="redact" style={{ width: "8.5ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 04</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "7.5ch" }} /><span className="redact" style={{ width: "4ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 05</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "5.5ch" }} /><span className="redact" style={{ width: "6.5ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
              <li className="sl-row"> <span className="sl-photo" aria-hidden="true" /> <span className="sp-id">Intervenant·e 06</span> <span className="sl-name" aria-hidden="true"><span className="redact" style={{ width: "4ch" }} /><span className="redact" style={{ width: "9ch" }} /></span> <span className="visually-hidden">Nom sous embargo</span> <span className="sp-status">annonce : à venir</span> </li>
            </ol>
            <div className="colL more-row actions"> <a className="btn btn--ghost" href="/devenir-speaker/">Postuler comme speaker</a> <a className="link-more" href="/speakers/">Ouvrir les six fiches <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M9 18l6-6-6-6" /> </svg> </a> </div>
          </div>
        </section>

        <section className="mom" id="lieu">
          <div className="mwrap">
            <p className="cote">Le lieu</p>
            <div className="colL">
              <h2 className="mom-title">Une salle au bord du canal</h2>
              <p className="lead">Le Centre de Congrès de l'Aube, à un quart d'heure à pied de la gare et au ras du centre ancien, offre une scène unique et une acoustique dessinée pour la voix. Ici, la ligne plie.</p>
            </div>
            <figure className="m3-lieu" data-line="avoid" data-line-side="right" data-line-flank="" data-line-margin="28" data-line-margin-m="14">
              <div className="lieu-trio">
                <div className="lieu-photo">
                  <img src="/assets/img/lieu/centre-congres.webp" srcSet={"/assets/img/lieu/centre-congres-640.webp 640w,\n                    /assets/img/lieu/centre-congres-720.webp 720w,\n                    /assets/img/lieu/centre-congres-960.webp 960w,\n                    /assets/img/lieu/centre-congres.webp 1280w"} sizes="(min-width: 1024px) 500px, calc(94vw - 40px)" alt="La foule devant le Centre de Congrès de l'Aube, à Troyes" width="1280" height="957" loading="lazy" />
                  <p className="lieu-mot" aria-hidden="true">Le lieu</p>
                </div>
                <div className="lieu-scene">
                  <svg className="lieu-plan" viewBox="0 0 240 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"> <rect className="pl-bg" width="240" height="330" /> <g className="pl-rue pl-rue--fine"> <path d="M96 0 L150 92" /> <path d="M150 0 L204 62" /> <path d="M104 118 L96 330" /> <path d="M0 290 L240 268" /> </g> <g className="pl-rue"> <path d="M0 52 L240 30" /> <path d="M34 0 L58 330" /> <path d="M0 232 L240 210" /> </g> <path className="pl-canal" d="M168 0 C158 60 176 120 164 190 C156 240 174 290 168 330" /> <text className="pl-txt" x="66" y="42" transform="rotate(-5 66 42)">bd danton</text> <text className="pl-txt" x="40" y="96" transform="rotate(86 40 96)">rue de la paix</text> <text className="pl-txt" x="64" y="226" transform="rotate(-5 64 226)">rue charles gros</text> <text className="pl-txt" x="92" y="206" transform="rotate(88 92 206)">rue louis ulbach</text> <text className="pl-txt pl-txt--poi" x="14" y="140">théâtre de</text> <text className="pl-txt pl-txt--poi" x="14" y="151">champagne</text> <text className="pl-txt pl-txt--poi" x="188" y="98">cathédrale</text> <text className="pl-txt pl-txt--poi" x="186" y="158" transform="rotate(84 186 158)">le canal</text> <circle className="pl-ici-dot" cx="146" cy="178" r="6" /> <text className="pl-txt pl-txt--ici" x="58" y="182">vous êtes ici</text> <rect className="pl-fig" y="306" width="240" height="24" /> <text className="pl-txt" x="10" y="321">plan de situation</text> </svg>
                  <div className="lieu-map" id="lieu-map" aria-label="Carte interactive du quartier : Centre de Congrès de l'Aube, 2 rue Pierre Labonde, 10000 Troyes"> </div>
                </div>
                <div className="lieu-info">
                  <ul className="facts">
                    <li> <strong>Jusqu'à 750 personnes</strong> <span className="data">configuration auditorium</span> </li>
                    <li> <strong>À un quart d'heure à pied de la gare</strong> <span className="data">bus TCAT et parkings publics à proximité</span> </li>
                  </ul>
                  <div className="lieu-fiche">
                    <p className="lieu-fiche-kicker">Adresse</p>
                    <p className="lieu-fiche-nom">Centre de Congrès de l'Aube</p>
                    <p className="lieu-fiche-adresse">2 rue Pierre Labonde<br />10000 Troyes</p>
                    <a className="link-more" href={"https://www.google.com/maps/search/?api=1&query=Centre+de+Congr%C3%A8s+de+l%27Aube+Troyes"} target="_blank" rel="noopener">Voir sur la carte<span className="visually-hidden"> (nouvelle fenêtre)</span> <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M7 17L17 7M9 7h8v8" /> </svg> </a>
                  </div>
                </div>
              </div>
              <figcaption><span className="fig-id">le Centre de Congrès de l'Aube</span>, photo, plan de situation et carte</figcaption>
            </figure>
          </div>
        </section>

        <section className="mom" id="programme">
          <div className="mwrap">
            <p className="cote">Programme</p>
            <div className="colL">
              <h2 className="mom-title">La soirée, réglée au quart d'heure</h2>
              <p className="lead">Portes à 18h00 avec un mini forum de recrutement, premier talk à 19h30, dernier talk à 22h30. La feuille de salle tient en 6 temps.</p>
            </div>
            <ol data-reveal-attr="aria-label" data-reveal="Le déroulé de la soirée du 18 mars 2027" className="tl" aria-label="Le déroulé de la soirée du ** **** ****">
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/recrutement-980.webp" srcSet="/assets/img/recrutement-600.webp 600w, /assets/img/recrutement-980.webp 980w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="980" height="490" loading="lazy" /> </figure>
                  <span className="tl-time">18h00</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Ouverture des portes et mini forum de recrutement</p>
                  <p className="tl-desc">Dans le hall, les entreprises partenaires et les associations rencontrent le public : stages, alternances, premiers emplois. CV bienvenus.</p>
                </div>
              </li>
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/ouverture-1200.webp" srcSet="/assets/img/ouverture-600.webp 600w, /assets/img/ouverture-1200.webp 1200w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="1200" height="600" loading="lazy" /> </figure>
                  <span className="tl-time">19h30</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Ouverture de la soirée</p>
                  <p className="tl-desc">Le thème est posé : <Masque texte="franchir ou s'adapter" />&nbsp;?</p>
                </div>
              </li>
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/talk1-1200.webp" srcSet="/assets/img/talk1-600.webp 600w, /assets/img/talk1-1200.webp 1200w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="1200" height="600" loading="lazy" /> </figure>
                  <span className="tl-time">19h45</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Première session de talks</p>
                  <p className="tl-desc">Trois premières prises de parole.</p>
                </div>
              </li>
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/entracte-1200.webp" srcSet="/assets/img/entracte-600.webp 600w, /assets/img/entracte-1200.webp 1200w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="1200" height="600" loading="lazy" /> </figure>
                  <span className="tl-time">20h50</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Entracte</p>
                  <p className="tl-desc">Trente minutes pour confronter les premières idées, après une petite surprise.</p>
                </div>
              </li>
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/talk2-1200.webp" srcSet="/assets/img/talk2-600.webp 600w, /assets/img/talk2-1200.webp 1200w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="1200" height="600" loading="lazy" /> </figure>
                  <span className="tl-time">21h20</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Seconde session de talks</p>
                  <p className="tl-desc">Trois prises de parole pour finir de faire le tour de la ligne.</p>
                </div>
              </li>
              <li className="tl-row">
                <div className="tl-left">
                  <figure className="tl-ph" aria-hidden="true"> <img src="/assets/img/cocktail-1200.webp" srcSet="/assets/img/cocktail-600.webp 600w, /assets/img/cocktail-1200.webp 1200w" sizes="(min-width: 1024px) 300px, 260px" alt="" width="1200" height="600" loading="lazy" /> </figure>
                  <span className="tl-time">22h30</span>
                </div>
                <span className="tl-dot" aria-hidden="true" />
                <div className="tl-body">
                  <p className="tl-title">Pot VIP</p>
                  <p className="tl-desc">Un moment privilégié pour rencontrer les intervenantes et intervenants autour d'un verre.</p>
                </div>
              </li>
            </ol>
            <p className="more-row"> <a className="link-more" href="/programme/">Lire la feuille de salle complète <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M9 18l6-6-6-6" /> </svg> </a> </p>
          </div>
        </section>

        <section className="mom mom--frise" id="dixieme-edition" data-line-flank="">
          <div className="mwrap">
            <p className="cote">Dixième édition</p>
            <div className="colL">
              <h2 className="mom-title">La ligne vient de loin</h2>
              <p className="lead">Neuf éditions, une seule scène. Depuis 2016, l'équipe s'est donnée pour mission de faire rayonner les idées et les passions.</p>
            </div>
            <p className="fr-caption">L'album des éditions · 2016 à 2027 · <span className="fr-fil">les affiches au fil de la ligne</span><span className="fr-swipe">glissez pour parcourir les affiches</span></p>
            <ol className="album" data-line="turn" aria-label="L'album des éditions TEDxUTTroyes, de 2016 à 2027">
              <li className="alb-item" style={{ "--c": "1", "--th": "0" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2016/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2016/visuel.webp" alt="Affiche de l'édition 2016 : Shape the future" width="840" height="840" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2016/"><span className="fr-y">2016</span><span className="fr-t" lang="en">Shape the future</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "2", "--th": "0.08" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2017/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2017/visuel.webp" alt="Affiche de l'édition 2017 : To the Limits and Beyond" width="840" height="840" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2017/"><span className="fr-y">2017</span><span className="fr-t" lang="en">To the Limits and Beyond</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "3", "--th": "0.16" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2019/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2019/affiche.webp" alt="Affiche de l'édition 2019 : Thinking outside the box" width="595" height="842" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2019/"><span className="fr-y">2019</span><span className="fr-t" lang="en">Thinking outside the box</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "4", "--th": "0.24" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2021/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2021/affiche.webp" alt="Affiche de l'édition 2021 : Changing codes" width="840" height="840" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2021/"><span className="fr-y">2021</span><span className="fr-t" lang="en">Changing codes</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "5", "--th": "0.32" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2022/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2022/affiche.webp" alt="Affiche de l'édition 2022 : Circulation" width="840" height="1188" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2022/"><span className="fr-y">2022</span><span className="fr-t">Circulation</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "6", "--th": "0.40" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2023/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2023/affiche.webp" alt="Affiche de l'édition 2023 : Impacting our world" width="840" height="1188" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2023/"><span className="fr-y">2023</span><span className="fr-t" lang="en">Impacting our world</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "7", "--th": "0.48" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2024/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2024/affiche.webp" alt="Affiche de l'édition 2024 : Le monde de demain" width="840" height="1188" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2024/"><span className="fr-y">2024</span><span className="fr-t">Le monde de demain</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "8", "--th": "0.56" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2025/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2025/affiche.webp" alt="Affiche de l'édition 2025 : Réveiller l'avenir" width="840" height="1188" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2025/"><span className="fr-y">2025</span><span className="fr-t">Réveiller l'avenir</span></a></span>
              </li>
              <li className="alb-item" style={{ "--c": "9", "--th": "0.64" } as React.CSSProperties}>
                <figure className="alb-img"> <a href="/editions/edition-2026/" tabIndex={-1} aria-hidden="true"> <img src="/assets/img/editions/2026/affiche.webp" alt="Affiche de l'édition 2026 : Un futur à bâtir" width="840" height="1233" loading="lazy" /> </a> </figure>
                <span className="alb-dot" aria-hidden="true" />
                {' '}
                <span className="alb-lbl"><a href="/editions/edition-2026/"><span className="fr-y">2026</span><span className="fr-t">Un futur à bâtir</span></a></span>
              </li>
              <li className="alb-item alb-item--end" style={{ "--c": "10", "--th": "0.72" } as React.CSSProperties}> <span className="alb-end-label"> <span className="fr-y">2027</span> <span className="fr-t"><Masque texte="Franchir ou s'adapter" />&nbsp;?</span> <span className="fr-end-note">Dixième édition · <Masque texte="18 mars 2027" /> · vous êtes ici</span> </span> <span className="alb-dot alb-dot--end" data-line="drop" aria-hidden="true" /> </li>
            </ol>
            <figure className="arch">
              <ul className="arch-strip">
                <li><img src="/assets/img/editions/2024/galerie/01.webp" alt="La scène du TEDxUTTroyes 2024" width="1400" height="933" loading="lazy" /></li>
                <li><img src="/assets/img/editions/2023/galerie/04.webp" alt="Le public de l'édition 2023" width="1400" height="933" loading="lazy" /></li>
                <li><img src="/assets/img/editions/2024/galerie/03.webp" alt="Un talk de l'édition 2024" width="1400" height="933" loading="lazy" /></li>
                <li><img src="/assets/img/editions/2023/galerie/07.webp" alt="Karim Hechmi sur la scène de l'édition 2023" width="1400" height="933" loading="lazy" /></li>
                <li><img src="/assets/img/editions/2024/galerie/06.webp" alt="Un moment de l'édition 2024" width="1400" height="933" loading="lazy" /></li>
                <li><img src="/assets/img/editions/2023/galerie/09.webp" alt="L'équipe organisatrice de l'édition 2023" width="1400" height="933" loading="lazy" /></li>
              </ul>
              <figcaption> Les éditions 2023 et 2024 photographiées par <a href="https://www.instagram.com/argentiqueutt/" target="_blank" rel="noopener">Argentique UTT</a> </figcaption>
            </figure>
            <ul className="data-lines" data-line="avoid" data-line-margin="28" data-line-margin-m="14" aria-label="La dixième édition en chiffres">
              <li><strong>61</strong><span>talks partagés sur la scène troyenne depuis 2016</span></li>
              <li><strong>2500</strong><span>spectateurs cumulés sur 9 éditions</span></li>
              <li><strong>750</strong><span>fauteuils le <Masque texte="18 mars 2027" /> pas un de plus</span></li>
            </ul>
            <p className="colL more-row"> <a className="link-more" href="/editions/">Ouvrir le registre des éditions <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M9 18l6-6-6-6" /> </svg> </a> </p>
          </div>
        </section>

        <section className="mom mom--tedx" id="tedx">
          <div className="mwrap">
            <p className="cote">Le programme TEDx</p>
            <div className="colL">
              <h2 className="h-md">Qu'est-ce que TEDx&nbsp;?</h2>
              <p className="lead">TED est une organisation à but non lucratif dédiée à la diffusion d'idées, généralement sous la forme de courtes conférences (18 minutes maximum) données par des experts, chercheurs, entrepreneurs ou artistes, autour de la devise « idées qui méritent d'être partagées ».<br /><br /> Dans cet esprit, TED a créé le programme TEDx, qui permet à des communautés locales et indépendantes d'organiser leurs propres événements pour recréer une expérience proche de celle des conférences TED. Chaque événement TEDx est organisé de façon autonome, sous licence de TED, mais respecte le même format et les mêmes valeurs.</p>
              <div className="actions more-row"> <a className="btn btn--ghost" href="https://www.ted.com/tedx" target="_blank" rel="noopener">Le programme TEDx : ted.com/tedx<span className="visually-hidden"> (nouvelle fenêtre)</span> <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"> <path d="M7 17L17 7M9 7h8v8" /> </svg> </a> </div>
            </div>
            <figure className="tedx-logo" data-line="avoid" data-line-side="right" data-line-exit="tight" data-line-margin="28" data-line-margin-m="14"> <img src="/assets/img/logo-white.png" alt="TEDxUTTroyes" width="500" height="105" loading="lazy" /> </figure>
          </div>
        </section>

        <section className="final-cta" id="billetterie">
          <div className="mwrap">
            <p className="cote">Billetterie</p>
            <div className="colL">
              <h2 className="final-title">La salle s'arrête à 750 fauteuils. C'est la seule limite de la soirée que personne ne franchira.</h2>
            </div>
            <div className="final-plug">
              <a className="btn btn--primary" data-line="plug" href="https://www.billetweb.fr/tedxuttroyes-2027-10e-edition" target="_blank" rel="noopener">Réserver ma place</a>
              <p className="final-note">Billetterie hébergée sur Billetweb. Aucune donnée n'est collectée sur ce site.</p>
            </div>
          </div>
        </section>
        </main>

        <PiedDePage finale />
      </div>
    </>
  );
}
