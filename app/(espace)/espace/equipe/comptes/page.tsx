import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import { editionCourante, exigerMembre } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { etatInvitation } from '@/lib/regles';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message, Section } from '../../../composants/Cadre';
import { FormulaireInvitation } from '../../../composants/Invitation';
import { actionDesactiver, actionEmail, actionReactiver, actionRenvoyer, actionRevoquer, actionSupprimerCompte } from './actions';

export const metadata: Metadata = { title: 'Comptes' };

const ROLES = { speaker: 'Speaker', membre: 'Équipe', prestataire: 'Prestataire' } as const;
const jour = (d: Date | null) => (d ? d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) : 'jamais');

export default async function Comptes({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { ok, erreur } = await searchParams;
  const e = await editionCourante();
  const b = await base();
  const invitations = await b.select().from(schema.invitation)
    .where(and(isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)))
    .orderBy(desc(schema.invitation.createdAt));
  const comptes = await b.select().from(schema.user).orderBy(desc(schema.user.role), asc(schema.user.name));
  const avecMdp = new Set((await b.select({ id: schema.account.userId }).from(schema.account).where(eq(schema.account.providerId, 'credential'))).map((x) => x.id));

  return (
    <Cadre
      acteur={a}
      actif="/espace/equipe/comptes/"
      cote={e.libelle}
      titre="Comptes"
      chapo="Un seul rôle dans l’équipe : chaque membre peut tout faire. Il faut toujours au moins deux membres actifs. Les prestataires s’invitent depuis le dossier de leur structure, dans la page Prestataires."
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Inviter" titre="Inviter quelqu’un">
        <FormulaireInvitation chemin="/espace/equipe/comptes/" />
      </Section>

      <Section cote="En attente" titre="Invitations en attente" alt>
        {invitations.length === 0 ? <p className="muet">Aucune.</p> : (
          <div className="tableau-defile"><table className="tableau">
            <thead><tr><th>Adresse</th><th>Rôle</th><th>État</th><th>Expire</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>{invitations.map((i) => {
              const et = etatInvitation(i);
              return (
                <tr key={i.id}>
                  <td>{i.email}{i.derogationDomaine && <> <span className="pastille">dérogation</span></>}</td>
                  <td>{ROLES[i.role]}</td>
                  <td><span className={et === 'valide' ? 'pastille' : 'pastille pastille--rouge'}>{et === 'valide' ? 'en attente' : 'expirée'}</span></td>
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
      </Section>

      <Section cote="Comptes" titre="Tous les comptes">
        <p className="muet">« Sans mot de passe » : un compte créé avant le passage aux mots de passe. La personne en choisit un par « Mot de passe oublié » sur la page de connexion.</p>
        <div className="tableau-defile"><table className="tableau">
          <thead><tr><th>Nom</th><th>Rôle</th><th>Dernière connexion</th><th>Gérer</th></tr></thead>
          <tbody>{comptes.map((u) => (
            <tr key={u.id}>
              <td>
                <p>{u.name}</p>
                <p className="muet">{u.email}</p>
                {u.desactiveLe && <span className="pastille pastille--rouge">désactivé</span>}
                {!avecMdp.has(u.id) && <span className="pastille">sans mot de passe</span>}
              </td>
              <td>{ROLES[u.role]}</td>
              <td>{jour(u.derniereConnexion)}</td>
              <td>
                {u.id === a.id ? <span className="muet">vous</span> : (
                  <details>
                    <summary>Gérer</summary>
                    <form action={actionEmail.bind(null, u.id)} className="formulaire">
                      <div className="champ"><label htmlFor={`email-${u.id}`}>Adresse e-mail</label><input id={`email-${u.id}`} name="email" type="email" defaultValue={u.email} required /></div>
                      <Bouton variante="sobre" petit>Changer l’adresse</Bouton>
                    </form>
                    <div className="actions">
                      {u.desactiveLe
                        ? <form action={actionReactiver.bind(null, u.id)}><Bouton variante="sobre" petit>Réactiver</Bouton></form>
                        : <form action={actionDesactiver.bind(null, u.id)}><Bouton variante="danger" petit>Désactiver</Bouton></form>}
                    </div>
                    <form action={actionSupprimerCompte.bind(null, u.id)} className="formulaire">
                      <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Supprimer définitivement ce compte et ses documents (Speaker Release et droit à l’image signés archivés)</label>
                      <Bouton variante="danger" petit>Supprimer le compte</Bouton>
                    </form>
                  </details>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table></div>
      </Section>
    </Cadre>
  );
}
