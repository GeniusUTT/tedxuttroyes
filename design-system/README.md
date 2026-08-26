# Design system TEDxUTTroyes 2027

Les composants React du site TEDxUTTroyes, empaquetes pour pouvoir maquetter de
nouvelles pages ailleurs que dans le depot (Claude Design en particulier).

**Le paquet ne redefinit aucun style.** Il rejoue le markup et les classes du site,
et sert la feuille unique du site (`assets/css/main.css`) telle quelle. La source de
verite visuelle reste le site : une retouche de `main.css` se propage au paquet au
prochain build, sans rien changer ici.

Ce dossier ne fait pas partie du site. Il n'est lie depuis aucune page, et `.htaccess`
refuse son acces en production.

## Commandes

```
npm install
npm run build     # dist/ : index.js, index.d.ts, styles.css, fonts/
node demo.mjs     # demo/*.html : chaque page du site recomposee avec les composants
node verify.mjs   # compare le vocabulaire de classes rendu avec celui du vrai site
```

Pour regarder les pages de controle, servir depuis la racine du depot (les images
pointent vers `/assets/`) :

```
python -m http.server 8010
```

puis ouvrir `http://127.0.0.1:8010/design-system/demo/`.

## verify.mjs : le garde-fou

`verify.mjs` compare, page par page puis globalement, les classes CSS produites par
les composants et celles des vraies pages du site. Il echoue si une classe du site
n'est produite par aucun composant (un morceau du site n'est plus couvert) ou si le
paquet produit une classe qui n'existe nulle part sur le site (une invention).
A relancer apres toute retouche du site ou du paquet.

Etat au dernier passage : 184 classes couvertes sur 186, zero invention.

## Ce que le paquet ne reprend pas, volontairement

| Ecarte | Pourquoi |
|---|---|
| `line.js`, le defilement virtuel et les ancres `data-line` | Choregraphie de page entiere (mesures, fenetres de gel, wrapper fixe) : irreproductible hors du site. `PageShell` pose la classe du regime (`journey` pour l'accueil, `parcours` pour les pages interieures) et embarque le repli CSS, la dorsale verticale statique. Les ancres qui donnent sa silhouette a chaque type de page sont des attributs, pas des classes : elles vivent dans le HTML du site. |
| La carte Mapbox (`lieu-map`) | Requete externe et jeton d'API. `PlanLieu`, le plan SVG dessine a la main, est la version unique du paquet. |
| Les sondes `probe` | Points de mesure de `line.js`, sans rendu. |
| Le minuteur vivant | `Ticker` prend sa valeur en prop : un rendu doit etre reproductible. |
| L'animation du voile d'ouverture | `VoileOuverture` pose le markup et la marque statique. Sur le site, le voile est arme par un script en ligne du head (une fois par onglet, cle de session `tedx-ouverture`), porte `logo-10ans-intro.svg` et sort par une animation CSS : rien de tout cela n'a de sens hors du site. |
| `.tally` | Classe pilotee par `main.js` mais sans aucune regle CSS ni usage dans le HTML du site : code mort, laisse de cote. |

## Composer une page

`PageShell` donne une page complete et conforme : lien d'evitement, header,
`main#contenu`, pied de page avec la mention de licence TED.

```jsx
<PageShell current="faq">
  <PageHead cote="Infos pratiques" title="FAQ" lead="..." />

  <Section cote="Questions, réponses">
    <FaqGroup title="Billetterie">
      <FaqItem question="Comment réserver ma place ?">
        <p>La billetterie est hébergée sur HelloAsso.</p>
      </FaqItem>
    </FaqGroup>
  </Section>

  <Band title="Une autre question ?" cote="Contact">
    <Actions>
      <Button href={`mailto:${CONTACT_MAIL}`}>Nous écrire</Button>
    </Actions>
  </Band>
</PageShell>
```

Pour l'accueil : `<PageShell variant="journey">`, qui active la dorsale et les
reglages de hero propres au parcours de la ligne.

## Les composants

**Gabarit** : `PageShell`, `SiteHeader`, `SiteFooter`, `Section`, `PageHead`, `Band`

**Marque des dix ans** : `Marque10`, `VoileOuverture`

**Base** : `Button`, `LinkMore`, `Icon`, `Heading`, `Cote`, `Lead`, `Prose`, `Notice`,
`Actions`, `Facts`, `Redact`, `VisuallyHidden`

**Accueil** : `Hero`, `Ticker`, `Moment`, `SpeakerList`, `LieuBlock`, `PlanLieu`,
`Timeline`, `Album`, `EditionSlider`, `ArchiveStrip`, `DataLines`, `TedxBlock`,
`FinalCta`

**Speakers** : `SpeakerGrid`, `SpeakerCard`, `TalkFrame`

**Editions** : `EditionRegister`, `EditionFiche`, `EditionMeta`, `EditionNav`,
`PeopleList`

**Hall of Fame** : `HofYear`

**Programme** : `Sheet`

**Partenaires** : `PartnersGrid`

**FAQ** : `FaqGroup`, `FaqItem`

**Erreur** : `ErrorHero`

## Regles a ne pas defaire

- Tirets cadratins et demi-cadratins proscrits partout, y compris dans le code et les
  commentaires. Deux points, parentheses ou virgules a la place.
- Zero border-radius, zero ombre portee, zero halo. Seule exception : les photos du
  planning de l'accueil (`Timeline`).
- La mention « Cet événement TEDx indépendant est organisé sous licence de TED. » figure
  dans chaque pied de page. `SiteFooter` la porte et elle ne se desactive pas.
- « TEDxUTTroyes » s'ecrit toujours en entier, jamais en capitales forcees.
- Aucun partenaire sur la page d'accueil (`PartnersGrid` n'y a pas sa place).
- Les logos partenaires restent plus petits que le logo de l'evenement : le plafond est
  dans la feuille, ne pas le contourner.
- Jamais d'email personnel d'un membre de l'equipe.
- Les valeurs provisoires portent un commentaire `PLACEHOLDER` : ne pas les retirer sans
  la vraie valeur.

## Tokens

Poses par la feuille, a utiliser plutot que des valeurs en dur :
`--noir #080808`, `--surface`, `--surface-2`, `--papier #EDEAE4`, `--encre`, `--encre-2`,
`--rouge #EB0028`, `--rouge-2`, `--rouge-vif`, `--filet`, `--caviardage`,
`--font-disp` (Bricolage Grotesque), `--font-body` (DM Sans), `--font-mono` (Space Mono),
`--m-left`, `--m-right`, `--line-x`, `--header-h`.
