/* TEDxUTTroyes 2027 : la carte du lieu.
   Le plan de situation SVG reste la version par defaut : sans JavaScript,
   sans WebGL ou si Mapbox ne repond pas, c'est lui qui s'affiche.
   Quand le bloc lieu approche du viewport, on charge Mapbox GL (meme
   style rouge que l'ancien site) et la carte interactive fond a la place
   du plan. Rien n'est demande aux serveurs de Mapbox avant ce moment. */
(function () {
  "use strict";

  var scene = document.querySelector(".lieu-scene");
  var box = document.getElementById("lieu-map");
  if (!scene || !box || !("IntersectionObserver" in window)) return;

  var VERSION = "2.15.0";
  /* PLACEHOLDER : jeton public repris de l'ancien site (compte personnel
     solene-drnx). A remplacer par un jeton cree sur un compte Mapbox de
     l'association, restreint au domaine tedxuttroyes.fr. */
  var TOKEN = "pk.eyJ1Ijoic29sZW5lLWRybngiLCJhIjoiY2xxbWtnOThsMms5MTJrdGs4eHlrazluOSJ9.OUYIvMEY-JOWEAbXw1ysFw";
  var STYLE = "mapbox://styles/solene-drnx/clqmks2rs00pq01qu989l0bl3";
  var CENTRE = [4.077912, 48.298433];

  var started = false;

  /* En cas d'echec, on retire la boite : le plan SVG reste seul en place. */
  function fail() {
    if (box.parentNode) {
      box.parentNode.removeChild(box);
    }
  }

  function init() {
    if (!window.mapboxgl) {
      fail();
      return;
    }
    window.mapboxgl.accessToken = TOKEN;

    var map;
    try {
      map = new window.mapboxgl.Map({
        container: box,
        style: STYLE,
        center: CENTRE,
        zoom: 13.8,
        attributionControl: false,
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        locale: {
          "Map.Title": "Carte du quartier du Centre de Congrès de l'Aube",
          "AttributionControl.ToggleAttribution": "Afficher les crédits",
          "CooperativeGesturesHandler.WindowsHelpText": "Ctrl + molette pour zoomer la carte",
          "CooperativeGesturesHandler.MacHelpText": "Cmd + molette pour zoomer la carte",
          "CooperativeGesturesHandler.MobileHelpText": "Déplacez la carte avec deux doigts"
        }
      });
    } catch (e) {
      fail();
      return;
    }

    map.touchZoomRotate.disableRotation();
    map.addControl(new window.mapboxgl.AttributionControl({ compact: true }));

    var live = false;

    /* Un tuile manquante apres coup est sans gravite ; une erreur avant le
       premier rendu (jeton, style) veut dire pas de carte : on replie. */
    map.on("error", function () {
      if (live) return;
      live = true;
      try {
        map.remove();
      } catch (e) { /* rien */ }
      fail();
    });

    map.on("load", function () {
      if (live) return;
      live = true;

      /* Le marqueur "vous etes ici", meme graphisme que sur le plan. */
      var el = document.createElement("div");
      el.className = "lieu-ici";
      el.innerHTML =
        '<span class="lieu-ici-dot"></span>' +
        '<span class="lieu-ici-lbl">vous êtes ici</span>';
      new window.mapboxgl.Marker({ element: el }).setLngLat(CENTRE).addTo(map);

      scene.classList.add("map-live");
      map.resize();
    });
  }

  function start() {
    if (started) return;
    started = true;

    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://api.mapbox.com/mapbox-gl-js/v" + VERSION + "/mapbox-gl.css";
    document.head.appendChild(css);

    var js = document.createElement("script");
    js.src = "https://api.mapbox.com/mapbox-gl-js/v" + VERSION + "/mapbox-gl.js";
    js.onload = init;
    js.onerror = fail;
    document.head.appendChild(js);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        io.disconnect();
        start();
        return;
      }
    }
  }, { rootMargin: "600px 0px" });

  io.observe(scene);
})();
