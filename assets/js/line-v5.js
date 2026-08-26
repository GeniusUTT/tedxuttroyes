/* TEDxUTTroyes 2027 - la ligne continue (accueil uniquement)
   Un seul trait rouge parcourt la page : il nait au seuil sous le titre,
   reste droit quand les mots le franchissent (ancres cross, sens ltr ou
   rtl), plie autour des blocs qui portent l'ancre avoid (liste des
   speakers, lieu) en revenant pile entre deux sections, allume la
   feuille de salle pastille apres pastille, traverse l'album des dix
   ans a l'horizontale (variable --sweep : les affiches se revelent au
   passage de la pointe), et se branche dans le bouton Reserver.

   Regime desktop : defilement virtuel a scrollbar native. Le contenu
   (main + footer, wrapper .jscroll) est fixe et translate par ce script
   selon le scroll d'un spacer ; chaque segment horizontal du trace
   recoit une fenetre de gel pendant laquelle la translation est
   constante : l'ecran se fige, la pointe balaie l'horizontale, puis le
   defilement reprend. La pointe vit ainsi toujours au centre de
   l'ecran. La regle s'arrete a la prise (bouton Reserver) : l'epilogue
   se trace au fil du defilement normal.

   Regime mobile (sous 1024 px) : pas de defilement virtuel, mais le
   trait traverse quand meme la page. Il court le long d'un rail (la
   marge de gauche, ou le milieu de la marge de droite), change de cote
   dans le blanc qui borde un bloc, et redescend : les blocs se
   retrouvent tantot a droite, tantot a gauche du trait. L'ancre
   data-line-rail="right" se pose sur une section entiere ou sur un bloc
   precis. La page defile normalement pendant le balayage.

   Les mots qui franchissent valent aussi en mobile : ils franchissent
   le rail de gauche, avec leur propre minutage (voir plus bas). Un
   moment porteur d'un mot doit donc rester sur ce rail, sinon son mot
   n'aurait rien a franchir et reste immobile.

   Principe inchange : le CSS place les contenus, ce script mesure et
   relie, le chemin est reconstruit a chaque changement de geometrie.
   Sans JavaScript, sous 1024 px, en reduced motion ou en cas d'echec :
   pas de defilement virtuel (flux normal) et les fallbacks CSS
   habituels (dorsale statique, contenu entierement visible). */

