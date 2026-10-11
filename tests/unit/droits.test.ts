import { describe, expect, it } from 'vitest';
import { peutCommenter, peutDeposer, peutGererComptes, peutLire, peutModifierFicheSpeaker, peutSupprimer, peutValiderJalon, peutVoirTableau, type Contexte, type RefDocument } from '../../lib/droits';

const speakerA: Contexte = { id: 'u-a', role: 'speaker', speakers: ['s-a'] };
const speakerB: Contexte = { id: 'u-b', role: 'speaker', speakers: ['s-b'] };
const membre: Contexte = { id: 'u-m', role: 'membre', speakers: [] };

const doc = (o: Partial<RefDocument>): RefDocument => ({ rattachement: 'speaker', speakerId: 's-a', sens: 'du_speaker', creeParId: 'u-a', ...o });
const dossierA = doc({});
const dossierB = doc({ speakerId: 's-b', creeParId: 'u-b' });
const versA = doc({ sens: 'vers_speaker', creeParId: 'u-m' });
const pourTous = doc({ rattachement: 'tous_speakers', speakerId: null, sens: 'vers_speaker', creeParId: 'u-m' });
const archive = doc({ archive: true });

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
