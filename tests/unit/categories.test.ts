import { describe, expect, it } from 'vitest';
import { extensionDe, lienValide, signatureValide } from '../../lib/categories';

const octets = (...x: number[]) => new Uint8Array(x);
const texte = (s: string) => new TextEncoder().encode(s);

describe('formats', () => {
  it('lit l’extension sans tenir compte de la casse', () => {
    expect(extensionDe('Slides FINAL.PPTX')).toBe('pptx');
    expect(extensionDe('script')).toBeNull();
    expect(extensionDe('page.html')).toBeNull();
    expect(extensionDe('image.svg')).toBeNull();
  });
  it('vérifie la signature binaire', () => {
    expect(signatureValide('pdf', texte('%PDF-1.7'))).toBe(true);
    expect(signatureValide('pdf', texte('<html>'))).toBe(false);
    expect(signatureValide('png', octets(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(true);
    expect(signatureValide('jpg', octets(0xff, 0xd8, 0xff, 0xe0))).toBe(true);
    expect(signatureValide('pptx', octets(0x50, 0x4b, 0x03, 0x04))).toBe(true);
    expect(signatureValide('txt', octets(0x41, 0x00, 0x42))).toBe(false);
  });
  it('n’accepte que des liens https', () => {
    expect(lienValide('https://youtu.be/x')).toBe(true);
    expect(lienValide('http://youtu.be/x')).toBe(false);
    expect(lienValide('javascript:alert(1)')).toBe(false);
  });
});