(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  var html = doc.documentElement;

  if (!body.classList.contains("journey") || !("ResizeObserver" in window)) {
    return;
  }

  var main = doc.getElementById("contenu");
  var wrap = doc.querySelector(".jscroll");
  var probeA = doc.getElementById("probe-a");
  var probeB = doc.getElementById("probe-b");
  if (!main || !wrap || !probeA || !probeB) {
    return;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var LEN = 1000;   /* pathLength normalise : dashoffset independant de la geometrie */
  var TIP = 0.5;    /* la pointe du trait vit au centre de la hauteur du viewport */

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 1024px)");

  var svg = null;
  var pathMain = null;
  var pathTail = null;
  var spacer = null;    /* porte la hauteur de scroll en regime virtuel */
  var svgW = 0;
  var svgH = 0;

  var vh = window.innerHeight;
  var wrapRect = null;  /* rect du wrapper au moment du build (repere contenu) */
  var contentH = 0;
  var virtualOn = false;
  var tableM = [];      /* etapes [scroll, fraction] du trait principal */
  var freezes = [];     /* fenetres de gel [debut, fin] en scroll */
  var tailFrom = 0;     /* fenetre de scroll ou l'epilogue se trace */
  var tailTo = 1;
  var crosses = [];     /* mots qui franchissent, actifs ce build (desktop) */
  var crossStates = []; /* etat persistant par ancre cross : {el, p, dist} */
  var plugEl = null;    /* le bouton Reserver : noir tant que la ligne n'y est pas */
  var sweepEl = null;   /* l'album des editions : recoit --sweep (0 a 1) */
  var sweepP0 = 0;      /* fenetre du balayage en fractions du trace */
  var sweepP1 = 0;
  var lastSweep = -1;
  var tlMarks = [];     /* creneaux du programme : {el, p (fraction), on} */
  var cs = window.scrollY;
  var rafId = 0;

  function crossStateFor(el) {
    for (var i = 0; i < crossStates.length; i++) {
      if (crossStates[i].el === el) {
        return crossStates[i];
      }
    }
    var st = { el: el, p: 1, dist: 0 };
    crossStates.push(st);
    return st;
  }

  /* ------------------------------------------------------------------
     Outils de geometrie (repere contenu : relatif au wrapper, donc
     invariant a la translation du defilement virtuel)
     ------------------------------------------------------------------ */

  function relRect(el) {
    var r = el.getBoundingClientRect();
    return {
      left: r.left - wrapRect.left,
      right: r.right - wrapRect.left,
      top: r.top - wrapRect.top,
      bottom: r.bottom - wrapRect.top,
      width: r.width,
      height: r.height
    };
  }

  function f(n) {
    return Math.round(n * 10) / 10;
  }

  /* Polyligne vers chemin SVG, angles adoucis en courbes quadratiques */
  function roundedPath(pts, radius) {
    if (pts.length < 2) {
      return "";
    }
    var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var v1x = p1[0] - p0[0];
      var v1y = p1[1] - p0[1];
      var v2x = p2[0] - p1[0];
      var v2y = p2[1] - p1[1];
      var l1 = Math.hypot(v1x, v1y);
      var l2 = Math.hypot(v2x, v2y);
      var r = Math.min(radius, l1 * 0.5, l2 * 0.5);
      if (l1 < 1 || l2 < 1 || r < 1) {
        d += "L" + f(p1[0]) + " " + f(p1[1]);
        continue;
      }
      d += "L" + f(p1[0] - (v1x / l1) * r) + " " + f(p1[1] - (v1y / l1) * r);
      d += "Q" + f(p1[0]) + " " + f(p1[1]) + " " +
        f(p1[0] + (v2x / l2) * r) + " " + f(p1[1] + (v2y / l2) * r);
    }
    var last = pts[pts.length - 1];
    return d + "L" + f(last[0]) + " " + f(last[1]);
  }

  /* Table scroll vers fraction tracee : la pointe suit la lecture.
     Les segments verticaux se declenchent quand leur sommet atteint le
     centre du viewport, decale des gels accumules. En regime virtuel,
     chaque segment horizontal recoit une fenetre de gel (budget de
     scroll pendant lequel la page est figee) ; hors regime virtuel,
     l'ancienne petite plage de scroll est conservee. budgets : plage
     dediee par indice de point (la traversee de la frise). */
  function buildTable(pts, virtual, budgets) {
    freezes = [];
    var lens = [0];
    var total = 0;
    var i;
    for (i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      lens.push(total);
    }
    if (total < 1) {
      tableM = [];
      return;
    }
    var acc = 0;
    var t = [pts[0][1] - TIP * vh];
    for (i = 1; i < pts.length; i++) {
      var dx = Math.abs(pts[i][0] - pts[i - 1][0]);
      var dy = Math.abs(pts[i][1] - pts[i - 1][1]);
      if (dy < 3 && dx > 3) {
        if (virtual) {
          var F = budgets && budgets[i]
            ? budgets[i]
            : Math.min(Math.max(dx * 0.5, 200), vh * 0.6);
          F = Math.round(F);
          t.push(t[i - 1] + F);
          freezes.push([t[i - 1], t[i - 1] + F]);
          acc += F;
        } else {
          t.push(t[i - 1] + Math.min(Math.max(dx * 0.35, 48), vh * 0.35));
        }
      } else {
        t.push(Math.max(t[i - 1] + 2, pts[i][1] - TIP * vh + acc));
      }
    }
    tableM = [];
    for (i = 0; i < pts.length; i++) {
      tableM.push({ t: t[i], p: lens[i] / total });
    }
  }

  /* Scroll vers translation du contenu : identite moins les gels deja
     consommes ; constante pendant un gel. Sans gel (regime normal),
     c'est l'identite. */
  function gOf(s) {
    var off = 0;
    for (var i = 0; i < freezes.length; i++) {
      var fz = freezes[i];
      if (s >= fz[1]) {
        off += fz[1] - fz[0];
      } else {
        if (s > fz[0]) {
          off += s - fz[0];
        }
        break;
      }
    }
    var y = s - off;
    var max = Math.max(0, contentH - vh);
    return y < 0 ? 0 : y > max ? max : y;
  }

  function interp(table, x) {
    if (!table.length) {
      return 1;
    }
    if (x <= table[0].t) {
      return table[0].p;
    }
    var hi = table.length - 1;
    if (x >= table[hi].t) {
      return table[hi].p;
    }
    var lo = 0;
    while (hi - lo > 1) {
      var mid = (hi + lo) >> 1;
      if (table[mid].t <= x) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    var a = table[lo];
    var b = table[hi];
    return a.p + (b.p - a.p) * ((x - a.t) / Math.max(1, b.t - a.t));
  }

  function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  /* Le frere visible qui precede ou qui suit, en remontant les parents
     tant qu'il n'y en a pas. Sert a mesurer le blanc de part et d'autre
     d'un bloc, que ce bloc soit une section entiere ou une liste posee
     au milieu d'une section. */
  function neighbour(el, forward) {
    var n = el;
    var s;
    var sr;
    while (n && n !== main) {
      s = forward ? n.nextElementSibling : n.previousElementSibling;
      while (s) {
        sr = relRect(s);
        if (sr.width >= 2 && sr.height >= 2) {
          return s;
        }
        s = forward ? s.nextElementSibling : s.previousElementSibling;
      }
      n = n.parentElement;
    }
    return null;
  }

  /* Extremites peintes d'une section : la premiere et la derniere boite
     non vide parmi ses descendants. Sert a mesurer le blanc reel entre
     deux sections, la ou passe une traversee mobile ; les bords de la
     section elle-meme ne diraient que ses paddings. */
  function innerSpan(sec) {
    var kids = sec.querySelectorAll("*");
    var top = Infinity;
    var bot = -Infinity;
    var i;
    var kr;
    for (i = 0; i < kids.length; i++) {
      kr = relRect(kids[i]);
      if (kr.width < 2 || kr.height < 2) {
        continue;
      }
      if (kr.top < top) {
        top = kr.top;
      }
      if (kr.bottom > bot) {
        bot = kr.bottom;
      }
    }
    var sr = relRect(sec);
    return {
      top: top === Infinity ? sr.top : top,
      bottom: bot === -Infinity ? sr.bottom : bot
    };
  }

  /* ------------------------------------------------------------------
     Construction du chemin a partir des ancres data-line du document
     ------------------------------------------------------------------ */

  function inject() {
    svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "jline");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    pathMain = doc.createElementNS(SVG_NS, "path");
    pathMain.setAttribute("pathLength", LEN);
    pathMain.setAttribute("stroke-dasharray", LEN);
    pathTail = doc.createElementNS(SVG_NS, "path");
    pathTail.setAttribute("class", "jtail");
    pathTail.setAttribute("pathLength", LEN);
    pathTail.setAttribute("stroke-dasharray", LEN);
    svg.appendChild(pathMain);
    svg.appendChild(pathTail);
    wrap.appendChild(svg);
  }

  function build() {
    /* Phase 1 : lectures seules, en repere contenu */
    vh = window.innerHeight;
    var horiz = wide.matches;
    var virtual = horiz && !reduce.matches;
    wrapRect = wrap.getBoundingClientRect();
    contentH = wrapRect.height;
    var axA = relRect(probeA).left;
    var axB = relRect(probeB).left;
    /* Largeur de travail : celle du wrapper, pas celle du viewport.
       Au-dela de 1920 px la page se fige et se centre, le wrapper est
       alors plus etroit que l'ecran ; les mots qui franchissent et les
       contournements doivent buter sur le bord de la page, pas sur le
       bord de l'ecran. En dessous, les deux valeurs sont identiques. */
    var W = Math.round(wrapRect.width);
    var footer = doc.querySelector(".site-footer");
    var H = Math.ceil(footer ? relRect(footer).bottom : contentH);

    var pts = [[axB, 0]];
    var budgets = {};
    var el;
    var r;

    /* Les mots qui franchissent : la ligne reste droite, seul le mot
       bouge. Sens par defaut : le mot part de la marge et traverse vers
       la droite. data-cross-dir="rtl" : le mot arrive du bord droit du
       viewport et vient buter contre la ligne sans la franchir. */
    var crossEls = main.querySelectorAll('[data-line="cross"]');
    crosses = [];
    var c;
    for (c = 0; c < crossEls.length; c++) {
      el = crossEls[c];
      var word = el.querySelector(".cross-word");
      var st = crossStateFor(el);
      var active = false;
      /* En mobile le mot franchit le rail de gauche, la ou vit la
         dorsale : un moment pose sur le rail de droite n'aurait rien a
         franchir, son mot reste donc immobile. */
      var onRightRail = el.getAttribute("data-line-rail") === "right";
      if (word && !reduce.matches && (horiz || !onRightRail)) {
        r = relRect(el);
        var wr = relRect(word);
        var rtl = el.getAttribute("data-cross-dir") === "rtl";
        var dist;
        if (rtl) {
          var layoutRightR = wr.right - (1 - st.p) * st.dist;
          dist = Math.round((W - 24) - layoutRightR);
        } else {
          var layoutRight = wr.right - (st.p - 1) * st.dist;
          dist = Math.round(layoutRight - (axB - 28));
        }
        if (dist > 40) {
          st.dist = dist;
          el.style.setProperty("--cross-dist", dist + "px");
          if (horiz) {
            crosses.push({ el: el, st: st, top: r.top, h: r.height });
          } else {
            /* En mobile la section est plus courte qu'un ecran : cadencer
               le mot sur toute sa hauteur le ferait finir sa course avant
               qu'il soit entre dans l'ecran. Le mot se cale donc sur
               lui-meme, du bas de l'ecran au tiers superieur (demande
               de Baptiste le 2026-08-26) : il s'ebranle quand il pointe
               par le bas, il a fini quand son centre atteint le tiers
               haut. La course tient ainsi sur les deux tiers de l'ecran,
               assez longue pour se laisser regarder, et elle s'acheve
               au-dessus du centre, la ou vit la pointe du trait : le mot
               franchit donc une ligne deja tracee.

               Les deux valeurs sortent de la formule d'apply() : cp vaut
               0 a 0,85 hauteur d'ecran au-dessus du repere et 1 apres
               0,75 x h de defilement. D'ou le recul de 0,15 pour partir
               au ras du bas, et la plage de deux tiers d'ecran plus la
               moitie du mot. L'easing doux (soft) va avec : la courbe
               cubique du bureau expedierait la course dans le premier
               tiers de la plage. */
            var wRect = relRect(word);
            crosses.push({
              el: el,
              st: st,
              top: wRect.top - vh * 0.15,
              h: ((vh * 2) / 3 + wRect.height / 2) / 0.75,
              soft: true
            });
          }
          active = true;
        }
      }
      if (!active) {
        el.style.removeProperty("--cross-dist");
        el.style.removeProperty("--cross-p");
        st.p = 1;
        st.dist = 0;
      }
    }

    /* La frise est mesuree d'abord : les blocs d'avoid situes sous son
       entree (les chiffres, le logo TEDx) ne peuvent pas etre contournes
       par l'axe B, la ligne etant deja partie a l'horizontale ; ils sont
       collectes ici et contournes par la descente vers la prise. */
    var band = main.querySelector('[data-line="turn"]');
    var dot = main.querySelector('[data-line="drop"]');
    var bandR = null;
    var dotR = null;
    var bandJogY = 0;
    var bandCutY = Infinity;
    if (band && dot && horiz) {
      bandR = relRect(band);
      dotR = relRect(dot);
      var caption = main.querySelector(".fr-caption");
      bandJogY = caption
        ? Math.round((relRect(caption).bottom + bandR.top) / 2)
        : bandR.top - 30;
      bandCutY = bandJogY;
    }

    /* Les pliures : la ligne plie autour de chaque bloc data-line="avoid",
       vers la gauche par defaut, vers la droite avec data-line-side="right".
       Les blocs qui se chevaucheraient sont ignores (le trace doit rester
       monotone du haut vers le bas). */
    /* En mobile, aucune pliure autour des blocs : la marge est trop
       etroite pour qu'un contournement se lise. Le parcours passe par
       les rails et les traversees, plus bas. */
    var avoidEls = horiz ? main.querySelectorAll('[data-line="avoid"]') : [];
    var avoids = [];
    var lateAvoids = [];
    for (c = 0; c < avoidEls.length; c++) {
      avoids.push({ el: avoidEls[c], r: relRect(avoidEls[c]) });
    }
    avoids.sort(function (a, b) {
      return a.r.top - b.r.top;
    });
    var lastY = 0;
    for (c = 0; c < avoids.length; c++) {
      el = avoids[c].el;
      r = avoids[c].r;
      if (r.width < 2 || r.height < 2) {
        continue;
      }
      var m = parseFloat(el.getAttribute(horiz ? "data-line-margin" : "data-line-margin-m"));
      if (!m || m < 0) {
        m = horiz ? 28 : 14;
      }
      if (r.top > bandCutY) {
        lateAvoids.push({ el: el, r: r, m: m });
        continue;
      }
      if (r.top - m < lastY + 12) {
        continue;
      }
      /* Une pliure ne se justifie que si l'axe passe encore dans le
         bloc, ou trop pres. Si l'axe le degage deja, la pliure ferait
         revenir le trait VERS le bloc au lieu de s'en ecarter. */
      var ex;
      if (horiz && el.getAttribute("data-line-side") === "right") {
        ex = Math.min(W - 4, r.right + m);
        if (ex <= axB + 1) {
          continue;
        }
      } else {
        ex = horiz
          ? Math.max(4, r.left - m)
          : Math.max(4, Math.min(r.left - m, axA - 10));
        if (ex >= axB - 1) {
          continue;
        }
      }
      /* Le retour vers l'axe se fait pile entre les deux blocs : la
         frontiere de la section porteuse est le milieu du blanc qui la
         separe de la suivante (les paddings des sections sont egaux). */
      var exitY = r.bottom + m;
      var sec = el.closest("section");
      if (sec) {
        var secBottom = relRect(sec).bottom;
        if (secBottom > exitY) {
          exitY = secBottom;
        }
      }
      pts.push([axB, r.top - m], [ex, r.top - m], [ex, exitY], [axB, exitY]);
      lastY = exitY;
    }

    /* Mobile : la dorsale n'est plus une simple verticale. Elle court le
       long d'un rail, traverse la largeur de la page dans le blanc d'une
       frontiere de section, puis redescend le long de l'autre rail : les
       blocs passent tantot a droite, tantot a gauche du trait, ce qui
       donne le parcours a l'echelle d'un telephone (demande de Baptiste
       le 2026-08-26). Les sections qui prennent le rail de droite le
       declarent par data-line-rail="right".

       Aucun gel : le defilement virtuel reste une affaire de bureau. En
       regime normal buildTable donne a chaque segment horizontal une
       plage de 48 a 160 px de scroll pendant laquelle la pointe balaie
       la largeur, la page continuant de defiler ; le retard pris par la
       pointe se resorbe de lui-meme sur la verticale suivante. */
    var railX = axB;
    var railR = axB;
    if (!horiz) {
      var cRight = 0;
      var refs = main.querySelectorAll(
        ".lead, .mom-title, .slist, .album, .tl, .data-lines, .mom-photo"
      );
      for (c = 0; c < refs.length; c++) {
        r = relRect(refs[c]);
        if (r.width > 2 && r.right > cRight) {
          cRight = r.right;
        }
      }
      if (cRight < 2) {
        cRight = W - 20;
      }
      /* Le rail de droite se pose au milieu de la marge libre : autant
         d'air entre le trait et les blocs qu'entre le trait et le bord
         de l'ecran (10 px de chaque cote sur un telephone courant). */
      railR = Math.min(W - 6, Math.round(cRight + (W - cRight) / 2));
      if (railR - axB < 80) {
        railR = axB;
      }
      /* L'ancre data-line-rail="right" se pose sur une section entiere
         ou sur un bloc precis (la liste des speakers, la fiche du lieu :
         les memes que le bureau contourne par data-line="avoid"). Le
         trait passe a droite dans le blanc qui precede le bloc et revient
         a gauche dans celui qui le suit. */
      var tagged = railR === axB ? [] : main.querySelectorAll('[data-line-rail="right"]');
      var evts = [];
      for (c = 0; c < tagged.length; c++) {
        el = tagged[c];
        /* Garde-fou : les pastilles du planning sont posees sur l'axe
           lui-meme (left: -body-pad - 6px), le trait les enfile une a une
           et n'allume que celles qui touchent un de ses segments
           verticaux. Le bloc qui porte la feuille de salle reste donc sur
           le rail de gauche, quoi que dise l'attribut. */
        if (el.querySelector(".tl-row .tl-dot")) {
          continue;
        }
        var span = innerSpan(el);
        if (span.bottom - span.top < 2) {
          continue;
        }
        /* Pas de traversee sans blanc : 36 px de vide au moins entre le
           bloc et son voisin. */
        var prevEl = neighbour(el, false);
        var above = prevEl ? innerSpan(prevEl).bottom : null;
        if (above !== null && span.top - above >= 36) {
          evts.push({ y: Math.round((above + span.top) / 2), x: railR });
        }
        var nextEl = neighbour(el, true);
        var below = nextEl ? innerSpan(nextEl).top : null;
        if (below !== null && below - span.bottom >= 36) {
          evts.push({ y: Math.round((span.bottom + below) / 2), x: axB });
        } else {
          /* Blanc trop mince sous le bloc (un bouton colle a une liste,
             par exemple) : le retour attend la fin de la section qui le
             porte. */
          var sec = el.closest("section");
          var secNext = sec && sec !== el ? neighbour(sec, true) : null;
          if (secNext) {
            var secSpan = innerSpan(sec);
            var secBelow = innerSpan(secNext).top;
            if (secBelow - secSpan.bottom >= 36) {
              evts.push({
                y: Math.round((secSpan.bottom + secBelow) / 2),
                x: axB
              });
            }
          }
        }
      }
      evts.sort(function (a, b) {
        return a.y - b.y;
      });
      /* 80 px au moins depuis la traversee precedente, sinon le trait
         ferait du sur-place. */
      var lastCross = -1e9;
      for (c = 0; c < evts.length; c++) {
        if (evts[c].x === railX || evts[c].y < lastCross + 80) {
          continue;
        }
        pts.push([railX, evts[c].y], [evts[c].x, evts[c].y]);
        railX = evts[c].x;
        lastCross = evts[c].y;
      }
    }

    /* Moment 4 : l'album des editions (desktop). La ligne quitte l'axe B
       pile entre le texte de la section et les affiches, rejoint la
       marge gauche, descend au niveau du fil (le centre de la bande des
       pastilles, mesure sur le point 2027) et balaie l'album a
       l'horizontale jusqu'au terminus. En regime virtuel, la traversee
       recoit un gel long (l'ecran se fige pendant le balayage). Les
       seuils --th des affiches sont calibres sur la geometrie : chaque
       affiche s'eclaire quand la pointe atteint son bord gauche. */
    var dropX = axB;
    var bandBottom = 0;
    var sweepIdx = null;
    sweepEl = band;
    if (bandR) {
      r = bandR;
      var dr = dotR;
      var lineY = dr.top + dr.height / 2;
      dropX = dr.left + dr.width / 2;
      bandBottom = r.bottom;
      var entryX = Math.max(4, r.left - 44);
      pts.push([axB, bandJogY], [entryX, bandJogY], [entryX, lineY]);
      sweepIdx = [pts.length - 1, pts.length];
      budgets[pts.length] = vh * 1.2;
      pts.push([dropX, lineY]);
      var items = band.querySelectorAll(".alb-item");
      for (var it = 0; it < items.length; it++) {
        var anchor = items[it].querySelector(".alb-img") ||
          items[it].querySelector(".alb-lbl, .alb-end-label");
        if (!anchor) {
          continue;
        }
        var ar = relRect(anchor);
        var thv = clamp01((ar.left - entryX) / Math.max(1, dropX - entryX));
        items[it].style.setProperty("--th", Math.min(0.8, thv).toFixed(3));
      }
    }

    /* La prise : le trait descend (le 1 du 10) et se branche au bouton.
       Le bouton attend en noir (plug-armed) et s'allume en rouge quand
       le trait le rejoint (plug-on, pose par apply). En reduced motion
       le trait est complet d'emblee : le bouton reste rouge. */
    var plug = main.querySelector('[data-line="plug"]');
    var plugRect = null;
    plugEl = plug;
    if (plug) {
      if (reduce.matches) {
        plug.classList.remove("plug-armed", "plug-on");
      } else {
        plug.classList.add("plug-armed");
      }
      plugRect = relRect(plug);
      if (!horiz) {
        /* Mobile : la dorsale descend jusqu'au centre vertical du bouton
           (centre dans la page), puis la ligne y entre par le cote d'ou
           elle arrive. Le serpentin ramene normalement le trait a gauche
           avant la billetterie ; si le blanc a manque pour la derniere
           traversee, l'entree se fait par la droite plutot que de couper
           le bouton en deux. */
        var py = plugRect.top + plugRect.height / 2;
        var plugX = railX > plugRect.left + plugRect.width / 2
          ? plugRect.right - 8
          : plugRect.left + 8;
        pts.push([railX, py], [plugX, py]);
      } else {
        var bx = plugRect.left + plugRect.width / 2;
        if (Math.abs(dropX - bx) > 12) {
          /* Le coude se fait tout en haut, juste sous l'album : la
             descente arrive droite dans le bouton, sans courbe finale. */
          var jogY2 = bandBottom ? bandBottom + 44 : plugRect.top - 18;
          pts.push([dropX, jogY2], [bx, jogY2]);
        }
        /* La descente contourne les blocs d'avoid situes sous la frise
           (les chiffres, le logo TEDx) : memes regles que sur l'axe B,
           autour de la verticale du bouton. */
        var lastY2 = pts[pts.length - 1][1];
        for (c = 0; c < lateAvoids.length; c++) {
          el = lateAvoids[c].el;
          r = lateAvoids[c].r;
          var m2 = lateAvoids[c].m;
          if (r.top - m2 < lastY2 + 12 || r.bottom + m2 > plugRect.top - 12) {
            continue;
          }
          /* Meme regle que sur l'axe B : pas de pliure si la descente
             degage deja le bloc. Sans ce test, des que la page se fige a
             1920 px le bouton Reserver passe a droite du logo TEDx, et
             le contournement ramenait le trait vers le logo (une bosse
             de 100 px vers la gauche qui ne contournait rien). */
          var ex2;
          if (el.getAttribute("data-line-side") === "right") {
            ex2 = Math.min(W - 4, r.right + m2);
            if (ex2 <= bx + 1) {
              continue;
            }
          } else {
            ex2 = Math.max(4, r.left - m2);
            if (ex2 >= bx - 1) {
              continue;
            }
          }
          /* data-line-exit="tight" : le retour se fait a la meme distance
             sous le bloc qu'au-dessus (cadre symetrique), au lieu d'etre
             repousse a la frontiere de la section. */
          var exitY2 = r.bottom + m2;
          if (el.getAttribute("data-line-exit") !== "tight") {
            var sec2 = el.closest("section");
            if (sec2) {
              var secBottom2 = relRect(sec2).bottom;
              if (secBottom2 > exitY2) {
                exitY2 = secBottom2;
              }
            }
          }
          pts.push([bx, r.top - m2], [ex2, r.top - m2], [ex2, exitY2], [bx, exitY2]);
          lastY2 = exitY2;
        }
        pts.push([bx, plugRect.top + 8]);
      }
    } else {
      pts.push([horiz ? dropX : railX, H]);
    }

    /* Epilogue : trait fin (non trace pour l'instant) */
    var tailPts = null;

    /* Phase 2 : ecritures */
    if (!svg) {
      inject();
    }
    if (!spacer) {
      spacer = doc.createElement("div");
      spacer.className = "jscroll-spacer";
      spacer.setAttribute("aria-hidden", "true");
      body.appendChild(spacer);
    }
    if (W !== svgW || H !== svgH) {
      svgW = W;
      svgH = H;
      svg.setAttribute("width", W);
      svg.setAttribute("height", H);
      svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    }
    pathMain.setAttribute("d", roundedPath(pts, 22));
    if (tailPts) {
      pathTail.setAttribute("d", roundedPath(tailPts, 12));
    } else {
      pathTail.removeAttribute("d");
    }

    buildTable(pts, virtual, budgets);
    virtualOn = virtual && tableM.length > 0;
    var totalF = 0;
    for (c = 0; c < freezes.length; c++) {
      totalF += freezes[c][1] - freezes[c][0];
    }
    /* Reserve de fin de course : la pointe vit au centre du viewport, il
       faut donc toujours une demi-hauteur d'ecran de scroll apres le
       dernier point, plus la plage de l'epilogue. Sur un ecran tres haut
       (1600 px, et surtout un 4K natif en 2160) le footer n'y suffit pas :
       le trait n'atteignait jamais sa fin, la prise ne s'allumait pas.
       On allonge alors le spacer d'autant : l'ecran reste fige au bas de
       la page pendant que le trait finit de se tracer, ce qui est le
       comportement deja en place sur les segments horizontaux. */
    var lastT = tableM.length ? tableM[tableM.length - 1].t : 0;
    var reserve = lastT + 70 + Math.max(120, Math.round(vh * 0.45));
    var pad = 0;

    if (virtualOn) {
      pad = Math.max(0, Math.ceil(reserve - (contentH + totalF - vh)));
      spacer.style.height = Math.round(contentH + totalF + pad) + "px";
      html.classList.add("jscroll-run");
    } else {
      html.classList.remove("jscroll-run");
      wrap.style.transform = "";
      freezes = [];
    }

    var maxScroll = Math.max(1, (virtualOn ? contentH + totalF + pad : contentH) - vh);
    tailFrom = tableM.length ? tableM[tableM.length - 1].t + 30 : 0;
    tailFrom = Math.min(tailFrom, maxScroll - 60);
    tailTo = Math.max(1, maxScroll - Math.max(120, Math.round(vh * 0.45)));
    if (tailTo - tailFrom < 40) {
      tailFrom = Math.max(0, tailTo - 40);
    }

    /* La fenetre du balayage de l'album, en fractions de longueur du
       trace (tableM et pts partagent les memes indices). */
    sweepP0 = 0;
    sweepP1 = 0;
    lastSweep = -1;
    if (sweepIdx && tableM.length) {
      sweepP0 = tableM[sweepIdx[0]].p;
      sweepP1 = tableM[sweepIdx[1]].p;
    } else if (sweepEl) {
      sweepEl.style.removeProperty("--sweep");
    }

    /* La feuille de salle : chaque pastille est situee sur le trace
       (segment vertical qui la contient) et recoit sa fraction de
       longueur ; apply() allume le creneau quand la pointe la depasse.
       Pastille introuvable sur le trace : creneau visible d'emblee. */
    tlMarks = [];
    var dots = main.querySelectorAll(".tl-row .tl-dot");
    for (c = 0; c < dots.length; c++) {
      var rowEl = dots[c].closest(".tl-row");
      if (!rowEl) {
        continue;
      }
      var dd = relRect(dots[c]);
      var dcx = dd.left + dd.width / 2;
      var dcy = dd.top + dd.height / 2;
      var frac = -1;
      for (var s = 1; s < pts.length; s++) {
        var vx = pts[s - 1][0];
        if (Math.abs(pts[s][0] - vx) < 3 && Math.abs(vx - dcx) < 24 &&
            dcy >= pts[s - 1][1] && dcy <= pts[s][1]) {
          frac = tableM[s - 1].p + (tableM[s].p - tableM[s - 1].p) *
            ((dcy - pts[s - 1][1]) / Math.max(1, pts[s][1] - pts[s - 1][1]));
          break;
        }
      }
      tlMarks.push({
        el: rowEl,
        p: frac,
        on: rowEl.classList.contains("is-on")
      });
    }

    doc.documentElement.classList.add("jline-run");

    if (reduce.matches) {
      pathMain.style.strokeDashoffset = "0";
      pathTail.style.strokeDashoffset = "0";
      for (c = 0; c < tlMarks.length; c++) {
        tlMarks[c].on = true;
        tlMarks[c].el.classList.add("is-on");
      }
      if (sweepEl) {
        sweepEl.style.removeProperty("--sweep");
      }
    } else {
      apply(cs);
    }
  }

  /* ------------------------------------------------------------------
     Pilote : le trait se trace au fil du defilement, avec lissage.
     En regime virtuel, la meme valeur lissee pilote la translation du
     contenu et le dashoffset : la pointe et la page bougent ensemble.
     La boucle rAF s'arrete d'elle-meme quand la page est immobile.
     ------------------------------------------------------------------ */

  function apply(scroll) {
    var offY = gOf(scroll);
    if (virtualOn) {
      wrap.style.transform = "translate3d(0, " + (-offY).toFixed(2) + "px, 0)";
    }
    var pM = interp(tableM, scroll);
    pathMain.style.strokeDashoffset = (LEN * (1 - pM)).toFixed(2);
    if (plugEl) {
      plugEl.classList.toggle("plug-on", pM >= 0.995);
    }
    if (sweepEl && sweepP1 > sweepP0) {
      var sp = clamp01((pM - sweepP0) / (sweepP1 - sweepP0));
      if (Math.abs(sp - lastSweep) > 0.003) {
        lastSweep = sp;
        sweepEl.style.setProperty("--sweep", sp.toFixed(3));
      }
    }
    for (var tm = 0; tm < tlMarks.length; tm++) {
      var mk = tlMarks[tm];
      if (!mk.on && pM >= mk.p) {
        mk.on = true;
        mk.el.classList.add("is-on");
      }
    }
    var pT = clamp01((scroll - tailFrom) / Math.max(1, tailTo - tailFrom));
    pathTail.style.strokeDashoffset = (LEN * (1 - pT)).toFixed(2);
    for (var i = 0; i < crosses.length; i++) {
      var cr = crosses[i];
      var cp = clamp01((offY + vh * 0.85 - cr.top) / Math.max(1, cr.h * 0.75));
      cp = cr.soft ? cp * cp * (3 - 2 * cp) : 1 - Math.pow(1 - cp, 3);
      if (Math.abs(cp - cr.st.p) > 0.001) {
        cr.st.p = cp;
        cr.el.style.setProperty("--cross-p", cp.toFixed(3));
      }
    }
  }

  function tick() {
    var target = window.scrollY;
    cs += (target - cs) * 0.18;
    if (Math.abs(target - cs) < 0.4) {
      cs = target;
    }
    apply(cs);
    rafId = cs === target ? 0 : window.requestAnimationFrame(tick);
  }

  function onScroll() {
    if (!rafId && !reduce.matches && tableM.length) {
      rafId = window.requestAnimationFrame(tick);
    }
  }

  /* ------------------------------------------------------------------
     Initialisation et reconstructions
     ------------------------------------------------------------------ */

  var ro = null;
  var roTimer = 0;

  function fail() {
    doc.documentElement.classList.add("jline-fail");
    doc.documentElement.classList.remove("jline-run", "jscroll-run");
    wrap.style.transform = "";
    virtualOn = false;
    freezes = [];
    if (plugEl) {
      plugEl.classList.remove("plug-armed", "plug-on");
      plugEl = null;
    }
    if (sweepEl) {
      sweepEl.style.removeProperty("--sweep");
      sweepEl = null;
    }
    tlMarks = [];
    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg);
    }
    if (ro) {
      ro.disconnect();
    }
    svg = null;
    tableM = [];
  }

  function safeBuild() {
    try {
      build();
    } catch (err) {
      fail();
    }
  }

  safeBuild();

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", function () {
    vh = window.innerHeight;
  }, { passive: true });

  ro = new ResizeObserver(function () {
    if (roTimer) {
      window.clearTimeout(roTimer);
    }
    roTimer = window.setTimeout(function () {
      window.requestAnimationFrame(safeBuild);
    }, 120);
  });
  /* En regime virtuel le body ne suit plus le contenu (wrapper fixe,
     hauteur portee par le spacer) : on surveille aussi le wrapper. */
  ro.observe(body);
  ro.observe(wrap);

  if (wide.addEventListener) {
    wide.addEventListener("change", safeBuild);
  }

  if (reduce.addEventListener) {
    reduce.addEventListener("change", function () {
      if (reduce.matches && rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
        cs = window.scrollY;
      }
      safeBuild();
    });
  }

  if (doc.fonts && doc.fonts.ready) {
    doc.fonts.ready.then(safeBuild);
  }

  window.addEventListener("load", safeBuild);
})();
