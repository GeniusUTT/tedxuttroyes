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
- **Date du jour J et thème masqués jusqu'au samedi 31 octobre 2026 à 18h00** (mis en place le 2026-08-16). « 18 mars 2027 » et « Franchir ou s'adapter ? » sont remplacés par des étoiles, un caractère pour un caractère (`***** ** **** ****`, `** **** ****`, `** ****`, `******** ** *'*******`, `** ******`), y compris dans les `meta description`, `og:description`, `twitter:description` et `og:image:alt`. Les deux sections « Franchir » et « S'adapter » de l'accueil sont sous embargo (barres `.redact`, comme les fiches speakers) ; les `<title>`, `og:title`, `twitter:title` et le JSON-LD portent un intitulé neutre (« TEDxUTTroyes 2027, dixième édition »). Le JSON-LD `Event` et les attributs `datetime` gardent la vraie date. Ne pas « corriger » ce masquage.
- **Le dévoilement est automatique** (`assets/js/reveal.js`) : à l'instant dit (cible UTC figée `2026-10-31T17:00:00Z`, Paris est repassé à l'heure d'hiver le 25), le site reprend son état d'avant le masquage. Le bouton d'agenda du seuil et les deux fichiers `assets/agenda/*.ics` basculent eux aussi de la révélation vers la soirée. Chaque zone masquée transporte sa version d'origine : `<span class="msk" data-c="...">`, `data-reveal`, `data-reveal-attr`, `data-reveal-html`, `data-reveal-unhide`, `data-reveal-drop`, `<template data-reveal-target="#id">`. Conséquence : **toute retouche d'un texte masqué doit mettre à jour sa version d'origine en même temps**, sinon le dévoilement remettra l'ancienne. C'est un voile, pas un secret (le code source contient les deux versions) ; la restauration définitive reste un `git revert` du commit de masquage.
- **La page cachée `tedx-utt-10ans/` est cachée exprès** (jeu de piste mis en place le 2026-08-18) : elle est la seule exception au masquage de la date et du thème (annonce en avant-première, décidée le 2026-08-18). Elle donne « Franchir ou s'adapter ? » et « Jeudi 18 mars 2027 » en clair, sans `.msk` ni `data-reveal` : rien à dévoiler le 31 octobre, `reveal.js` n'a rien à y faire. Le voile tient parce que la page est introuvable (noindex, hors sitemap, sans Open Graph) : ne pas la lier, et ne pas remettre le thème ou la date en clair ailleurs. Le `<title>` reste neutre (« Vous l'avez trouvée »), l'onglet et l'historique ne vendent donc rien. Elle affiche aussi un mot de passe (« Genius mieux que la Junior ») et deux boutons : un `mailto:geniusutt@utt.fr` avec objet et corps pré-remplis, et le compte Instagram `@tedxuttroyes`. Le mot de passe n'est pas un code de réduction : il se réclame auprès de l'équipe, qui vérifie et réserve la place (tarif normal VIP) à la première personne qui écrit. La version d'origine distribuait le code HelloAsso `codesite10` à saisir sur la billetterie ; elle a été remplacée le 2026-08-18. Elle n'est dans aucun menu, dans aucun pied de page, ni dans `sitemap.xml`, elle porte `noindex, nofollow` et n'a aucune balise Open Graph (un aperçu de partage vendrait la mèche). Ne pas la lier, ne pas l'indexer, ne rien écrire dans `robots.txt` (un `Disallow` publierait l'adresse). La charade qui donne l'adresse (`tedx` + `utt` + `10ans`) vit dans la FAQ, groupe « Le jeu de piste », et la 404 signale seulement que cette page existe : tout doit rester résoluble sans code source ni console, au téléphone comme à l'ordinateur. Si l'adresse change, la charade change avec elle. La page n'ajoute aucune règle CSS : elle n'emploie que des classes existantes.
- **Les pages HTML ne portent aucun commentaire** (nettoyage du 2026-08-18, à la demande de Baptiste) : ne pas en réintroduire, pas même un `PLACEHOLDER` ou un gabarit. Ce qui reste à compléter est listé dans le tableau du README, et les deux gabarits (annonce d'un speaker, tuile partenaire) y sont consignés sous « Gabarits ». La feuille CSS et les quatre scripts gardent les leurs, dont le `PLACEHOLDER` du jeton Mapbox : c'est là que vit la documentation du projet.

Baptiste préfère valider un plan avant l'écriture du code pour tout changement non trivial.

## Architecture

### La ligne continue (index.html + assets/js/line.js)

Le concept directeur de l'accueil : un seul trait SVG rouge parcourt toute la page (`body.journey`). **Le CSS place les contenus, line.js mesure et relie** : le script lit les ancres `data-line` (`cross`, `avoid`, `turn`, `drop`, `plug`, `finale`) et deux sondes CSS (`#probe-a` donne `--line-x`, `#probe-b` donne `--axis-b`), reconstruit le path à chaque changement de géométrie (ResizeObserver), et le dessine au fil du scroll (pathLength normalisé à 1000, pointe au centre du viewport).

En desktop, l'accueil est en **défilement virtuel à scrollbar native** : `main` + footer vivent dans un wrapper `.jscroll` que line.js passe en `position: fixed` (classe `jscroll-run` sur `html`) et translate selon le scroll d'un spacer ; chaque segment horizontal du tracé reçoit une fenêtre de gel (translation constante) pendant laquelle l'écran est figé et la pointe balaie l'horizontale (contournements, virages, traversée de la frise), jusqu'à la prise (bouton Réserver) où la règle s'arrête. Toutes les mesures de line.js sont en repère contenu (relatives au wrapper). Conséquence : `position: sticky` ne fonctionne plus à l'intérieur de `main` sur l'accueil (ancêtre transformé), et le scroll natif (`window.scrollY`) continue d'avancer normalement (le header, main-v2.js et les IntersectionObserver ne sont pas affectés). Sans JavaScript, sous 1024 px, en reduced motion ou en cas d'échec de build (classe `.jline-fail`) : flux normal, dorsale verticale statique en pur CSS (`main::before`).

Conséquence : déplacer, redimensionner ou supprimer un bloc porteur de `data-line` sur l'accueil change le tracé de la ligne. Vérifier le rendu au scroll après toute retouche de layout de l'accueil. Sous 1024 px, line.js tourne toujours mais dessine une **dorsale strictement droite** : les pliures autour des blocs `avoid` et les traversées horizontales (`cross`, `turn`, `drop`) sont neutralisées (`horiz` faux). Seule exception au bout du parcours : le bloc final `.final-plug` est centré dans la page et la ligne descend droite puis entre dans le bouton « Réserver ma place » par la gauche (segment horizontal jusqu'au centre vertical du bouton), qu'elle illumine en rouge (`plug-on`). La section « Dix ans » est réduite en mobile à son titre et à un carrousel d'affiches balayable (`.ed-slider`, scroll-snap pur CSS) : l'album, la bande d'archives et les chiffres sont masqués.

### CSS : une seule feuille, sections numérotées

`assets/css/main-v2.css` est la feuille unique, organisée en sections numérotées (01 à 21, sous-sections 20b/20c/20d) avec un sommaire commenté en tête de fichier. Toute nouvelle règle va dans la section correspondante, et le sommaire est tenu à jour. Tokens en tête : `--noir #080808`, `--papier #EDEAE4`, `--rouge #EB0028`, `--filet`, `--line-x`, etc. Mobile first.

### JavaScript : quatre fichiers, zéro dépendance, chargés en defer

- `assets/js/reveal.js` : le dévoilement du samedi 31 octobre 2026 à 18h00 (voir les règles dures). Chargé sur toutes les pages, avant `main-v2.js`, et expose `window.TEDX_REVEAL`.
- `assets/js/main-v2.js` : header au scroll, menu mobile accessible, téléscripteur du compte à rebours, dixième bâton. Le téléscripteur vise deux cibles successives : la révélation (`2026-10-31T17:00:00Z`), puis le jour J (`2027-03-18T17:00:00Z`). Quand la première tombe, il déclenche le dévoilement et enchaîne sur la seconde.
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
- **Le seuil de l'accueil doit tenir dans le premier écran**, du titre au bouton d'agenda, sans défilement (demande de Baptiste le 2026-08-16). Deux paliers de resserrement en section 08 : `@media (max-height: 820px)` puis `@media (max-height: 720px)`. Mesuré au chargement de 1893x857 à 375x667 ; sous 640 px de haut le seuil déborde encore (deux boutons pleine largeur et le téléscripteur ne rentrent pas). Toute addition dans le hero se vérifie à ces tailles, et le téléscripteur garde sa taille d'origine (`clamp(1.25rem, 3vw, 1.9rem)`).
