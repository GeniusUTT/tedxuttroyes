import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Toute adresse que ni le site public ni l'espace ne connaissent reçoit la 404
// du site, octet pour octet, avec le statut 404 : pas de page Next.js ici.

let page: Buffer | undefined;

async function introuvable(): Promise<Response> {
  page ??= await readFile(join(process.cwd(), 'public', '404.html'));
  return new Response(new Uint8Array(page), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export const GET = introuvable;
export const HEAD = introuvable;
