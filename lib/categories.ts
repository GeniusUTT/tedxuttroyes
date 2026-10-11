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
export type Sens = 'du_speaker' | 'vers_speaker' | 'interne';
export type Rattachement = 'speaker' | 'tous_speakers' | 'pole' | 'commun';

export type Categorie = {
  slug: string;
  libelle: string;
  sens: Sens;
  formats: Extension[];
  maxMo: number;
  aide?: string;
  attestation?: boolean;
  lien?: boolean;
  unique?: boolean;
};

const BUREAUTIQUE: Extension[] = ['pdf', 'docx', 'odt', 'pptx', 'odp', 'xlsx', 'ods', 'txt', 'md', 'jpg', 'jpeg', 'png', 'webp'];

export const CATEGORIES: Categorie[] = [
  { slug: 'script', libelle: 'Script du talk', sens: 'du_speaker', formats: ['pdf', 'docx', 'odt', 'txt', 'md'], maxMo: 20, unique: true },
  { slug: 'slides', libelle: 'Slides', sens: 'du_speaker', formats: ['pdf', 'pptx', 'key', 'odp'], maxMo: 50, attestation: true, unique: true,
    aide: 'Les règles TEDx interdisent toute image, musique ou vidéo dont vous ne détenez pas les droits.' },
  { slug: 'photo_hd', libelle: 'Photo HD', sens: 'du_speaker', formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'tif', 'tiff'], maxMo: 30, unique: true },
  { slug: 'portrait', libelle: 'Photo portrait (fiche)', sens: 'du_speaker', formats: ['jpg', 'jpeg', 'png', 'webp'], maxMo: 10, unique: true },
  { slug: 'release', libelle: 'Speaker Release signé', sens: 'du_speaker', formats: ['pdf', 'jpg', 'jpeg', 'png'], maxMo: 10, unique: true },
  { slug: 'transport', libelle: 'Justificatifs de transport', sens: 'du_speaker', formats: ['pdf', 'jpg', 'jpeg', 'png'], maxMo: 10,
    aide: 'Supprimés de l’espace trois mois après l’édition, une fois transmis à la trésorerie.' },
  { slug: 'fiche_technique', libelle: 'Fiche technique', sens: 'du_speaker', formats: ['pdf', 'docx', 'odt'], maxMo: 10, unique: true },
  { slug: 'video_repetition', libelle: 'Vidéo de répétition (lien)', sens: 'du_speaker', formats: [], maxMo: 0, lien: true,
    aide: 'Un lien vers la vidéo (YouTube non répertorié, Drive…). La vidéo finale passe par le TED Media Uploader, pas par ici.' },
  { slug: 'accueil', libelle: 'Dossier d’accueil', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'regles_tedx', libelle: 'Règles de contenu TEDx', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'planning', libelle: 'Planning du jour J', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'billets', libelle: 'Billets de train', sens: 'vers_speaker', formats: ['pdf', 'jpg', 'jpeg', 'png'], maxMo: 10 },
  { slug: 'autre', libelle: 'Autre document', sens: 'vers_speaker', formats: BUREAUTIQUE, maxMo: 50 },
  { slug: 'document', libelle: 'Document', sens: 'interne', formats: BUREAUTIQUE, maxMo: 50 },
];

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
