import { eq } from 'drizzle-orm';
import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it } from 'vitest';
import { connecter, creerCompte, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { base, schema } from '../../lib/db';
import { contexte, modifierFiche } from '../../lib/documents';
import { destinataires } from '../../lib/notifications';
import { changerEtatJalon, commenter, definirReferent, enregistrerPreferences, etats, jalons, RefusSuivi } from '../../lib/suivi';

let editionId = '';
const sessions = new Map<string, Map<string, string>>();
const ids = new Map<string, string>();

async function compte(email: string, role: 'speaker' | 'membre') {
  await creerCompte(editionId, email, role, `Fictif ${email.slice(0, 5)}`);
  expect(await connecter(email)).toEqual({ ok: true });
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

async function unDocumentDeA() {
  const b = await base();
  const [d] = await b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA));
  if (d) return d;
  // Un document posé directement : ce fichier teste le suivi, pas le dépôt.
  const id = crypto.randomUUID();
  await b.insert(schema.document).values({ id, editionId, rattachement: 'speaker', speakerId: speakerA, categorie: 'script', sens: 'du_speaker', titre: 'Script', creeParId: ids.get('suivi-a@exemple.com')! });
  return (await b.select().from(schema.document).where(eq(schema.document.id, id)))[0]!;
}

let speakerA = '';

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'membre', desactiveLe: new Date() });
  await compte('suivi-a@exemple.com', 'speaker');
  await compte('suivi-b@exemple.com', 'speaker');
  await compte('suivi-membre@utt.fr', 'membre');
  await compte('suivi-referente@utt.fr', 'membre');
  speakerA = (await en('suivi-a@exemple.com')).speakers[0]!;
});

describe('jalons', () => {
  it('une fiche complète passe le jalon « fiche » à « déposé » ; incomplète, rien ne bouge', async () => {
    const j = (await jalons(editionId)).find((x) => x.categorie === 'fiche')!;
    const ctx = await en('suivi-a@exemple.com');
    const fiche = { prenom: 'Camille', nom: 'Fictive', emailContact: 'camille@exemple.com', telephone: '', titreProvisoire: '', resume: 'Une idée.', biographie: 'Un parcours.' };
    await modifierFiche(ctx, speakerA, fiche);
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat ?? 'a_faire').toBe('a_faire');
    await modifierFiche(ctx, speakerA, { ...fiche, telephone: '06 12 34 56 78' });
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('depose');
  });

  it('seule l’équipe valide un jalon', async () => {
    const j = (await jalons(editionId))[0]!;
    await expect(changerEtatJalon(await en('suivi-a@exemple.com'), speakerA, j.id, 'valide')).rejects.toThrow(RefusSuivi);
    await changerEtatJalon(await en('suivi-membre@utt.fr'), speakerA, j.id, 'valide');
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('valide');
  });

  it('une fiche réenregistrée ne défait pas une validation', async () => {
    const j = (await jalons(editionId)).find((x) => x.categorie === 'fiche')!;
    await changerEtatJalon(await en('suivi-membre@utt.fr'), speakerA, j.id, 'valide');
    await modifierFiche(await en('suivi-a@exemple.com'), speakerA, { prenom: 'Camille', nom: 'Fictive', emailContact: 'camille@exemple.com', telephone: '06 12 34 56 78', titreProvisoire: 'Titre', resume: 'Une idée.', biographie: 'Un parcours.' });
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('valide');
  });
});

describe('notifications', () => {
  it('sans référent, un dépôt du speaker prévient toute l’équipe active, pas le speaker', async () => {
    const d = await unDocumentDeA();
    const qui = await destinataires({ type: 'depot', documentId: d.id, acteurId: ids.get('suivi-a@exemple.com')! });
    expect(qui).toContain(ids.get('suivi-membre@utt.fr'));
    expect(qui).toContain(ids.get('suivi-referente@utt.fr'));
    expect(qui).not.toContain(ids.get('suivi-a@exemple.com'));
    expect(qui).not.toContain(ids.get('suivi-b@exemple.com'));
    expect(qui).not.toContain('systeme');
  });

  it('avec un référent, c’est lui seul qui est prévenu ; un retour de l’équipe prévient le speaker', async () => {
    await definirReferent(await en('suivi-membre@utt.fr'), speakerA, ids.get('suivi-referente@utt.fr')!);
    const d = await unDocumentDeA();
    const qui = await destinataires({ type: 'depot', documentId: d.id, acteurId: ids.get('suivi-a@exemple.com')! });
    expect(qui).toEqual([ids.get('suivi-referente@utt.fr')]);
    const avant = (await courriels('suivi-a@exemple.com')).length;
    await commenter(await en('suivi-referente@utt.fr'), d.id, 'Bien reçu, merci.');
    const apres = await courriels('suivi-a@exemple.com');
    expect(apres.length).toBe(avant + 1);
    expect(apres.at(-1).sujet).not.toMatch(/Fictif|Camille/);
    expect(apres.at(-1).texte).not.toMatch(/Fictif|Camille/);
  });

  it('un speaker ne peut pas être référent', async () => {
    await expect(definirReferent(await en('suivi-membre@utt.fr'), speakerA, ids.get('suivi-b@exemple.com')!)).rejects.toThrow(RefusSuivi);
  });

  it('respecte les préférences', async () => {
    await enregistrerPreferences(ids.get('suivi-a@exemple.com')!, true, false);
    const d = await unDocumentDeA();
    expect(await destinataires({ type: 'commentaire', documentId: d.id, acteurId: ids.get('suivi-referente@utt.fr')! })).not.toContain(ids.get('suivi-a@exemple.com'));
  });
});

describe('commentaires', () => {
  it('un speaker ne commente pas le dossier d’un autre', async () => {
    const d = await unDocumentDeA();
    await expect(commenter(await en('suivi-b@exemple.com'), d.id, 'intrusion')).rejects.toThrow(RefusSuivi);
  });
});
