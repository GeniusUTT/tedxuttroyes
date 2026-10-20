// Les partenaires de chaque édition, de la plus récente à la plus ancienne.
// Reconstitué le 2026-10-20 depuis les archives du Drive TEDx : le tableur
// « Partenaires historiques » (TEDxP27), le bilan d'action 2025, les dossiers
// de logos et les visuels de remerciement. 2017 et 2021 n'y laissent aucune
// trace sûre : elles n'ont pas de section. Les partenaires du visuel « P18 »
// (Devoteam, Banque Populaire...) sont rangés en 2019, comme dans le tableur.
//
// Les logos sont recadrés sur leur contenu ; ceux qui sont sombres sur fond
// transparent ont reçu une plaque blanche. largeur et hauteur sont celles du
// fichier : la page en tire la taille d'affichage.

export type Logo = {
  nom: string;
  fichier: string;
  largeur: number;
  hauteur: number;
  lien?: string;
};

const L = (nom: string, fichier: string, largeur: number, hauteur: number, lien?: string): Logo => ({
  nom,
  fichier: `/assets/img/partenaires/logos/${fichier}.webp`,
  largeur,
  hauteur,
  lien,
});

const UTT = L("Université de Technologie de Troyes", "utt", 203, 231, "https://www.utt.fr/");
const UTT_2019 = L("Université de Technologie de Troyes", "utt-2019", 410, 149, "https://www.utt.fr/");
const FONDATION = L("Fondation UTT", "fondation-utt", 480, 161, "https://fondation-utt.odoo.com/");
const GENIUS = L("Genius UTT", "genius-utt", 467, 162, "https://www.instagram.com/geniusutt/");
const BDE = L("BDE UTT", "bde", 240, 240, "https://bde.utt.fr/");
const BDE_2019 = L("BDE UTT", "bde-2019", 219, 138, "https://bde.utt.fr/");
const TROYES = L("Troyes Champagne Métropole", "troyes", 388, 195, "https://troyes-champagne-metropole.fr/");
const AUBASSADEURS = L("Les Aubassadeurs, l'Aube puissance dix", "aubassadeurs", 326, 156, "https://www.aubassadeurs.fr/");
const TCAT = L("TCAT, transports en commun de l'agglomération troyenne", "tcat", 242, 147, "https://tcat.fr/");
const CROUS = L("Crous de Reims", "crous-reims", 256, 256, "https://www.crous-reims.fr/");
const CVEC = L("CVEC, contribution de vie étudiante et de campus", "cvec", 220, 97, "https://www.etudiant.gouv.fr/fr/cvec-une-demarche-de-rentree-incontournable-955");
const JCDECAUX = L("JCDecaux", "jcdecaux", 234, 81, "https://www.jcdecaux.fr/");
const VOLVO = L("Volvo", "volvo", 457, 128, "https://volvocars-concessions.com/troyes");
const AMPLITUDE = L("Amplitude", "amplitude", 406, 74, "https://www.amplitude-auto.com/");
const CHEERS = L("Cheers", "cheers", 252, 199, "https://www.instagram.com/cheersutt/");
const ARGENTIQUE = L("Argentique, club photo de l'UTT", "argentique", 200, 178, "https://www.instagram.com/argentiqueutt/");
const MEDIA = L("Média UTT", "media", 248, 240, "https://www.instagram.com/mediautt/");
const GRAND_EST = L("Région Grand Est", "region-grand-est", 480, 155, "https://www.grandest.fr/");
const CAPIFRANCE = L("Capifrance", "capifrance", 480, 310, "https://www.capifrance.fr/");
const LCL = L("LCL, Le Crédit Lyonnais", "lcl", 256, 180, "https://www.lcl.fr/");
const LUTECE = L("Lutèce International", "lutece", 381, 154);
const ZETRUC = L("ZeTruc, agence de communication", "zetruc", 324, 124);
const INNOV_UTT = L("Innov'UTT", "innov-utt", 203, 202);
const AMALTO = L("Amalto", "amalto", 314, 185);
const BILLETWEB = L("Billetweb", "billetweb", 351, 65, "https://www.billetweb.fr/");
const BEST_WESTERN = L("Best Western Premier Hôtel de la Poste, Troyes", "best-western", 369, 138);
const PREMIUM = L("Premium Automobiles : Jaguar, Land Rover, Volvo", "premium", 398, 149);
const DEVOTEAM = L("Devoteam", "devoteam", 408, 144, "https://www.devoteam.com/");
const BANQUE_POPULAIRE = L("Banque Populaire Alsace Lorraine Champagne", "banque-populaire", 454, 152);
const SAP = L("SAP", "sap", 480, 266, "https://www.sap.com/");
const CLERAMBAULT = L("Champagne Clérambault", "clerambault", 226, 175, "https://www.champagne-clerambault.com/");
const COMTES = L("Aux Comtes de Champagne", "comtes-champagne", 208, 194);
const JUST_ONE_LIFE = L("Just One Life", "just-one-life", 134, 104);

export const PARTENAIRES: { annee: number; logos: Logo[] }[] = [
  { annee: 2026, logos: [UTT, FONDATION, GENIUS, BDE, TROYES, AUBASSADEURS, TCAT, CROUS, CVEC, JCDECAUX, VOLVO, AMPLITUDE, CHEERS, ARGENTIQUE, MEDIA] },
  { annee: 2025, logos: [UTT, FONDATION, BDE, TROYES, GRAND_EST, CROUS, CVEC, AUBASSADEURS, VOLVO] },
  { annee: 2024, logos: [AUBASSADEURS, AMPLITUDE] },
  { annee: 2023, logos: [UTT, FONDATION, BDE, AUBASSADEURS, GRAND_EST, CAPIFRANCE] },
  { annee: 2022, logos: [UTT, FONDATION, AUBASSADEURS, BDE, GENIUS, ARGENTIQUE, MEDIA] },
  { annee: 2019, logos: [UTT_2019, BDE_2019, CROUS, SAP, PREMIUM, BANQUE_POPULAIRE, DEVOTEAM, ZETRUC, COMTES, CLERAMBAULT, JUST_ONE_LIFE, INNOV_UTT, BEST_WESTERN, BILLETWEB] },
  { annee: 2016, logos: [LCL, PREMIUM, BEST_WESTERN, LUTECE, ZETRUC, INNOV_UTT, AMALTO, BILLETWEB] },
];
