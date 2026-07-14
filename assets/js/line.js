/* TEDxUTTroyes 2027 - la ligne continue (accueil uniquement)
   Un seul trait rouge parcourt la page : il nait au seuil sous le titre,
   reste droit quand le mot le franchit, plie autour du bloc du lieu,
   redescend a 2016, deroule la frise des dix ans, forme le 1 du grand 10,
   se branche dans le bouton Reserver, puis file en trait fin souligner
   la mention de licence TED au pied de page.
   Principe : le CSS place les contenus, ce script mesure et relie.
   Le chemin SVG est reconstruit a chaque changement de geometrie.
   Sans JavaScript ou en cas d'echec : ligne verticale statique en CSS. */

(function () {
  "use strict";

  var doc = document;
  var body = doc.body;

  if (!body.classList.contains("journey") || !("ResizeObserver" in window)) {
    return;
  }

  var main = doc.getElementById("contenu");
  var probeA = doc.getElementById("probe-a");
  var probeB = doc.getElementById("probe-b");
  if (!main || !probeA || !probeB) {
    return;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var LEN = 1000;   /* pathLength normalise : dashoffset independant de la geometrie */
  var TIP = 0.62;   /* la pointe du trait vit a 62 % de la hauteur du viewport */

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 1024px)");

  var svg = null;
  var pathMain = null;
  var pathTail = null;
  var svgW = 0;
  var svgH = 0;

  var vh = window.innerHeight;
  var tableM = [];      /* etapes [scroll, fraction] du trait principal */
  var tailFrom = 0;     /* fenetre de scroll ou l'epilogue se trace */
  var tailTo = 1;
  var cross = null;     /* etat du mot qui franchit (desktop seulement) */
  var lastCrossP = 1;
  var lastDist = 0;
  var cs = window.scrollY;
  var rafId = 0;

  /* ------------------------------------------------------------------
     Outils de geometrie
     ------------------------------------------------------------------ */

  function absRect(el, sx, sy) {
    var r = el.getBoundingClientRect();
    return {
      left: r.left + sx,
      right: r.right + sx,
      top: r.top + sy,
      bottom: r.bottom + sy,
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
     Les segments verticaux se declenchent quand leur sommet atteint
     TIP du viewport ; les segments horizontaux (frise, pliure, virage)
     recoivent une plage de scroll dediee pour que le balayage se voie. */
  function buildTable(pts) {
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
    var t = [pts[0][1] - TIP * vh];
    for (i = 1; i < pts.length; i++) {
      var dx = Math.abs(pts[i][0] - pts[i - 1][0]);
      var dy = Math.abs(pts[i][1] - pts[i - 1][1]);
      if (dy < 3 && dx > 3) {
        t.push(t[i - 1] + Math.min(Math.max(dx * 0.35, 48), vh * 0.35));
      } else {
        t.push(Math.max(t[i - 1] + 2, pts[i][1] - TIP * vh));
      }
    }
    tableM = [];
    for (i = 0; i < pts.length; i++) {
      tableM.push({ t: t[i], p: lens[i] / total });
    }
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
    body.appendChild(svg);
  }

  function build() {
    /* Phase 1 : lectures seules */
    vh = window.innerHeight;
    var sx = window.scrollX;
    var sy = window.scrollY;
    var horiz = wide.matches;
    var axA = probeA.getBoundingClientRect().left + sx;
    var axB = probeB.getBoundingClientRect().left + sx;
    var W = doc.documentElement.clientWidth;
    var footer = doc.querySelector(".site-footer");
    var H = footer
      ? Math.ceil(footer.getBoundingClientRect().bottom + sy)
      : doc.documentElement.scrollHeight;

    var pts = [[axB, 0]];
    var el;
    var r;

    /* Moment 2 : le mot franchit, la ligne reste droite */
    el = main.querySelector('[data-line="cross"]');
    cross = null;
    if (el) {
      var word = el.querySelector(".cross-word");
      if (word && horiz && !reduce.matches) {
        r = absRect(el, sx, sy);
        var wr = absRect(word, sx, sy);
        var layoutRight = wr.right - (lastCrossP - 1) * lastDist;
        var dist = Math.round(layoutRight - (axB - 28));
        if (dist > 40) {
          lastDist = dist;
          el.style.setProperty("--cross-dist", dist + "px");
          cross = { el: el, top: r.top, h: r.height };
        }
      }
      if (!cross) {
        el.style.removeProperty("--cross-dist");
        el.style.removeProperty("--cross-p");
        lastCrossP = 1;
        lastDist = 0;
      }
    }

    /* Moment 3 : la pliure autour du bloc du lieu */
    el = main.querySelector('[data-line="avoid"]');
    if (el) {
      r = absRect(el, sx, sy);
      var m = parseFloat(el.getAttribute(horiz ? "data-line-margin" : "data-line-margin-m"));
      if (!m || m < 0) {
        m = horiz ? 28 : 14;
      }
      var ex = horiz
        ? Math.max(4, r.left - m)
        : Math.max(4, Math.min(r.left - m, axA - 10));
      pts.push([axB, r.top - m], [ex, r.top - m], [ex, r.bottom + m], [axB, r.bottom + m]);
    }

    /* Moment 4 : retour a 2016, virage, frise horizontale (desktop).
       Sur mobile la frise reste une echelle verticale sur la ligne. */
    var dropX = axB;
    var band = main.querySelector('[data-line="turn"]');
    var dot = main.querySelector('[data-line="drop"]');
    if (band && horiz) {
      r = absRect(band, sx, sy);
      var midY = r.top + r.height / 2;
      var jogY = r.top - 56;
      pts.push([axB, jogY], [r.left, jogY], [r.left, midY]);
      if (dot) {
        var dr = absRect(dot, sx, sy);
        dropX = dr.left + dr.width / 2;
        pts.push([dropX, midY]);
      }
    }

    /* La prise : le trait descend (le 1 du 10) et se branche au bouton */
    var plug = main.querySelector('[data-line="plug"]');
    var plugRect = null;
    if (plug) {
      plugRect = absRect(plug, sx, sy);
      var bx = plugRect.left + plugRect.width / 2;
      if (Math.abs(dropX - bx) > 12) {
        pts.push([dropX, plugRect.top - 18], [bx, plugRect.top - 18]);
      }
      pts.push([bx, plugRect.top + 8]);
    } else {
      pts.push([dropX, H]);
    }

    /* Epilogue : trait fin jusqu'a la mention de licence TED */
    var tailPts = null;
    el = doc.querySelector('[data-line="finale"]');
    if (el && plugRect) {
      /* Le trait fin ressort par le flanc gauche du bouton, descend dans
         la marge, puis vient souligner la mention de licence TED. */
      var lic = absRect(el, sx, sy);
      var midYBtn = plugRect.top + plugRect.height / 2;
      var descX = Math.max(6, lic.left - 16);
      var underY = lic.bottom + 5;
      if (underY > midYBtn + 40 && descX < plugRect.left - 20) {
        tailPts = [
          [plugRect.left - 2, midYBtn],
          [descX, midYBtn],
          [descX, underY],
          [lic.right, underY]
        ];
      }
    }

    /* Phase 2 : ecritures */
    if (!svg) {
      inject();
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

    buildTable(pts);
    var maxScroll = Math.max(1, H - vh);
    tailFrom = tableM.length ? tableM[tableM.length - 1].t + 30 : 0;
    tailFrom = Math.min(tailFrom, maxScroll - 60);
    tailTo = maxScroll;
    if (tailTo - tailFrom < 40) {
      tailFrom = Math.max(0, tailTo - 40);
    }

    if (reduce.matches) {
      pathMain.style.strokeDashoffset = "0";
      pathTail.style.strokeDashoffset = "0";
    } else {
      apply(cs);
    }
  }

  /* ------------------------------------------------------------------
     Pilote : le trait se trace au fil du defilement, avec lissage.
     La boucle rAF s'arrete d'elle-meme quand la page est immobile.
     ------------------------------------------------------------------ */

  function apply(scroll) {
    var pM = interp(tableM, scroll);
    pathMain.style.strokeDashoffset = (LEN * (1 - pM)).toFixed(2);
    var pT = clamp01((scroll - tailFrom) / Math.max(1, tailTo - tailFrom));
    pathTail.style.strokeDashoffset = (LEN * (1 - pT)).toFixed(2);
    if (cross) {
      var cp = clamp01((scroll + vh * 0.85 - cross.top) / Math.max(1, cross.h * 0.75));
      cp = 1 - Math.pow(1 - cp, 3);
      if (Math.abs(cp - lastCrossP) > 0.001) {
        lastCrossP = cp;
        cross.el.style.setProperty("--cross-p", cp.toFixed(3));
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
  ro.observe(body);

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
