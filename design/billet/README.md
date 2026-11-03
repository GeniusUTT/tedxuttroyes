# Billet Billetweb de la 10e édition

Fond de billet personnalisé, modèle « Pleine page » de Billetweb (page « Visuels billets » de l'événement).

- `tedxuttroyes-2027-billet-full.png` : le fichier à charger, A4 à 300 dpi (2480 x 3508 px). Billetweb exige « full » dans le nom.
- `billet.html` : la source. Polices, couleurs et logos viennent de `public/assets/`.

Billetweb ajoute son bloc (nom, tarif, QR code, mentions) en haut à gauche, sans qu'on puisse le déplacer dans ce modèle. Les quatre coins rouges l'encadrent, d'après son emplacement mesuré sur l'aperçu Billetweb du 2026-11-02 (seconde mesure) : x 56 à 1179, y 531 à 1226.

Sous le bloc, trois anciens speakers (Jamy Gourmaud 2017, Vincent Doumeizel et Léo Techmaker 2023), présentés comme « déjà passés sur notre scène » : les speakers 2027 restent sous embargo, le billet ne doit pas laisser croire que ces trois-là reviennent. Portraits repris de `public/assets/img/editions/`.

Le billet porte le thème et la date en clair : ne pas le charger sur Billetweb avant la révélation du mardi 10 novembre 2026 à 16h00.

Ce dossier n'est pas servi par le site (seul `public/` l'est).

## Régénérer le PNG

Depuis la racine du dépôt, avec Chrome :

```
chrome --headless=new --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 --window-size=2480,3508 --virtual-time-budget=3000 --screenshot=design/billet/tedxuttroyes-2027-billet-full.png file:///<chemin absolu>/design/billet/billet.html
```
