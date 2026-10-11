import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Clé dérivée du secret de Better Auth : un secret de plus à gérer serait un
// secret de plus à perdre. Chiffrement AES-256-GCM pour les secrets TOTP,
// empreinte HMAC-SHA-256 pour les jetons d'invitation et les clés de débit.

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('BETTER_AUTH_SECRET absent ou trop court (32 caractères au moins)');
  return s;
}

function cle(usage: string): Buffer {
  return createHash('sha256').update(`${usage}:${secret()}`).digest();
}

export function chiffrer(clair: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', cle('totp'), iv);
  const corps = Buffer.concat([c.update(clair, 'utf8'), c.final()]);
  return [iv, c.getAuthTag(), corps].map((b) => b.toString('base64url')).join('.');
}

export function dechiffrer(chiffre: string): string {
  const [iv, tag, corps] = chiffre.split('.').map((p) => Buffer.from(p, 'base64url'));
  if (!iv || !tag || !corps) throw new Error('secret chiffré illisible');
  const d = createDecipheriv('aes-256-gcm', cle('totp'), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(corps), d.final()]).toString('utf8');
}

export function empreinte(valeur: string, usage = 'jeton'): string {
  return createHmac('sha256', cle(usage)).update(valeur).digest('base64url');
}

export function jetonAleatoire(octets = 32): string {
  return randomBytes(octets).toString('base64url');
}

export function egalEnTempsConstant(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
