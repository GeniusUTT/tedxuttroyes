import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
// @ts-expect-error : module JavaScript sans déclaration de types
import { ecarts, epurer, fichiers } from '../../scripts/epurer-assets.mjs';

describe('fichiers servis sans commentaires', () => {
  it('sont à jour de leurs sources (sinon : node scripts/epurer-assets.mjs)', () => {
    expect(ecarts()).toEqual([]);
  });

  it('ne portent plus aucun commentaire', () => {
    for (const { servi } of fichiers() as { servi: string }[]) {
      const texte = readFileSync(servi, 'utf8');
      expect(texte, servi).not.toMatch(/\/\*|\*\//);
      expect(texte.replace(/"[^"\n]*"|'[^'\n]*'/g, ''), servi).not.toMatch(/\/\//);
    }
  });

  it('épargnent chaînes, adresses et expressions régulières', () => {
    const js = [
      'var a = "http://x/*y*/"; // fin',
      "var b = '/* pas un commentaire */';",
      'var c = /\\/\\*[^/]*\\//g.test(a); /* bloc */',
      'var d = `${a} // gabarit`;',
      'var e = 6 / 2 / 3;',
      'return /*',
      ' plusieurs lignes */ a',
    ].join('\n');
    expect(epurer(js, 'js')).toBe(
      [
        'var a = "http://x/*y*/";',
        "var b = '/* pas un commentaire */';",
        'var c = /\\/\\*[^/]*\\//g.test(a);',
        'var d = `${a} // gabarit`;',
        'var e = 6 / 2 / 3;',
        'return',
        ' a',
        '',
      ].join('\n'),
    );
    expect(epurer('a{b:url(//x/y)}/* c */\n.d{e:"/*f*/"}', 'css')).toBe('a{b:url(//x/y)}\n.d{e:"/*f*/"}\n');
  });
});
