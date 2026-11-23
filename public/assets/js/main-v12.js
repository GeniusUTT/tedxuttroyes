(function () {
  "use strict";

  var doc = document;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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

    var desktopQuery = window.matchMedia("(min-width: 1160px)");
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", function (mq) {
        if (mq.matches && menuOpen) {
          closeMenu(false);
        }
      });
    }
  }

  var tickerValue = doc.getElementById("ticker-value");
  if (tickerValue) {
    var REVELATION = window.TEDX_REVEAL
      ? window.TEDX_REVEAL.at
      : Date.UTC(2026, 10, 10, 15, 0, 0);
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

      var total = r.height + vh;
      var q = clamp01((vh - r.top) / total);

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

      var z = Math.min(
        lisse(clamp01((q - 0.12) / 0.26)),
        1 - lisse(clamp01((q - 0.56) / 0.26))
      );
      if (Math.abs(z - dernierZoom) > 0.004) {
        dernierZoom = z;
        interlude.style.setProperty("--zoom", z.toFixed(3));
        doc.documentElement.style.setProperty("--ligne-zoom", z.toFixed(3));
      }

      if (video) {
        if (q > 0.02 && !video.getAttribute("src")) {
          var petit = video.getAttribute("data-src-petit");
          var choisi = petit && window.matchMedia("(max-width: 767px)").matches
            ? petit
            : video.getAttribute("data-src");
          video.setAttribute("src", choisi);
          video.load();
        }

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

  var majGouttieres = function () {
    var cs = window.getComputedStyle(doc.body);
    var st = doc.documentElement.style;
    st.setProperty("--g-l", cs.paddingLeft);
    st.setProperty("--g-r", cs.paddingRight);
  };
  majGouttieres();
  window.addEventListener("resize", majGouttieres, { passive: true });

  var fond = doc.querySelector(".fond-marque");
  var fondWrap = doc.querySelector(".jscroll");
  var fondMain = doc.getElementById("contenu");

  var fondA = doc.getElementById("moment-2") || fondMain;
  var fondB = doc.getElementById("billetterie") || fondMain;
  if (fond && fondA && fondB && fondMain) {
    var fondImg = fond.querySelector("img");
    var sDebut = 0;
    var sFin = 0;
    var fondY = null;
    var rafFond = 0;
    var fondJusqua = 0;

    var FOND_COURSE = 1;

    var borne = function (v) {
      return v < 0 ? 0 : v > 1 ? 1 : v;
    };

    var offsetTotal = function (el) {
      var y = 0;
      while (el) {
        y += el.offsetTop;
        el = el.offsetParent;
      }
      return y;
    };

    var mesurerFond = function () {
      var vh = window.innerHeight;
      var haut = offsetTotal(fondA);
      var bas = offsetTotal(fondB) + fondB.offsetHeight;
      var courseContenu = Math.max(
        1,
        (fondWrap ? fondWrap.offsetHeight : doc.documentElement.scrollHeight) - vh
      );
      var courseBarre = Math.max(1, doc.documentElement.scrollHeight - vh);
      var f0 = haut / courseContenu;
      var f1 = (bas - vh) / courseContenu;
      if (f1 < f0 + 0.01) {
        f1 = f0 + 0.01;
      }
      sDebut = f0 * courseBarre;
      sFin = f1 * courseBarre;
    };

    var majFond = function () {
      if (sFin <= sDebut || !fondImg) {
        return;
      }
      var hImg = fondImg.offsetHeight;
      if (!hImg) {
        return;
      }
      var vh = window.innerHeight;
      var p = borne((window.pageYOffset - sDebut) / (sFin - sDebut));

      var hFige = hImg - vh <= 0 || sFin - sDebut < hImg * FOND_COURSE;
      var pPan = reduceMotion.matches || hFige ? 0.5 : p;
      var y = Math.round(-pPan * (hImg - vh));
      if (y !== fondY) {
        fondY = y;
        fondImg.style.setProperty("--fond-y", y + "px");
      }
    };

    var boucleFond = function () {
      majFond();
      rafFond = Date.now() < fondJusqua ? window.requestAnimationFrame(boucleFond) : 0;
    };

    var reveillerFond = function () {
      majFond();
      fondJusqua = Date.now() + 300;
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

    if (window.ResizeObserver) {
      new window.ResizeObserver(refaireFond).observe(fondWrap || fondMain);
    }

    if (doc.readyState !== "complete") {
      window.addEventListener("load", refaireFond);
    }
    refaireFond();

    if ("IntersectionObserver" in window) {
      new window.IntersectionObserver(
        function (entrees) {
          for (var k = 0; k < entrees.length; k++) {
            var e = entrees[k];
            fond.classList.toggle(
              "fond-marque--on",
              e.isIntersecting || e.boundingClientRect.top < 0
            );
          }
        },

        { rootMargin: "0px 0px -25% 0px" }
      ).observe(fondA);
    }
  }

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

  var invite = doc.getElementById("invite");
  if (invite) {
    var INVITE_CLE = "tedx-invite-vue";
    var INVITE_DUREE = 7 * 864e5;
    var inviteVue = false;
    try {
      var inviteDate = +localStorage.getItem(INVITE_CLE);
      inviteVue = !!inviteDate && Date.now() - inviteDate < INVITE_DUREE;
    } catch (e) { }

    var inviteTrait = invite.querySelector(".invite-trait rect");
    var inviteEtat = invite.querySelector(".invite-etat");
    var inviteMontree = false;

    var inviteRetenir = function () {
      try {
        localStorage.setItem(INVITE_CLE, String(Date.now()));
      } catch (e) { }
    };

    var inviteMontrer = function () {
      if (inviteMontree) return;
      inviteMontree = true;
      invite.hidden = false;

      var b = invite.getBoundingClientRect();
      var perimetre = 2 * (b.width + b.height - 5);
      invite.style.setProperty("--invite-p", perimetre.toFixed(1));
      void invite.offsetWidth;
      invite.classList.add("invite-on");
      if (reduceMotion.matches || !inviteTrait) {
        invite.classList.add("invite-trace");
        return;
      }
      var fin = function (ev) {
        if (ev.propertyName !== "stroke-dashoffset") return;
        inviteTrait.removeEventListener("transitionend", fin);
        invite.classList.add("invite-trace");
      };
      inviteTrait.addEventListener("transitionend", fin);
    };

    var inviteFermer = function () {
      inviteRetenir();
      invite.classList.remove("invite-on");
      window.setTimeout(function () {
        invite.hidden = true;
      }, reduceMotion.matches ? 0 : 400);
    };

    invite.querySelector(".invite-fermer").addEventListener("click", inviteFermer);
    invite.querySelector(".invite-suivre").addEventListener("click", inviteFermer);
    invite.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") inviteFermer();
    });

    invite.querySelector(".invite-partage").addEventListener("click", function () {
      var url = location.origin + location.pathname;
      var dire = function (t) {
        inviteEtat.textContent = t;
      };
      if (navigator.share) {
        navigator.share({ title: doc.title, url: url }).then(
          function () {
            inviteRetenir();
            dire("Merci pour le partage !");
          },
          function () { }
        );
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () {
            dire("Lien copié, il ne reste qu'à le coller.");
          },
          function () {
            dire("Adresse de la page : " + url);
          }
        );
        return;
      }
      dire("Adresse de la page : " + url);
    });

    if (!inviteVue) {
      var inviteMoment = doc.getElementById("moment-2");
      if (inviteMoment && "IntersectionObserver" in window) {
        var inviteObs = new window.IntersectionObserver(
          function (entrees) {
            for (var k = 0; k < entrees.length; k++) {
              var e = entrees[k];
              if (e.isIntersecting || e.boundingClientRect.top < 0) {
                inviteObs.disconnect();
                inviteMontrer();
              }
            }
          },
          { rootMargin: "0px 0px -25% 0px" }
        );
        inviteObs.observe(inviteMoment);
      } else {
        var inviteMinuteur = 0;
        var inviteSeuil = function () {
          if (window.scrollY > window.innerHeight) {
            window.removeEventListener("scroll", inviteSeuil);
            window.clearTimeout(inviteMinuteur);
            inviteMontrer();
          }
        };
        window.addEventListener("scroll", inviteSeuil, { passive: true });
        inviteMinuteur = window.setTimeout(function () {
          var course = doc.documentElement.scrollHeight - window.innerHeight;
          if (course < window.innerHeight) {
            window.removeEventListener("scroll", inviteSeuil);
            inviteMontrer();
          }
        }, 12000);
        inviteSeuil();
      }
    }
  }
})();
