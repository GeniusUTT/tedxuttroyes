# Site TEDxUTTroyes 2027 : "Le relevé"

Site statique de la dixième édition de TEDxUTTroyes (jeudi 18 mars 2027, 19h30, Centre de Congrès de l'Aube, Troyes). HTML, CSS et JavaScript purs : aucun framework, aucun build, aucun tracker, aucune donnée collectée.

## La direction artistique en deux mots

Le site est construit autour d'un concept directeur unique : **la ligne continue**, qui matérialise la limite du thème. Sur l'accueil, un seul trait SVG rouge parcourt toute la page et change de comportement : au seuil, la question du titre se tient à cheval dessus ; au moment "franchir", il reste droit et un mot le traverse au défilement ; au moment "s'adapter", il plie autour du bloc du lieu ; puis il redescend à 2016, tourne à l'horizontale et devient la frise des dix ans (interrompue en 2018 et 2020, les deux années sans édition), forme le 1 du grand 10 en retombant de 2027, se branche dans le bouton Réserver, et file en trait fin souligner la mention de licence TED du footer. Le trait se dessine au fil du défilement (`assets/js/line.js`) : le CSS place les contenus, le script mesure les ancres `data-line` et relie. Les pages intérieures gardent la ligne comme dorsale statique (pur CSS), marge technique en Space Mono, contenu à sa droite.

À ne pas défaire : les speakers non annoncés sont des **fiches sous embargo** (barres de caviardage), les éditions passées un **registre**, le compte à rebours un **téléscripteur** mono d'une seule ligne.

## Structure

```
index.html               Accueil (le parcours de la ligne : seuil, franchir,
                         s'adapter, frise des dix ans, prise, épilogue)
speakers.html            Les 6 fiches sous embargo
programme.html           Feuille de salle du 18 mars
editions.html            Le registre des 9 éditions
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
| Photos des 9 éditions | `assets/img/editions/*.svg` | déposer les vraies photos (jpg ou webp, environ 800x500), changer le `src` et renseigner l'`alt` ; le noir et blanc est appliqué automatiquement par le CSS |
| Liens YouTube par édition | `editions.html` | remplacer les liens de recherche YouTube par les playlists exactes |
| Photo du lieu | `index.html`, section « Le lieu » | remplacer `assets/img/lieu/centre-congres.svg` par une vraie photo |
| Image de partage (Open Graph) | `assets/img/og/og-default.jpg` | placeholder généré aux couleurs du site, à remplacer par un visuel conçu (1200x630) |
| Logos partenaires | `partenaires.html` | suivre le gabarit commenté ; ne pas retirer les limites de taille CSS (règle TEDx) |
| Mentions légales | `mentions-legales.html` | compléter les champs entre crochets |
| Contenus FAQ et programme | `faq.html`, `programme.html` | contenus type à relire et ajuster (tarifs, horaires précis, conditions) |

## À vérifier (préremplis, non garantis)

- **Thèmes des éditions passées** : extraits de l'ancien site, dont « Shape the futur » (2016), orthographe à confirmer.
- **Adresse et accès du lieu** : « 2 rue Pierre Labonde, 10000 Troyes », « un quart d'heure à pied de la gare », « au bord du canal » : à valider sur place.
- **Textes About TED / About TEDx** : adaptation française d'usage, à faire relire.
- **Heure de fin** : le JSON-LD de `index.html` indique 22h30, à ajuster avec le déroulé définitif.
- **2018 et 2020** figurent comme années sans édition (c'est ce qui fait de 2027 la dixième) : la frise de `index.html` interrompt la ligne à ces deux dates, et `editions.html` le mentionne.

## Règles TEDx intégrées (ne pas défaire)

- Aucun logo ni nom de partenaire sur la page d'accueil : les partenaires vivent uniquement sur leur page dédiée.
- Le texte officiel « Qu'est-ce que TEDx ? » et le lien vers ted.com/tedx sont sur l'accueil.
- Le footer de chaque page porte la mention : « Cet événement TEDx indépendant est organisé sous licence de TED. »
- La dénomination complète « TEDxUTTroyes » est utilisée partout, jamais « TEDx » ou « TED » seuls pour désigner l'événement, et le nom n'est jamais composé en capitales forcées.
- Les logos partenaires sont plafonnés en CSS pour rester plus petits que le logo de l'événement.

## Notes techniques

- **Polices** : 8 fichiers woff2 locaux. Bricolage Grotesque en variable (graisses 200 à 800), Space Mono 400 et 700 (données, marges, téléscripteur : la chasse fixe supprime tout tressautement de chiffres), DM Sans en variable (corps de texte). Aucun appel à un service tiers.
- **Téléscripteur** : cible figée à l'instant UTC `2027-03-18T18:30:00Z` (19h30 heure de Paris, encore en heure d'hiver à cette date). Sans JavaScript, le bloc est masqué et la date en clair reste affichée.
- **Motion** : une seule séquence d'entrée (la ligne se trace, le hero entre, le téléscripteur s'allume) et un seul moment au scroll (le dixième bâton se trace). Pas de reveals dispersés. `prefers-reduced-motion` neutralise tout.
- **Photos** : le CSS applique aux photos du registre et des fiches un traitement noir et blanc légèrement réchauffé (`filter` sur `.reg-media img` et `.emb-row--photo img`), pour que des images d'époques différentes forment une seule matière. Retirez ces règles si vous préférez la couleur.
- **Accessibilité** : navigation clavier complète (menu mobile inclus, fermeture par Échap), contrastes AA sur fond sombre (corps 9:1, secondaire 4,9:1), barres de caviardage doublées d'un texte pour lecteurs d'écran, téléscripteur doublé d'une phrase statique.
- **Typographie** : les tirets cadratins et demi-cadratins sont proscrits sur l'ensemble du site (règle éditoriale du projet).
