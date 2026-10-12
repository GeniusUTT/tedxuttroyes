import { describe, expect, it } from 'vitest';
import { domaineMembreAccepte, emailValide, etatInvitation, invitationAutorisee, motDePasseRefuse, normaliserEmail, retraitMembrePermis, telephoneValide } from '../../lib/regles';

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
  it('limite les membres au domaine, sauf dérogation', () => {
    expect(invitationAutorisee('membre', 'x@exemple.com', false, 'utt.fr')).toBe(false);
    expect(invitationAutorisee('membre', 'x@exemple.com', true, 'utt.fr')).toBe(true);
    expect(invitationAutorisee('membre', 'x@utt.fr', false, 'utt.fr')).toBe(true);
  });
  it('laisse les speakers et les prestataires libres de leur domaine', () => {
    expect(invitationAutorisee('speaker', 'x@exemple.com', false, 'utt.fr')).toBe(true);
    expect(invitationAutorisee('prestataire', 'x@exemple.com', false, 'utt.fr')).toBe(true);
    expect(invitationAutorisee('prestataire', 'pas-une-adresse', false, 'utt.fr')).toBe(false);
  });
  it('calcule l’état', () => {
    const base = { expireLe: new Date(Date.now() + 1000), accepteeLe: null, revoqueeLe: null };
    expect(etatInvitation(base)).toBe('valide');
    expect(etatInvitation({ ...base, expireLe: new Date(Date.now() - 1) })).toBe('expiree');
    expect(etatInvitation({ ...base, accepteeLe: new Date() })).toBe('utilisee');
    expect(etatInvitation({ ...base, revoqueeLe: new Date() })).toBe('revoquee');
  });
});

describe('membres', () => {
  it('refuse de descendre sous deux membres actifs', () => {
    expect(retraitMembrePermis(2, true)).toBe(false);
    expect(retraitMembrePermis(3, true)).toBe(true);
    expect(retraitMembrePermis(2, false)).toBe(true);
  });
});

describe('mots de passe', () => {
  it('demande douze caractères au moins, cent vingt-huit au plus', () => {
    expect(motDePasseRefuse('court')).toMatch(/12/);
    expect(motDePasseRefuse('une phrase de passe')).toBeNull();
    expect(motDePasseRefuse('x'.repeat(129))).toMatch(/128/);
  });
  it('refuse l’identifiant de l’adresse et les répétitions', () => {
    expect(motDePasseRefuse('camille.martin2027', 'camille.martin@utt.fr')).toMatch(/adresse/);
    expect(motDePasseRefuse('aaaaaaaaaaaaaaaa')).toMatch(/répétitif/);
  });
});

describe('téléphone', () => {
  it('accepte les formes courantes, refuse le reste', () => {
    for (const t of ['', '06 12 34 56 78', '+33 6 12 34 56 78', '06.12.34.56.78', '(0)6-12-34-56-78']) expect(telephoneValide(t), t).toBe(true);
    for (const t of ['douze', '123', '06 12 34 56 78 <script>', '+33 6 12 34 56 78 90 12 34 56 78']) expect(telephoneValide(t), t).toBe(false);
  });
});
