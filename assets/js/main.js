/* TEDxUTTroyes 2027 - script principal ("Le releve")
   Zero dependance, charge en defer.
   Modules : etat du header, menu mobile accessible, telescripteur
   du compte a rebours, trace du dixieme baton. Les reveals au scroll
   ont ete retires volontairement : une seule sequence d'entree suffit. */

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

    var desktopQuery = window.matchMedia("(min-width: 1024px)");
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
     Cible figee en UTC : le 18 mars 2027 a 18h00 (ouverture des portes
     et mini forum de recrutement), Paris est en heure d'hiver (UTC+1),
     soit 17h00 UTC. Aucun calcul de fuseau cote client.
     ------------------------------------------------------------------ */
  var tickerValue = doc.getElementById("ticker-value");
  if (tickerValue) {
    var TARGET = Date.UTC(2027, 2, 18, 17, 0, 0);
    var DAY = 86400000;
    var HOUR = 3600000;
    var MINUTE = 60000;
    var tickerLabel = doc.querySelector(".ticker-label");
    var timerId = 0;

    var pad = function (value) {
      return value < 10 ? "0" + value : String(value);
    };

    var tick = function () {
      var diff = TARGET - Date.now();
      if (diff <= 0) {
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
    if (TARGET - Date.now() > 0) {
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
