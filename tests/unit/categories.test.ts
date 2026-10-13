import { describe, expect, it } from 'vitest';
import { categorie, CATEGORIES, DU_PRESTATAIRE, extensionDe, lienValide, pourPrestataire, signatureValide, VERS_PRESTATAIRE } from '../../lib/categories';
import { ARCHIVES_PRESTATAIRE } from '../../lib/rgpd';

const octets = (...x: number[]) => new Uint8Array(x);
const texte = (s: string) => new TextEncoder().encode(s);

describe('formats', () => {
  it('lit l’extension sans tenir compte de la casse', () => {
    expect(extensionDe('Slides FINAL.PPTX')).toBe('pptx');
    expect(extensionDe('script')).toBeNull();
    expect(extensionDe('page.html')).toBeNull();
    expect(extensionDe('image.svg')).toBeNull();
  });
  it('vérifie la signature binaire', () => {
    expect(signatureValide('pdf', texte('%PDF-1.7'))).toBe(true);
    expect(signatureValide('pdf', texte('<html>'))).toBe(false);
    expect(signatureValide('png', octets(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe(true);
    expect(signatureValide('jpg', octets(0xff, 0xd8, 0xff, 0xe0))).toBe(true);
    expect(signatureValide('pptx', octets(0x50, 0x4b, 0x03, 0x04))).toBe(true);
    expect(signatureValide('txt', octets(0x41, 0x00, 0x42))).toBe(false);
  });
  it('n’accepte que des liens https', () => {
    expect(lienValide('https://youtu.be/x')).toBe(true);
    expect(lienValide('http://youtu.be/x')).toBe(false);
    expect(lienValide('javascript:alert(1)')).toBe(false);
  });
});

describe('catalogue', () => {
  it('ni fiche technique ni vidéo de répétition', () => {
    expect(categorie('fiche_technique')).toBeUndefined();
    expect(categorie('video_repetition')).toBeUndefined();
  });
  it('chaque document à signer a son modèle, déposé pour tous par l’équipe', () => {
    const aSigner = CATEGORIES.filter((c) => c.modele);
    expect(aSigner.map((c) => c.slug).sort()).toEqual(['droit_image', 'release']);
    for (const c of aSigner) {
      const m = categorie(c.modele!);
      expect(m?.estModele).toBe(true);
      expect(m?.sens).toBe('vers_speaker');
      expect(c.sens).toBe('du_speaker');
    }
  });
  it('les catégories des prestataires sont à part, dans les deux sens', () => {
    expect(DU_PRESTATAIRE).toEqual(['devis', 'facture', 'contrat_signe', 'assurance', 'technique', 'piece_prestataire']);
    expect(VERS_PRESTATAIRE).toEqual(['contrat', 'cahier_charges', 'logistique', 'info_prestataire']);
    for (const c of CATEGORIES.filter((x) => pourPrestataire(x.sens))) {
      expect(c.requis || c.modele || c.estModele || c.attestation).toBeFalsy();
    }
    for (const slug of ARCHIVES_PRESTATAIRE) expect(pourPrestataire(categorie(slug)!.sens)).toBe(true);
  });
  it('les pièces requises sont celles du dossier speaker', () => {
    expect(CATEGORIES.filter((c) => c.requis).map((c) => c.slug)).toEqual(['release', 'droit_image', 'photo_hd']);
  });
});
