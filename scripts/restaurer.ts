// Restauration d'une sauvegarde quotidienne dans une base VIDE (migrations
// appliquées). Procédure complète dans le README, section « Sauvegardes ».
//
//   npx tsx --env-file=.env.restauration scripts/restaurer.ts base/2026-10-11.json.gz
//   npx tsx --env-file=.env.restauration scripts/restaurer.ts ./sauvegarde.json.gz
//
// Le premier argument est une clé du seau de sauvegardes, ou un fichier local.

import { existsSync, readFileSync } from 'node:fs';
import { count } from 'drizzle-orm';
import { base, schema } from '../lib/db';
import { depaqueter, restaurerBase, stockageSauvegardes } from '../lib/taches';
import { migrer } from './migrer';

async function principal() {
  const source = process.argv[2];
  if (!source) {
    console.error('Usage : restaurer.ts <clé du seau ou fichier .json.gz>');
    process.exit(2);
  }
  await migrer({ amorcer: false });
  const b = await base();
  const [n] = await b.select({ n: count() }).from(schema.user);
  const [e] = await b.select({ n: count() }).from(schema.edition);
  if ((n?.n ?? 0) > 0 || (e?.n ?? 0) > 0) {
    console.error('La base cible contient déjà des comptes : restauration refusée. Utilisez une base neuve (nouvelle branche Neon).');
    process.exit(1);
  }
  const octets = existsSync(source) ? new Uint8Array(readFileSync(source)) : await (await stockageSauvegardes()).s.lire(source);
  const tables = depaqueter(octets);
  await restaurerBase(tables);
  for (const [t, lignes] of Object.entries(tables)) console.info(`${t} : ${lignes.length}`);
  console.info('Restauration terminée.');
}

principal().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
