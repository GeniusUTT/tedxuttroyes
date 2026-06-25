/* ============================================================
   TEDxUTTroyes 2027 - interactions de la home
   Compte a rebours, reveals au scroll, menu mobile, header.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Compte a rebours jusqu'au 18 mars 2027, 19h30 ---------- */
  var DEADLINE = new Date('2027-03-18T19:30:00+01:00').getTime();
  var elDays = document.getElementById('cd-days');
  var elClock = document.getElementById('cd-clock');

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function tick() {
    var diff = DEADLINE - Date.now();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (elDays) elDays.textContent = d;
    if (elClock) elClock.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  if (elDays || elClock) { tick(); setInterval(tick, 1000); }

  /* ---------- Header : etat "scrolled" ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.nav-toggle');
  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    header.querySelectorAll('.main-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Reveals au scroll ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ---------- Annee dynamique footer ---------- */
  var y = document.getElementById('foot-year');
  if (y) y.textContent = new Date().getFullYear();
})();
