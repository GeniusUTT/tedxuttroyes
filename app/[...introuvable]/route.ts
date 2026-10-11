import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Toute adresse que ni le site public ni l'espace ne connaissent reçoit la 404
// du site, octet pour octet, avec le statut 404 : pas de page Next.js ici.

let page: Buffer | undefined;

type Contexte = { params: Promise<{ introuvable: string[] }> };

async function introuvable(_requete: Request, { params }: Contexte): Promise<Response> {
  page ??= await readFile(join(process.cwd(), 'public', '404.html'));
  // Demandée par son nom, la page existe : Apache la servait en 200.
  const { introuvable: chemin } = await params;
  const direct = chemin.length === 1 && chemin[0] === '404.html';
  return new Response(new Uint8Array(page), {
    status: direct ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}

export const GET = introuvable;
export const HEAD = introuvable;
