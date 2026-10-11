import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { dernierCode, lienInvitation, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { demanderCode, seConnecter } from '../../lib/connexion';
import { base, schema } from '../../lib/db';
import { contexte, enregistrerLien } from '../../lib/documents';
import { accepter, inviter } from '../../lib/invitations';
import { destinataires } from '../../lib/notifications';
import { changerEtatJalon, commenter, definirReferent, enregistrerPreferences, etats, jalons, RefusSuivi } from '../../lib/suivi';

let editionId = '';
const sessions = new Map<string, Map<string, string>>();
const ids = new Map<string, string>();

async function compte(email: string, role: 'speaker' | 'membre', poles: string[] = []) {
  await inviter({ email, role, editionId, poles, nomAffiche: `Fictif ${email.slice(0, 5)}`, derogation: false, parId: 'systeme' });
  await accepter(await lienInvitation(email));
  requete.cookies = new Map();
  await demanderCode(email);
  expect(await seConnecter(email, await dernierCode(email))).toEqual({ ok: true });
  sessions.set(email, requete.cookies);
  ids.set(email, (await acteurCourant())!.id);
}

async function en(email: string) {
  requete.cookies = sessions.get(email)!;
  return contexte((await acteurCourant())!);
}

async function courriels(a: string) {
  try {
    return (await readFile(process.env.ESPACE_FICHIER_COURRIELS!, 'utf8')).trim().split('\n').map((l) => JSON.parse(l)).filter((c) => c.a === a);
  } catch {
    return [];
  }
}

let speakerA = '';

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'admin', desactiveLe: new Date() });
  const poles = await b.select().from(schema.pole);
  const pid = (slug: string) => poles.find((p) => p.slug === slug)!.id;
  await compte('speaker-a@exemple.com', 'speaker');
  await compte('speaker-b@exemple.com', 'speaker');
  await compte('prospecteur@utt.fr', 'membre', [pid('prospection-speakers')]);
  await compte('referente@utt.fr', 'membre', [pid('logistique')]);
  await compte('logisticien@utt.fr', 'membre', [pid('logistique')]);
  speakerA = (await en('speaker-a@exemple.com')).speakers[0]!;
});

describe('jalons', () => {
  it('un dépôt du speaker passe le jalon lié à « déposé »', async () => {
    const ctx = await en('speaker-a@exemple.com');
    await enregistrerLien(ctx, speakerA, 'https://video.exemple.com/repetition');
    const j = (await jalons(editionId)).find((x) => x.categorie === 'video_repetition')!;
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('depose');
  });

  it('seul le pôle Prospection Speakers (ou un admin) valide', async () => {
    const j = (await jalons(editionId))[0]!;
    await expect(changerEtatJalon(await en('logisticien@utt.fr'), speakerA, j.id, 'valide')).rejects.toThrow(RefusSuivi);
    await expect(changerEtatJalon(await en('speaker-a@exemple.com'), speakerA, j.id, 'valide')).rejects.toThrow(RefusSuivi);
    await changerEtatJalon(await en('prospecteur@utt.fr'), speakerA, j.id, 'valide');
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('valide');
  });
});

describe('notifications', () => {
  it('sans référent, un dépôt du speaker prévient le pôle Prospection Speakers, pas les autres', async () => {
    const d = await base().then((b) => b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA)));
    const qui = await destinataires({ type: 'depot', documentId: d[0]!.id, acteurId: ids.get('speaker-a@exemple.com')! });
    expect(qui).toContain(ids.get('prospecteur@utt.fr'));
    expect(qui).not.toContain(ids.get('logisticien@utt.fr'));
    expect(qui).not.toContain(ids.get('speaker-a@exemple.com'));
    expect(qui).not.toContain('systeme');
  });

  it('avec un référent, c’est lui qui est prévenu ; un retour de l’équipe prévient le speaker', async () => {
    await definirReferent(await en('prospecteur@utt.fr'), speakerA, ids.get('referente@utt.fr')!);
    const [d] = await base().then((b) => b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA)));
    const qui = await destinataires({ type: 'depot', documentId: d!.id, acteurId: ids.get('speaker-a@exemple.com')! });
    expect(qui).toContain(ids.get('referente@utt.fr'));
    expect(qui).not.toContain(ids.get('prospecteur@utt.fr'));
    const avant = (await courriels('speaker-a@exemple.com')).length;
    await commenter(await en('referente@utt.fr'), d!.id, 'Bien reçu, merci.');
    const apres = await courriels('speaker-a@exemple.com');
    expect(apres.length).toBe(avant + 1);
    expect(apres.at(-1).sujet).not.toMatch(/Fictif/);
    expect(apres.at(-1).texte).not.toMatch(/Fictif/);
  });

  it('respecte les préférences', async () => {
    await enregistrerPreferences(ids.get('speaker-a@exemple.com')!, true, false);
    const [d] = await base().then((b) => b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA)));
    expect(await destinataires({ type: 'commentaire', documentId: d!.id, acteurId: ids.get('referente@utt.fr')! })).not.toContain(ids.get('speaker-a@exemple.com'));
  });
});

describe('commentaires', () => {
  it('un speaker ne commente pas le dossier d’un autre', async () => {
    const [d] = await base().then((b) => b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA)));
    await expect(commenter(await en('speaker-b@exemple.com'), d!.id, 'intrusion')).rejects.toThrow(RefusSuivi);
  });
});
