/* TEDxUTTroyes 2027 - script principal ("Le releve")
   Zero dependance, charge en defer.
   Modules : etat du header, interlude de l'accueil, filigrane de la
   dixieme edition, menu mobile accessible, telescripteur du compte a
   rebours, trace du dixieme baton. L'allumage de la feuille de salle de l'accueil est
   pilote par line-v8.js (la pointe du trait franchit les pastilles). */

(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------
     Header : fond plus dense des que la page defile
     ------------------------------------------------------------------ */
  var header = doc.querySelector(".site-header");
  if (header) {
    var scrolledFlag = false;
    var onScroll = function () {
      var scrolled = window.scrollY > 4;
      if (scrolled !== scrolledFlag) {
        scrolledFlag = scrolled;
        header.classList.toggle("is-scrolled", scrolled);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
     Menu mobile : bouton burger, fermeture Echap, focus gere
     ------------------------------------------------------------------ */
  var toggle = doc.querySelector(".nav-toggle");
  var menu = doc.getElementById("menu-mobile");

  if (toggle && menu) {
    var focusablesSel = "a[href], button:not([disabled])";
    var menuOpen = false;

    var openMenu = function () {
      menuOpen = true;
      menu.removeAttribute("hidden");
      doc.body.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      window.requestAnimationFrame(function () {
        menu.classList.add("is-open");
      });
      var first = menu.querySelector(focusablesSel);
      if (first) {
        first.focus();
      }
    };

    var closeMenu = function (refocus) {
      menuOpen = false;
      menu.classList.remove("is-open");
      doc.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      window.setTimeout(function () {
        if (!menuOpen) {
          menu.setAttribute("hidden", "");
        }
      }, 260);
      if (refocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", function () {
      if (menuOpen) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu(false);
      }
    });

    doc.addEventListener("keydown", function (event) {
      if (!menuOpen) {
        return;
      }
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (event.key === "Tab") {
        var items = menu.querySelectorAll(focusablesSel);
        if (!items.length) {
          return;
        }
        var firstItem = items[0];
        var lastItem = items[items.length - 1];
        if (event.shiftKey && doc.activeElement === firstItem) {
          event.preventDefault();
          lastItem.focus();
        } else if (!event.shiftKey && doc.activeElement === lastItem) {
          event.preventDefault();
          firstItem.focus();
        }
      }
    });

    /* Le seuil ou la barre complete remplace le burger : 1160 px
       depuis l'arrivee du bouton Nous rejoindre (2026-08-28), et il
       doit rester d'accord avec les trois blocs media du header en
       section 07 de la feuille. */
    var desktopQuery = window.matchMedia("(min-width: 1160px)");
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", function (mq) {
        if (mq.matches && menuOpen) {
          closeMenu(false);
        }
      });
    }
  }

  /* ------------------------------------------------------------------
     Telescripteur : compte a rebours en une seule ligne mono.

     Deux cibles successives, toutes deux figees en UTC (aucun calcul de
     fuseau cote client) :

     1. la revelation, samedi 31 octobre 2026 a 18h00 a Paris. L'heure
        d'hiver est revenue le 25 octobre (UTC+1), soit 17h00 UTC. Quand
        elle tombe, le telescripteur demande a reveal.js de devoiler la
        page, puis enchaine sur la cible suivante ;
     2. le jour J, jeudi 18 mars 2027 a 18h00 (ouverture des portes et
        mini forum de recrutement), heure d'hiver aussi, soit 17h00 UTC.

     Une page ouverte depuis longtemps bascule donc toute seule, et une
     page ouverte apres la revelation part directement sur le jour J.
     ------------------------------------------------------------------ */
  var tickerValue = doc.getElementById("ticker-value");
  if (tickerValue) {
    var REVELATION = window.TEDX_REVEAL
      ? window.TEDX_REVEAL.at
      : Date.UTC(2026, 9, 31, 17, 0, 0);
    var JOUR_J = Date.UTC(2027, 2, 18, 17, 0, 0);
    var DAY = 86400000;
    var HOUR = 3600000;
    var MINUTE = 60000;
    var tickerLabel = doc.querySelector(".ticker-label");
    var timerId = 0;
    var target = Date.now() >= REVELATION ? JOUR_J : REVELATION;

    var pad = function (value) {
      return value < 10 ? "0" + value : String(value);
    };

    var tick = function () {
      var diff = target - Date.now();
      if (diff <= 0) {
        if (target === REVELATION) {
          /* L'heure dite : le site retrouve sa version d'origine, et le
             compte a rebours reprend sa course vers le jour J. */
          if (window.TEDX_REVEAL) {
            window.TEDX_REVEAL.run();
          }
          target = JOUR_J;
          tick();
          return;
        }
        window.clearInterval(timerId);
        if (tickerLabel) {
          tickerLabel.textContent = "C'est ce soir";
        }
        tickerValue.textContent = "Ouverture des portes 18h00";
        return;
      }
      var days = Math.floor(diff / DAY);
      var hours = Math.floor((diff % DAY) / HOUR);
      var minutes = Math.floor((diff % HOUR) / MINUTE);
      var seconds = Math.floor((diff % MINUTE) / 1000);
      tickerValue.textContent =
        "J-" + days + " · " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    };

    tick();
    if (target - Date.now() > 0) {
      timerId = window.setInterval(tick, 1000);
    }
  }

  /* ------------------------------------------------------------------
     L'interlude : le panneau fixe qui recouvre le contenu entre le
     seuil et le theme. Son opacite suit la course de l'espaceur pose
     dans le flux.

     On lit la position de l'espaceur A L'ECRAN (getBoundingClientRect)
     et non le scroll : sur l'accueil en bureau, le contenu est translate
     par line.js avec un lissage et des fenetres de gel, et le rect en
     tient compte tout seul. Le panneau reste donc d'accord avec le
     contenu quel que soit le regime.
     ------------------------------------------------------------------ */
  var interlude = doc.querySelector(".interlude");
  var espace = doc.querySelector(".interlude-espace");
  if (interlude && espace && !reduceMotion.matches) {
    var clamp01 = function (v) {
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };
    var lisse = function (v) {
      return v * v * (3 - 2 * v);
    };
    var video = interlude.querySelector(".interlude-mark");
    var cibleVideo = -1;

    /* Un seul deplacement a la fois. Sans ce garde-fou, chaque image de
       defilement empile une demande et la video hoquette. */
    var poserVideo = function () {
      if (!video || video.seeking || cibleVideo < 0) {
        return;
      }
      if (Math.abs(video.currentTime - cibleVideo) > 0.02) {
        try {
          video.currentTime = cibleVideo;
        } catch (e) {}
      }
    };

    if (video) {
      video.addEventListener("seeked", poserVideo);
    }
    var rafInter = 0;
    var jusqua = 0;
    var derniere = -1;
    var dernierZoom = -1;
    var vu = 0;

    var majInterlude = function () {
      var r = espace.getBoundingClientRect();
      if (!r.height) {
        return;
      }
      var vh = window.innerHeight;
      /* Une seule course, du moment ou l'espaceur pointe par le bas de
         l'ecran (q = 0) a celui ou il en sort par le haut (q = 1), et
         un trapeze dessus : le panneau se leve, TIENT, puis s'efface.

         Ce qui passe derriere pendant la levee et la sortie n'a pas
         d'importance : le panneau est opaque, il masque tout. Ce qui
         compte est le palier, ou l'opacite vaut 1 franchement, sans
         quoi le contenu transparait sans arret et l'interlude ne tient
         jamais l'ecran. Les bornes sont des fractions de la course :
         elles suivent l'espaceur si on change sa hauteur.

         Trois choses se jouent sur cette meme course : le panneau se
         leve (0 a 0,34), il tient (0,34 a 0,60), il part (0,60 a 0,86) ;
         le zoom epaissit LA ligne de la page puis la rend a son trait ;
         et la video se deroule au fil du defilement, pas au fil du
         temps. */
      var total = r.height + vh;
      var q = clamp01((vh - r.top) / total);

      /* Une fois par jour : des que le panneau a tenu l'ecran, on note
         l'instant. Le script en tete d'index.html relit cette date au
         chargement et ne saute l'interlude que si elle a moins de
         vingt-quatre heures (86 400 000 ms), sinon il le rejoue. Le
         temoin s'ecrit ici et non au chargement : quelqu'un qui repart
         du seuil sans avoir defile jusque-la n'a rien vu, il aura droit
         au panneau. */
      if (!vu && q > 0.5) {
        vu = 1;
        try {
          localStorage.setItem("tedx-interlude-vu", String(Date.now()));
        } catch (e) {}
      }
      var o = Math.min(
        lisse(clamp01(q / 0.34)),
        1 - lisse(clamp01((q - 0.60) / 0.26))
      );
      if (Math.abs(o - derniere) > 0.004) {
        derniere = o;
        interlude.style.opacity = o.toFixed(3);
      }

      /* Le zoom : une bosse sur la course, qui pousse puis se retire
         avant le depart du panneau. Il porte sur LA ligne de la page,
         pas sur un trait de decor : --ligne-zoom part sur html, la
         feuille epaissit le path du SVG. La scene, elle, s'avance d'un
         cran pour accompagner le geste. */
      var z = Math.min(
        lisse(clamp01((q - 0.12) / 0.26)),
        1 - lisse(clamp01((q - 0.56) / 0.26))
      );
      if (Math.abs(z - dernierZoom) > 0.004) {
        dernierZoom = z;
        interlude.style.setProperty("--zoom", z.toFixed(3));
        doc.documentElement.style.setProperty("--ligne-zoom", z.toFixed(3));
      }

      /* La video de la marque. Son src n'est pose qu'a l'approche, elle
         ne coute donc rien tant qu'on ne descend pas jusqu'ici. Muette
         et playsinline, elle n'est jamais lue : on ne fait que la
         deplacer dans le temps.

         Deux fichiers, choisis a l'usage : la marque fait 391 px de
         large en bureau et 140 px sur telephone, servir la grande
         version a un telephone serait une facture pour rien. Le seuil
         est celui du repli empile de la feuille, les deux doivent
         rester d'accord.

         Le format est du H.264 en MP4, pas du VP9 en WebM : c'est le
         seul que tous les appareils lisent, iPhone compris, et il se
         trouve qu'il est ici plus leger a qualite egale. */
      if (video) {
        if (q > 0.02 && !video.getAttribute("src")) {
          var petit = video.getAttribute("data-src-petit");
          var choisi = petit && window.matchMedia("(max-width: 767px)").matches
            ? petit
            : video.getAttribute("data-src");
          video.setAttribute("src", choisi);
          video.load();
        }
        /* Elle ne se joue pas, elle se deroule : sa position dans le
           temps suit la position dans la page, du debut du passage a sa
           fin. Defiler vite la fait defiler vite, remonter la fait
           revenir en arriere. Elle reste donc en pause, on ne fait que
           deplacer currentTime.

           On ne lance jamais un deplacement pendant qu'un autre est en
           cours : les demandes s'empileraient et la lecture saccaderait.
           La cible est gardee de cote, et l'evenement seeked rattrape ce
           qui a bouge entre-temps. Le fichier etant tout en images cles
           (voir plus bas), chaque deplacement est immediat.

           Cela demande un serveur qui accepte les requetes Range, sans
           quoi le deplacement echoue et la video reste sur sa premiere
           image. Apache le fait ; le http.server de Python, non (d'ou
           .claude/serveur-range.py pour les essais en local). */
        if (video.readyState >= 1 && video.duration) {
          cibleVideo = clamp01(q / 0.86) * video.duration;
          poserVideo();
        }
      }
    };

    var boucle = function () {
      majInterlude();
      rafInter = Date.now() < jusqua ? window.requestAnimationFrame(boucle) : 0;
    };

    /* On continue un peu apres le dernier evenement : la translation du
       contenu est lissee (lerp), elle met quelques images a se poser. */
    var reveiller = function () {
      jusqua = Date.now() + 400;
      if (!rafInter) {
        rafInter = window.requestAnimationFrame(boucle);
      }
    };

    window.addEventListener("scroll", reveiller, { passive: true });
    window.addEventListener("resize", reveiller, { passive: true });
    majInterlude();
  }

  /* ------------------------------------------------------------------
     Le filigrane de la dixieme edition : le X moire en fond, du premier
     versant du theme jusqu'a la billetterie.

     Le geste : la fenetre de l'ecran parcourt le dessin du haut vers sa
     base. Au sommet de la zone on voit le haut du X, au bas on voit sa
     base. Cela demande un dessin plus haut que l'ecran (la feuille lui
     donne deux hauteurs d'ecran), sans quoi il n'y aurait rien a
     parcourir.

     On lit la position A L'ECRAN (getBoundingClientRect) et non le
     scroll : sur l'accueil en bureau le contenu est translate par
     line.js avec un lissage et des fenetres de gel, et le rect en tient
     compte tout seul.
     ------------------------------------------------------------------ */
  var fond = doc.querySelector(".fond-marque");
  var fondA = doc.getElementById("moment-2");
  var fondB = doc.getElementById("billetterie");
  if (fond && fondA && fondB) {
    var fondImg = fond.querySelector("img");
    var fondH = 0;
    var fondY = null;
    var rafFond = 0;
    var fondJusqua = 0;

    /* La zone se mesure dans le repere du contenu : main est positionne
       et les deux sections en sont filles directes, offsetTop suffit. */
    var mesurerFond = function () {
      var t = fondA.offsetTop;
      fondH = fondB.offsetTop + fondB.offsetHeight - t;
      fond.style.setProperty("--fond-t", t + "px");
      fond.style.setProperty("--fond-h", fondH + "px");
    };

    var majFond = function () {
      if (!fondH || !fondImg) {
        return;
      }
      var hImg = fondImg.offsetHeight;
      if (!hImg) {
        return;
      }
      var vh = window.innerHeight;
      var r = fond.getBoundingClientRect();
      var course = Math.max(1, r.height - vh);
      var s = -r.top;
      if (s < 0) {
        s = 0;
      } else if (s > course) {
        s = course;
      }
      /* p vaut 0 au sommet du dessin, 1 a sa base. En reduced motion la
         fenetre ne se deplace plus : elle se pose au milieu du dessin et
         l'y reste, le filigrane parait alors immobile a l'ecran. */
      var p = reduceMotion.matches ? 0.5 : s / course;
      var y = Math.round(s - p * (hImg - vh));
      if (y !== fondY) {
        /* Tant que la position bouge, on prolonge la boucle : sur
           l'accueil en bureau, la translation du contenu est lissee et
           peut mettre plus longtemps a se poser que le sursis fixe qui
           suit le dernier evenement de defilement. Sans cela le
           filigrane se figeait avant le contenu et paraissait en
           retard. */
        fondJusqua = Math.max(fondJusqua, Date.now() + 200);
        fondY = y;
        fondImg.style.setProperty("--fond-y", y + "px");
      }
    };

    var boucleFond = function () {
      majFond();
      rafFond = Date.now() < fondJusqua ? window.requestAnimationFrame(boucleFond) : 0;
    };

    /* On replace le filigrane des l'evenement de defilement, avant meme
       d'armer la boucle : un navigateur qui bride ses images (onglet en
       arriere-plan, economie d'energie) le laisserait sinon en arriere
       d'autant d'images qu'il en saute. La boucle prend ensuite le
       relais pour suivre le lissage de la translation du contenu. */
    var reveillerFond = function () {
      majFond();
      fondJusqua = Date.now() + 400;
      if (!rafFond) {
        rafFond = window.requestAnimationFrame(boucleFond);
      }
    };

    var refaireFond = function () {
      mesurerFond();
      majFond();
    };

    window.addEventListener("scroll", reveillerFond, { passive: true });
    window.addEventListener("resize", function () {
      refaireFond();
      reveillerFond();
    }, { passive: true });
    /* La geometrie bouge encore apres le premier rendu (polices, images,
       build de line.js) : on remesure a chaque changement de taille du
       contenu, et une derniere fois au chargement complet. */
    if (window.ResizeObserver) {
      var contenu = doc.getElementById("contenu");
      if (contenu) {
        new window.ResizeObserver(refaireFond).observe(contenu);
      }
    }
    window.addEventListener("load", refaireFond);
    refaireFond();
  }

  /* ------------------------------------------------------------------
     Le dixieme baton : le trait rouge du tally se trace une fois,
     quand la figure entre dans le viewport.
     ------------------------------------------------------------------ */
  var tally = doc.querySelector(".tally");
  if (tally) {
    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      tally.classList.add("is-in");
    } else {
      var tallyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              tallyObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      tallyObserver.observe(tally);
    }
  }
})();
