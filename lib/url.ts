// L'URL de base de l'espace, réglée par environnement : la production sur le
// domaine canonique, une prévisualisation sur sa propre adresse de branche,
// le développement sur localhost. Aucune ne pointe vers une autre.

export function urlDeBase(): string {
  if (process.env.ESPACE_URL) return process.env.ESPACE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_ENV === 'production') return 'https://tedxuttroyes.fr';
  const hote = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  if (hote) return `https://${hote}`;
  return 'http://localhost:3000';
}
