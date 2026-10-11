import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { exigerSession } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { MDP_MIN } from '@/lib/regles';
import { preferences } from '@/lib/suivi';
import { Bouton } from '../../composants/Bouton';
import { Cadre, Message, Section } from '../../composants/Cadre';
import { actionPreferences } from '../documents/suivi-actions';
import { changerMotDePasse, fermerAutresSessions, fermerSession, supprimerMonCompte } from './actions';

export const metadata: Metadata = { title: 'Mon compte' };

const ROLES = { speaker: 'Speaker', membre: 'Membre de l’équipe' } as const;
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
    <Cadre
      acteur={a}
      actif="/espace/compte/"
      cote="Mon compte"
      titre={a.nom}
      chapo={<>{a.email} · {ROLES[a.role]}. Seule l’équipe peut changer l’adresse e-mail d’un compte.</>}
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Mot de passe" titre="Changer de mot de passe">
        <form action={changerMotDePasse} className="formulaire formulaire--etroit">
          <input type="email" name="identifiant" autoComplete="username" value={a.email} readOnly hidden />
          <div className="champ"><label htmlFor="actuel">Mot de passe actuel</label><input id="actuel" name="actuel" type="password" autoComplete="current-password" required /></div>
          <div className="champ">
            <label htmlFor="mdp">Nouveau mot de passe</label>
            <input id="mdp" name="mdp" type="password" autoComplete="new-password" minLength={MDP_MIN} maxLength={128} required />
            <p className="aide">{MDP_MIN} caractères au moins.</p>
          </div>
          <div className="champ"><label htmlFor="confirmation">Le même, une seconde fois</label><input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={MDP_MIN} maxLength={128} required /></div>
          <Bouton variante="sobre">Changer le mot de passe</Bouton>
        </form>
      </Section>

      <Section cote="Notifications" titre="Notifications par e-mail" alt>
        <form action={actionPreferences} className="formulaire">
          <label className="case"><input type="checkbox" name="depot" value="oui" defaultChecked={prefs.notifDepot} /> M’écrire à chaque nouveau document qui me concerne</label>
          <label className="case"><input type="checkbox" name="commentaire" value="oui" defaultChecked={prefs.notifCommentaire} /> M’écrire à chaque nouveau retour qui me concerne</label>
          <Bouton variante="sobre">Enregistrer</Bouton>
        </form>
      </Section>

      <Section cote="Sessions" titre="Sessions ouvertes">
        <p className="muet">Une session dure sept jours et se prolonge tant que vous l’utilisez.</p>
        <div className="tableau-defile">
          <table className="tableau">
            <thead><tr><th>Appareil</th><th>Dernière activité</th><th>Expire</th><th><span className="visually-hidden">Action</span></th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id}>
                  <td>{appareil(s.userAgent)}{s.id === a.sessionId && <> <span className="pastille">cette session</span></>}</td>
                  <td>{date(s.updatedAt)}</td>
                  <td>{date(s.expiresAt)}</td>
                  <td>{s.id !== a.sessionId && <form action={fermerSession.bind(null, s.id)}><Bouton variante="sobre" petit>Fermer</Bouton></form>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length > 1 && <form action={fermerAutresSessions}><Bouton variante="sobre">Fermer toutes les autres sessions</Bouton></form>}
      </Section>

      <Section cote="Mes données" titre="Vos données" alt>
        <p className="lead">Vous pouvez télécharger tout ce que l’espace conserve sur vous : compte, fiche, documents, retours, sessions, journal de vos actions.</p>
        <p><a className="btn btn--ghost" href="/espace/api/export/">Télécharger mes données (JSON)</a></p>
        <p className="muet">Durées de conservation : comptes speakers supprimés douze mois après l’édition, comptes de l’équipe douze mois après la dernière connexion, journal douze mois, justificatifs de transport trois mois après l’édition. La Speaker Release et le droit à l’image signés sont conservés tant que le talk et les photos sont en ligne. Détails dans les <a href="/mentions-legales/">mentions légales</a>.</p>
        <form action={supprimerMonCompte} className="formulaire">
          <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Je veux supprimer mon compte et mes documents, définitivement.{a.role === 'speaker' ? ' Ma Speaker Release et mon droit à l’image signés seront conservés par l’équipe, comme le prévoit la licence TEDx.' : ''}</label>
          <Bouton variante="danger">Supprimer mon compte</Bouton>
        </form>
      </Section>
    </Cadre>
  );
}
