import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { connecter, creerCompte, lienInvitation, MDP, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { base, schema } from '../../lib/db';
import { confirmerDepot, contexte, documentLisible, documents, lienTelechargement, preparerDepot, RefusDocument } from '../../lib/documents';
import { accepter, inviter, RefusInvitation } from '../../lib/invitations';
import { destinataires } from '../../lib/notifications';
import { creerPrestataire, modifierFichePrestataire } from '../../lib/prestataires';
import { supprimerPrestataire } from '../../lib/rgpd';
import { stockage } from '../../lib/storage';
import { exporterBase } from '../../lib/taches';

const PDF = new TextEncoder().encode('%PDF-1.7\n% fictif\n');
let editionId = '';
const sessions = new Map<string, Map<string, string>>();
let membreId = '';

async function en(email: string) {
  requete.cookies = sessions.get(email)!;
  return contexte((await acteurCourant())!);
}

async function ouvrir(email: string) {
  expect(await connecter(email)).toEqual({ ok: true });
  sessions.set(email, requete.cookies);
}

async function inviterDans(prestataireId: string, email: string) {
  await inviter({ email, role: 'prestataire', editionId, nomAffiche: `Fictif ${email.slice(0, 4)}`, derogation: false, parId: membreId, prestataireId });
  await accepter(await lienInvitation(email), MDP, MDP);
  await ouvrir(email);
}

async function deposer(email: string, d: Parameters<typeof preparerDepot>[1]) {
  const ctx = await en(email);
  const { envoiId } = await preparerDepot(ctx, d);
  const b = await base();
  const [e] = await b.select().from(schema.envoi).where(eq(schema.envoi.id, envoiId));
  await (await stockage()).ecrire(e!.cle, PDF, 'application/pdf');
  return confirmerDepot(ctx, envoiId, true);
}

const pourX = (categorie: string) => ({ rattachement: 'prestataire' as const, prestataireId: x, categorie, nom: `${categorie}.pdf`, taille: PDF.length });

let x = '', y = '', speaker = '';

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'membre' });
  await creerCompte(editionId, 'membre-presta@utt.fr', 'membre');
  await ouvrir('membre-presta@utt.fr');
  membreId = (await en('membre-presta@utt.fr')).id;
  await creerCompte(editionId, 'speaker-presta@exemple.com', 'speaker');
  await ouvrir('speaker-presta@exemple.com');
  speaker = (await en('speaker-presta@exemple.com')).speakers[0]!;
  const m = await en('membre-presta@utt.fr');
  x = await creerPrestataire(m, 'Régie Fictive', 'Son et lumière');
  y = await creerPrestataire(m, 'Traiteur Fictif', 'Buffet');
  await inviterDans(x, 'regie-un@exemple.com');
  await inviterDans(x, 'regie-deux@exemple.com');
  await inviterDans(y, 'traiteur@exemple.com');
});

