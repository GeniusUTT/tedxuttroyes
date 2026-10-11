import { describe, expect, it } from 'vitest';
import { peutCommenter, peutDeposer, peutLire, peutModifierFicheSpeaker, peutSupprimer, peutValiderJalon, peutVoirTableau, type Contexte, type RefDocument } from '../../lib/droits';

const LOG = { id: 'p-log', slug: 'logistique' };
const PSP = { id: 'p-sp', slug: 'prospection-speakers' };

const speakerA: Contexte = { id: 'u-a', role: 'speaker', poles: [], speakers: ['s-a'] };
const speakerB: Contexte = { id: 'u-b', role: 'speaker', poles: [], speakers: ['s-b'] };
const sansPole: Contexte = { id: 'u-m0', role: 'membre', poles: [], speakers: [] };
const logistique: Contexte = { id: 'u-m1', role: 'membre', poles: [LOG], speakers: [] };
const prospection: Contexte = { id: 'u-m2', role: 'membre', poles: [PSP], speakers: [] };
const admin: Contexte = { id: 'u-ad', role: 'admin', poles: [], speakers: [] };

const doc = (o: Partial<RefDocument>): RefDocument => ({ rattachement: 'speaker', speakerId: 's-a', poleId: null, sens: 'du_speaker', creeParId: 'u-a', ...o });
const dossierA = doc({});
const dossierB = doc({ speakerId: 's-b', creeParId: 'u-b' });
const pourTous = doc({ rattachement: 'tous_speakers', speakerId: null, sens: 'vers_speaker', creeParId: 'u-m1' });
const poleLog = doc({ rattachement: 'pole', speakerId: null, poleId: 'p-log', sens: 'interne', creeParId: 'u-m1' });
const commun = doc({ rattachement: 'commun', speakerId: null, sens: 'interne', creeParId: 'u-m1' });

describe('lecture', () => {
  it('un speaker ne lit que son dossier et les documents pour tous les speakers', () => {
    expect(peutLire(speakerA, dossierA)).toBe(true);
    expect(peutLire(speakerA, dossierB)).toBe(false);
    expect(peutLire(speakerB, dossierA)).toBe(false);
    expect(peutLire(speakerA, pourTous)).toBe(true);
    expect(peutLire(speakerA, poleLog)).toBe(false);
    expect(peutLire(speakerA, commun)).toBe(false);
  });
  it('un membre sans pôle ne lit que l’espace commun', () => {
    expect(peutLire(sansPole, commun)).toBe(true);
    expect(peutLire(sansPole, dossierA)).toBe(false);
    expect(peutLire(sansPole, pourTous)).toBe(false);
    expect(peutLire(sansPole, poleLog)).toBe(false);
  });
  it('un membre d’un pôle lit les dossiers speakers, son pôle et le commun', () => {
    expect(peutLire(logistique, dossierA)).toBe(true);
    expect(peutLire(logistique, poleLog)).toBe(true);
    expect(peutLire(prospection, poleLog)).toBe(false);
    expect(peutLire(logistique, commun)).toBe(true);
  });
  it('un admin lit tout', () => {
    for (const d of [dossierA, dossierB, pourTous, poleLog, commun]) expect(peutLire(admin, d)).toBe(true);
  });
});

describe('dépôt', () => {
  it('un speaker dépose dans son dossier, jamais ailleurs ni dans le sens de l’équipe', () => {
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker' })).toBe(true);
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-b', sens: 'du_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-a', sens: 'vers_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'tous_speakers', sens: 'vers_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'commun', sens: 'interne' })).toBe(false);
  });
  it('un membre d’un pôle dépose vers un speaker, dans son pôle et dans le commun', () => {
    expect(peutDeposer(logistique, { rattachement: 'speaker', speakerId: 's-a', sens: 'vers_speaker' })).toBe(true);
    expect(peutDeposer(logistique, { rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker' })).toBe(false);
    expect(peutDeposer(logistique, { rattachement: 'pole', poleId: 'p-log', sens: 'interne' })).toBe(true);
    expect(peutDeposer(logistique, { rattachement: 'pole', poleId: 'p-sp', sens: 'interne' })).toBe(false);
    expect(peutDeposer(logistique, { rattachement: 'commun', sens: 'interne' })).toBe(true);
  });
  it('un membre sans pôle ne dépose nulle part', () => {
    expect(peutDeposer(sansPole, { rattachement: 'commun', sens: 'interne' })).toBe(false);
    expect(peutDeposer(sansPole, { rattachement: 'speaker', speakerId: 's-a', sens: 'vers_speaker' })).toBe(false);
  });
});

describe('commentaires, suppression, tableau, jalons', () => {
  it('commente ce qu’il peut lire, sauf le membre sans pôle dans le commun', () => {
    expect(peutCommenter(speakerA, dossierA)).toBe(true);
    expect(peutCommenter(speakerA, dossierB)).toBe(false);
    expect(peutCommenter(speakerA, pourTous)).toBe(false);
    expect(peutCommenter(sansPole, commun)).toBe(false);
    expect(peutCommenter(logistique, commun)).toBe(true);
  });
  it('supprime ses propres dépôts ; l’admin supprime tout', () => {
    expect(peutSupprimer(speakerA, dossierA)).toBe(true);
    expect(peutSupprimer(speakerA, dossierB)).toBe(false);
    expect(peutSupprimer(logistique, dossierA)).toBe(false);
    expect(peutSupprimer(logistique, poleLog)).toBe(true);
    expect(peutSupprimer(admin, dossierB)).toBe(true);
  });
  it('le tableau est à l’équipe, la validation des jalons au pôle Prospection Speakers', () => {
    expect(peutVoirTableau(speakerA)).toBe(false);
    expect(peutVoirTableau(sansPole)).toBe(true);
    expect(peutValiderJalon(logistique)).toBe(false);
    expect(peutValiderJalon(prospection)).toBe(true);
    expect(peutValiderJalon(admin)).toBe(true);
    expect(peutValiderJalon(speakerA)).toBe(false);
  });
  it('la fiche se modifie par son speaker ou un admin', () => {
    expect(peutModifierFicheSpeaker(speakerA, 's-a')).toBe(true);
    expect(peutModifierFicheSpeaker(speakerA, 's-b')).toBe(false);
    expect(peutModifierFicheSpeaker(logistique, 's-a')).toBe(false);
    expect(peutModifierFicheSpeaker(admin, 's-a')).toBe(true);
  });
});

describe('archive des Speaker Releases', () => {
  it('réservée aux admins, jamais supprimable depuis l’interface', () => {
    const archive = doc({ archive: true, sens: 'du_speaker' });
    expect(peutLire(admin, archive)).toBe(true);
    expect(peutLire(logistique, archive)).toBe(false);
    expect(peutLire(speakerA, archive)).toBe(false);
    expect(peutSupprimer(admin, archive)).toBe(false);
  });
});
