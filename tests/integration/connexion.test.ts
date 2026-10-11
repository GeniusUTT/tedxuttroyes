import { eq } from 'drizzle-orm';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { connecter, courrielsPour, creerCompte, lienInvitation, lienReinitialisation, MDP, preparer, requete } from './outils';
import { acteurCourant, editionCourante, exigerMembre } from '../../lib/acces';
import { desactiver, RefusCompte } from '../../lib/comptes';
import { demanderReinitialisation, reinitialiser, seConnecter } from '../../lib/connexion';
import { base, schema } from '../../lib/db';
import { accepter, inviter, lireInvitation, RefusInvitation, revoquer } from '../../lib/invitations';
import { aUnMotDePasse } from '../../lib/motdepasse';

let editionId = '';
let n = 0;
const adresse = (prefixe: string) => `${prefixe}-${++n}@utt.fr`;

async function compte(role: 'speaker' | 'membre', email = adresse(role)) {
  await creerCompte(editionId, email, role);
  return email;
}

beforeAll(async () => {
  await preparer();
  editionId = (await editionCourante()).id;
  const b = await base();
  await b.insert(schema.user).values({ id: 'systeme', email: 'systeme@exemple.invalid', name: 'Système', emailVerified: true, role: 'membre' });
});

beforeEach(() => {
  requete.cookies.clear();
  requete.ip = `203.0.113.${(n % 250) + 1}`;
});

