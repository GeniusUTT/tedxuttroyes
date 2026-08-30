# Site TEDxUTTroyes 2027 : "Le relevé"

Site statique de la dixième édition de TEDxUTTroyes (jeudi 18 mars 2027, portes à 18h00 avec mini forum de recrutement, talks à 19h30, Centre de Congrès de l'Aube, Troyes). HTML, CSS et JavaScript purs : aucun framework, aucun build, aucun tracker, aucune donnée collectée.

## La direction artistique en deux mots

Le site est construit autour d'un concept directeur unique : **la ligne continue**, qui matérialise la limite du thème. Sur l'accueil, un seul trait SVG rouge parcourt toute la page et change de comportement : au seuil, la question du titre se tient à cheval dessus ; juste après, un interlude fixe recouvre l'écran le temps d'un message sur la ligne, puis s'efface ; au moment "franchir", il reste droit et un mot le traverse au défilement ; les moments "s'adapter" et "speakers" le laissent filer droit ; au moment "le lieu", il plie autour du bloc carte + présentation ; puis, après la feuille de salle, il redescend à 2016, tourne à l'horizontale et devient la frise des éditions, forme le 1 du grand 10 en retombant de 2027, se branche dans le bouton Réserver (centré), et file en trait fin souligner la mention de licence TED du footer. Le trait se dessine au fil du défilement (`assets/js/line-v9.js`) : le CSS place les contenus, le script mesure les ancres `data-line` et relie. Les pages intérieures ont elles aussi leur tracé depuis le 2026-08-26 : le même trait, servi par le même script, qui serpente entre le rail de gauche et le milieu de la marge droite et se branche dans le bouton final. **Chaque type de page a sa silhouette**, décidée par les blocs qui portent `data-line-flank` : deux ailes sur une fiche speaker (la fiche, puis les fiches voisines), une seule au centre sur une fiche d'édition (l'équipe), un quinconce sur le registre, un peigne sur le Hall of Fame, une alternance par groupe sur la FAQ, une grille encadrée sur l'index des speakers et sur les partenaires. Le tableau complet est dans CLAUDE.md. Sur ces pages, le trait atteint le bouton d'appel aux deux tiers du défilement : le dernier tiers se lit avec la prise déjà allumée. Deux nuances depuis l'audit du 2026-08-28 : l'accueil en bureau fait exception (son défilement virtuel ne le permet pas, la prise y reste vers 95 %), et sur les quatre pages les plus longues un plafond d'avance retarde la prise jusqu'à 70 à 86 %, pour que la pointe du trait ne sorte jamais par le bas de l'écran et continue d'accompagner la lecture. Mesuré : la pointe reste entre 0,2 et 0,85 hauteur d'écran sur toutes les pages, à toutes les tailles. Marge technique en Space Mono, contenu à sa droite. Sans JavaScript : dorsale verticale statique, comme avant.

À ne pas défaire : les speakers non annoncés sont des **fiches sous embargo** (barres de caviardage), les éditions passées un **registre**, le compte à rebours un **téléscripteur** mono d'une seule ligne.

## Structure

Chaque page vit dans son dossier sous le nom `index.html` et se sert en URL sans extension (`/editions/`, `/speakers/2019/alexandre-dana/`). Les anciennes adresses en `.html` (ancien site inclus) sont redirigées en 301 par le `.htaccess`. Tous les liens internes sont absolus depuis la racine (`/editions/`, `/assets/...`).

```
index.html               Accueil (le parcours de la ligne : seuil, franchir,
                         s'adapter, speakers, lieu, programme, frise des
                         éditions, prise, épilogue)
speakers/                Les 6 fiches sous embargo + appel à candidatures
speakers/<annee>/<nom>/  Une page par speaker passé (61 pages, générées depuis
                         les archives de l'ancien site ; les anciennes URL
                         en .html sont redirigées en 301 ; bio 2016-2017
                         à reconstituer, seuls nom et talk sont documentés)
devenir-speaker/         Candidature speaker (CTA Google Forms)
programme/               Feuille de salle du 18 mars (portes 18h00, forum)
editions/                Le registre des 9 éditions
editions/edition-XXXX/   Une page par édition, speakers cliquables
hall-of-fame/            Toutes les voix passées (61 fiches, 60 interventions
                         données, 2016 à 2026 ;
                         portrait et nom cliquables vers la bio, titre
                         d'année cliquable vers l'édition)
partenaires/             Partenaires (page dédiée, jamais sur l'accueil)
a-propos/                About TED / About TEDx / About TEDxUTTroyes
faq/                     FAQ pratique (accordéons natifs)
mentions-legales/        Mentions légales (LCEN)
tedx-utt-10e/            La page cachée du jeu de piste : hors menu, hors
                         plan du site, en noindex. Une place à gagner (voir
                         « Le jeu de piste » plus bas). Ne pas la lier.
404.html                 Page d'erreur (reste à la racine : cible du
                         ErrorDocument d'Apache)
.htaccess                HTTPS, URL en dossiers + redirections 301, cache,
                         compression, 404 (OVH mutualisé)
robots.txt, sitemap.xml  SEO technique
assets/
  css/main-v14.css        Feuille unique (sommaire commenté en tête de fichier)
  js/reveal-v2.js           Le dévoilement automatique du 31 octobre 2026 :
                         chaque zone masquée porte sa version d'origine,
                         ce script les remet en place le jour dit
  js/main-v7.js          Script commun (menu, header, téléscripteur, interlude
                         de l'accueil)
  js/line-v9.js          La ligne continue, sur tout le site : construit le tracé
                         SVG en mesurant les ancres data-line, le dessine au
                         scroll, pilote le mot qui franchit. Deux régimes :
                         l'accueil (body.journey, parcours complet, défilement
                         virtuel en bureau) et les pages intérieures
                         (body.parcours, serpentin entre deux rails, jamais de
                         gel). Sans JS : dorsale CSS.
  js/map-v2.js              Carte Mapbox du lieu (accueil) : chargée paresseusement
                         à l'approche du bloc, elle remplace le plan SVG qui
                         reste la version par défaut (sans JS, sans WebGL).
  agenda/                Les deux rendez-vous en .ics (révélation, puis soirée) :
                         Apple Calendrier et Samsung Calendrier importent ces
                         fichiers, Google passe par une URL
  fonts/                 Bricolage Grotesque (variable), Space Mono 400 et 700,
                         DM Sans (variable), hébergées en local
  img/                   Logo, marque de la dixième édition (logo-10e*.svg),
                         favicons, image de partage, visuels éditions et lieu
```

## Le jeu de piste (page cachée)

Une page du site n'est dans aucun menu, dans aucun pied de page, ni dans `sitemap.xml`, et porte `<meta name="robots" content="noindex, nofollow">` : `tedx-utt-10e/`. Elle affiche un mot de passe, « Genius mieux que la Junior », et deux boutons : un `mailto:` vers `geniusutt@utt.fr` (objet et corps pré-remplis avec le mot de passe) et le compte Instagram `@tedxuttroyes`. Ce n'est plus un code de réduction : la personne qui trouve la page nous envoie le mot de passe, l'équipe vérifie et lui réserve sa place (tarif normal VIP). Une seule place, à la première personne qui écrit : c'est donc l'équipe qui arbitre, pensez à répondre vite et à prévenir les autres une fois la place attribuée.

La page annonce en outre, en avant-première, la date et le thème de l'édition : « Franchir ou s'adapter ? » et « Jeudi 18 mars 2027 », en clair et sans masquage, alors que le reste du site les remplace par des étoiles jusqu'au 31 octobre 2026 à 18h00. C'est la récompense de la charade, et la seule exception au masquage : elle ne tient que parce que la page est introuvable (hors menu, hors sitemap, `noindex`, sans Open Graph) et parce que son `<title>` reste neutre. Un encadré demande au visiteur de garder la primeur pour lui.

Modifié le 2026-08-28 : l'adresse est passée de `tedx-utt-10ans/` à `tedx-utt-10e/`. Il s'agit de la dixième édition, pas d'un anniversaire de dix ans, et la charade de la FAQ a suivi (le troisième morceau est désormais le rang de l'édition, `10e`). L'ancienne adresse n'est pas redirigée : elle renvoie une 404. Les fichiers de la marque ont été renommés dans le même mouvement (`logo-10ans*.svg` devient `logo-10e*.svg`, idem pour les trois icônes).

