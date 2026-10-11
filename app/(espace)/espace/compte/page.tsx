import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { exigerSession } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { Bouton } from '../../composants/Bouton';
import { Cadre, Message } from '../../composants/Cadre';
import { fermerAutresSessions, fermerSession, supprimerMonCompte } from './actions';
import { actionPreferences } from '../documents/suivi-actions';
import { preferences } from '@/lib/suivi';

export const metadata: Metadata = { title: 'Mon compte' };

const ROLES = { speaker: 'Speaker', membre: 'Membre de l’équipe', admin: 'Admin' } as const;
const date = (d: Date) => d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' });

function appareil(ua: string | null): string {
  if (!ua) return 'Appareil inconnu';
  const nav = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Navigateur';
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${nav} sur ${os}` : nav;
}

export default async function Compte({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerSession();
  const { ok, erreur } = await searchParams;
  const b = await base();
  const prefs = await preferences(a.id);
  const sessions = await b.select().from(schema.session).where(eq(schema.session.userId, a.id)).orderBy(desc(schema.session.updatedAt));
  return (
    <Cadre acteur={a} actif="/espace/compte/">
      <p className="cote">Mon compte</p>
      <h1>{a.nom}</h1>
      <Message ok={ok} erreur={erreur} />
      <p>{a.email} · {ROLES[a.role]}</p>
      <p className="muet">Seul un admin peut changer l’adresse e-mail d’un compte.</p>

      <h2>Notifications par e-mail</h2>
      <form action={actionPreferences} className="carte">
        <label className="case champ"><input type="checkbox" name="depot" value="oui" defaultChecked={prefs.notifDepot} /> M’écrire à chaque nouveau document qui me concerne</label>
        <label className="case champ"><input type="checkbox" name="commentaire" value="oui" defaultChecked={prefs.notifCommentaire} /> M’écrire à chaque nouveau retour qui me concerne</label>
        <Bouton variante="sobre">Enregistrer</Bouton>
      </form>

      <h2>Sessions ouvertes</h2>
      <p className="muet">Une session dure sept jours et se prolonge tant que vous l’utilisez.</p>
      <div className="tableau-defile">
        <table className="tableau">
          <thead><tr><th>Appareil</th><th>Dernière activité</th><th>Expire</th><th><span className="visually-hidden">Action</span></th></tr></thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{appareil(s.userAgent)}{s.id === a.sessionId && <> <span className="pastille pastille--vert">cette session</span></>}</td>
                <td>{date(s.updatedAt)}</td>
                <td>{date(s.expiresAt)}</td>
                <td>{s.id !== a.sessionId && <form action={fermerSession.bind(null, s.id)}><Bouton variante="sobre" petit>Fermer</Bouton></form>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sessions.length > 1 && (
        <form action={fermerAutresSessions} style={{ marginTop: 16 }}><Bouton variante="sobre">Fermer toutes les autres sessions</Bouton></form>
      )}

      <h2>Mes données</h2>
      <p>Vous pouvez télécharger tout ce que l’espace conserve sur vous : compte, fiche, documents, retours, sessions, journal de vos actions.</p>
      <p><a className="btn btn--sobre" href="/espace/api/export/">Télécharger mes données (JSON)</a></p>
      <p className="muet">Durées de conservation : comptes speakers supprimés douze mois après l’édition, comptes de l’équipe douze mois après la dernière connexion, journal douze mois, justificatifs de transport trois mois après l’édition. La Speaker Release est conservée tant que le talk est en ligne. Détails dans les <a href="/mentions-legales/">mentions légales</a>.</p>
      {a.role !== 'admin' && (
        <form action={supprimerMonCompte} className="carte">
          <label className="case champ"><input type="checkbox" name="confirmer" value="oui" required /> Je veux supprimer mon compte et mes documents, définitivement.{a.role === 'speaker' ? ' Ma Speaker Release signée sera conservée par l’équipe, comme le prévoit la licence TEDx.' : ''}</label>
          <Bouton variante="danger">Supprimer mon compte</Bouton>
        </form>
      )}
    </Cadre>
  );
}
