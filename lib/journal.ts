import { randomUUID } from 'node:crypto';
import { base, schema } from './db';

// Le journal : qui a fait quoi, sur quoi. Jamais le contenu d'un document,
// jamais un code ou un jeton.

export type Action =
  | 'connexion' | 'connexion.echec' | 'connexion.lien_demande' | 'deconnexion'
  | 'invitation.creee' | 'invitation.renvoyee' | 'invitation.revoquee' | 'invitation.acceptee' | 'invitation.refusee'
  | 'compte.mot_de_passe' | 'compte.email' | 'compte.desactive' | 'compte.reactive' | 'compte.supprime' | 'compte.export'
  | 'session.fermee' | 'compte.secours'
  | 'document.depose' | 'document.lu' | 'document.supprime' | 'document.modele_refuse' | 'commentaire.cree' | 'commentaire.supprime'
  | 'jalon.valide' | 'jalon.modifie' | 'edition.modifiee' | 'speaker.modifie' | 'speaker.supprime'
  | 'prestataire.cree' | 'prestataire.modifie' | 'prestataire.supprime' | 'prestataire.acces_retire'
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