Modifié le 2026-08-18 : la première version distribuait un code de réduction de 100 % (`codesite10`) à saisir sur la billetterie. Ce code n'a plus cours depuis le passage de la billetterie sur Billetweb, le 2026-08-27 ; il n'était de toute façon plus affiché nulle part.

On y arrive sans ouvrir le code source ni la console : la charade est posée en clair dans la FAQ (groupe « Le jeu de piste »), et la page 404 souffle qu'une telle page existe. Les trois morceaux de l'adresse : `tedx` (le programme sous licence duquel la soirée existe), `utt` (l'école), `10e` (le rang de cette édition, en chiffres suivis de la lettre « e »), reliés par des traits d'union.

À tenir :

- **Ne pas lier la page**, ne pas l'ajouter au menu, au pied de page ni au `sitemap.xml`, ne rien écrire dans `robots.txt` (un `Disallow` publierait l'adresse à qui lit ce fichier).
- **Pas de balises Open Graph** sur cette page : un lien partagé sur un réseau ne doit pas afficher d'aperçu qui vend la mèche.
- Si l'adresse change, la charade de la FAQ change avec elle.
- La page ne définit aucune règle CSS : elle se compose uniquement de classes existantes (`sec`, `cote`, `prose`, `notice`, `ticker-label`, `ticker-value`, `actions`, `btn`). Pas de renommage `main-v14.css` à prévoir de son fait.
- La page ne porte aucun `.msk` ni `data-reveal` : date et thème y sont écrits en clair, `reveal-v2.js` n'a donc rien à y dévoiler le 31 octobre. En contrepartie, ne jamais lui donner de balise Open Graph et ne jamais la lier depuis une page publique.
- Le mot de passe est le seul endroit du site qui force `white-space: normal` en style en ligne sur un `.ticker-value` : la classe est en `nowrap` pour le téléscripteur, et la phrase déborderait sous 400 px sans cela.