describe('invitations', () => {
  it('l’invitation se refuse avec un mot de passe trop court ou mal recopié, et reste valable', async () => {
    const email = adresse('membre');
    await inviter({ email, role: 'membre', editionId, nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    await expect(accepter(jeton, 'court', 'court')).rejects.toThrow(/12/);
    await expect(accepter(jeton, MDP, `${MDP} autre`)).rejects.toThrow(/identiques/);
    expect((await lireInvitation(jeton))?.etat).toBe('valide');
    await accepter(jeton, MDP, MDP);
    await expect(accepter(jeton, MDP, MDP)).rejects.toThrow(RefusInvitation);
  });

  it('refuse une invitation expirée', async () => {
    const email = adresse('membre');
    const id = await inviter({ email, role: 'membre', editionId, nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    const b = await base();
    await b.update(schema.invitation).set({ expireLe: new Date(Date.now() - 1000) }).where(eq(schema.invitation.id, id));
    await expect(accepter(jeton, MDP, MDP)).rejects.toThrow(/expiré/);
  });

  it('refuse une invitation révoquée', async () => {
    const email = adresse('membre');
    const id = await inviter({ email, role: 'membre', editionId, nomAffiche: '', derogation: false, parId: 'systeme' });
    const jeton = await lienInvitation(email);
    await revoquer(id, 'systeme');
    await expect(accepter(jeton, MDP, MDP)).rejects.toThrow(RefusInvitation);
  });

  it('refuse un membre hors domaine sans dérogation, accepte un speaker', async () => {
    await expect(inviter({ email: 'x@exemple.com', role: 'membre', editionId, nomAffiche: '', derogation: false, parId: 'systeme' })).rejects.toThrow(RefusInvitation);
    await expect(inviter({ email: 'speaker-externe@exemple.com', role: 'speaker', editionId, nomAffiche: 'Speaker Fictif', derogation: false, parId: 'systeme' })).resolves.toBeTruthy();
  });

  it('le mot de passe n’est jamais stocké en clair', async () => {
    const email = await compte('speaker');
    const b = await base();
    const [u] = await b.select().from(schema.user).where(eq(schema.user.email, email));
    const [c] = await b.select().from(schema.account).where(eq(schema.account.userId, u!.id));
    expect(c?.providerId).toBe('credential');
    expect(c?.password).toBeTruthy();
    expect(c?.password).not.toContain(MDP);
  });
});

describe('connexion par mot de passe', () => {
  it('connecte avec le bon mot de passe et ouvre une session', async () => {
    const email = await compte('membre');
    expect(await connecter(email)).toEqual({ ok: true });
    expect((await acteurCourant())?.email).toBe(email);
  });

  it('même refus pour un mauvais mot de passe et pour une adresse inconnue', async () => {
    const email = await compte('speaker');
    const faux = await connecter(email, 'pas le bon mot de passe');
    const inconnue = await connecter('personne-inconnue@utt.fr', MDP);
    expect(faux).toEqual({ ok: false, message: 'Adresse ou mot de passe incorrect.' });
    expect(inconnue).toEqual(faux);
    expect(await acteurCourant()).toBeNull();
  });

  it('bloque une adresse après dix essais, même avec le bon mot de passe', async () => {
    const email = await compte('membre');
    for (let i = 0; i < 10; i++) {
      requete.ip = `198.51.100.${i + 1}`;
      expect((await connecter(email, 'mauvais mot de passe')).ok).toBe(false);
    }
    requete.ip = '198.51.100.99';
    const r = await connecter(email);
    expect(r.ok).toBe(false);
    expect(await acteurCourant()).toBeNull();
  });

  it('refuse un mot de passe vide', async () => {
    expect((await seConnecter('quelquun@utt.fr', '')).ok).toBe(false);
  });
});

describe('mot de passe oublié', () => {
  it('répond pareil pour une adresse inconnue, sans rien envoyer', async () => {
    const inconnue = 'personne-inconnue-2@utt.fr';
    const connue = await compte('speaker');
    expect(await demanderReinitialisation(inconnue)).toEqual(await demanderReinitialisation(connue));
    expect(await courrielsPour(inconnue)).toBe(0);
  });

  it('le lien pose un nouveau mot de passe, ferme les anciennes sessions et ne sert qu’une fois', async () => {
    const email = await compte('membre');
    await connecter(email);
    const ancienne = new Map(requete.cookies);
    await demanderReinitialisation(email);
    const jeton = await lienReinitialisation(email);
    requete.cookies = new Map();
    const nouveau = 'un tout nouveau mot de passe';
    expect(await reinitialiser(jeton, nouveau, nouveau)).toEqual({ ok: true });
    expect((await acteurCourant())?.email).toBe(email);
    requete.cookies = ancienne;
    expect(await acteurCourant()).toBeNull();
    expect((await connecter(email)).ok).toBe(false);
    expect((await connecter(email, nouveau)).ok).toBe(true);
    expect((await reinitialiser(jeton, nouveau, nouveau)).ok).toBe(false);
  });

  it('un compte créé sans mot de passe en choisit un par ce lien', async () => {
    const b = await base();
    await b.insert(schema.user).values({ id: 'ancien', email: 'ancien-admin@utt.fr', name: 'Ancien', emailVerified: true, role: 'membre' });
    expect(await aUnMotDePasse('ancien')).toBe(false);
    expect((await connecter('ancien-admin@utt.fr', MDP)).ok).toBe(false);
    await demanderReinitialisation('ancien-admin@utt.fr');
    expect(await reinitialiser(await lienReinitialisation('ancien-admin@utt.fr'), MDP, MDP)).toEqual({ ok: true });
    expect(await aUnMotDePasse('ancien')).toBe(true);
  });
});

describe('sessions et droits', () => {
  it('ferme les sessions à la désactivation et refuse toute reconnexion, sans envoyer de lien', async () => {
    const email = await compte('membre');
    await connecter(email);
    const a = await acteurCourant();
    expect(a).not.toBeNull();
    await desactiver(a!.id, 'systeme');
    expect(await acteurCourant()).toBeNull();
    const b = await base();
    expect(await b.select().from(schema.session).where(eq(schema.session.userId, a!.id))).toHaveLength(0);
    expect((await connecter(email)).ok).toBe(false);
    const avant = await courrielsPour(email);
    await demanderReinitialisation(email);
    expect(await courrielsPour(email)).toBe(avant);
  });

  it('l’espace de l’équipe est fermé aux speakers', async () => {
    await connecter(await compte('speaker'));
    await expect(exigerMembre()).rejects.toThrow('NEXT_NOT_FOUND');
    await connecter(await compte('membre'));
    await expect(exigerMembre()).resolves.toBeTruthy();
  });

  it('garde toujours deux membres actifs', async () => {
    const b = await base();
    const membres = await b.select().from(schema.user).where(eq(schema.user.role, 'membre'));
    for (const u of membres.filter((x) => !x.desactiveLe).slice(2)) await desactiver(u.id, 'systeme');
    const restants = (await b.select().from(schema.user).where(eq(schema.user.role, 'membre'))).filter((u) => !u.desactiveLe);
    expect(restants).toHaveLength(2);
    await expect(desactiver(restants[0]!.id, 'systeme')).rejects.toThrow(RefusCompte);
  });
});
