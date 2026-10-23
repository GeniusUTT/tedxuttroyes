// Les adresses que le site public répète d'une page à l'autre. Elles ne sont
// écrites qu'ici : changer de billetterie, c'est changer une ligne.

export const SITE = 'https://tedxuttroyes.fr';
export const BILLETTERIE = 'https://www.billetweb.fr/tedxuttroyes-2027-10e-edition';
export const NOS_LIENS = 'https://linktr.ee/tedxuttroyes';
export const INSTAGRAM = 'https://www.instagram.com/tedxuttroyes/';
export const LINKEDIN = 'https://www.linkedin.com/company/tedx-uttroyes/';
export const INSTAGRAM_GENIUS = 'https://www.instagram.com/geniusutt/';
export const LINKEDIN_GENIUS = 'https://www.linkedin.com/company/genius-utt/';
export const CONTACT = 'geniusutt@utt.fr';

// Les scripts du site, en JavaScript pur. Ils sont mis en cache un mois
// (next.config.ts) : toute retouche passe par un nouveau numéro.
export const SCRIPTS = {
  devoilement: '/assets/js/reveal-v3.js',
  principal: '/assets/js/main-v9.js',
  ligne: '/assets/js/line-v10.js',
  carte: '/assets/js/map-v2.js',
} as const;