describe('prestataires', () => {
  it('un prestataire ne s’invite que dans un dossier existant', async () => {
    await expect(inviter({ email: 'perdu@exemple.com', role: 'prestataire', editionId, nomAffiche: '', derogation: false, parId: membreId }))
      .rejects.toThrow(RefusInvitation);
    await expect(inviter({ email: 'perdu@exemple.com', role: 'prestataire', editionId, nomAffiche: '', derogation: false, parId: membreId, prestataireId: 'inconnu' }))
      .rejects.toThrow(RefusInvitation);
  });

  it('plusieurs personnes partagent le dossier de leur structure, et lui seul', async () => {
    expect((await en('regie-un@exemple.com')).prestataires).toEqual([x]);
    expect((await en('regie-deux@exemple.com')).prestataires).toEqual([x]);
    expect((await en('traiteur@exemple.com')).prestataires).toEqual([y]);
    const facture = await deposer('regie-un@exemple.com', pourX('facture'));
    const autre = await en('regie-deux@exemple.com');
    expect((await documents(autre, { rattachement: 'prestataire', prestataireId: x })).map((d) => d.id)).toContain(facture.documentId);
    expect(await lienTelechargement(autre, facture.versionId)).toBeTruthy();
    const traiteur = await en('traiteur@exemple.com');
    expect(await documentLisible(traiteur, facture.documentId)).toBeNull();
    expect(await lienTelechargement(traiteur, facture.versionId)).toBeNull();
    expect(await documentLisible(await en('speaker-presta@exemple.com'), facture.documentId)).toBeNull();
  });

  it('ni dossier speaker pour un prestataire, ni catégorie croisée', async () => {
    const regie = await en('regie-un@exemple.com');
    await expect(preparerDepot(regie, { rattachement: 'speaker', speakerId: speaker, categorie: 'script', nom: 's.pdf', taille: 10 })).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(regie, { ...pourX('script'), nom: 's.pdf' })).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(regie, pourX('contrat'))).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(regie, { ...pourX('devis'), prestataireId: y })).rejects.toThrow(RefusDocument);
    const m = await en('membre-presta@utt.fr');
    await expect(preparerDepot(m, { rattachement: 'speaker', speakerId: speaker, categorie: 'facture', nom: 'f.pdf', taille: 10 })).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(m, { rattachement: 'prestataire', prestataireId: x, categorie: 'billets', nom: 'b.pdf', taille: 10 })).rejects.toThrow(RefusDocument);
  });

  it('l’équipe envoie un contrat ; toute la structure est prévenue, jamais la voisine', async () => {
    const contrat = await deposer('membre-presta@utt.fr', pourX('contrat'));
    const b = await base();
    const ids = await destinataires({ type: 'depot', documentId: contrat.documentId, acteurId: membreId });
    const emails = (await b.select({ id: schema.user.id, email: schema.user.email }).from(schema.user)).filter((u) => ids.includes(u.id)).map((u) => u.email).sort();
    expect(emails).toEqual(['regie-deux@exemple.com', 'regie-un@exemple.com']);
    const devis = await deposer('regie-un@exemple.com', pourX('devis'));
    const regieUn = (await en('regie-un@exemple.com')).id;
    const ids2 = await destinataires({ type: 'depot', documentId: devis.documentId, acteurId: regieUn });
    expect(ids2).toContain(membreId);
    expect(ids2).not.toContain(regieUn);
    expect(ids2).toContain((await en('regie-deux@exemple.com')).id);
    expect(ids2).not.toContain((await en('traiteur@exemple.com')).id);
  });

  it('la fiche se remplit par la structure, jamais par une autre', async () => {
    const f = { structure: 'Régie Fictive', prestation: 'Son', contact: 'Personne Fictive', emailContact: 'contact@exemple.com', telephone: '01 02 03 04 05', adresse: '1 rue Fictive' };
    await modifierFichePrestataire(await en('regie-deux@exemple.com'), x, f);
    await expect(modifierFichePrestataire(await en('traiteur@exemple.com'), x, f)).rejects.toThrow(RefusDocument);
    await expect(modifierFichePrestataire(await en('regie-un@exemple.com'), x, { ...f, telephone: 'abc' })).rejects.toThrow(/téléphone/);
  });

  it('la suppression archive devis, factures et contrats, efface le reste et les comptes', async () => {
    const technique = await deposer('regie-un@exemple.com', pourX('technique'));
    await inviter({ email: 'regie-trois@exemple.com', role: 'prestataire', editionId, nomAffiche: '', derogation: false, parId: membreId, prestataireId: x });
    const jeton = await lienInvitation('regie-trois@exemple.com');
    const b = await base();
    expect(Object.keys(await exporterBase())).toEqual(expect.arrayContaining(['prestataire', 'prestataire_compte']));
    await supprimerPrestataire(x, editionId, membreId);
    for (const email of ['regie-un@exemple.com', 'regie-deux@exemple.com']) {
      expect(await b.select().from(schema.user).where(eq(schema.user.email, email))).toHaveLength(0);
    }
    const restants = await b.select().from(schema.document).where(eq(schema.document.prestataireId, x));
    expect(restants.map((d) => d.categorie).sort()).toEqual(['contrat', 'devis', 'facture']);
    expect(restants.every((d) => d.archive)).toBe(true);
    expect(restants.map((d) => d.id)).not.toContain(technique.documentId);
    const [p] = await b.select().from(schema.prestataire).where(eq(schema.prestataire.id, x));
    expect(p?.supprimeLe).toBeTruthy();
    expect(p?.structure).toBe('Régie Fictive');
    expect(p?.emailContact).toBe('');
    await expect(accepter(jeton, MDP, MDP)).rejects.toThrow(RefusInvitation);
    // La structure voisine n'est pas touchée.
    expect((await en('traiteur@exemple.com')).prestataires).toEqual([y]);
  });
});
