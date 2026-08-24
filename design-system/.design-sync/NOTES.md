# Notes de synchronisation vers Claude Design

Particularites de ce depot, a lire avant toute nouvelle synchronisation.

## Le depot

- Le paquet vit dans `design-system/`, pas a la racine : la racine est le site statique
  TEDxUTTroyes, deploye sur OVH par push Git. Tout le materiel de synchronisation
  (`.ds-sync/`, `ds-bundle/`, `.design-sync/.cache/`) reste donc sous `design-system/`,
  jamais a la racine, et `.htaccess` refuse l'acces au dossier en production.
- Lancer toutes les commandes depuis `design-system/`.
- Le paquet est prive et absent de `node_modules` : passer `--entry ./dist/index.js`.
- `--node-modules ./node_modules` (celui de `design-system/`).

## Avant le convertisseur

- `node build.mjs` (c'est `cfg.buildCmd`) reconstruit `dist/` : bundle esbuild, types
  `tsc`, copie de la feuille du site et des polices. A relancer des que le SITE change,
  pas seulement le paquet : `dist/styles.css` est une copie de `assets/css/main.css`.
- Le paquet ne redefinit aucun style. Ne jamais recopier une regle CSS dans le paquet,
  ne jamais y inventer une classe. `node verify.mjs` (a la racine du paquet) compare le
  vocabulaire de classes rendu par les composants avec celui des vraies pages du site et
  echoue sur toute classe non couverte ou inventee.

## Alertes de validation triees (« Known render warns »)

- `[FONT_MISSING] "Arial Black"` : **benin, ne pas chercher a le resoudre.** Arial Black
  n'est pas une police du site, c'est un repli systeme dans la pile
  `--font-disp: "Bricolage Grotesque", "Arial Black", Arial, sans-serif`. Les trois vraies
  familles (Bricolage Grotesque, DM Sans, Space Mono) embarquent bien leurs huit
  `@font-face`, atteignables depuis `styles.css` via `fonts/fonts.css`.

## Pieges rencontres, et ce qui les regle

- **Fond blanc des cartes d'apercu.** Le gabarit de carte pose
  `body{margin:0;padding:24px;background:#fff}` en style inline, apres la feuille : sur
  une DA entierement sombre, tous les textes deviennent illisibles. Il n'existe aucun
  levier de configuration pour ce fond, et `lib/emit.mjs` ne doit pas etre forke. Regle
  par un ajout en fin de `dist/styles.css`, ecrit par `build.mjs` : `html body` (un cran
  plus specifique qu'un selecteur d'element) rappelle `--noir` et `--encre`, les memes
  valeurs que `main.css` pose deja sur `body`. C'est le seul ajout du paquet a la feuille.
- **Animations d'apparition capturees en cours de fondu.** Les classes `.a a1` a `.a a7`
  partent d'`opacity: 0` avec un delai jusqu'a une seconde : les captures sortaient
  delavees. `.design-sync/previews/_still.tsx` exporte `Fige`, qui rejoue la regle que le
  site applique deja sous `prefers-reduced-motion` (section 21 de `main.css`). A inclure
  dans toute vignette qui rend `PageHead`, `Hero` ou `PageShell`.
- **Telescripteur invisible.** `.ticker { display: none }` et `.js .ticker { display: flex }` :
  le compte a rebours n'existe que si la classe `.js` est posee, ce que fait le script du
  site en tete de page. Les cartes n'executent pas ce script, d'ou `[RENDER_THIN]` a 0 px.
  `_still.tsx` exporte `ScriptActif`, qui pose la meme classe. A inclure dans les vignettes
  de `Ticker` et `Hero`.
- **Images.** Les cartes sont servies depuis le bundle : un chemin en `/assets/` n'y
  resout pas. `.design-sync/previews/_images.ts` embarque 26 miniatures du site en data
  URI (~237 ko), generees par un script Pillow jetable a partir de `assets/img/`. Chaque
  vignette n'emporte que les images qu'elle importe (esbuild elague par fichier).
- **Presque tout le systeme est large.** Ce sont des blocs de page entiere, pas des
  controles : 24 composants sont en `cardMode: "column"`, et `PageShell` et `SiteHeader`
  en `cardMode: "single"` (contenu en position fixe, aucune grille ne peut les presenter).
- **L'album a besoin de ses neuf affiches.** `Album` repartit ses stations sur autant de
  colonnes qu'il a d'entrees : le nourrir avec trois affiches ecrase les etiquettes les
  unes sur les autres. La vignette utilise les neuf editions reelles.

## Trouvailles sur le site lui-meme

- `.tally` (le dix en batons) est pilote par `assets/js/main.js` mais n'a plus aucune
  regle CSS ni aucun usage dans le HTML : code mort. Exclu du paquet.
- La page 404 est la seule du site sans pied de page, donc sans la mention de licence TED.
  D'ou la prop `footer` de `PageShell`. A signaler a Baptiste si la conformite compte.

## Etat au 2026-08-09 (premiere synchronisation)

45 composants envoyes dans le projet Claude Design `TEDxUTTroyes 2027`
(`41f94233-8d68-4914-bc86-ab114267343d`), 241 fichiers, aucune carte minimale : les 45
ont une vignette ecrite a la main et notee `good` sur les 108 cellules. Validation a zero
defaut (`bad`, `thin`, `variantsIdentical` tous a 0), une alerte triee (Arial Black).
La derniere capture complete affiche `45 carried forward, 0 grade cleared` : la
prochaine synchronisation ne reverifiera que ce qui a change.

Cadrages de carte retenus (`cfg.overrides`) : 21 composants en `column` (ce sont des
blocs de page, pas des controles), et quatre en `single` avec un cadrage explicite :
`Album` (1500x760, composition horizontale), `LieuBlock` (1400x640, trio photo / plan /
fiche), `PageShell` (1280x900) et `SiteHeader` (1280x240, sans quoi la carte rend la
navigation mobile), `SpeakerCard` (900x820, sinon le statut d'annonce est coupe).

Re-sync : `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules
./node_modules --entry ./dist/index.js --out ./ds-bundle --remote
.design-sync/.cache/remote-sync.json` depuis `design-system/`, apres avoir relance
`node build.mjs` et refait le `cp -r` des scripts stages.

## Risques de peremption (a surveiller a la prochaine synchronisation)

- **La feuille du site est la source de verite.** Toute retouche de `assets/css/main.css`
  change le rendu du paquet au prochain `node build.mjs`. Si `main.css` est renomme
  (regle de cache-busting du projet : `main-v2.css` apres une mise en ligne), `build.mjs`
  le suit par glob et prend le plus recent : verifier la ligne `[ds] feuille :` du build.
- **Le rappel `html body` de `build.mjs`** existe uniquement a cause du fond blanc code en
  dur dans le gabarit de carte. Si une version future du convertisseur rend ce fond
  configurable, l'ajout peut etre retire.
- **Les images en data URI** sont un instantane des assets du site : elles ne se mettent
  pas a jour toutes seules. Regenerer le module si les visuels changent (le script vit
  dans le scratchpad de la session, il est trivial a reecrire : recadrage Pillow puis
  base64 en WebP qualite 72).
- **Les contenus des vignettes** citent de vrais speakers et de vrais themes d'editions
  passees. Rien n'est sous embargo la-dedans, mais ne jamais y faire figurer un nom de
  speaker 2027 non annonce.
- **Non verifie** : le rendu dans le panneau Design System de claude.ai lui-meme (seules
  les captures locales l'ont ete).
