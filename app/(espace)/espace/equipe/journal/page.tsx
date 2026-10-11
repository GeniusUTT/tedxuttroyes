import { desc, like } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerMembre } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { Cadre, Section } from '../../../composants/Cadre';
import { noms, quand } from '../../../composants/Documents';

export const metadata: Metadata = { title: 'Journal' };

const FAMILLES: [string, string][] = [
  ['', 'Tout'], ['connexion', 'Connexions'], ['invitation', 'Invitations'], ['compte', 'Comptes'], ['speaker', 'Speakers'], ['document', 'Documents'],
  ['commentaire', 'Retours'], ['jalon', 'Jalons'], ['purge', 'Purges'], ['sauvegarde', 'Sauvegardes'],
];

const LIBELLES: Record<string, string> = {
  'connexion': 'connexion', 'connexion.echec': 'échec de connexion', 'connexion.lien_demande': 'lien de mot de passe demandé', 'deconnexion': 'déconnexion',
  'invitation.creee': 'invitation envoyée', 'invitation.renvoyee': 'invitation renvoyée', 'invitation.revoquee': 'invitation révoquée',
  'invitation.acceptee': 'invitation acceptée', 'invitation.refusee': 'invitation refusée', 'compte.mot_de_passe': 'mot de passe choisi',
  'compte.email': 'adresse changée', 'compte.desactive': 'compte désactivé', 'compte.reactive': 'compte réactivé', 'compte.supprime': 'compte supprimé',
  'compte.export': 'export des données', 'compte.secours': 'procédure de secours', 'session.fermee': 'session fermée',
  'document.depose': 'dépôt', 'document.lu': 'téléchargement', 'document.supprime': 'suppression', 'document.modele_refuse': 'modèle non signé refusé',
  'commentaire.cree': 'retour publié', 'commentaire.supprime': 'retour supprimé', 'jalon.valide': 'jalon changé', 'jalon.modifie': 'jalon modifié',
  'edition.modifiee': 'édition modifiée', 'speaker.modifie': 'fiche speaker modifiée', 'speaker.supprime': 'speaker supprimé',
  'purge': 'purge quotidienne', 'sauvegarde': 'sauvegarde',
};

export default async function Journal({ searchParams }: { searchParams: Promise<{ famille?: string }> }) {
  const a = await exigerMembre();
  const { famille = '' } = await searchParams;
  const b = await base();
  const q = b.select().from(schema.journal);
  const lignes = await (famille ? q.where(like(schema.journal.action, `${famille.replace(/[^a-z_]/g, '')}%`)) : q).orderBy(desc(schema.journal.le)).limit(300);
  const qui = await noms(lignes.map((l) => l.acteurId));
  return (
    <Cadre acteur={a} actif="/espace/equipe/edition/" cote={<Link href="/espace/equipe/edition/">Édition</Link>} titre="Journal" chapo="Qui a fait quoi, et quand : les 300 dernières entrées, conservées douze mois. Jamais le contenu d’un document.">
      <Section cote="Filtrer">
        <p className="actions">
          {FAMILLES.map(([f, l]) => <Link key={f} className={`btn btn--sm ${f === famille ? 'btn--primary' : 'btn--ghost'}`} href={f ? `/espace/equipe/journal/?famille=${f}` : '/espace/equipe/journal/'}>{l}</Link>)}
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
      </Section>
    </Cadre>
  );
}
