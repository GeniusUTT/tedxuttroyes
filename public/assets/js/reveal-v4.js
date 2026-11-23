(function () {
  "use strict";

  var REVEAL_UTC = Date.UTC(2026, 10, 10, 15, 0, 0);
  var doc = document;
  var done = false;

  var swapText = function (el, value) {
    el.parentNode.replaceChild(doc.createTextNode(value), el);
  };

  var run = function () {
    if (done) {
      return;
    }
    done = true;

    var tpl = doc.querySelectorAll("template[data-reveal-target]");
    for (var t = 0; t < tpl.length; t++) {
      var cible = doc.querySelector(tpl[t].getAttribute("data-reveal-target"));
      if (cible) {
        cible.innerHTML = tpl[t].innerHTML;
      }
    }

    var msk = doc.querySelectorAll(".msk[data-c]");
    for (var m = 0; m < msk.length; m++) {
      swapText(msk[m], msk[m].getAttribute("data-c"));
    }

    var rev = doc.querySelectorAll("[data-reveal]");
    for (var r = 0; r < rev.length; r++) {
      var el = rev[r];
      var attr = el.getAttribute("data-reveal-attr");
      if (attr) {
        el.setAttribute(attr, el.getAttribute("data-reveal"));
      } else {
        el.textContent = el.getAttribute("data-reveal");
      }
    }

    var htm = doc.querySelectorAll("[data-reveal-html]");
    for (var h = 0; h < htm.length; h++) {
      htm[h].innerHTML = htm[h].getAttribute("data-reveal-html");
    }

    var hid = doc.querySelectorAll("[data-reveal-unhide]");
    for (var u = 0; u < hid.length; u++) {
      hid[u].removeAttribute("aria-hidden");
    }

    var drop = doc.querySelectorAll("[data-reveal-drop]");
    for (var d = 0; d < drop.length; d++) {
      drop[d].parentNode.removeChild(drop[d]);
    }

    doc.documentElement.classList.add("revele");
  };

  window.TEDX_REVEAL = {
    at: REVEAL_UTC,
    run: run,
    isDone: function () {
      return done;
    }
  };

  var arm = function () {
    var reste = REVEAL_UTC - Date.now();
    if (reste <= 0) {
      run();
      return;
    }
    window.setTimeout(arm, Math.min(reste, 86400000));
  };

  arm();
})();
