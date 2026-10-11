import { createHmac, randomBytes } from 'node:crypto';

// TOTP selon la RFC 6238 (SHA-1, 6 chiffres, pas de 30 s), compatible avec
// toutes les applications d'authentification. Écrit à la main pour ne pas
// dépendre d'une bibliothèque pour vingt lignes.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32(octets: Buffer): string {
  let bits = 0, valeur = 0, sortie = '';
  for (const o of octets) {
    valeur = (valeur << 8) | o;
    bits += 8;
    while (bits >= 5) {
      sortie += ALPHABET[(valeur >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) sortie += ALPHABET[(valeur << (5 - bits)) & 31];
  return sortie;
}

export function depuisBase32(texte: string): Buffer {
  let bits = 0, valeur = 0;
  const sortie: number[] = [];
  for (const c of texte.replace(/=+$/, '').toUpperCase()) {
    const i = ALPHABET.indexOf(c);
    if (i < 0) throw new Error('base32 invalide');
    valeur = (valeur << 5) | i;
    bits += 5;
    if (bits >= 8) {
      sortie.push((valeur >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(sortie);
}

export function nouveauSecret(): string {
  return base32(randomBytes(20));
}

export function codeAuPas(secret: string, pas: number): string {
  const compteur = Buffer.alloc(8);
  compteur.writeBigUInt64BE(BigInt(pas));
  const h = createHmac('sha1', depuisBase32(secret)).update(compteur).digest();
  const decalage = h[h.length - 1]! & 15;
  const n = (h.readUInt32BE(decalage) & 0x7fffffff) % 1_000_000;
  return n.toString().padStart(6, '0');
}

export function pasCourant(maintenant = Date.now()): number {
  return Math.floor(maintenant / 30_000);
}

// Accepte le pas courant et ses deux voisins (dérive d'horloge), jamais un
// pas déjà utilisé : un code intercepté ne se rejoue pas.
export function verifierCode(secret: string, code: string, dernierPasUtilise: number | null, maintenant = Date.now()): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const p = pasCourant(maintenant);
  for (const pas of [p - 1, p, p + 1]) {
    if (dernierPasUtilise !== null && pas <= dernierPasUtilise) continue;
    if (codeAuPas(secret, pas) === code) return pas;
  }
  return null;
}

export function uriOtpauth(secret: string, compte: string): string {
  const emetteur = 'TEDxUTTroyes';
  return `otpauth://totp/${encodeURIComponent(`${emetteur}:${compte}`)}?secret=${secret}&issuer=${emetteur}&algorithm=SHA1&digits=6&period=30`;
}
