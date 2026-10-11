import { beforeAll, describe, expect, it } from 'vitest';
import { dernierCode, lienInvitation, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { demanderCode, seConnecter } from '../../lib/connexion';
import { base, schema } from '../../lib/db';
import { confirmerDepot, contexte, documents, lienTelechargement, preparerDepot, RefusDocument, supprimerDocument } from '../../lib/documents';
import { accepter, inviter } from '../../lib/invitations';
import { GET as telecharger } from '../../app/(espace)/espace/api/fichiers/[id]/route';
import { POST as envoyerLocal } from '../../app/(espace)/espace/api/stockage-local/route';

const PDF = new TextEncoder().encode('%PDF-1.7\n% document fictif\n');
let editionId = '';
const sessions = new Map<string, Map<string, string>>();

async function compte(email: string, role: 'speaker' | 'membre', poles: string[] = []) {
  await inviter({ email, role, editionId, poles, nomAffiche: `Fictif ${email.slice(0, 4)}`, derogation: false, parId: 'systeme' });
  await accepter(await lienInvitation(email));
  requete.cookies = new Map();
  await demanderCode(email);
  expect(await seConnecter(email, await dernierCode(email))).toEqual({ ok: true });
  sessions.set(email, requete.cookies);
}

async function en(email: string) {
  requete.cookies = sessions.get(email)!;
  const a = await acteurCourant();
  return contexte(a!);
}

async function deposer(email: string, d: Parameters<typeof preparerDepot>[1], corps: Uint8Array, attestation = true) {
  const ctx = await en(email);
  const { envoiId, formulaire } = await preparerDepot(ctx, d);
  const f = new FormData();
  for (const [k, v] of Object.entries(formulaire.champs)) f.set(k, v);
  f.set('file', new File([new Uint8Array(corps)], d.nom));
  const r = await envoyerLocal(new Request(formulaire.url, { method: 'POST', body: f }));
  expect(r.status).toBe(204);
  return confirmerDepot(ctx, envoiId, attestation);
}

let speakerA = '', speakerB = '';

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'admin' });
  const poles = await b.select().from(schema.pole);
  await compte('speaker-a@exemple.com', 'speaker');
  await compte('speaker-b@exemple.com', 'speaker');
  await compte('membre-sans-pole@utt.fr', 'membre');
  await compte('membre-logistique@utt.fr', 'membre', [poles.find((p) => p.slug === 'logistique')!.id]);
  speakerA = (await en('speaker-a@exemple.com')).speakers[0]!;
  speakerB = (await en('speaker-b@exemple.com')).speakers[0]!;
});

describe('documents', () => {
  it('dépose des slides avec attestation et garde l’historique des versions', async () => {
    const d = { rattachement: 'speaker' as const, speakerId: speakerA, categorie: 'slides', nom: 'slides.pdf', taille: PDF.length };
    const v1 = await deposer('speaker-a@exemple.com', d, PDF);
    const v2 = await deposer('speaker-a@exemple.com', { ...d, nom: 'slides-v2.pdf' }, PDF);
    expect(v2.documentId).toBe(v1.documentId);
    const liste = await documents(await en('speaker-a@exemple.com'), { rattachement: 'speaker', speakerId: speakerA });
    expect(liste[0]!.versions.map((v) => v.numero)).toEqual([2, 1]);
  });

  it('refuse les slides sans attestation', async () => {
    await expect(deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'slides', nom: 's.pdf', taille: PDF.length }, PDF, false))
      .rejects.toThrow(/attestation/);
  });

  it('refuse un format hors liste et un fichier trop lourd', async () => {
    const ctx = await en('speaker-a@exemple.com');
    await expect(preparerDepot(ctx, { rattachement: 'speaker', speakerId: speakerA, categorie: 'script', nom: 'page.html', taille: 10 })).rejects.toThrow(/Format/);
    await expect(preparerDepot(ctx, { rattachement: 'speaker', speakerId: speakerA, categorie: 'release', nom: 'r.pdf', taille: 11 * 1024 * 1024 })).rejects.toThrow(/lourd/);
  });

  it('refuse un fichier dont le contenu ne correspond pas à l’extension', async () => {
    await expect(deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'release', nom: 'faux.pdf', taille: 20 }, new TextEncoder().encode('<script>alert(1)</script>')))
      .rejects.toThrow(/format/);
  });
});

describe('un speaker ne peut rien du dossier d’un autre, même en devinant les identifiants', () => {
  it('ni lister, ni télécharger, ni déposer, ni supprimer', async () => {
    const { documentId, versionId } = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'script', nom: 'script.pdf', taille: PDF.length }, PDF);
    const b = await en('speaker-b@exemple.com');
    expect(await documents(b, { rattachement: 'speaker', speakerId: speakerA })).toEqual([]);
    expect(await lienTelechargement(b, versionId)).toBeNull();
    await expect(preparerDepot(b, { rattachement: 'speaker', speakerId: speakerA, categorie: 'script', nom: 'x.pdf', taille: 10 })).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(b, { rattachement: 'speaker', speakerId: speakerB, documentId, categorie: 'script', nom: 'x.pdf', taille: 10 })).rejects.toThrow(RefusDocument);
    await expect(supprimerDocument(b, documentId)).rejects.toThrow(RefusDocument);
    const r = await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: versionId }) });
    expect(r.status).toBe(404);
    const inconnu = await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: crypto.randomUUID() }) });
    expect(inconnu.status).toBe(404);
    expect(await r.text()).toBe(await inconnu.text());
  });

  it('le propriétaire et un membre de pôle obtiennent une URL signée ; un membre sans pôle non ; sans session, 404', async () => {
    const { versionId } = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'fiche_technique', nom: 'ft.pdf', taille: PDF.length }, PDF);
    await en('speaker-a@exemple.com');
    const r = await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: versionId }) });
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toMatch(/sig=/);
    expect(await lienTelechargement(await en('membre-logistique@utt.fr'), versionId)).toBeTruthy();
    expect(await lienTelechargement(await en('membre-sans-pole@utt.fr'), versionId)).toBeNull();
    requete.cookies = new Map();
    expect((await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: versionId }) })).status).toBe(404);
  });

  it('un membre de pôle dépose vers le speaker, mais pas à sa place', async () => {
    const m = await en('membre-logistique@utt.fr');
    await expect(preparerDepot(m, { rattachement: 'speaker', speakerId: speakerA, categorie: 'billets', nom: 'billet.pdf', taille: PDF.length })).resolves.toBeTruthy();
    await expect(preparerDepot(m, { rattachement: 'speaker', speakerId: speakerA, categorie: 'slides', nom: 's.pdf', taille: PDF.length })).rejects.toThrow(RefusDocument);
  });
});