## Tester en local

Les liens du site sont absolus depuis la racine (`/editions/`, `/assets/...`) : ouvrir les fichiers directement dans un navigateur ne fonctionne pas, servez le dossier (le serveur Python sert bien les `index.html` des dossiers, comme Apache) :

```
python -m http.server 8000
```

## Déploiement OVH

Poussez le contenu du dossier tel quel à la racine du site (www). Trois points d'attention :

1. **SSL** : la redirection HTTPS du `.htaccess` suppose un certificat actif (Let's Encrypt gratuit dans l'espace client OVH). Sinon, commentez temporairement les lignes indiquées dans le fichier.
2. **Cache** : la feuille et le script communs sont mis en cache un mois. Si vous les modifiez après la mise en ligne, renommez le fichier (les cinq portent un numéro : `main-v14.css`, `main-v7.js`, `line-v9.js`, `reveal-v2.js` et `map-v2.js` ; passez au numéro suivant) et mettez à jour les références dans toutes les pages HTML.
3. **Fichiers du dépôt** : `README.md`, `CLAUDE.md`, `.gitignore` et `.git/` suivent le site à la racine du www sans en faire partie. Le `.htaccess` les refuse en 404, parce que ce fichier-ci donne l'adresse de la page cachée et son mot de passe. Si vous ajoutez un fichier de travail à la racine, ajoutez-le à cette règle.

## Placeholders à compléter avant mise en ligne

