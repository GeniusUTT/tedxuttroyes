// Le voile du 3 novembre (voir reveal-v3.js) : la date du jour J et le thème
// sont remplacés par des étoiles, un caractère pour un caractère, et la
// version d'origine voyage dans data-c. On n'écrit ici que le texte vrai :
// les étoiles s'en déduisent, les deux versions ne peuvent plus diverger.

export function etoiles(texte: string): string {
  return texte.replace(/[\p{L}\p{N}]/gu, '*');
}

// « masque » ne sert qu'aux rares textes cachés autrement (« Au-delà », dont
// le trait d'union est lui aussi masqué).
export function Masque({ texte, masque }: { texte: string; masque?: string }) {
  return (
    <span className="msk" data-c={texte}>
      {masque ?? etoiles(texte)}
    </span>
  );
}
