import { sql } from 'drizzle-orm';
import { base, schema } from './db';
import { empreinte } from './chiffrement';

// Limitation de débit en fenêtre fixe, stockée dans Postgres. La clé est
// hachée : une adresse e-mail n'apparaît pas en clair dans cette table.

export async function consommer(cle: string, max: number, fenetreSecondes: number): Promise<boolean> {
  const b = await base();
  const id = empreinte(cle, 'limite');
  const expiree = sql`${schema.limite.fenetreDebut} < now() - make_interval(secs => ${fenetreSecondes})`;
  const rows = await b
    .insert(schema.limite)
    .values({ cle: id, compte: 1, fenetreDebut: new Date() })
    .onConflictDoUpdate({
      target: schema.limite.cle,
      set: {
        compte: sql`case when ${expiree} then 1 else ${schema.limite.compte} + 1 end`,
        fenetreDebut: sql`case when ${expiree} then now() else ${schema.limite.fenetreDebut} end`,
      },
    })
    .returning({ compte: schema.limite.compte });
  return (rows[0]?.compte ?? 1) <= max;
}

export const LIMITES = {
  codeParEmail: { max: 5, fenetre: 3600 },
  codeParIp: { max: 20, fenetre: 3600 },
  essaiParIp: { max: 30, fenetre: 600 },
  totpParCompte: { max: 5, fenetre: 600 },
} as const;
