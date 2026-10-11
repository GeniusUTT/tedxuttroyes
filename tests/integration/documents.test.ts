import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { connecter, creerCompte, preparer, requete } from './outils';
import { acteurCourant, editionCourante } from '../../lib/acces';
import { base, schema } from '../../lib/db';
import { confirmerDepot, contexte, documents, enregistrerLienVideo, lienTelechargement, modifierFiche, preparerDepot, RefusDocument, supprimerDocument } from '../../lib/documents';
import { etats, jalons } from '../../lib/suivi';
import { GET as telecharger } from '../../app/(espace)/espace/api/fichiers/[id]/route';
import { POST as envoyerLocal } from '../../app/(espace)/espace/api/stockage-local/route';

const PDF = new TextEncoder().encode('%PDF-1.7\n% document fictif\n');
const MODELE = new TextEncoder().encode('%PDF-1.7\n% modele de Release, a signer\n');
const SIGNE = new TextEncoder().encode('%PDF-1.7\n% modele de Release, a signer\n% signature fictive\n');
let editionId = '';
const sessions = new Map<string, Map<string, string>>();

async function compte(email: string, role: 'speaker' | 'membre') {
  await creerCompte(editionId, email, role, `Fictif ${email.slice(0, 4)}`);
  expect(await connecter(email)).toEqual({ ok: true });
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
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'membre' });
  await compte('speaker-a@exemple.com', 'speaker');
  await compte('speaker-b@exemple.com', 'speaker');
  await compte('membre@utt.fr', 'membre');
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

  it('refuse un format hors liste, un fichier trop lourd et une catégorie retirée', async () => {
    const ctx = await en('speaker-a@exemple.com');
    await expect(preparerDepot(ctx, { rattachement: 'speaker', speakerId: speakerA, categorie: 'script', nom: 'page.html', taille: 10 })).rejects.toThrow(/Format/);
    await expect(preparerDepot(ctx, { rattachement: 'speaker', speakerId: speakerA, categorie: 'release', nom: 'r.pdf', taille: 11 * 1024 * 1024 })).rejects.toThrow(/lourd/);
    await expect(preparerDepot(ctx, { rattachement: 'speaker', speakerId: speakerA, categorie: 'fiche_technique', nom: 'f.pdf', taille: 10 })).rejects.toThrow(/inconnue/);
  });

  it('refuse un fichier dont le contenu ne correspond pas à l’extension', async () => {
    await expect(deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'release', nom: 'faux.pdf', taille: 20 }, new TextEncoder().encode('<script>alert(1)</script>')))
      .rejects.toThrow(/format/);
  });

  it('accepte plusieurs photos haute qualité', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const p1 = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'photo_hd', titre: 'Portrait', nom: 'portrait.png', taille: png.length }, png);
    const p2 = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'photo_hd', titre: 'En pied', nom: 'pied.png', taille: png.length }, png);
    expect(p2.documentId).not.toBe(p1.documentId);
  });
});

describe('modèles à signer', () => {
  it('le modèle se dépose pour tous les speakers, par l’équipe seulement, jamais dans un dossier', async () => {
    await expect(preparerDepot(await en('speaker-a@exemple.com'), { rattachement: 'tous_speakers', categorie: 'modele_release', nom: 'm.pdf', taille: MODELE.length })).rejects.toThrow(RefusDocument);
    await expect(preparerDepot(await en('membre@utt.fr'), { rattachement: 'speaker', speakerId: speakerA, categorie: 'modele_release', nom: 'm.pdf', taille: MODELE.length })).rejects.toThrow(RefusDocument);
    const m = await deposer('membre@utt.fr', { rattachement: 'tous_speakers', categorie: 'modele_release', nom: 'speaker-release.pdf', taille: MODELE.length }, MODELE);
    const b = await base();
    const [v] = await b.select().from(schema.version).where(eq(schema.version.id, m.versionId));
    expect(v?.empreinte).toMatch(/^[0-9a-f]{64}$/);
    expect(await lienTelechargement(await en('speaker-b@exemple.com'), m.versionId)).toBeTruthy();
  });

  it('refuse la Release renvoyée telle quelle, sans signature, et efface le fichier', async () => {
    const d = { rattachement: 'speaker' as const, speakerId: speakerA, categorie: 'release', nom: 'speaker-release.pdf', taille: MODELE.length };
    await expect(deposer('speaker-a@exemple.com', d, MODELE)).rejects.toThrow(/modèle vierge/);
    const b = await base();
    expect(await b.select().from(schema.document).where(eq(schema.document.speakerId, speakerA))).not.toContainEqual(expect.objectContaining({ categorie: 'release' }));
    expect((await b.select().from(schema.envoi).where(eq(schema.envoi.speakerId, speakerA))).filter((e) => e.categorie === 'release')).toHaveLength(0);
  });

  it('accepte la Release signée, garde son empreinte et passe le jalon à « déposé »', async () => {
    const r = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'release', nom: 'release-signee.pdf', taille: SIGNE.length }, SIGNE);
    const b = await base();
    const [v] = await b.select().from(schema.version).where(eq(schema.version.id, r.versionId));
    expect(v?.empreinte).toMatch(/^[0-9a-f]{64}$/);
    const j = (await jalons(editionId)).find((x) => x.categorie === 'release')!;
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('depose');
  });

  it('un nouveau modèle remplace l’ancien sans oublier sa version : l’ancien reste refusé', async () => {
    const MODELE_2 = new TextEncoder().encode('%PDF-1.7\n% modele de Release, version 2\n');
    const m2 = await deposer('membre@utt.fr', { rattachement: 'tous_speakers', categorie: 'modele_release', nom: 'speaker-release-v2.pdf', taille: MODELE_2.length }, MODELE_2);
    const b = await base();
    expect((await b.select().from(schema.version).where(eq(schema.version.documentId, m2.documentId))).length).toBe(2);
    for (const corps of [MODELE, MODELE_2]) {
      await expect(deposer('speaker-b@exemple.com', { rattachement: 'speaker', speakerId: speakerB, categorie: 'release', nom: 'r.pdf', taille: corps.length }, corps)).rejects.toThrow(/modèle vierge/);
    }
  });
});

