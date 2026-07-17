# Site TEDxUTTroyes 2027 : "Le relevé"

Site statique de la dixième édition de TEDxUTTroyes (jeudi 18 mars 2027, portes à 18h00 avec mini forum de recrutement, talks à 19h30, Centre de Congrès de l'Aube, Troyes). HTML, CSS et JavaScript purs : aucun framework, aucun build, aucun tracker, aucune donnée collectée.

## La direction artistique en deux mots

Le site est construit autour d'un concept directeur unique : **la ligne continue**, qui matérialise la limite du thème. Sur l'accueil, un seul trait SVG rouge parcourt toute la page et change de comportement : au seuil, la question du titre se tient à cheval dessus ; au moment "franchir", il reste droit et un mot le traverse au défilement ; les moments "s'adapter" et "speakers" le laissent filer droit ; au moment "le lieu", il plie autour du bloc carte + présentation ; puis, après la feuille de salle, il redescend à 2016, tourne à l'horizontale et devient la frise des dix ans (interrompue en 2018 et 2020, les deux années sans édition), forme le 1 du grand 10 en retombant de 2027, se branche dans le bouton Réserver (centré), et file en trait fin souligner la mention de licence TED du footer. Le trait se dessine au fil du défilement (`assets/js/line.js`) : le CSS place les contenus, le script mesure les ancres `data-line` et relie. Les pages intérieures gardent la ligne comme dorsale statique (pur CSS), marge technique en Space Mono, contenu à sa droite.

À ne pas défaire : les speakers non annoncés sont des **fiches sous embargo** (barres de caviardage), les éditions passées un **registre**, le compte à rebours un **téléscripteur** mono d'une seule ligne.

## Structure

```
index.html               Accueil (le parcours de la ligne : seuil, franchir,
                         s'adapter, speakers, lieu, programme, frise des dix
                         ans, prise, épilogue)
speakers.html            Les 6 fiches sous embargo + appel à candidatures
devenir-speaker.html     Candidature speaker (CTA mailto)
programme.html           Feuille de salle du 18 mars (portes 18h00, forum)
editions.html            Le registre des 9 éditions
editions/                Une page par édition, speakers cliquables
speakers/<annee>/        Une page par speaker passé (47 pages, générées depuis
                         les archives de l'ancien site ; mêmes URLs qu'avant)
partenaires.html         Partenaires (page dédiée, jamais sur l'accueil)
a-propos.html            About TED / About TEDx / About TEDxUTTroyes
faq.html                 FAQ pratique (accordéons natifs)
mentions-legales.html    Mentions légales (LCEN)
404.html                 Page d'erreur (chemins absolus, servie par Apache)
.htaccess                HTTPS, cache, compression, 404 (OVH mutualisé)
robots.txt, sitemap.xml  SEO technique
assets/
  css/main.css           Feuille unique (sommaire commenté en tête de fichier)
  js/main.js             Script commun (menu, header, téléscripteur)
  js/line.js             La ligne continue de l'accueil : construit le tracé SVG
                         en mesurant les ancres data-line, le dessine au scroll,
                         pilote le mot qui franchit. Sans JS : dorsale CSS.
  js/map.js              Carte Mapbox du lieu (accueil) : chargée paresseusement
                         à l'approche du bloc, elle remplace le plan SVG qui
                         reste la version par défaut (sans JS, sans WebGL).
  fonts/                 Bricolage Grotesque (variable), Space Mono 400 et 700,
                         DM Sans (variable), hébergées en local
  img/                   Logo, favicon, OG, placeholders éditions et lieu
```

## Tester en local

Ouvrir les fichiers directement dans un navigateur fonctionne, mais pour tester la page 404 et les chemins absolus, servez le dossier :

```
python -m http.server 8000
```

## Déploiement OVH

Poussez le contenu du dossier tel quel à la racine du site (www). Deux points d'attention :

1. **SSL** : la redirection HTTPS du `.htaccess` suppose un certificat actif (Let's Encrypt gratuit dans l'espace client OVH). Sinon, commentez temporairement les lignes indiquées dans le fichier.
2. **Cache** : `main.css` et `main.js` sont mis en cache un mois. Si vous les modifiez après la mise en ligne, renommez le fichier (par exemple `main-v2.css`) et mettez à jour les références dans les 9 pages HTML.

## Placeholders à compléter avant mise en ligne

Tous les emplacements variables sont marqués par un commentaire `PLACEHOLDER` dans les fichiers. Recherchez le mot `PLACEHOLDER` dans le projet pour tous les retrouver.

| Quoi | Où | Comment |
|---|---|---|
| Lien billetterie HelloAsso | toutes les pages + JSON-LD de `index.html` | remplacer partout `https://www.helloasso.com/associations/geniusutt/evenements/tedxuttroyes-2027-10e-edition` |
| Lien newsletter HelloAsso | `index.html`, footers | remplacer partout `https://www.helloasso.com/PLACEHOLDER-NEWSLETTER` |
| Chiffres (talks, intervenants) | `index.html`, section « En chiffres » | remplacer les `XX` des lignes de données |
| Annonce d'un speaker | `speakers.html` | suivre le gabarit commenté : la fiche sous embargo devient nom + sujet + photo optionnelle (dossier `assets/img/speakers/` à créer) |
| Liens YouTube par édition | `editions.html` et pages `editions/` | remplacer les liens de recherche YouTube par les playlists exactes |
| Liens des sites partenaires | `partenaires.html` | les logos 2026 sont en place avec `href="#"` : remplacer chaque `#` par l'URL du site du partenaire (liste fournie par l'équipe) et retirer les partenaires non reconduits |
| Talks 2026 | `speakers/2026/*.html` | ajouter le lien YouTube de chaque talk 2026 dès sa publication |
| Jeton Mapbox | `assets/js/map.js` | le jeton public et le style rouge proviennent du compte personnel `solene-drnx` (ancien site) ; créer un jeton sur un compte Mapbox de l'association, restreint au domaine tedxuttroyes.fr, et y transférer le style |
| Image de partage (Open Graph) | `assets/img/og/og-default.jpg` | placeholder généré aux couleurs du site, à remplacer par un visuel conçu (1200x630) |
| Logos partenaires | `partenaires.html` | suivre le gabarit commenté ; ne pas retirer les limites de taille CSS (règle TEDx) |
| Mentions légales | `mentions-legales.html` | compléter les champs entre crochets |
| Contenus FAQ et programme | `faq.html`, `programme.html` | contenus type à relire et ajuster (tarifs, horaires précis, conditions) |

