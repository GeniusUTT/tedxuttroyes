# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Le projet

Site statique de TEDxUTTroyes 2027 (dixième édition, jeudi 18 mars 2027, Centre de Congrès de l'Aube, Troyes). HTML, CSS et JavaScript purs : aucun framework, aucun build, aucune dépendance npm, aucun test automatisé. Tout le contenu est en français. Le README.md décrit la structure, le déploiement OVH et la table des placeholders à compléter : le lire avant toute modification de contenu.

## Commandes

Pas de build ni de lint pour le site (le dossier `design-system/` a le sien, voir plus bas). Pour tester en local (indispensable : tous les liens et chemins d'assets sont absolus depuis la racine, ouvrir les fichiers directement ne fonctionne pas) :

```
python -m http.server 8000
```

Le déploiement est fait par Baptiste via Git/SSH sur OVH mutualisé. Attention : `.htaccess` met la feuille et le script communs en cache un mois ; après une mise en ligne, une modification de ces fichiers exige de les renommer (ils s'appellent aujourd'hui `main-v2.css` et `main-v2.js`, passer à `main-v3`) et de mettre à jour les références dans toutes les pages HTML.

## Règles dures (ne jamais défaire)

- **Tirets cadratins et demi-cadratins proscrits** partout : dans le HTML, le CSS, les commentaires, les commits. Utiliser deux points, parenthèses ou virgules.
- **Zéro framework, zéro tracker, zéro cookie.** Polices hébergées en local (`assets/fonts/`). Seule exception aux requêtes externes : la carte Mapbox de l'accueil (chargée paresseusement, plan SVG local en fallback), documentée dans les mentions légales.
- **Conformité TEDx** : aucun partenaire sur l'accueil ; texte officiel « Qu'est-ce que TEDx ? » et lien ted.com/tedx sur l'accueil ; mention « Cet événement TEDx indépendant est organisé sous licence de TED. » dans chaque footer ; toujours « TEDxUTTroyes » en entier, jamais en capitales forcées ; logos partenaires plafonnés en CSS sous la taille du logo de l'événement.
- **Jamais d'email personnel** des membres de l'équipe sur le site (nom, rôle et LinkedIn uniquement).
- **DA « le relevé »** : zéro border-radius, zéro ombre portée ou halo. Seule exception au border-radius : les photos du planning de l'accueil (`.tl-ph img`), coupées en 2/1 avec un léger arrondi, à la demande de Baptiste le 2026-07-18 (ce sont de simples illustrations du programme). Les photos sont affichées en couleur (le noir et blanc a été retiré à la demande de Baptiste le 2026-07-17 ; seul le fond du hero reste assombri). Les speakers non annoncés sont des fiches sous embargo (barres de caviardage), les éditions un registre, le compte à rebours un téléscripteur mono d'une ligne.
- **Thème masqué** (depuis le 2026-08-16) : « Franchir ou s'adapter ? » et « la limite » ne figurent nulle part dans les pages servies. Les titres courts sont en étoiles (`******** ** *'*******`), les deux sections « Franchir » et « S'adapter » de l'accueil sont sous embargo (barres `.redact`, comme les fiches speakers), les `<title>`, `og:title`, `twitter:title`, `og:image:alt` et le JSON-LD portent un intitulé neutre (« TEDxUTTroyes 2027, dixième édition »). Les textes d'origine ne sont ni dans le HTML ni dans les commentaires : ils se récupèrent dans l'historique git. Même échéance que la date : le 18 octobre 2026.
- **Date du jour J masquée** (depuis le 2026-08-16) : toute apparition visible de « 18 mars 2027 » est remplacée par des étoiles, un caractère pour un caractère (`***** ** **** ****`, `** **** ****`, `** ****`), y compris dans les `meta description`, `og:description`, `twitter:description` et `og:image:alt`. Le JSON-LD `Event` de l'accueil et les attributs `datetime` gardent la vraie date. Ne pas « corriger » ce masquage : il tombe le 18 octobre 2026, date jusqu'à laquelle décompte le téléscripteur.
- Les emplacements à compléter portent un commentaire `PLACEHOLDER` : en ajouter sur toute donnée inventée ou provisoire, ne pas en retirer sans la vraie valeur.

Baptiste préfère valider un plan avant l'écriture du code pour tout changement non trivial.

## Architecture

### La ligne continue (index.html + assets/js/line.js)

Le concept directeur de l'accueil : un seul trait SVG rouge parcourt toute la page (`body.journey`). **Le CSS place les contenus, line.js mesure et relie** : le script lit les ancres `data-line` (`cross`, `avoid`, `turn`, `drop`, `plug`, `finale`) et deux sondes CSS (`#probe-a` donne `--line-x`, `#probe-b` donne `--axis-b`), reconstruit le path à chaque changement de géométrie (ResizeObserver), et le dessine au fil du scroll (pathLength normalisé à 1000, pointe au centre du viewport).

En desktop, l'accueil est en **défilement virtuel à scrollbar native** : `main` + footer vivent dans un wrapper `.jscroll` que line.js passe en `position: fixed` (classe `jscroll-run` sur `html`) et translate selon le scroll d'un spacer ; chaque segment horizontal du tracé reçoit une fenêtre de gel (translation constante) pendant laquelle l'écran est figé et la pointe balaie l'horizontale (contournements, virages, traversée de la frise), jusqu'à la prise (bouton Réserver) où la règle s'arrête. Toutes les mesures de line.js sont en repère contenu (relatives au wrapper). Conséquence : `position: sticky` ne fonctionne plus à l'intérieur de `main` sur l'accueil (ancêtre transformé), et le scroll natif (`window.scrollY`) continue d'avancer normalement (le header, main-v2.js et les IntersectionObserver ne sont pas affectés). Sans JavaScript, sous 1024 px, en reduced motion ou en cas d'échec de build (classe `.jline-fail`) : flux normal, dorsale verticale statique en pur CSS (`main::before`).

Conséquence : déplacer, redimensionner ou supprimer un bloc porteur de `data-line` sur l'accueil change le tracé de la ligne. Vérifier le rendu au scroll après toute retouche de layout de l'accueil. Sous 1024 px, line.js tourne toujours mais dessine une **dorsale strictement droite** : les pliures autour des blocs `avoid` et les traversées horizontales (`cross`, `turn`, `drop`) sont neutralisées (`horiz` faux). Seule exception au bout du parcours : le bloc final `.final-plug` est centré dans la page et la ligne descend droite puis entre dans le bouton « Réserver ma place » par la gauche (segment horizontal jusqu'au centre vertical du bouton), qu'elle illumine en rouge (`plug-on`). La section « Dix ans » est réduite en mobile à son titre et à un carrousel d'affiches balayable (`.ed-slider`, scroll-snap pur CSS) : l'album, la bande d'archives et les chiffres sont masqués.

### CSS : une seule feuille, sections numérotées

`assets/css/main-v2.css` est la feuille unique, organisée en sections numérotées (01 à 21, sous-sections 20b/20c/20d) avec un sommaire commenté en tête de fichier. Toute nouvelle règle va dans la section correspondante, et le sommaire est tenu à jour. Tokens en tête : `--noir #080808`, `--papier #EDEAE4`, `--rouge #EB0028`, `--filet`, `--line-x`, etc. Mobile first.

### JavaScript : trois fichiers, zéro dépendance, chargés en defer

- `assets/js/main-v2.js` : header au scroll, menu mobile accessible, téléscripteur du compte à rebours (cible UTC figée `2026-10-18T16:00:00Z`, la révélation de la date du jour J), dixième bâton.
- `assets/js/line.js` : la ligne continue (accueil uniquement, voir ci-dessus).
- `assets/js/map.js` : carte Mapbox GL du bloc lieu, chargée paresseusement (IntersectionObserver) ; le plan SVG dessiné à la main reste la version par défaut (sans JS, sans WebGL, en cas d'échec). Piège : `mapbox-gl.css` se charge après `main-v2.css` et pose `position: relative` sur `.mapboxgl-map`, d'où le sélecteur plus spécifique `.lieu-scene .lieu-map`.

### Pages et contenus

- Chaque page vit dans son dossier sous le nom `index.html` et se sert en URL sans extension : `/editions/`, `/editions/edition-2016/`, `/speakers/2019/alexandre-dana/`. Seuls `index.html` (l'accueil) et `404.html` (cible du `ErrorDocument`) restent à la racine. Les anciennes URL en `.html` (celles de l'ancien site comprises) sont redirigées en 301 par le `.htaccess` : ne pas retirer ces règles. Tous les liens internes sont absolus depuis la racine (`/editions/`, `/assets/...`), jamais relatifs.
- Éditions : 2016 à 2026, ni 2018 ni 2020 (deux années sans édition, ce qui fait de 2027 la dixième). Ces deux années blanches ne figurent plus dans la frise de l'accueil (retirées le 2026-07-18), seule `editions/index.html` les mentionne dans le texte.
- `migration/` : extraction brute de l'ancien site (contenus, tableaux speakers/équipe, photos haute résolution). C'est la matière source, jamais servie ni liée depuis les pages ; les images optimisées vivent dans `assets/img/editions/` (WebP, produites via Pillow).
- Toute nouvelle page est créée dans son dossier (`nouvelle-page/index.html`), ajoutée à `sitemap.xml` (URL sans extension) et reprend le gabarit commun (header, footer avec mention de licence, ligne dorsale).

### Le paquet design system (design-system/)

Dossier de travail **hors site** : les composants React qui rejouent le markup et les classes du site, pour maquetter de nouvelles pages ailleurs (export vers Claude Design). Il n'est lié depuis aucune page et `.htaccess` refuse son accès en production (`RedirectMatch 404 ^/design-system(/|$)`). Seul endroit du dépôt avec un `package.json` et des dépendances npm : la règle « zéro dépendance » continue de s'appliquer au site lui-même, qui n'en tire rien.

**Le paquet ne redéfinit aucun style** : `build.mjs` copie `assets/css/main*.css` telle quelle dans `dist/styles.css` (seuls les chemins de polices sont réécrits) et embarque le logo en data URI. Une retouche de la feuille se propage au prochain build. Conséquence : ne jamais recopier une règle CSS dans le paquet, et ne jamais y inventer une classe.

```
cd design-system && npm run build   # dist/
node demo.mjs                       # demo/*.html : chaque page recomposée avec les composants
node verify.mjs                     # compare le vocabulaire de classes rendu avec celui du vrai site
```

`verify.mjs` est le garde-fou : il échoue si une classe du site n'est produite par aucun composant, ou si le paquet produit une classe qui n'existe nulle part sur le site. À relancer après toute retouche du site ou du paquet. Exclusions assumées et documentées dans `design-system/README.md` : `line.js` et le défilement virtuel (le paquet embarque le repli statique), la carte Mapbox (`lieu-map`), les sondes `probe`, le minuteur vivant.

Trouvaille au passage : `.tally` (le dix en bâtons) est piloté par `main-v2.js` mais n'a plus aucune règle CSS ni usage dans le HTML. Code mort, laissé de côté par le paquet.

## Pièges de test connus

- Une fenêtre Chrome maximisée refuse `resize_window` : tester les breakpoints via une iframe same-origin en comptant environ 17 px de scrollbar (une iframe de 1024 px rend le layout mobile).
- L'IntersectionObserver de map.js ne se déclenche jamais dans un onglet en arrière-plan (`document.hidden`) : la carte ne peut pas s'initialiser pendant un test onglet caché.
- `prefers-reduced-motion` neutralise ligne animée, traversée du mot et pulsations : à vérifier dans les deux modes après toute retouche de motion.
