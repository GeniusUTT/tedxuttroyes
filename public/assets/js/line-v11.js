(function () {
  "use strict";

  var doc = document;
  var body = doc.body;
  var html = doc.documentElement;

  var journey = body.classList.contains("journey");
  var parcours = !journey && body.classList.contains("parcours");
  if ((!journey && !parcours) || !("ResizeObserver" in window)) {
    return;
  }

  var main = doc.getElementById("contenu");

  var wrap = journey ? doc.querySelector(".jscroll") : main;
  if (!main || !wrap) {
    return;
  }
  var probeA = doc.getElementById("probe-a");
  var probeB = doc.getElementById("probe-b");
  if (journey && (!probeA || !probeB)) {
    return;
  }
  if (parcours) {

    probeA = doc.createElement("span");
    probeA.className = "probe";
    probeA.setAttribute("aria-hidden", "true");
    probeA.style.left = "var(--line-x)";
    main.appendChild(probeA);
    probeB = probeA;
  }

  var SVG_NS = "http://www.w3.org/2000/svg";
  var LEN = 1000;
  var TIP = 0.5;
  var PRISE = 0.75;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 1024px)");

  var svg = null;
  var pathMain = null;
  var pathTail = null;
  var spacer = null;
  var svgW = 0;
  var svgH = 0;

  var vh = window.innerHeight;
  var wrapRect = null;
  var contentH = 0;
  var virtualOn = false;
  var tableM = [];
  var extraH = 0;
  var freezes = [];
  var tailFrom = 0;
  var tailTo = 1;
  var crosses = [];
  var crossStates = [];
  var plugEl = null;
  var sweepEl = null;
  var sweepP0 = 0;
  var sweepP1 = 0;
  var lastSweep = -1;
  var tlMarks = [];
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

  function buildTable(pts, virtual, budgets, hFactor) {
    freezes = [];
    extraH = 0;
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
          var win = Math.min(Math.max(dx * 0.35, 48), vh * 0.35) * (hFactor || 1);
          extraH += win;
          t.push(t[i - 1] + win);
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

  function clearFilet(y, lo, hi, dir, filets) {
    for (var i = 0; i < filets.length; i++) {
      if (Math.abs(y - filets[i]) < 10) {
        y = dir > 0
          ? Math.min(hi - 8, filets[i] + 18)
          : Math.max(lo + 8, filets[i] - 18);
        break;
      }
    }
    return Math.round(y);
  }

  function replie(el) {
    return !!el.closest("details:not([open])") && !el.closest("summary");
  }

  function neighbour(el, forward, bande) {
    var n = el;
    var er = bande || relRect(el);
    var s;
    var sr;
    while (n && n !== main) {
      s = forward ? n.nextElementSibling : n.previousElementSibling;
      while (s) {
        sr = relRect(s);
        if (sr.width >= 2 && sr.height >= 2 && !replie(s) &&
            (forward ? sr.top >= er.bottom - 4 : sr.bottom <= er.top + 4)) {
          return s;
        }
        s = forward ? s.nextElementSibling : s.previousElementSibling;
      }
      n = n.parentElement;
    }
    return null;
  }

  function rowSpan(el) {
    var sp = innerSpan(el);
    var top = sp.top;
    var bottom = sp.bottom;
    var s = el.parentElement ? el.parentElement.firstElementChild : null;
    var sr;
    var ss;
    while (s) {
      if (s !== el) {
        sr = relRect(s);
        if (sr.width >= 2 && sr.height >= 2 && !replie(s) &&
            sr.top < bottom - 4 && sr.bottom > top + 4) {
          ss = innerSpan(s);
          if (ss.top < top) {
            top = ss.top;
          }
          if (ss.bottom > bottom) {
            bottom = ss.bottom;
          }
        }
      }
      s = s.nextElementSibling;
    }
    return { top: top, bottom: bottom };
  }

  function gapNear(el, dir, cartes, filets) {
    var n = el;
    var sp;
    var nb;
    var edge;
    var lo;
    var hi;
    var y;
    while (n && n !== main) {
      sp = rowSpan(n);
      nb = neighbour(n, dir > 0, sp);
      if (nb) {
        edge = dir > 0 ? innerSpan(nb).top : innerSpan(nb).bottom;
        lo = dir > 0 ? sp.bottom : edge;
        hi = dir > 0 ? edge : sp.top;
        if (hi - lo >= 36) {

          y = clearFilet((lo + hi) / 2, lo, hi, -dir, filets);
          if (!dansUneCarte(y, el, cartes)) {
            return { y: y, lo: lo, hi: hi };
          }
        }
      }
      n = n.parentElement;
    }
    return null;
  }

  function dansUneCarte(y, el, cartes) {
    for (var i = 0; i < cartes.length; i++) {
      if (y > cartes[i].top + 2 && y < cartes[i].bottom - 2 &&
          !cartes[i].el.contains(el)) {
        return true;
      }
    }
    return false;
  }

  function innerSpan(sec) {
    var kids = sec.querySelectorAll("*");
    var top = Infinity;
    var bot = -Infinity;
    var i;
    var kr;
    for (i = 0; i < kids.length; i++) {
      kr = relRect(kids[i]);
      if (kr.width < 2 || kr.height < 2 || replie(kids[i])) {
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

    vh = window.innerHeight;
    var horiz = wide.matches;

    if (parcours && horiz) {
      if (svg && svg.parentNode) {
        svg.parentNode.removeChild(svg);
        svg = null;
        pathMain = null;
        pathTail = null;
        svgW = 0;
        svgH = 0;
      }
      wrapRect = wrap.getBoundingClientRect();
      contentH = wrapRect.height;
      var fin = main.querySelector('[data-line="plug"]');
      if (fin) {

        fin.classList.remove("plug-armed", "plug-on");
        var finR = relRect(fin);
        main.style.setProperty(
          "--dorsale-fin",
          Math.max(0, Math.round(contentH - (finR.top + finR.height / 2))) + "px"
        );
      } else {
        main.style.removeProperty("--dorsale-fin");
      }
      plugEl = null;
      tableM = [];
      freezes = [];
      virtualOn = false;
      html.classList.remove("jline-run");
      return;
    }

    var moments = journey && horiz;

    var rails = !horiz;
    var virtual = moments && !reduce.matches;
    wrapRect = wrap.getBoundingClientRect();
    contentH = wrapRect.height;
    var axA = relRect(probeA).left;

    var axB = journey ? relRect(probeB).left : axA;

    var W = Math.round(wrapRect.width);

    var footer = journey ? doc.querySelector(".site-footer") : null;
    var H = Math.ceil(footer ? relRect(footer).bottom : contentH);

    var filets = [];
    var cartes = [];
    if (parcours) {
      var edged = main.querySelectorAll("*");
      var fst;
      var haut;
      var bas;
      for (var fq = 0; fq < edged.length; fq++) {
        r = relRect(edged[fq]);
        if (r.width < W * 0.5 || r.height < 2 || replie(edged[fq])) {
          continue;
        }
        fst = window.getComputedStyle(edged[fq]);
        haut = parseFloat(fst.borderTopWidth) > 0;
        bas = parseFloat(fst.borderBottomWidth) > 0;
        if (haut) {
          filets.push(r.top);
        }
        if (bas) {
          filets.push(r.bottom);
        }
        if (haut || bas) {

          cartes.push({ el: edged[fq], top: r.top, bottom: r.bottom });
        }
      }
    }

    var pts = [[axB, 0]];
    var budgets = {};
    var el;
    var r;

    var crossEls = main.querySelectorAll('[data-line="cross"]');
    crosses = [];
    var c;
    for (c = 0; c < crossEls.length; c++) {
      el = crossEls[c];
      var word = el.querySelector(".cross-word");
      var st = crossStateFor(el);
      var active = false;

      var onRightRail = el.hasAttribute("data-line-flank");
      if (word && !reduce.matches && (moments || !onRightRail)) {
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

          var wRect = relRect(word);
          crosses.push({
            el: el,
            st: st,
            top: wRect.top - vh * 0.15,
            h: ((vh * 2) / 3 + wRect.height / 2) / 0.75
          });
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

    var band = main.querySelector('[data-line="turn"]');
    var dot = main.querySelector('[data-line="drop"]');
    var bandR = null;
    var dotR = null;
    var bandJogY = 0;
    var bandCutY = Infinity;
    if (band && dot && moments) {
      bandR = relRect(band);
      dotR = relRect(dot);
      var caption = main.querySelector(".fr-caption");
      bandJogY = caption
        ? Math.round((relRect(caption).bottom + bandR.top) / 2)
        : bandR.top - 30;
      bandCutY = bandJogY;
    }

    var avoidEls = moments ? main.querySelectorAll('[data-line="avoid"]') : [];
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
      var m = parseFloat(el.getAttribute(
        moments ? "data-line-margin" : "data-line-margin-m"
      ));
      if (!m || m < 0) {
        m = moments ? 28 : 14;
      }
      if (r.top > bandCutY) {
        lateAvoids.push({ el: el, r: r, m: m });
        continue;
      }
      if (r.top - m < lastY + 12) {
        continue;
      }

      var ex;
      if (moments && el.getAttribute("data-line-side") === "right") {
        ex = Math.min(W - 4, r.right + m);
        if (ex <= axB + 1) {
          continue;
        }
      } else {
        ex = moments
          ? Math.max(4, r.left - m)
          : Math.max(4, Math.min(r.left - m, axA - 10));
        if (ex >= axB - 1) {
          continue;
        }
      }

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

    var railX = axB;
    var railR = axB;
    if (rails) {
      var cRight = 0;

      var refs = main.querySelectorAll(
        ".sec-body, .lead, .mom-title, .slist, .album, .tl, .data-lines," +
        " .mom-photo"
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

      railR = Math.min(W - 6, Math.round(cRight + (W - cRight) / 2));
      if (railR - axB < 80) {
        railR = axB;
      }

      var tagged = railR === axB
        ? []
        : main.querySelectorAll('[data-line-flank]');
      var evts = [];
      for (c = 0; c < tagged.length; c++) {
        el = tagged[c];

        if (el.querySelector(".tl-row .tl-dot")) {
          continue;
        }
        var span = innerSpan(el);
        if (span.bottom - span.top < 2) {
          continue;
        }

        var gIn = gapNear(el, -1, cartes, filets);
        if (gIn) {
          evts.push({ y: gIn.y, x: railR });
        }
        var gOut = gapNear(el, 1, cartes, filets);
        if (gOut) {
          evts.push({ y: gOut.y, x: axB });
        }
      }
      evts.sort(function (a, b) {
        return a.y - b.y;
      });

      for (c = 0; c < evts.length - 1; c++) {
        if (evts[c].x === axB && evts[c + 1].x === railR &&
            evts[c + 1].y - evts[c].y < 100) {
          evts.splice(c, 2);
          c -= 1;
        }
      }

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
      if (!moments) {

        var py = plugRect.top + plugRect.height / 2;
        var plugX = railX > plugRect.left + plugRect.width / 2
          ? plugRect.right - 8
          : plugRect.left + 8;
        pts.push([railX, py], [plugX, py]);
      } else {
        var bx = plugRect.left + plugRect.width / 2;
        if (Math.abs(dropX - bx) > 12) {

          var jogY2 = bandBottom ? bandBottom + 44 : plugRect.top - 18;
          pts.push([dropX, jogY2], [bx, jogY2]);
        }

        var lastY2 = pts[pts.length - 1][1];
        for (c = 0; c < lateAvoids.length; c++) {
          el = lateAvoids[c].el;
          r = lateAvoids[c].r;
          var m2 = lateAvoids[c].m;
          if (r.top - m2 < lastY2 + 12 || r.bottom + m2 > plugRect.top - 12) {
            continue;
          }

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

      if (parcours && railX !== axB) {
        var basContenu = innerSpan(main).bottom;
        var yRetour = H - basContenu >= 24
          ? Math.round((basContenu + H) / 2)
          : H;
        pts.push([railX, yRetour], [axB, yRetour]);
        railX = axB;
      }
      pts.push([moments ? dropX : railX, H]);
    }

    var tailPts = null;

    if (!svg) {
      inject();
    }
    if (journey && !spacer) {
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

    buildTable(pts, virtual, budgets, 1);

    if (!virtual && tableM.length > 1) {
      var dispo = Math.max(1, html.scrollHeight - vh);
      var t0 = tableM[0].t;
      var finT = tableM[tableM.length - 1].t;

      var cible = plugEl
        ? finT - (PRISE - TIP) * vh
        : Math.min(finT, dispo - 40);

      if (cible < 0) {
        cible = 0;
      }
      if (finT - t0 > 1 && cible > t0) {
        var kSec = (cible - t0) / (finT - t0);

        var kFin = (dispo - 40 - t0) / (finT - t0);
        if (kSec > kFin) {
          kSec = kFin;
        }
        for (c = 0; c < tableM.length; c++) {
          tableM[c].t = t0 + (tableM[c].t - t0) * kSec;
        }
      }
    }
    virtualOn = virtual && tableM.length > 0;
    var totalF = 0;
    for (c = 0; c < freezes.length; c++) {
      totalF += freezes[c][1] - freezes[c][0];
    }

    var lastT = tableM.length ? tableM[tableM.length - 1].t : 0;
    var reserve = lastT + 70 + Math.max(120, Math.round(vh * 0.45));
    var pad = 0;

    if (virtualOn) {
      pad = Math.max(0, Math.ceil(reserve - (contentH + totalF - vh)));
      spacer.style.height = Math.round(contentH + totalF + pad) + "px";
      html.classList.add("jscroll-run");
    } else {
      html.classList.remove("jscroll-run");
      if (journey) {
        wrap.style.transform = "";
      }
      freezes = [];
    }

    var maxScroll = Math.max(1, (virtualOn ? contentH + totalF + pad : contentH) - vh);
    tailFrom = tableM.length ? tableM[tableM.length - 1].t + 30 : 0;
    tailFrom = Math.min(tailFrom, maxScroll - 60);
    tailTo = Math.max(1, maxScroll - Math.max(120, Math.round(vh * 0.45)));
    if (tailTo - tailFrom < 40) {
      tailFrom = Math.max(0, tailTo - 40);
    }

    sweepP0 = 0;
    sweepP1 = 0;
    lastSweep = -1;
    if (sweepIdx && tableM.length) {
      sweepP0 = tableM[sweepIdx[0]].p;
      sweepP1 = tableM[sweepIdx[1]].p;
    } else if (sweepEl) {
      sweepEl.style.removeProperty("--sweep");
    }

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

  function apply(scroll) {
    if (!pathMain) {
      return;
    }
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

      cp = cp * cp * (3 - 2 * cp);
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

  if (doc.readyState === "complete") {
    safeBuild();
  } else {
    window.addEventListener("load", safeBuild);
  }
})();
