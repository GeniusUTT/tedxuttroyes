import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Clé dérivée du secret de Better Auth : un secret de plus à gérer serait un
// secret de plus à perdre. Empreinte HMAC-SHA-256 pour les jetons
// d'invitation et de réinitialisation, et pour les clés de débit.

function secret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s || s.length < 32) throw new Error('BETTER_AUTH_SECRET absent ou trop court (32 caractères au moins)');
  return s;
}

function cle(usage: string): Buffer {
  return createHash('sha256').update(`${usage}:${secret()}`).digest();
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