describe('fiche et lien vidéo', () => {
  it('le speaker remplit sa fiche ; complète, elle passe le jalon « fiche » à « déposé »', async () => {
    const ctx = await en('speaker-a@exemple.com');
    const fiche = { prenom: 'Camille', nom: 'Fictive', emailContact: 'camille@exemple.com', telephone: '06 12 34 56 78', titreProvisoire: 'Un talk fictif', resume: 'Une idée.', biographie: 'Un parcours.' };
    await expect(modifierFiche(ctx, speakerA, { ...fiche, telephone: 'pas un numéro' })).rejects.toThrow(/téléphone/);
    await expect(modifierFiche(ctx, speakerA, { ...fiche, emailContact: 'pas-une-adresse' })).rejects.toThrow(/adresse/);
    await modifierFiche(ctx, speakerA, { ...fiche, nomAffiche: 'Ignoré pour un speaker' });
    const b = await base();
    const [s] = await b.select().from(schema.speaker).where(eq(schema.speaker.id, speakerA));
    expect(s).toMatchObject({ prenom: 'Camille', nom: 'Fictive', nomAffiche: 'Camille Fictive', telephone: '06 12 34 56 78', resume: 'Une idée.' });
    const j = (await jalons(editionId)).find((x) => x.categorie === 'fiche')!;
    expect((await etats([speakerA])).find((e) => e.jalonId === j.id)?.etat).toBe('depose');
    await expect(modifierFiche(await en('speaker-b@exemple.com'), speakerA, fiche)).rejects.toThrow(RefusDocument);
  });

  it('le lien de la vidéo se pose par l’équipe, en https, jamais par le speaker', async () => {
    await expect(enregistrerLienVideo(await en('speaker-a@exemple.com'), speakerA, 'https://www.youtube.com/watch?v=fictif')).rejects.toThrow(RefusDocument);
    await expect(enregistrerLienVideo(await en('membre@utt.fr'), speakerA, 'http://www.youtube.com/watch?v=fictif')).rejects.toThrow(/https/);
    await enregistrerLienVideo(await en('membre@utt.fr'), speakerA, 'https://www.youtube.com/watch?v=fictif');
    const b = await base();
    const [s] = await b.select().from(schema.speaker).where(eq(schema.speaker.id, speakerA));
    expect(s?.lienVideo).toBe('https://www.youtube.com/watch?v=fictif');
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

  it('le propriétaire et un membre obtiennent une URL signée ; sans session, 404', async () => {
    const { versionId } = await deposer('speaker-a@exemple.com', { rattachement: 'speaker', speakerId: speakerA, categorie: 'transport', nom: 'billet.pdf', taille: PDF.length }, PDF);
    await en('speaker-a@exemple.com');
    const r = await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: versionId }) });
    expect(r.status).toBe(302);
    expect(r.headers.get('location')).toMatch(/sig=/);
    expect(await lienTelechargement(await en('membre@utt.fr'), versionId)).toBeTruthy();
    requete.cookies = new Map();
    expect((await telecharger(new Request('http://localhost/'), { params: Promise.resolve({ id: versionId }) })).status).toBe(404);
  });

  it('un membre dépose vers le speaker, et à sa place', async () => {
    const m = await en('membre@utt.fr');
    await expect(preparerDepot(m, { rattachement: 'speaker', speakerId: speakerA, categorie: 'billets', nom: 'billet.pdf', taille: PDF.length })).resolves.toBeTruthy();
    await expect(preparerDepot(m, { rattachement: 'speaker', speakerId: speakerA, categorie: 'photo_hd', nom: 'p.jpg', taille: 10 })).resolves.toBeTruthy();
  });
});
