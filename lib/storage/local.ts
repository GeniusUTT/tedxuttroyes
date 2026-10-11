import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { empreinte } from '../chiffrement';
import { urlDeBase } from '../url';
import type { FormulaireEnvoi, Stockage } from './index';

// Pilote local, pour le développement et les tests seulement : un dossier
// sur le disque, et une route de l'espace qui joue le rôle du stockage, avec
// les mêmes garanties (signature, taille maximale, type, expiration).
// Interdit en production par stockage().

export const DOSSIER_LOCAL = resolve(process.env.STOCKAGE_LOCAL_DOSSIER ?? '.stockage-local');

export function cheminLocal(cle: string): string {
  const p = resolve(DOSSIER_LOCAL, cle);
  if (!p.startsWith(DOSSIER_LOCAL)) throw new Error('clé invalide');
  return p;
}

export function signer(...parts: (string | number)[]): string {
  return empreinte(parts.join('|'), 'stockage-local');
}

export class StockageLocal implements Stockage {
  async formulaireEnvoi(cle: string, typeMime: string, tailleMax: number, dureeS: number): Promise<FormulaireEnvoi> {
    const exp = Date.now() + dureeS * 1000;
    return {
      url: `${urlDeBase()}/espace/api/stockage-local/`,
      champs: { key: cle, 'Content-Type': typeMime, max: String(tailleMax), exp: String(exp), sig: signer('envoi', cle, typeMime, tailleMax, exp) },
    };
  }

  async infos(cle: string) {
    try {
      return { taille: (await stat(cheminLocal(cle))).size };
    } catch {
      return null;
    }
  }

  async debut(cle: string, octets: number) {
    return new Uint8Array((await readFile(cheminLocal(cle))).subarray(0, octets));
  }

  async lire(cle: string) {
    return new Uint8Array(await readFile(cheminLocal(cle)));
  }

  async ecrire(cle: string, corps: Uint8Array) {
    const p = cheminLocal(cle);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, corps);
  }

  async urlLecture(cle: string, nomFichier: string, typeMime: string, dureeS: number) {
    const exp = Date.now() + dureeS * 1000;
    const q = new URLSearchParams({ key: cle, nom: nomFichier, type: typeMime, exp: String(exp), sig: signer('lecture', cle, nomFichier, typeMime, exp) });
    return `${urlDeBase()}/espace/api/stockage-local/?${q}`;
  }

  async supprimer(cle: string) {
    await rm(cheminLocal(cle), { force: true });
  }

  async lister(prefixe: string) {
    const sortie: { cle: string; date: Date }[] = [];
    try {
      for (const f of await readdir(DOSSIER_LOCAL, { recursive: true, withFileTypes: true })) {
        if (!f.isFile()) continue;
        const cle = join(f.parentPath, f.name).slice(DOSSIER_LOCAL.length + 1).replaceAll(sep, '/');
        if (cle.startsWith(prefixe)) sortie.push({ cle, date: (await stat(join(f.parentPath, f.name))).mtime });
      }
    } catch {
      return [];
    }
    return sortie;
  }
}

export { join };
