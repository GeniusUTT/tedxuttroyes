// Le stockage des fichiers, derrière une interface : Scaleway Object
// Storage aujourd'hui, tout stockage compatible S3 demain, un dossier local
// pour le développement et les tests. Aucun fichier ne transite par une
// fonction : le navigateur envoie et télécharge directement, par des URL
// signées de courte durée.

export type FormulaireEnvoi = { url: string; champs: Record<string, string> };

export interface Stockage {
  formulaireEnvoi(cle: string, typeMime: string, tailleMax: number, dureeS: number): Promise<FormulaireEnvoi>;
  infos(cle: string): Promise<{ taille: number } | null>;
  debut(cle: string, octets: number): Promise<Uint8Array>;
  urlLecture(cle: string, nomFichier: string, typeMime: string, dureeS: number): Promise<string>;
  lire(cle: string): Promise<Uint8Array>;
  ecrire(cle: string, corps: Uint8Array, typeMime: string): Promise<void>;
  supprimer(cle: string): Promise<void>;
  lister(prefixe: string): Promise<{ cle: string; date: Date }[]>;
}

let instance: Stockage | undefined;

export async function stockage(): Promise<Stockage> {
  if (instance) return instance;
  const pilote = process.env.STORAGE_DRIVER ?? 's3';
  if (pilote === 'local') {
    if (process.env.VERCEL_ENV === 'production') throw new Error('Le stockage local est interdit en production');
    const { StockageLocal } = await import('./local');
    instance = new StockageLocal();
  } else {
    const { StockageS3 } = await import('./s3');
    instance = new StockageS3();
  }
  return instance;
}

// Nom de fichier pour l'en-tête Content-Disposition (RFC 6266 et 5987).
export function disposition(nom: string): string {
  const ascii = nom.normalize('NFKD').replace(/[^\x20-\x7e]/g, '').replace(/["\\]/g, '_') || 'document';
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(nom)}`;
}