Les pages HTML ne portent plus aucun commentaire depuis le nettoyage du 2026-08-18 : **ce tableau est la seule liste des points à compléter**. Seuls la feuille CSS et les scripts gardent leurs commentaires, dont un `PLACEHOLDER` dans `assets/js/map-v2.js`.

| Quoi | Où | Comment |
|---|---|---|
| Dévoilement automatique | `assets/js/reveal-v2.js` | le samedi 31 octobre 2026 à 18h00 (cible UTC figée `2026-10-31T17:00:00Z`), le site reprend de lui-même son état d'avant le masquage : plus une étoile, plus une barre de caviardage, titres et descriptions d'origine. Le compte à rebours de l'accueil enchaîne alors sur le jour J. **Si vous modifiez un texte masqué, mettez à jour sa version d'origine dans le même élément** (`data-c`, `data-reveal`, `data-reveal-html`, `template`), sinon le dévoilement remettra l'ancienne. La remise en état définitive reste un `git revert` du commit de masquage : le HTML servi redevient alors correct pour Google et les partages sociaux, ce que le dévoilement JavaScript ne fait que pour le visiteur (le JSON-LD de l'accueil, lui, n'est pas rétabli par le script). |
| Thème (masqué) | toutes les pages | « Franchir ou s'adapter ? » est remplacé par `******** ** *'*******` (une étoile par caractère), « la limite » par `** ******`. Sur l'accueil, les deux sections du diptyque sont sous embargo (barres de caviardage `.redact`, même DA que les fiches speakers). Les titres d'onglet, les metas sociales et le JSON-LD portent un intitulé neutre : « TEDxUTTroyes 2027, dixième édition ». Trois textes ont été reformulés parce qu'ils nommaient le thème : le titre et le chapô du bloc speakers de l'accueil, et le chapô de `speakers/index.html`. Tout se récupère dans l'historique git (commit précédant le masquage). Même échéance que la date : samedi 31 octobre 2026 à 18h00. |
| Date du jour J (masquée) | toutes les pages + `assets/js/main-v7.js` | la date est remplacée par des étoiles (`***** ** **** ****` pour « Jeudi 18 mars 2027 », `** **** ****` pour « 18 mars 2027 », `** ****` pour « 18 mars ») et le téléscripteur de l'accueil décompte jusqu'à sa révélation, le samedi 31 octobre 2026 à 18h00, avec un bouton « ajouter à mon agenda » qui ouvre le choix entre Google Agenda (URL d'ajout), Apple Calendrier et Samsung Calendrier (fichiers `assets/agenda/*.ics`, servis en `text/calendar` grâce à un `AddType` du `.htaccess`). Les trois destinations basculent sur la soirée elle-même une fois la date révélée. Le JSON-LD, les attributs `datetime` et la date affichée dans ce README gardent la vraie valeur. |
| Biographies courtes | 14 fiches speakers 2016 et 2017 | elles ont bien une bio depuis le 2026-08-18, mais courte (180 à 300 caractères) et ouverte sur une phrase de raccord fabriquée (« Sur la scène de TEDxUTTroyes 2016, autour du thème *Shape the future*, X a défendu l'idée « ... » »). Elles n'ont pas non plus de ligne `Domaine :`, contrairement aux quarante-sept autres. À reprendre au fil de l'eau, sur le modèle des fiches 2021 et 2023 : un `<p class="ed-meta">Domaine : ...</p>` en minuscule, puis deux ou trois paragraphes dans `.ed-fiche-body`. |
| Playlists YouTube par édition | `editions/index.html`, `editions/edition-XXXX/` | aucune playlist n'existe côté chaîne : les liens pointent vers une recherche YouTube « TEDxUTTroyes + année ». À remplacer le jour où des playlists sont créées. |
| Jeton Mapbox | `assets/js/map-v2.js` | le jeton public et le style rouge viennent du compte personnel `solene-drnx` (ancien site). Laissé tel quel à la demande de Baptiste le 2026-08-18 ; à basculer un jour sur un compte Mapbox de l'association, restreint au domaine tedxuttroyes.fr. |
| Déroulé du jour J | `programme/index.html` | horaires type (portes 18h00 avec mini forum, talks 19h30, fin vers 22h30) à figer quand le programme sera arrêté. |
| Image de partage (Open Graph) | `assets/img/og/og-2027.jpg` | carte 1200x630 composée le 2026-08-25 autour du X moiré de la dixième édition : elle porte la date masquée et la mention « date et thème révélés le 31 octobre 2026 ». La version d'après le dévoilement est déjà faite, `assets/img/og/og-2027-revele.jpg` (thème et vraie date) : le 31 octobre 2026, un seul remplacement suffit dans les 79 pages qui portent une balise `og:image`, `sed -i 's#og/og-2027.jpg#og/og-2027-revele.jpg#g'`. Une image étant statique, `reveal-v2.js` ne peut rien y faire. L'ancienne capture `og-default.jpg` reste sur le serveur pour ne pas casser les partages déjà publiés, mais plus aucune page ne la référence. |

Réglé le 2026-08-28 : les onze biographies manquantes (les sept fiches 2021, et Karim Hechmi, Léo Techmaker, Marcel Soh et Serge Rohmer pour 2023) ont été fournies par Baptiste et posées avec leur ligne `Domaine :`. Plus aucune fiche ne porte le texte de remplacement « Les archives du site n'ont pas conservé de biographie ».

Réglé le 2026-08-27 : la billetterie a quitté HelloAsso pour Billetweb, `https://www.billetweb.fr/tedxuttroyes-2027-10e-edition` (toutes les pages, le JSON-LD `offers` de `index.html`, la 301 de `billetterie.html` dans `.htaccess` et le fichier `assets/agenda/tedxuttroyes-2027.ics`). La newsletter n'existe plus : la mention a été retirée des mentions légales et le renvoi de `speakers/index.html` pointe désormais vers Instagram.

Réglés le 2026-08-18 : mentions légales, sites des partenaires, chiffres de l'accueil, tarifs et conditions d'échange de la FAQ, date et rôles de l'édition 2026, liens LinkedIn de l'équipe 2026, biographies des speakers 2016 et 2017, mot de passe de la page cachée (la place se réclame par e-mail ou sur Instagram, plus par code sur la billetterie).

## Gabarits

Les pages ne portent plus de commentaire : les deux gabarits qui y vivaient sont consignés ici.

**Créer une page** : reprendre le gabarit d'une page voisine du même type, garder `class="parcours"` sur `<body>`, le `line-v9.js` en `defer` après `main-v7.js`, le `data-line="plug"` sur le bouton final, et les mêmes ancres `data-line-flank` que ses semblables (le tableau des recettes est dans CLAUDE.md). Une nouvelle fiche speaker se contente donc de son portrait et de sa nav ancrés, comme les soixante autres.

**Annoncer un speaker** (`speakers/index.html` et le bloc speakers de `index.html`) : remplacer une fiche sous embargo par cette carte, et créer le dossier `assets/img/speakers/` au premier ajout.

```html
<li class="sp-card sp-card--live">
  <div class="sp-photo">
    <img src="/assets/img/speakers/prenom-nom.jpg" alt="Portrait de Prénom Nom" width="600" height="750" loading="lazy">
  </div>
  <span class="sp-id">Intervenant·e 01</span>
  <p class="sp-name">Prénom Nom</p>
  <p class="sp-bio">Mini bio en une ou deux phrases : qui parle, depuis quelle expérience.</p>
  <p class="sp-talk"><span class="sp-talk-k">Talk</span> Le titre du talk</p>
  <span class="sp-status sp-status--live">annoncé·e</span>
</li>
```

**Ajouter un partenaire** (`partenaires/index.html`) : une tuile est un logo enveloppé d'un lien vers le site du partenaire. Le CSS plafonne la taille des logos pour qu'ils restent plus petits que celui de TEDxUTTroyes : règle TEDx, ne pas retirer ces limites.

```html
<li class="partner-tile">
  <a href="https://exemple.fr" target="_blank" rel="noopener">
    <img src="/assets/img/partenaires/nom-du-partenaire.webp" alt="Nom du partenaire" width="300" height="120" loading="lazy">
    <span class="visually-hidden"> (nouvelle fenêtre)</span>
  </a>
</li>
```

## À vérifier (préremplis, non garantis)

- **Thèmes des éditions passées** : extraits de l'ancien site, dont « Shape the futur » (2016), orthographe à confirmer.
- **Adresse et accès du lieu** : « 2 rue Pierre Labonde, 10000 Troyes », « un quart d'heure à pied de la gare », « au bord du canal » : à valider sur place.
- **Textes About TED / About TEDx** : adaptation française d'usage, à faire relire.
- **Heure de fin** : le JSON-LD de `index.html` indique 23h00, à ajuster avec le déroulé définitif.
- **Mini forum de recrutement** : annoncé à 18h00 (ouverture des portes) sur l'accueil, le programme et la FAQ ; libellé et contenu à préciser avec les partenaires.
- **Édition 2026** : vendredi 20 mars 2026 au Centre de Congrès de l'Aube, cinq talks donnés, quatre publiés sur la chaîne TEDx Talks (celui de Franck Robin n'a pas été capté). La sixième voix annoncée, Jean-Marie Simon, n'a pas pu être présente. Confirmé par Baptiste le 2026-08-18.
- **2018 et 2020** figurent comme années sans édition (c'est ce qui fait de 2027 la dixième) : la frise de `index.html` ne les affiche pas (retirées le 2026-07-18 à la demande de Baptiste), `editions/index.html` les mentionne dans le texte.

## Règles TEDx intégrées (ne pas défaire)

- Aucun logo ni nom de partenaire sur la page d'accueil : les partenaires vivent uniquement sur leur page dédiée.
- Le texte officiel « Qu'est-ce que TEDx ? » et le lien vers ted.com/tedx sont sur l'accueil.
- Le footer de chaque page porte la mention : « Cet événement TEDx indépendant est organisé sous licence de TED. »
- La dénomination complète « TEDxUTTroyes » est utilisée partout, jamais « TEDx » ou « TED » seuls pour désigner l'événement, et le nom n'est jamais composé en capitales forcées.
- Les logos partenaires sont plafonnés en CSS pour rester plus petits que le logo de l'événement.

## Notes techniques

- **Polices** : 8 fichiers woff2 locaux. Bricolage Grotesque en variable (graisses 200 à 800), Space Mono 400 et 700 (données, marges, téléscripteur : la chasse fixe supprime tout tressautement de chiffres), DM Sans en variable (corps de texte). Aucun appel à un service tiers.
- **Téléscripteur** : cible figée à l'instant UTC `2027-03-18T17:00:00Z` (18h00 heure de Paris, encore en heure d'hiver à cette date : l'ouverture des portes). Sans JavaScript, le bloc est masqué et la date en clair reste affichée.
- **Motion** : une seule séquence d'entrée (la ligne se trace, le hero entre, le téléscripteur s'allume) et un seul moment au scroll (le dixième bâton se trace). Pas de reveals dispersés. `prefers-reduced-motion` neutralise tout.
- **Photos** : les photos (registre, fiches, galeries, bande d'archives) sont affichées en couleur, cadrées par les mêmes filets. Le fond du hero reste assombri (`brightness`) pour la lisibilité du titre. Les grandes images de l'accueil (diptyque, feuille de salle, photo du lieu) sont servies en WebP à plusieurs largeurs via `srcset` et `sizes` : un téléphone télécharge la variante à sa taille, pas l'original. Les variantes sont produites avec Pillow, comme les visuels d'éditions.
- **Mobile** : mise en page mobile first, vérifiée de 320 à 768 px de large plus le cas paysage. Aucun débordement horizontal, aucun texte sous 12 px (à l'exception des étiquettes du plan de situation SVG, calibrées au caractère près dans leur `viewBox`), cibles tactiles à 44 px pour toutes les commandes (les liens posés au milieu d'une phrase relèvent de l'exception WCAG 2.5.8). Trois adaptations de fond : la feuille de salle de l'accueil reste pleinement opaque (l'allumage progressif au passage du trait n'a de sens qu'avec le défilement virtuel du desktop), l'album des éditions devient un carrousel à `scroll-snap` qui garde année et thème, et les portraits d'édition passent en deux colonnes. La ligne continue de l'accueil, elle, traverse aussi la page sur téléphone (2026-08-26) : en mobile elle serpente d'une marge à l'autre en traversant la page, sans jamais figer le défilement. En bureau (2026-08-27), ces pages sont revenues à la dorsale verticale statique en pur CSS : le trait animé y est réservé au téléphone et à la tablette. Cette dorsale s'arrête sur le bouton d'appel de la page et le rejoint par un raccord horizontal (2026-08-28). Les blocs concernés portent `data-line-flank` (la liste des speakers, la fiche du lieu, la section de la dixième édition) ; la feuille de salle et les deux moments qui portent un mot gardent la marge de gauche. Les deux mots qui franchissent jouent eux aussi sur téléphone : « Au-delà » entre par la gauche et franchit le trait, « Jusqu'ici » arrive de la droite et s'arrête contre lui. Leur minutage est propre au mobile : la course va du bas de l'écran au tiers supérieur. La pointe du trait vivant au centre de l'écran, il n'y a de ligne à franchir qu'au-dessus du centre, et c'est là que le mot doit achever sa traversée.
- **Accessibilité** : navigation clavier complète (menu mobile inclus, fermeture par Échap), contrastes AA sur fond sombre (corps 9:1, secondaire 4,9:1), barres de caviardage doublées d'un texte pour lecteurs d'écran, téléscripteur doublé d'une phrase statique.
- **La marque de la dixième édition** : le X moiré exporté par Baptiste vit dans `assets/img/` en cinq versions (`logo-10e.svg` la marque seule, `logo-10e-texte.svg` le bloc complet, `logo-10e-anime.svg` et `logo-10e-texte-anime.svg` les boucles de 5,9 s, `logo-10e-intro.svg` la même animation jouée une seule fois en 2,36 s puis figée, remplacée au voile d'ouverture par `assets/video/logo-10e-intro-1120.mp4` le 2026-08-30). Elle sert de favicon (`favicon-10e.svg`, `favicon-10e.png`, `webclip-10e.png` : traits épaissis, sans quoi le moiré se referme sous 32 px), de voile d'ouverture de l'accueil, de signature du moment « Dixième édition », de filigrane de la 404, de sujet de la page cachée et de motif de l'image de partage. Tout le CSS correspondant est en section 22 de la feuille.
- **Voile d'ouverture** : l'accueil s'ouvre sur l'animation du X, une seule fois par onglet. Un script en ligne dans le `<head>` pose la classe `voile-on` ; sa sortie est une animation CSS de 2,9 s en `forwards`, le voile ne capte pas le pointeur et la page est utilisable dessous dès la première image. Rien ne peut le laisser coincé, même si un script tombe. Neutralisé en `prefers-reduced-motion` et sans JavaScript. Deux paliers depuis le 2026-08-26 : la première venue voit le dessin se tracer (2,9 s), une visite suivante reçoit la version courte, 1 s sur le logo déjà fini (classe `voile-court`). Le site écrit deux clés dans le navigateur, et deux seulement : `tedx-ouverture` (mémoire de session) et `tedx-ouverture-vue` (mémoire locale, l'animation complète a déjà été vue). Les deux sont documentées dans les mentions légales pour que la promesse « aucun cookie » reste exacte.
- **Typographie** : les tirets cadratins et demi-cadratins sont proscrits sur l'ensemble du site (règle éditoriale du projet).
