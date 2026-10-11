/* ==========================================================================
   TEDxUTTroyes 2027 - Le devoilement
   --------------------------------------------------------------------------
   La date du jour J et le theme sont masques jusqu'au samedi 31 octobre
   2026 a 18h00 (heure de Paris). A cet instant precis, le site se remet de
   lui-meme dans l'etat d'avant le masquage : plus une etoile, plus une
   barre de caviardage, les titres et les descriptions d'origine reviennent.

   Cible figee en UTC : Paris est repasse a l'heure d'hiver le 25 octobre
   2026 (UTC+1), donc 18h00 a Paris = 17h00 UTC. Aucun calcul de fuseau
   cote client : tout le monde bascule au meme instant, ou que l'on soit.

   Le contenu d'origine voyage dans les pages elles-memes :

     <span class="msk" data-c="texte d'origine">masque</span>
     <element data-reveal="texte d'origine">
     <element data-reveal-attr="content" data-reveal="valeur d'origine">
     <element data-reveal-html="html d'origine">
     <element data-reveal-unhide>        (retire aria-hidden)
     <element data-reveal-drop>          (disparait au devoilement)
     <template data-reveal-target="#id"> (remplace le contenu de la cible)

   C'est un voile, pas un secret : qui ouvre le code source lit tout. Le
   jour venu, le mieux reste de revenir au vrai HTML (git revert du commit
   de masquage) ; ce script est le filet qui evite au site de rester
   masque si personne n'est devant un clavier.
   ========================================================================== */
(function () {
  "use strict";

  var REVEAL_UTC = Date.UTC(2026, 9, 31, 17, 0, 0);
  var doc = document;
  var done = false;

  /* Remplace un noeud par le texte qu'il cachait. */
  var swapText = function (el, value) {
    el.parentNode.replaceChild(doc.createTextNode(value), el);
  };

  var run = function () {
    if (done) {
      return;
    }
    done = true;

    /* 1. Les templates d'abord : ils reinstallent des blocs entiers
       (les deux versants du theme, caviardes en attendant). */
    var tpl = doc.querySelectorAll("template[data-reveal-target]");
    for (var t = 0; t < tpl.length; t++) {
      var cible = doc.querySelector(tpl[t].getAttribute("data-reveal-target"));
      if (cible) {
        cible.innerHTML = tpl[t].innerHTML;
      }
    }

    /* 2. Les zones de texte masquees, une etoile par caractere. */
    var msk = doc.querySelectorAll(".msk[data-c]");
    for (var m = 0; m < msk.length; m++) {
      swapText(msk[m], msk[m].getAttribute("data-c"));
    }

    /* 3. Textes, attributs et blocs remplaces en entier. */
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

    /* 4. Ce qui n'existait que pour le masquage disparait, et ce qui
       etait cache aux lecteurs d'ecran leur revient. */
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

  /* Rearme au plus une journee d'avance : le compte a rebours de
     l'accueil declenche aussi le devoilement quand il tombe a zero, et un
     simple rechargement suffit dans tous les cas. */
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
