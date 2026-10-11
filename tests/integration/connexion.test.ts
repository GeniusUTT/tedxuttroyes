import { eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { courrielsPour, dernierCode, lienInvitation, preparer, requete } from './outils';
import { acteurCourant, editionCourante, exigerAdmin, exigerRole } from '../../lib/acces';
import { changerRole, desactiver, RefusCompte } from '../../lib/comptes';
import { demanderCode, seConnecter } from '../../lib/connexion';
import { base, schema } from '../../lib/db';
import { accepter, inviter, RefusInvitation, revoquer } from '../../lib/invitations';

let editionId = '';
let n = 0;
const adresse = (prefixe: string) => `${prefixe}-${++n}@utt.fr`;

async function compte(role: 'speaker' | 'membre' | 'admin', email = adresse(role)) {
  await inviter({ email, role, editionId, poles: [], nomAffiche: 'Fictif', derogation: false, parId: 'systeme' });
  await accepter(await lienInvitation(email));
  return email;
}

async function connecter(email: string) {
  requete.cookies.clear();
  expect(await demanderCode(email)).toEqual({ ok: true });
  expect(await seConnecter(email, await dernierCode(email))).toEqual({ ok: true });
}

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'admin' });
});

beforeEach(() => {
  requete.cookies.clear();
  requete.ip = `203.0.113.${(n % 250) + 1}`;
});

describe('invitations', () => {
  it('refuse une invitation déjà utilisée', async () => {
    const email = adresse('membre');
    await inviter({ email, role: 'membre', editionId, poles: [], nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    await accepter(jeton);
    await expect(accepter(jeton)).rejects.toThrow(RefusInvitation);
  });

  it('refuse une invitation expirée', async () => {
    const email = adresse('membre');
    const id = await inviter({ email, role: 'membre', editionId, poles: [], nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    const b = await base();
    await b.update(schema.invitation).set({ expireLe: new Date(Date.now() - 1000) }).where(eq(schema.invitation.id, id));
    await expect(accepter(jeton)).rejects.toThrow(/expiré/);
  });

  it('refuse une invitation révoquée', async () => {
    const email = adresse('membre');
    const id = await inviter({ email, role: 'membre', editionId, poles: [], nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    await revoquer(id, 'systeme');
    await expect(accepter(jeton)).rejects.toThrow(RefusInvitation);
  });

  it('refuse un membre hors domaine sans dérogation, accepte un speaker', async () => {
    await expect(inviter({ email: 'x@exemple.com', role: 'membre', editionId, poles: [], nomAffiche: '', derogation: false, parId: 'systeme' })).rejects.toThrow(RefusInvitation);
    await expect(inviter({ email: 'speaker-externe@exemple.com', role: 'speaker', editionId, poles: [], nomAffiche: 'Speaker Fictif', derogation: false, parId: 'systeme' })).resolves.toBeTruthy();
  });
});

describe('connexion', () => {
  it('connecte avec le bon code et ouvre une session', async () => {
    const email = await compte('membre');
    await connecter(email);
    expect((await acteurCourant())?.email).toBe(email);
  });

  it('répond pareil pour une adresse inconnue, sans rien envoyer', async () => {
    const inconnue = 'personne-inconnue@utt.fr';
    const connue = await compte('speaker');
    expect(await demanderCode(inconnue)).toEqual(await demanderCode(connue));
    expect(await courrielsPour(inconnue)).toBe(0);
  });

  it('refuse le sixième essai, même avec le bon code', async () => {
    const email = await compte('membre');
    await demanderCode(email);
    const bon = await dernierCode(email);
    const faux = bon === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) expect((await seConnecter(email, faux)).ok).toBe(false);
    const sixieme = await seConnecter(email, bon);
    expect(sixieme.ok).toBe(false);
    expect(await acteurCourant()).toBeNull();
  });

  it('limite les demandes de code par adresse', async () => {
    const email = await compte('membre');
    for (let i = 0; i < 5; i++) {
      requete.ip = `198.51.100.${i + 1}`;
      expect((await demanderCode(email)).ok).toBe(true);
    }
    requete.ip = '198.51.100.99';
    const r = await demanderCode(email);
    expect(r.ok).toBe(false);
  });
});

describe('sessions et droits', () => {
  it('ferme les sessions à la désactivation et refuse toute reconnexion', async () => {
    const email = await compte('membre');
    await connecter(email);
    const a = await acteurCourant();
    expect(a).not.toBeNull();
    await desactiver(a!.id, 'systeme');
    expect(await acteurCourant()).toBeNull();
    const b = await base();
    expect(await b.select().from(schema.session).where(eq(schema.session.userId, a!.id))).toHaveLength(0);
    requete.cookies.clear();
    await demanderCode(email);
    await expect(dernierCode(email)).resolves.toBeTruthy();
  });

  it('ferme les sessions au changement de rôle', async () => {
    const email = await compte('membre');
    await connecter(email);
    const a = await acteurCourant();
    await changerRole(a!.id, 'speaker', 'systeme');
    expect(await acteurCourant()).toBeNull();
  });

  it('interdit l’administration à un membre comme à un speaker', async () => {
    for (const role of ['membre', 'speaker'] as const) {
      await connecter(await compte(role));
      await expect(exigerAdmin()).rejects.toThrow('NEXT_NOT_FOUND');
      await expect(exigerRole('admin')).rejects.toThrow('NEXT_NOT_FOUND');
    }
  });

  it('demande le second facteur à un admin avant l’administration', async () => {
    await connecter(await compte('admin'));
    await expect(exigerAdmin()).rejects.toThrow('NEXT_REDIRECT /espace/admin/verification/');
  });

  it('garde toujours deux admins actifs', async () => {
    const b = await base();
    const admins = await b.select().from(schema.user).where(eq(schema.user.role, 'admin'));
    for (const u of admins.slice(2)) await desactiver(u.id, 'systeme');
    const restants = (await b.select().from(schema.user).where(eq(schema.user.role, 'admin'))).filter((u) => !u.desactiveLe);
    expect(restants).toHaveLength(2);
    await expect(desactiver(restants[0]!.id, 'systeme')).rejects.toThrow(RefusCompte);
    await expect(changerRole(restants[1]!.id, 'membre', 'systeme')).rejects.toThrow(RefusCompte);
  });
});
