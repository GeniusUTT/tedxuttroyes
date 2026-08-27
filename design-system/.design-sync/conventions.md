# TEDxUTTroyes : conventions du design system

Ce systeme habille le site de TEDxUTTroyes, une conference TEDx organisee sous licence de
TED. La direction artistique s'appelle « le releve » : le site se lit comme un releve
technique, sur fond noir, avec une ligne de cote rouge verticale sur chaque page, une
marge d'annotations en typo mono a gauche et le contenu a droite.

## Mise en place

Aucun provider, aucun contexte, aucun theme a initialiser : les composants sont des
fonctions React sans etat qui emettent le markup et les classes du site. Il suffit que
`styles.css` soit charge.

Pour une page complete, partir de `PageShell` : il pose le lien d'evitement, `SiteHeader`,
`<main id="contenu">` et `SiteFooter`. Le pied de page porte la mention de licence TED,
qui est obligatoire sur chaque page. `PageShell` accepte `footer={false}`, reserve a la
seule page 404 : ne pas l'utiliser ailleurs.

Le canevas est sombre par construction : `styles.css` pose `--noir` en fond et `--encre`
en couleur de texte sur `html body`. Ne jamais poser de fond clair, ni de texte sombre.

## L'idiome de style : des tokens CSS, pas de classes utilitaires

Il n'y a **pas** de systeme de classes utilitaires ici, et aucune classe a inventer. Pour
toute mise en page ajoutee autour des composants, utiliser les variables CSS du systeme :

| Role | Tokens |
|---|---|
| Fonds | `--noir` (#080808), `--surface`, `--surface-2` |
| Textes | `--papier` (#EDEAE4, titres), `--encre` (corps), `--encre-2` (secondaire, mono) |
| Rouge | `--rouge` (#EB0028, la ligne et les aplats), `--rouge-2`, `--rouge-vif` (petits textes) |
| Traits | `--filet` (filets 10 %), `--caviardage` (barres d'embargo) |
| Typo | `--font-disp` (Bricolage Grotesque), `--font-body` (DM Sans), `--font-mono` (Space Mono) |
| Geometrie | `--m-left`, `--m-right`, `--line-x` (l'axe de la ligne rouge), `--header-h` |

Quelques classes structurelles du site sont reutilisables telles quelles quand un
composant ne suffit pas : `inner` (la colonne de contenu), `sec-body`, `colL`, `more-row`,
`actions`, `facts`, `prose`, `notice`. Toute autre classe serait inventee : s'en tenir aux
composants et aux tokens.

## Ou est la verite

Lire `styles.css` et ses deux imports (`fonts/fonts.css` pour les huit `@font-face`,
`_ds_bundle.css` pour les regles de composants) avant d'ecrire du style. Pour chaque
composant, `<Nom>.d.ts` donne le contrat de props et `<Nom>.prompt.md` l'usage.

## Regles a ne jamais enfreindre

- **Zero border-radius, zero ombre portee, zero halo.** Seule exception du systeme : les
  photos du planning (`Timeline`).
- **Tirets cadratins et demi-cadratins proscrits** dans tous les textes. Utiliser deux
  points, des parentheses ou des virgules.
- **« TEDxUTTroyes » s'ecrit toujours en entier**, jamais tronque, jamais en capitales
  forcees.
- **La mention de licence TED** figure dans chaque pied de page (`SiteFooter` la porte).
- **Aucun partenaire sur la page d'accueil** : `PartnersGrid` n'y a pas sa place. Les
  logos partenaires restent plus petits que le logo de l'evenement, plafond porte par la
  feuille : ne pas le contourner.
- **Jamais d'email personnel** d'un membre de l'equipe. L'adresse de contact est celle de
  l'association.
- Les speakers non annonces restent **sous embargo** : `SpeakerCard` sans `name` affiche
  des barres de caviardage. Ne jamais inventer un nom de speaker.

## Exemple

```jsx
<PageShell current="faq">
  <PageHead
    cote="Infos pratiques"
    title="FAQ"
    lead="Billets, horaires, accès : les réponses aux questions qui reviennent."
  />

  <Section cote="Questions, réponses">
    <FaqGroup title="Billetterie">
      <FaqItem question="Comment réserver ma place ?">
        <p>La billetterie est hébergée sur Billetweb.</p>
      </FaqItem>
    </FaqGroup>

    <div style={{ display: "grid", gap: "18px", borderTop: "1px solid var(--filet)" }}>
      <Notice>Les tarifs seront annoncés à l'ouverture de la billetterie.</Notice>
    </div>
  </Section>

  <Band cote="Contact" title="Une autre question ?">
    <Actions>
      <Button href="mailto:geniusutt@utt.fr">Nous écrire</Button>
    </Actions>
  </Band>
</PageShell>
```
