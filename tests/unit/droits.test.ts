import { describe, expect, it } from 'vitest';
import { peutCommenter, peutDeposer, peutGererComptes, peutLire, peutModifierFichePrestataire, peutModifierFicheSpeaker, peutSupprimer, peutValiderJalon, peutVoirFichePrestataire, peutVoirTableau, type Contexte, type RefDocument } from '../../lib/droits';

const speakerA: Contexte = { id: 'u-a', role: 'speaker', speakers: ['s-a'] };
const speakerB: Contexte = { id: 'u-b', role: 'speaker', speakers: ['s-b'] };
const membre: Contexte = { id: 'u-m', role: 'membre', speakers: [] };
const prestaX1: Contexte = { id: 'u-x1', role: 'prestataire', speakers: [], prestataires: ['p-x'] };
const prestaX2: Contexte = { id: 'u-x2', role: 'prestataire', speakers: [], prestataires: ['p-x'] };
const prestaY: Contexte = { id: 'u-y', role: 'prestataire', speakers: [], prestataires: ['p-y'] };

const doc = (o: Partial<RefDocument>): RefDocument => ({ rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker', creeParId: 'u-a', ...o });
const dossierA = doc({});
const dossierB = doc({ speakerId: 's-b', creeParId: 'u-b' });
const versA = doc({ sens: 'vers_speaker', creeParId: 'u-m' });
const pourTous = doc({ rattachement: 'tous_speakers', speakerId: null, sens: 'vers_speaker', creeParId: 'u-m' });
const archive = doc({ archive: true });
const duX = doc({ rattachement: 'prestataire', speakerId: null, prestataireId: 'p-x', sens: 'du_prestataire', creeParId: 'u-x1' });
const versX = doc({ rattachement: 'prestataire', speakerId: null, prestataireId: 'p-x', sens: 'vers_prestataire', creeParId: 'u-m' });
const archiveX = doc({ rattachement: 'prestataire', speakerId: null, prestataireId: 'p-x', sens: 'du_prestataire', creeParId: 'u-x1', archive: true });

describe('lecture', () => {
  it('un speaker ne lit que son dossier et les documents pour tous les speakers', () => {
    expect(peutLire(speakerA, dossierA)).toBe(true);
    expect(peutLire(speakerA, versA)).toBe(true);
    expect(peutLire(speakerA, dossierB)).toBe(false);
    expect(peutLire(speakerB, dossierA)).toBe(false);
    expect(peutLire(speakerA, pourTous)).toBe(true);
  });
  it('un membre lit tout, archive comprise', () => {
    for (const d of [dossierA, dossierB, versA, pourTous, archive]) expect(peutLire(membre, d)).toBe(true);
  });
  it('un speaker ne lit jamais l’archive, même la sienne', () => {
    expect(peutLire(speakerA, archive)).toBe(false);
  });
});

describe('dépôt', () => {
  it('un speaker dépose dans son dossier, jamais ailleurs ni dans le sens de l’équipe', () => {
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker' })).toBe(true);
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-b', sens: 'du_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'speaker', speakerId: 's-a', sens: 'vers_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'tous_speakers', sens: 'vers_speaker' })).toBe(false);
  });
  it('un membre dépose vers un speaker, à sa place, et pour tous', () => {
    expect(peutDeposer(membre, { rattachement: 'speaker', speakerId: 's-a', sens: 'vers_speaker' })).toBe(true);
    expect(peutDeposer(membre, { rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker' })).toBe(true);
    expect(peutDeposer(membre, { rattachement: 'tous_speakers', sens: 'vers_speaker' })).toBe(true);
    expect(peutDeposer(membre, { rattachement: 'tous_speakers', sens: 'du_speaker' })).toBe(false);
  });
});

describe('commentaires, suppression, tableau, jalons, comptes', () => {
  it('commente ce qu’il peut lire ; les documents pour tous ne se commentent que par l’équipe', () => {
    expect(peutCommenter(speakerA, dossierA)).toBe(true);
    expect(peutCommenter(speakerA, dossierB)).toBe(false);
    expect(peutCommenter(speakerA, pourTous)).toBe(false);
    expect(peutCommenter(membre, pourTous)).toBe(true);
  });
  it('un speaker supprime ses propres dépôts ; un membre supprime tout sauf l’archive', () => {
    expect(peutSupprimer(speakerA, dossierA)).toBe(true);
    expect(peutSupprimer(speakerA, versA)).toBe(false);
    expect(peutSupprimer(speakerA, dossierB)).toBe(false);
    expect(peutSupprimer(membre, dossierB)).toBe(true);
    expect(peutSupprimer(membre, archive)).toBe(false);
  });
  it('tableau, jalons et comptes sont à l’équipe', () => {
    for (const f of [peutVoirTableau, peutValiderJalon, peutGererComptes]) {
      expect(f(membre)).toBe(true);
      expect(f(speakerA)).toBe(false);
    }
  });
  it('la fiche se modifie par son speaker ou un membre', () => {
    expect(peutModifierFicheSpeaker(speakerA, 's-a')).toBe(true);
    expect(peutModifierFicheSpeaker(speakerA, 's-b')).toBe(false);
    expect(peutModifierFicheSpeaker(membre, 's-a')).toBe(true);
  });
});

describe('prestataires', () => {
  it('toutes les personnes d’une structure lisent son dossier, et lui seul', () => {
    for (const c of [prestaX1, prestaX2]) {
      expect(peutLire(c, duX)).toBe(true);
      expect(peutLire(c, versX)).toBe(true);
    }
    expect(peutLire(prestaY, duX)).toBe(false);
    expect(peutLire(prestaY, versX)).toBe(false);
  });
  it('un prestataire ne voit rien des speakers, un speaker rien des prestataires', () => {
    for (const d of [dossierA, versA, pourTous, archive]) expect(peutLire(prestaX1, d)).toBe(false);
    for (const d of [duX, versX]) expect(peutLire(speakerA, d)).toBe(false);
  });
  it('l’archive d’un prestataire est à l’équipe seule', () => {
    expect(peutLire(prestaX1, archiveX)).toBe(false);
    expect(peutLire(membre, archiveX)).toBe(true);
    expect(peutSupprimer(membre, archiveX)).toBe(false);
  });
  it('un prestataire dépose dans le dossier de sa structure, vers l’équipe seulement', () => {
    expect(peutDeposer(prestaX2, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'du_prestataire' })).toBe(true);
    expect(peutDeposer(prestaX2, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'vers_prestataire' })).toBe(false);
    expect(peutDeposer(prestaY, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'du_prestataire' })).toBe(false);
    expect(peutDeposer(prestaX1, { rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker' })).toBe(false);
    expect(peutDeposer(prestaX1, { rattachement: 'tous_speakers', sens: 'vers_speaker' })).toBe(false);
    expect(peutDeposer(speakerA, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'du_prestataire' })).toBe(false);
  });
  it('un membre dépose dans les deux sens', () => {
    expect(peutDeposer(membre, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'vers_prestataire' })).toBe(true);
    expect(peutDeposer(membre, { rattachement: 'prestataire', prestataireId: 'p-x', sens: 'du_prestataire' })).toBe(true);
  });
  it('chacun supprime ses propres dépôts, pas ceux d’un collègue ni de l’équipe', () => {
    expect(peutSupprimer(prestaX1, duX)).toBe(true);
    expect(peutSupprimer(prestaX2, duX)).toBe(false);
    expect(peutSupprimer(prestaX1, versX)).toBe(false);
    expect(peutSupprimer(membre, duX)).toBe(true);
  });
  it('commente son dossier ; fiche à la structure et à l’équipe ; rien de l’administration', () => {
    expect(peutCommenter(prestaX2, duX)).toBe(true);
    expect(peutCommenter(prestaY, duX)).toBe(false);
    expect(peutVoirFichePrestataire(prestaX1, 'p-x')).toBe(true);
    expect(peutModifierFichePrestataire(prestaX1, 'p-x')).toBe(true);
    expect(peutModifierFichePrestataire(prestaY, 'p-x')).toBe(false);
    expect(peutModifierFichePrestataire(membre, 'p-x')).toBe(true);
    expect(peutVoirFichePrestataire(speakerA, 'p-x')).toBe(false);
    expect(peutModifierFicheSpeaker(prestaX1, 's-a')).toBe(false);
    for (const f of [peutVoirTableau, peutValiderJalon, peutGererComptes]) expect(f(prestaX1)).toBe(false);
  });
});
