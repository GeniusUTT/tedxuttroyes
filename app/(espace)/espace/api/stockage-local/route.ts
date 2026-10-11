import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { egalEnTempsConstant } from '@/lib/chiffrement';
import { disposition } from '@/lib/storage';
import { cheminLocal, signer } from '@/lib/storage/local';

// Le stockage local du développement et des tests, avec les mêmes contrôles
// qu'un POST présigné S3. N'existe pas en production.

const actif = () => process.env.STORAGE_DRIVER === 'local' && process.env.VERCEL_ENV !== 'production';
const refus = (s = 403) => new Response(null, { status: s });

export async function POST(r: Request) {
  if (!actif()) return refus(404);
  const f = await r.formData();
  const cle = String(f.get('key') ?? ''), type = String(f.get('Content-Type') ?? '');
  const max = Number(f.get('max')), exp = Number(f.get('exp')), sig = String(f.get('sig') ?? '');
  const fichier = f.get('file');
  if (!(fichier instanceof File) || Date.now() > exp || !egalEnTempsConstant(sig, signer('envoi', cle, type, max, exp))) return refus();
  if (fichier.size < 1 || fichier.size > max) return refus(400);
  const p = cheminLocal(cle);
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, new Uint8Array(await fichier.arrayBuffer()));
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}

export async function GET(r: Request) {
  if (!actif()) return refus(404);
  const q = new URL(r.url).searchParams;
  const cle = q.get('key') ?? '', nom = q.get('nom') ?? '', type = q.get('type') ?? '', exp = Number(q.get('exp')), sig = q.get('sig') ?? '';
  if (Date.now() > exp || !egalEnTempsConstant(sig, signer('lecture', cle, nom, type, exp))) return refus();
  try {
    const corps = await readFile(cheminLocal(cle));
    return new Response(new Uint8Array(corps), { headers: { 'Content-Type': type, 'Content-Disposition': disposition(nom), 'Cache-Control': 'private, no-store' } });
  } catch {
    return refus(404);
  }
}
