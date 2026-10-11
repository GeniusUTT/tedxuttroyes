import { desc, like } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerAdmin } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { Cadre } from '../../../composants/Cadre';
import { noms, quand } from '../../../composants/Documents';

export const metadata: Metadata = { title: 'Journal' };

const FAMILLES: [string, string][] = [
  ['', 'Tout'], ['connexion', 'Connexions'], ['invitation', 'Invitations'], ['compte', 'Comptes'], ['document', 'Documents'],
  ['commentaire', 'Retours'], ['jalon', 'Jalons'], ['totp', 'Second facteur'], ['purge', 'Purges'], ['sauvegarde', 'Sauvegardes'],
];

const LIBELLES: Record<string, string> = {
  'connexion': 'connexion', 'connexion.echec': 'échec de connexion', 'connexion.code_demande': 'code demandé', 'deconnexion': 'déconnexion',
  'invitation.creee': 'invitation envoyée', 'invitation.renvoyee': 'invitation renvoyée', 'invitation.revoquee': 'invitation révoquée',
  'invitation.acceptee': 'invitation acceptée', 'invitation.refusee': 'invitation refusée', 'compte.role': 'rôle changé', 'compte.poles': 'pôles changés',
  'compte.email': 'adresse changée', 'compte.desactive': 'compte désactivé', 'compte.reactive': 'compte réactivé', 'compte.supprime': 'compte supprimé',
  'compte.export': 'export des données', 'session.fermee': 'session fermée', 'totp.active': 'second facteur activé', 'totp.echec': 'second facteur refusé',
  'totp.valide': 'second facteur validé', 'admin.secours': 'procédure de secours', 'document.depose': 'dépôt', 'document.lu': 'téléchargement',
  'document.supprime': 'suppression', 'commentaire.cree': 'retour publié', 'commentaire.supprime': 'retour supprimé', 'jalon.valide': 'jalon changé',
  'jalon.modifie': 'jalon modifié', 'edition.modifiee': 'édition modifiée', 'pole.modifie': 'pôle modifié', 'speaker.modifie': 'fiche speaker modifiée',
  'purge': 'purge quotidienne', 'sauvegarde': 'sauvegarde',
};

export default async function Journal({ searchParams }: { searchParams: Promise<{ famille?: string }> }) {
  const a = await exigerAdmin();
  const { famille = '' } = await searchParams;
  const b = await base();
  const q = b.select().from(schema.journal);
  const lignes = await (famille ? q.where(like(schema.journal.action, `${famille.replace(/[^a-z_]/g, '')}%`)) : q).orderBy(desc(schema.journal.le)).limit(300);
  const qui = await noms(lignes.map((l) => l.acteurId));
  return (
    <Cadre acteur={a} actif="/espace/admin/">
      <p className="cote"><Link href="/espace/admin/">Administration</Link> · Journal</p>
      <h1>Journal</h1>
      <p className="muet">Les 300 dernières entrées. Conservées douze mois.</p>
      <p className="actions">
        {FAMILLES.map(([f, l]) => <Link key={f} className={`btn btn--petit ${f === famille ? '' : 'btn--sobre'}`} href={f ? `/espace/admin/journal/?famille=${f}` : '/espace/admin/journal/'}>{l}</Link>)}
      </p>
      <div className="tableau-defile"><table className="tableau">
        <thead><tr><th>Quand</th><th>Qui</th><th>Quoi</th><th>Sur</th></tr></thead>
        <tbody>{lignes.map((l) => (
          <tr key={l.id}>
            <td>{quand(l.le)}</td>
            <td>{l.acteurId ? qui.get(l.acteurId) ?? 'compte supprimé' : 'système'}</td>
            <td>{LIBELLES[l.action] ?? l.action}</td>
            <td className="muet">{l.cibleType ? `${l.cibleType} ${(l.cibleId ?? '').slice(0, 8)}` : ''}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </Cadre>
  );
}
