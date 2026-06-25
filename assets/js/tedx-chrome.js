/* Header/footer harmonises : menu mobile + annee du footer */
(function () {
  'use strict';
  var nav = document.querySelector('.t27-nav');
  var burger = nav && nav.querySelector('.t27-burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('t27-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.t27-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
