import { randomUUID } from 'node:crypto';
import { base, schema } from './db';

// Le journal : qui a fait quoi, sur quoi. Jamais le contenu d'un document,
// jamais un code ou un jeton.

export type Action =
  | 'connexion' | 'connexion.echec' | 'connexion.code_demande' | 'deconnexion'
  | 'invitation.creee' | 'invitation.renvoyee' | 'invitation.revoquee' | 'invitation.acceptee' | 'invitation.refusee'
  | 'compte.role' | 'compte.poles' | 'compte.email' | 'compte.desactive' | 'compte.reactive' | 'compte.supprime' | 'compte.export'
  | 'session.fermee' | 'totp.active' | 'totp.echec' | 'totp.valide' | 'admin.secours'
  | 'document.depose' | 'document.lu' | 'document.supprime' | 'commentaire.cree' | 'commentaire.supprime'
  | 'jalon.valide' | 'jalon.modifie' | 'edition.modifiee' | 'pole.modifie' | 'speaker.modifie'
  | 'purge' | 'sauvegarde';

export async function noter(action: Action, o: { acteurId?: string | null; cibleType?: string; cibleId?: string; editionId?: string; details?: Record<string, unknown> } = {}) {
  const b = await base();
  await b.insert(schema.journal).values({
    id: randomUUID(),
    action,
    acteurId: o.acteurId ?? null,
    cibleType: o.cibleType ?? null,
    cibleId: o.cibleId ?? null,
    editionId: o.editionId ?? null,
    details: o.details ?? {},
  });
}
