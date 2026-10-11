import type { ReactNode } from 'react';

// Le calendrier : un registre par mois, comme le registre des éditions du
// site. Les dates s'affichent à l'heure de Paris. Un repère rouge se pose
// entre ce qui est passé et ce qui vient ; la soirée est la seule rangée en
// display.

export type Entree = { id: string; date: Date; libelle: ReactNode; detail?: ReactNode; etat?: ReactNode; soiree?: boolean };

const FUSEAU = 'Europe/Paris';
const mois = (d: Date) => d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: FUSEAU });
const jour = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: FUSEAU });
const aujourdhui = (d: Date) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSEAU });

export function Calendrier({ entrees, maintenant = new Date() }: { entrees: Entree[]; maintenant?: Date }) {
  const triees = [...entrees].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!triees.length) return <p className="muet">Aucune date pour l’instant.</p>;
  const prochaine = triees.findIndex((e) => e.date.getTime() >= maintenant.getTime());
  // Le repère se pose avant la prochaine date : dans son mois si ce mois est
  // déjà le courant, avant l'en-tête du mois sinon (le 11 octobre ne se lit
  // pas sous « décembre »).
  const groupes: { mois: string; avant: boolean; lignes: ReactNode[] }[] = [];
  const courant = mois(maintenant);
  const repere = (cle: string) => <p key={cle} className="cal-aujourdhui">Aujourd’hui, {aujourdhui(maintenant)}</p>;
  triees.forEach((e, i) => {
    const m = mois(e.date);
    if (groupes.at(-1)?.mois !== m) groupes.push({ mois: m, avant: i === prochaine && m !== courant, lignes: [] });
    const g = groupes.at(-1)!;
    if (i === prochaine && !g.avant) g.lignes.push(<li key="aujourdhui">{repere('r')}</li>);
    const passe = e.date.getTime() < maintenant.getTime();
    const cls = ['cal-ligne', passe ? 'cal-ligne--passe' : '', e.soiree ? 'cal-ligne--soiree' : ''].filter(Boolean).join(' ');
    g.lignes.push(
      <li key={e.id} className={cls}>
        <time className="cal-jour" dateTime={e.date.toISOString()}>{jour(e.date)}</time>
        <span className="cal-libelle">{e.libelle}{e.detail && e.detail !== e.libelle && <span className="muet">{e.detail}</span>}</span>
        <span>{e.etat}</span>
      </li>,
    );
  });
  return (
    <div className="cal">
      {groupes.map((g) => [
        g.avant ? repere(`avant-${g.mois}`) : null,
        <section key={g.mois} className="cal-mois" aria-label={g.mois}>
          <h3>{g.mois}</h3>
          <ol>{g.lignes}</ol>
        </section>,
      ])}
      {prochaine === -1 && repere('fin')}
    </div>
  );
}
