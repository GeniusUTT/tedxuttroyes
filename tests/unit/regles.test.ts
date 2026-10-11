import { describe, expect, it } from 'vitest';
import { domaineMembreAccepte, emailValide, etatInvitation, invitationAutorisee, normaliserEmail, retraitAdminPermis } from '../../lib/regles';

describe('adresses', () => {
  it('normalise la casse et les espaces', () => {
    expect(normaliserEmail('  Prenom.Nom@UTT.fr ')).toBe('prenom.nom@utt.fr');
  });
  it('rejette les formes invalides', () => {
    expect(emailValide('pas-une-adresse')).toBe(false);
    expect(emailValide('a@b')).toBe(false);
    expect(emailValide('a@utt.fr')).toBe(true);
  });
  it('compare le domaine en entier', () => {
    expect(domaineMembreAccepte('x@utt.fr', 'utt.fr')).toBe(true);
    expect(domaineMembreAccepte('x@UTT.FR', 'utt.fr')).toBe(true);
    expect(domaineMembreAccepte('x@etu.utt.fr', 'utt.fr')).toBe(false);
    expect(domaineMembreAccepte('x@autre-utt.fr', 'utt.fr')).toBe(false);
    expect(domaineMembreAccepte('x@utt.fr.exemple.com', 'utt.fr')).toBe(false);
    expect(domaineMembreAccepte('utt.fr@exemple.com', 'utt.fr')).toBe(false);
  });
});

describe('invitations', () => {
  it('limite les membres et les admins au domaine, sauf dérogation', () => {
    expect(invitationAutorisee('membre', 'x@exemple.com', false, 'utt.fr')).toBe(false);
    expect(invitationAutorisee('admin', 'x@exemple.com', false, 'utt.fr')).toBe(false);
    expect(invitationAutorisee('membre', 'x@exemple.com', true, 'utt.fr')).toBe(true);
    expect(invitationAutorisee('membre', 'x@utt.fr', false, 'utt.fr')).toBe(true);
  });
  it('laisse les speakers libres de leur domaine', () => {
    expect(invitationAutorisee('speaker', 'x@exemple.com', false, 'utt.fr')).toBe(true);
  });
  it('calcule l’état', () => {
    const base = { expireLe: new Date(Date.now() + 1000), accepteeLe: null, revoqueeLe: null };
    expect(etatInvitation(base)).toBe('valide');
    expect(etatInvitation({ ...base, expireLe: new Date(Date.now() - 1) })).toBe('expiree');
    expect(etatInvitation({ ...base, accepteeLe: new Date() })).toBe('utilisee');
    expect(etatInvitation({ ...base, revoqueeLe: new Date() })).toBe('revoquee');
  });
});

describe('admins', () => {
  it('refuse de descendre sous deux admins actifs', () => {
    expect(retraitAdminPermis(2, true)).toBe(false);
    expect(retraitAdminPermis(3, true)).toBe(true);
    expect(retraitAdminPermis(2, false)).toBe(true);
  });
});
