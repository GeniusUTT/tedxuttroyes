import { describe, expect, it } from 'vitest';
import { base32, codeAuPas, depuisBase32, pasCourant, verifierCode } from '../../lib/totp';

// Vecteur de la RFC 6238 (SHA-1) : secret ASCII « 12345678901234567890 ».
const SECRET = base32(Buffer.from('12345678901234567890'));

describe('TOTP', () => {
  it('fait l’aller-retour base32', () => {
    expect(depuisBase32(SECRET).toString()).toBe('12345678901234567890');
  });
  it('reproduit les vecteurs de la RFC 6238', () => {
    expect(codeAuPas(SECRET, Math.floor(59 / 30))).toBe('287082');
    expect(codeAuPas(SECRET, Math.floor(1111111109 / 30))).toBe('081804');
    expect(codeAuPas(SECRET, Math.floor(1234567890 / 30))).toBe('005924');
  });
  it('accepte le pas voisin mais jamais un pas déjà utilisé', () => {
    const t = 1_700_000_000_000;
    const p = pasCourant(t);
    const code = codeAuPas(SECRET, p);
    expect(verifierCode(SECRET, code, null, t)).toBe(p);
    expect(verifierCode(SECRET, code, p, t)).toBeNull();
    expect(verifierCode(SECRET, codeAuPas(SECRET, p - 1), null, t)).toBe(p - 1);
    expect(verifierCode(SECRET, codeAuPas(SECRET, p - 2), null, t)).toBeNull();
    expect(verifierCode(SECRET, 'abcdef', null, t)).toBeNull();
  });
});
