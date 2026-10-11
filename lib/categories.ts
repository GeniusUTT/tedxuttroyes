// Catégories de documents : qui les dépose, quels formats, quelle taille.
// Le type d'un fichier se décide ici, à partir de son extension, puis se
// vérifie sur ses premiers octets : on ne croit jamais le navigateur.

export const FORMATS = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  txt: 'text/plain',
  md: 'text/markdown',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  key: 'application/vnd.apple.keynote',
  odp: 'application/vnd.oasis.opendocument.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  tif: 'image/tiff',
  tiff: 'image/tiff',
} as const;

export type Extension = keyof typeof FORMATS;
export type Sens = 'du_speaker' | 'vers_speaker';
export type Rattachement = 'speaker' | 'tous_speakers';

export type Categorie = {
  slug: string;
  libelle: string;
  sens: Sens;
  formats: Extension[];
  maxMo: number;
  aide?: string;
  attestation?: boolean;
  unique?: boolean;
  // À fournir par chaque speaker : la liste de son dossier les compte.
  requis?: boolean;
  // Un document à signer : le slug du modèle vierge que l'équipe met à
  // disposition. Le fichier renvoyé est comparé à ce modèle (SHA-256).
  modele?: string;
  // Le modèle vierge lui-même (déposé pour tous les speakers).
  estModele?: boolean;
};

const BUREAUTIQUE: Extension[] = ['pdf', 'docx', 'odt', 'pptx', 'odp', 'xlsx', 'ods', 'txt', 'md', 'jpg', 'jpeg', 'png', 'webp'];
const IMAGES_HD: Extension[] = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tif', 'tiff'];
const SIGNE: Extension[] = ['pdf', 'jpg', 'jpeg', 'png'];

export const CATEGORIES: Categorie[] = [
  { slug: 'release', libelle: 'Speaker Release signée', sens: 'du_speaker', formats: SIGNE, maxMo: 10, unique: true, requis: true, modele: 'modele_release',
    aide: 'Téléchargez le modèle, signez-le (à la main puis scanné, ou par signature électronique), puis déposez-le ici.' },
  { slug: 'droit_image', libelle: 'Droit à l’image signé', sens: 'du_speaker', formats: SIGNE, maxMo: 10, unique: true, requis: true, modele: 'modele_droit_image',
    aide: 'Il autorise l’équipe à vous photographier et à vous filmer le jour de l’événement, pour sa communication sur les réseaux sociaux et sur le site.' },
  { slug: 'photo_hd', libelle: 'Photos haute qualité', sens: 'du_speaker', formats: IMAGES_HD, maxMo: 30, requis: true,
    aide: 'Une ou plusieurs photos de vous, en haute définition : elles servent à la communication sur nos réseaux sociaux et sur le site.' },
  { slug: 'script', libelle: 'Script du talk', sens: 'du_speaker', formats: ['pdf', 'docx', 'odt', 'txt', 'md'], maxMo: 20, unique: true },
  { slug: 'slides', libelle: 'Slides', sens: 'du_speaker', formats: ['pdf', 'pptx', 'key', 'odp'], maxMo: 50, attestation: true, unique: true,
    aide: 'Les règles TEDx interdisent toute image, musique ou vidéo dont vous ne détenez pas les droits.' },
  { slug: 'transport', libelle: 'Justificatifs de transport', sens: 'du_speaker', formats: SIGNE, maxMo: 10,
    aide: 'Supprimés de l’espace trois mois après l’édition, une fois transmis à la trésorerie.' },
  { slug: 'modele_release', libelle: 'Speaker Release (modèle à signer)', sens: 'vers_speaker', formats: ['pdf', 'docx', 'odt'], maxMo: 10, unique: true, estModele: true },
  { slug: 'modele_droit_image', libelle: 'Droit à l’image (modèle à signer)', sens: 'vers_speaker', formats: ['pdf', 'docx', 'odt'], maxMo: 10, unique: true, estModele: true },
  { slug: 'accueil', libelle: 'Dossier d’accueil', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'regles_tedx', libelle: 'Règles de contenu TEDx', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'planning', libelle: 'Planning du jour J', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'billets', libelle: 'Billets de train', sens: 'vers_speaker', formats: SIGNE, maxMo: 10 },
  { slug: 'autre', libelle: 'Autre document', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
];

// Un jalon peut se rattacher à une catégorie de dépôt, ou à la fiche du
// speaker : coordonnées, biographie et résumé remplis passent le jalon à
// « déposé ».
export const JALON_FICHE = 'fiche';

export function categorie(slug: string): Categorie | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function extensionDe(nom: string): Extension | null {
  const e = nom.toLowerCase().split('.').pop() ?? '';
  return e in FORMATS ? (e as Extension) : null;
}

// Signatures binaires : un fichier renommé en .pdf n'en devient pas un.
export function signatureValide(ext: Extension, o: Uint8Array): boolean {
  const debut = (...octets: number[]) => octets.every((x, i) => o[i] === x);
  const ascii = (s: string, a = 0) => [...s].every((c, i) => o[a + i] === c.charCodeAt(0));
  switch (ext) {
    case 'pdf': return ascii('%PDF');
    case 'docx': case 'pptx': case 'xlsx': case 'odt': case 'odp': case 'ods': case 'key': return debut(0x50, 0x4b, 0x03, 0x04);
    case 'jpg': case 'jpeg': return debut(0xff, 0xd8, 0xff);
    case 'png': return debut(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case 'webp': return ascii('RIFF') && ascii('WEBP', 8);
    case 'heic': return ascii('ftyp', 4);
    case 'tif': case 'tiff': return debut(0x49, 0x49, 0x2a, 0x00) || debut(0x4d, 0x4d, 0x00, 0x2a);
    case 'txt': case 'md': return !o.includes(0);
  }
}

export function lienValide(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && url.length <= 2000;
  } catch {
    return false;
  }
}
