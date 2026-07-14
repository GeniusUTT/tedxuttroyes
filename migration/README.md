# Migration des éditions TEDxUTTroyes

Extraction complète du contenu des pages `/editions/` (2019, 2021, 2022, 2023, 2024, 2025) en vue de la migration vers le nouveau site web, complétée par les images des autres pages du site (éditions 2016/2017/2026, pages speakers, accueil, à propos, partenaires, toutes les éditions, assets communs) : voir `autres-pages.md`. Généré le 14 juillet 2026.

## Structure

Chaque dossier `edition-XXXX/` contient :

- `contenu.md` : toutes les informations de l'édition (titre, thème, date, lieu, texte de présentation, métadonnées SEO, speakers, équipe organisatrice avec rôles/LinkedIn/emails, liste des photos de galerie, notes de migration)
- `affiche/` : l'affiche ou le visuel principal de l'édition
- `photos-speakers/` : les portraits des speakers
- `photos-equipe/` : les photos de l'équipe organisatrice
- `photos-galerie/` : les photos « Retour en images » (uniquement 2023 et 2024, les autres éditions n'ont pas de galerie)

Seules les images originales en pleine résolution ont été copiées (pas les variantes redimensionnées `-p-500`, `-p-800`, etc. générées par Webflow).

## Convention de nommage des images

Toutes les images ont été renommées avec des noms explicites en kebab-case, sans accents ni majuscules, pour identifier directement leur contenu :

- Portraits (speakers et équipe) : `prenom-nom.ext` (ex. `jean-audouze.jpg`, `solene-derniaux.jpg`)
- Affiches : `affiche-tedxuttroyes-XXXX.ext` (2021 : `visuel-tedxuttroyes-2021.png`, simple capture d'écran)
- Galeries : `galerie-XXXX-NN.ext` dans l'ordre du slider d'origine, avec le sujet en suffixe quand il est connu (ex. `galerie-2023-02-marcel-soh.png`)
- Extensions normalisées en minuscules (`.JPG` et `.jpeg` deviennent `.jpg`)

Chaque `contenu.md` contient un tableau de correspondance entre les nouveaux noms et les fichiers d'origine du dossier `images/` du site actuel.

## Récapitulatif des éditions

| Édition | Thème | Date | Lieu | Speakers | Équipe | Galerie |
|---|---|---|---|---|---|---|
| 2025 | Réveiller l'avenir | 21 mars 2025 | Centre de Congrès de l'Aube | 7 | 8 | non (réutilise 2024) |
| 2024 | Le monde de demain | 22 mars 2024 | Centre des Congrès de Troyes | 7 | 7 | 10 photos |
| 2023 | Impacting our world | 15 mars 2023 | UTT | 6 | 9 | 10 photos + 1 bonus |
| 2022 | Circulation | 3 mars 2022 | UTT | 7 | 10 | non |
| 2021 | Changing codes | 5 mai 2021 | en ligne (YouTube) | 7 | 10 | non |
| 2019 | Thinking outside the box | 3 avril 2019 | UTT | 7 | 2 | non |

## Autres dossiers

- `edition-2016/`, `edition-2017/` : visuel placeholder (les pages n'ont pas de vraie affiche) ; thèmes « Shape the future » et « To the Limits and Beyond »
- `edition-2026/` : affiche « Un futur à bâtir », photos speakers (variantes carrées et rondes) et équipe
- `pages/` : images propres à chaque page du site (accueil, a-propos, partenaires, toutes-les-editions)
- `assets-communs/` : logos, icônes, favicon, décors partagés
- Détail complet et correspondances des noms dans `autres-pages.md`

## Points d'attention
- Les biographies détaillées des speakers se trouvent sur les pages individuelles `/speakers/XXXX/*.html` (non extraites ici, seuls les noms, photos et liens sont repris).
- Les fichiers source du site utilisent des noms avec accents décomposés (NFD, ex. `Équipe.png`) ; les copies du dossier `migration/` ont été renommées sans accents et ne posent plus ce problème.
- Le slider 2023 référence une photo du dossier `images/edition-2026/` (`fond_ted2025.jpg`), probablement une substitution accidentelle ; copiée sous le nom `galerie-2023-09-photo-2025-a-verifier.jpg`, voir la note dans `edition-2023/contenu.md`.
- Quelques coquilles du site actuel sont signalées dans les sections « Notes de migration » de chaque fiche (orthographe de noms, fautes dans les textes).