## À vérifier (préremplis, non garantis)

- **Thèmes des éditions passées** : extraits de l'ancien site, dont « Shape the futur » (2016), orthographe à confirmer.
- **Adresse et accès du lieu** : « 2 rue Pierre Labonde, 10000 Troyes », « un quart d'heure à pied de la gare », « au bord du canal » : à valider sur place.
- **Textes About TED / About TEDx** : adaptation française d'usage, à faire relire.
- **Heure de fin** : le JSON-LD de `index.html` indique 23h00, à ajuster avec le déroulé définitif.
- **Mini forum de recrutement** : annoncé à 18h00 (ouverture des portes) sur l'accueil, le programme et la FAQ ; libellé et contenu à préciser avec les partenaires.
- **2018 et 2020** figurent comme années sans édition (c'est ce qui fait de 2027 la dixième) : la frise de `index.html` interrompt la ligne à ces deux dates, et `editions.html` le mentionne.

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
- **Photos** : les photos (registre, fiches, galeries, bande d'archives) sont affichées en couleur, cadrées par les mêmes filets. Le fond du hero reste assombri (`brightness`) pour la lisibilité du titre.
- **Accessibilité** : navigation clavier complète (menu mobile inclus, fermeture par Échap), contrastes AA sur fond sombre (corps 9:1, secondaire 4,9:1), barres de caviardage doublées d'un texte pour lecteurs d'écran, téléscripteur doublé d'une phrase statique.
- **Typographie** : les tirets cadratins et demi-cadratins sont proscrits sur l'ensemble du site (règle éditoriale du projet).
