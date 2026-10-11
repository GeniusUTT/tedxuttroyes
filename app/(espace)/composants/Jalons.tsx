export const ETATS = { a_faire: 'à faire', depose: 'déposé', valide: 'validé' } as const;

export function Pastille({ etat, echeance }: { etat: keyof typeof ETATS; echeance: Date }) {
  const enRetard = etat === 'a_faire' && echeance.getTime() < Date.now();
  const cls = etat === 'valide' ? 'pastille pastille--fait' : enRetard || etat === 'depose' ? 'pastille pastille--rouge' : 'pastille';
  return <span className={cls}>{enRetard ? 'en retard' : ETATS[etat]}</span>;
}

export function echeance(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
}
