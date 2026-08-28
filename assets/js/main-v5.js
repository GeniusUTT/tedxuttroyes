/* TEDxUTTroyes 2027 - script principal ("Le releve")
   Zero dependance, charge en defer.
   Modules : etat du header, repere d'ouverture de l'accueil, menu
   mobile accessible, telescripteur du compte a rebours, trace du
   dixieme baton. L'allumage de la feuille de salle de l'accueil est
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
     Le repere d'ouverture : la phrase posee au milieu de l'accueil
     s'efface des que la lecture commence (demande de Baptiste le
     2026-08-28). Meme seuil que le fond du header, et une seule fois :
     l'ecouteur se retire de lui-meme, le repere ne revient pas si l'on
     remonte en haut de la page.

     Sur l'accueil en bureau la page est en defilement virtuel, mais
     window.scrollY continue d'avancer normalement : ce signal vaut dans
     les deux regimes. Le fondu est en CSS (classe repere-off sur html),
     le script ne fait que donner le depart. */
  var repere = doc.querySelector(".repere");
  if (repere) {
    var closeRepere = function () {
      doc.documentElement.classList.add("repere-off");
      window.removeEventListener("scroll", onRepereScroll);
    };
    var onRepereScroll = function () {
      if (window.scrollY > 4) {
        closeRepere();
      }
    };
    window.addEventListener("scroll", onRepereScroll, { passive: true });
    /* Rechargement au milieu de la page, ou retour par l'historique :
       la lecture a deja commence, le repere n'a plus lieu d'etre. */
    onRepereScroll();
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
