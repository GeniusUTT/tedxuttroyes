import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import { editionCourante, exigerAdmin } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { DOMAINE_MEMBRES, etatInvitation } from '@/lib/regles';
import { Bouton } from '../../composants/Bouton';
import { Cadre, Message } from '../../composants/Cadre';
import { actionDesactiver, actionSupprimerCompte, actionEmail, actionInviter, actionPoles, actionReactiver, actionRenvoyer, actionRevoquer, actionRole } from './actions';

export const metadata: Metadata = { title: 'Administration' };

const ROLES = { speaker: 'Speaker', membre: 'Membre', admin: 'Admin' } as const;
const jour = (d: Date | null) => (d ? d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) : 'jamais');

export default async function Admin({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerAdmin();
  const { ok, erreur } = await searchParams;
  const e = await editionCourante();
  const b = await base();
  const poles = await b.select().from(schema.pole).orderBy(asc(schema.pole.ordre));
  const invitations = await b.select().from(schema.invitation)
    .where(and(isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)))
    .orderBy(desc(schema.invitation.createdAt));
  const comptes = await b.select().from(schema.user).orderBy(asc(schema.user.role), asc(schema.user.name));
  const affectations = await b.select().from(schema.membrePole).where(eq(schema.membrePole.editionId, e.id));
  const polesDe = (id: string) => affectations.filter((x) => x.userId === id).map((x) => x.poleId);
  const nomPole = (id: string) => poles.find((p) => p.id === id)?.nom ?? '';

  return (
    <Cadre acteur={a} actif="/espace/admin/">
      <p className="cote">Administration · {e.libelle}</p>
      <h1>Comptes et invitations</h1>
      <Message ok={ok} erreur={erreur} />
      <p className="actions"><a className="btn btn--sobre btn--petit" href="/espace/admin/journal/">Journal</a> <a className="btn btn--sobre btn--petit" href="/espace/admin/edition/">Édition et jalons</a> <a className="btn btn--sobre btn--petit" href="/espace/admin/archive/">Archive des Releases</a></p>

      <h2>Inviter</h2>
      <form action={actionInviter} className="carte">
        <div className="grille">
          <div className="champ"><label htmlFor="email">Adresse e-mail</label><input id="email" name="email" type="email" required /></div>
          <div className="champ"><label htmlFor="nom">Nom affiché</label><input id="nom" name="nom" type="text" placeholder="Prénom Nom" /></div>
          <div className="champ">
            <label htmlFor="role">Rôle</label>
            <select id="role" name="role" defaultValue="membre">
              <option value="speaker">Speaker</option>
              <option value="membre">Membre de l’équipe</option>
              <option value="admin">Admin (bureau)</option>
            </select>
          </div>
        </div>
        <fieldset>
          <legend>Pôles (membres et admins)</legend>
          {poles.map((p) => (
            <label key={p.id} className="case"><input type="checkbox" name="poles" value={p.id} /> {p.nom}</label>
          ))}
        </fieldset>
        <label className="case champ"><input type="checkbox" name="derogation" value="oui" /> Dérogation : inviter un membre ou un admin hors du domaine {DOMAINE_MEMBRES}</label>
        <Bouton>Envoyer l’invitation</Bouton>
      </form>

      <h2>Invitations en attente</h2>
      {invitations.length === 0 ? <p className="muet">Aucune.</p> : (
        <div className="tableau-defile"><table className="tableau">
          <thead><tr><th>Adresse</th><th>Rôle</th><th>État</th><th>Expire</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>{invitations.map((i) => {
            const et = etatInvitation(i);
            return (
              <tr key={i.id}>
                <td>{i.email}{i.derogationDomaine && <> <span className="pastille">dérogation</span></>}</td>
                <td>{ROLES[i.role]}</td>
                <td><span className={`pastille ${et === 'valide' ? 'pastille--vert' : 'pastille--rouge'}`}>{et === 'valide' ? 'en attente' : 'expirée'}</span></td>
                <td>{jour(i.expireLe)}</td>
                <td><div className="actions">
                  <form action={actionRenvoyer.bind(null, i.id)}><Bouton variante="sobre" petit>Renvoyer</Bouton></form>
                  <form action={actionRevoquer.bind(null, i.id)}><Bouton variante="danger" petit>Révoquer</Bouton></form>
                </div></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}

      <h2>Comptes</h2>
      <div className="tableau-defile"><table className="tableau">
        <thead><tr><th>Nom</th><th>Rôle</th><th>Pôles</th><th>Dernière connexion</th><th>Modifier</th></tr></thead>
        <tbody>{comptes.map((u) => (
          <tr key={u.id}>
            <td>{u.name}<br /><span className="muet">{u.email}</span>{u.desactiveLe && <> <span className="pastille pastille--rouge">désactivé</span></>}</td>
            <td>{ROLES[u.role]}</td>
            <td>{polesDe(u.id).map(nomPole).join(', ') || <span className="muet">aucun</span>}</td>
            <td>{jour(u.derniereConnexion)}</td>
            <td>
              <details>
                <summary>Modifier</summary>
                <form action={actionRole.bind(null, u.id)} className="actions champ">
                  <label className="visually-hidden" htmlFor={`role-${u.id}`}>Rôle</label>
                  <select id={`role-${u.id}`} name="role" defaultValue={u.role} style={{ width: 'auto' }}>
                    <option value="speaker">Speaker</option><option value="membre">Membre</option><option value="admin">Admin</option>
                  </select>
                  <Bouton variante="sobre" petit>Changer le rôle</Bouton>
                </form>
                {u.role !== 'speaker' && (
                  <form action={actionPoles.bind(null, u.id)} className="champ">
                    {poles.map((p) => (
                      <label key={p.id} className="case"><input type="checkbox" name="poles" value={p.id} defaultChecked={polesDe(u.id).includes(p.id)} /> {p.nom}</label>
                    ))}
                    <Bouton variante="sobre" petit>Enregistrer les pôles</Bouton>
                  </form>
                )}
                <form action={actionEmail.bind(null, u.id)} className="actions champ">
                  <label className="visually-hidden" htmlFor={`email-${u.id}`}>Adresse e-mail</label>
                  <input id={`email-${u.id}`} name="email" type="email" defaultValue={u.email} required style={{ width: 'auto', flex: 1 }} />
                  <Bouton variante="sobre" petit>Changer l’adresse</Bouton>
                </form>
                {u.desactiveLe
                  ? <form action={actionReactiver.bind(null, u.id)}><Bouton variante="sobre" petit>Réactiver</Bouton></form>
                  : u.id !== a.id && <form action={actionDesactiver.bind(null, u.id)}><Bouton variante="danger" petit>Désactiver</Bouton></form>}
                {u.id !== a.id && (
                  <form action={actionSupprimerCompte.bind(null, u.id)} className="champ" style={{ marginTop: 12 }}>
                    <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Supprimer définitivement ce compte et ses documents (la Speaker Release est archivée)</label>
                    <Bouton variante="danger" petit>Supprimer le compte</Bouton>
                  </form>
                )}
              </details>
            </td>
          </tr>
        ))}</tbody>
      </table></div>
    </Cadre>
  );
}
