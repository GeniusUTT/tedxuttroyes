import { and, eq, inArray, isNull } from 'drizzle-orm';
import { categorie } from './categories';
import { base, schema } from './db';
import { envoyer } from './mail';
import { courrielNotification } from './mail/gabarits';
import { urlDeBase } from './url';

// Qui prévenir d'un dépôt ou d'un commentaire. Jamais l'auteur lui-même,
// jamais un compte désactivé, jamais qui a coupé ce type de notification.
// Ni l'objet ni le corps ne nomment le speaker : un e-mail se transfère, une
// notification de téléphone se lit par-dessus l'épaule.

type Evenement = { type: 'depot' | 'commentaire'; documentId: string; acteurId: string };

async function membres(): Promise<string[]> {
  const b = await base();
  return (await b.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.role, 'membre'))).map((x) => x.id);
}

export async function destinataires(ev: Evenement): Promise<string[]> {
  const b = await base();
  const [d] = await b.select().from(schema.document).where(eq(schema.document.id, ev.documentId));
  if (!d) return [];
  const ids = new Set<string>();
  if (d.rattachement === 'speaker' && d.speakerId) {
    const [s] = await b.select().from(schema.speaker).where(eq(schema.speaker.id, d.speakerId));
    const venantDuSpeaker = !!s?.userId && s.userId === ev.acteurId;
    if (venantDuSpeaker) {
      // Le speaker agit : son référent, à défaut toute l'équipe.
      if (s.referentId) ids.add(s.referentId);
      else for (const id of await membres()) ids.add(id);
    } else {
      // L'équipe agit : le speaker, et son référent s'il n'est pas l'auteur.
      if (s?.userId) ids.add(s.userId);
      if (s?.referentId) ids.add(s.referentId);
    }
  } else if (d.rattachement === 'tous_speakers') {
    const r = await b.select({ id: schema.speaker.userId }).from(schema.speaker)
      .where(and(eq(schema.speaker.editionId, d.editionId), isNull(schema.speaker.supprimeLe)));
    for (const x of r) if (x.id) ids.add(x.id);
  }
  ids.delete(ev.acteurId);
  if (!ids.size) return [];
  const actifs = await b.select({ id: schema.user.id }).from(schema.user).where(and(inArray(schema.user.id, [...ids]), isNull(schema.user.desactiveLe)));
  const prefs = await b.select().from(schema.preference).where(inArray(schema.preference.userId, [...ids]));
  return actifs.map((u) => u.id).filter((id) => {
    const p = prefs.find((x) => x.userId === id);
    return !p || (ev.type === 'depot' ? p.notifDepot : p.notifCommentaire);
  });
}

export async function notifier(ev: Evenement) {
  const ids = await destinataires(ev);
  if (!ids.length) return;
  const b = await base();
  const [d] = await b.select().from(schema.document).where(eq(schema.document.id, ev.documentId));
  const quoi = categorie(d!.categorie)?.libelle ?? 'Document';
  const ou = d!.rattachement === 'speaker' ? 'dans un dossier speaker' : 'pour tous les speakers';
  const phrase = ev.type === 'depot' ? `Nouveau dépôt ${ou} : « ${quoi} ».` : `Nouveau retour ${ou}, sur « ${quoi} ».`;
  const titre = ev.type === 'depot' ? 'Espace TEDxUTTroyes : nouveau document' : 'Espace TEDxUTTroyes : nouveau retour';
  const lien = `${urlDeBase()}/espace/documents/${ev.documentId}/`;
  const emails = await b.select({ email: schema.user.email }).from(schema.user).where(inArray(schema.user.id, ids));
  for (const { email } of emails) await envoyer({ a: email, ...courrielNotification(titre, phrase, lien) });
}

// Envoi après la réponse quand on est dans une requête Next.js ; sinon tout
// de suite (scripts, tests).
export async function enArrierePlan(f: () => Promise<void>) {
  try {
    const { after } = await import('next/server');
    after(f);
  } catch {
    await f();
  }
}
