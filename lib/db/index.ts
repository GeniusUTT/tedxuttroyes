import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Neon en production et en prévisualisation (URL poolée). Pour le
// développement et les tests, une URL « pglite:<dossier> » ou « pglite:memoire »
// ouvre un Postgres embarqué : aucune base distante n'est nécessaire.

export type Base = ReturnType<typeof drizzleNeon<typeof schema>>;

const globalPourBase = globalThis as unknown as { __base?: Base };

async function ouvrirPglite(chemin: string): Promise<Base> {
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const client = new PGlite(chemin === 'memoire' ? undefined : chemin);
  return drizzle({ client, schema, casing: 'snake_case' }) as unknown as Base;
}

function ouvrirNeon(url: string): Base {
  if (typeof WebSocket !== 'undefined') neonConfig.webSocketConstructor = WebSocket;
  return drizzleNeon({ client: new Pool({ connectionString: url }), schema, casing: 'snake_case' });
}

let enCours: Promise<Base> | undefined;

export function base(): Promise<Base> {
  if (globalPourBase.__base) return Promise.resolve(globalPourBase.__base);
  enCours ??= (async () => {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL manquante');
    const b = url.startsWith('pglite:') ? await ouvrirPglite(url.slice('pglite:'.length)) : ouvrirNeon(url);
    globalPourBase.__base = b;
    return b;
  })();
  return enCours;
}

export function fixerBase(b: Base) {
  globalPourBase.__base = b;
}

export { schema };
