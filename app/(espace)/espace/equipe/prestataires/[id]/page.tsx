import { and, desc, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerMembre } from '@/lib/acces';
import { DU_PRESTATAIRE, VERS_PRESTATAIRE } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { comptesDuPrestataire, prestataireLisible } from '@/lib/prestataires';
import { etatInvitation } from '@/lib/regles';
import { Bouton } from '../../../../composants/Bouton';
import { Cadre, Message, Section } from '../../../../composants/Cadre';
import { CarteDocument, choix } from '../../../../composants/Documents';
import { Depot } from '../../../../composants/Depot';
import { FormulaireFichePrestataire } from '../../../../composants/FichePrestataire';
import { actionFichePrestataire, actionInviterPrestataire, actionReferentPrestataire, actionRetirerAcces, actionSupprimerPrestataire } from '../actions';

export const metadata: Metadata = { title: 'Dossier prestataire' };

const jour = (d: Date | null) => (d ? d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' }) : 'jamais');

export default async function DossierPrestataire({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const p = await prestataireLisible(ctx, id);
  if (!p) notFound();
  const retour = `/espace/equipe/prestataires/${id}/`;
  const b = await base();
  const docs = await documents(ctx, { rattachement: 'prestataire', prestataireId: id });
  const recus = docs.filter((d) => d.sens === 'du_prestataire');
  const envoyes = docs.filter((d) => d.sens === 'vers_prestataire');
  const comptes = await comptesDuPrestataire(id);
  const invitations = (await b.select().from(schema.invitation)
    .where(and(eq(schema.invitation.prestataireId, id), isNull(schema.invitation.accepteeLe), isNull(schema.invitation.revoqueeLe)))
    .orderBy(desc(schema.invitation.createdAt)));
  const equipe = await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(and(eq(schema.user.role, 'membre'), isNull(schema.user.desactiveLe)));

  const lignes: [string, string][] = [
    ['Prestation', p.prestation],
    ['Personne à joindre', p.contact],
    ['E-mail de contact', p.emailContact],
    ['Téléphone', p.telephone],
    ['Adresse de facturation', p.adresse],
  ];

  return (
    <Cadre
      acteur={a}
      actif="/espace/equipe/prestataires/"
      cote={<Link href="/espace/equipe/prestataires/">Prestataires</Link>}
      titre={p.structure}
      chapo={p.prestation || 'Prestation à préciser.'}
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Fiche" titre="Coordonnées" id="fiche">
        <dl className="fiche">
          {lignes.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v || <span className="muet">à venir</span>}</dd></div>
          ))}
        </dl>
        <details>
          <summary>Compléter ou corriger la fiche</summary>
          <FormulaireFichePrestataire p={p} action={actionFichePrestataire.bind(null, id, retour)} />
        </details>
      </Section>

      <Section cote="Accès" titre="Qui a accès au dossier" id="acces" alt>
        {comptes.length === 0 ? <p className="muet">Personne pour l’instant : invitez un interlocuteur ci-dessous.</p> : (
          <div className="tableau-defile"><table className="tableau">
            <thead><tr><th>Personne</th><th>Dernière connexion</th><th>Gérer</th></tr></thead>
            <tbody>{comptes.map((c) => (
              <tr key={c.id}>
                <td>
                  <p>{c.nom}</p>
                  <p className="muet">{c.email}</p>
                  {c.desactiveLe && <span className="pastille pastille--rouge">désactivé</span>}
                </td>
                <td>{jour(c.derniereConnexion)}</td>
                <td>
                  <details>
                    <summary>Retirer l’accès</summary>
                    <form action={actionRetirerAcces.bind(null, id, c.id)} className="formulaire">
                      <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Supprimer le compte de {c.nom}. Ses dépôts restent dans le dossier.</label>
                      <Bouton variante="danger" petit>Retirer l’accès</Bouton>
                    </form>
                  </details>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
        {invitations.length > 0 && (
          <>
            <h3>Invitations en attente</h3>
            <ul className="fil">
              {invitations.map((i) => (
                <li key={i.id}>{i.email} <span className={etatInvitation(i) === 'valide' ? 'pastille' : 'pastille pastille--rouge'}>{etatInvitation(i) === 'valide' ? `expire le ${jour(i.expireLe)}` : 'expirée'}</span></li>
              ))}
            </ul>
            <p className="muet">Une invitation se renvoie ou se révoque depuis la page <Link href="/espace/equipe/comptes/">Comptes</Link>.</p>
          </>
        )}
        <h3>Inviter une personne</h3>
        <form action={actionInviterPrestataire.bind(null, id)} className="formulaire">
          <div className="champs">
            <div className="champ"><label htmlFor="inv-email">Adresse e-mail</label><input id="inv-email" name="email" type="email" required /></div>
            <div className="champ"><label htmlFor="inv-nom">Nom affiché</label><input id="inv-nom" name="nom" type="text" placeholder="Prénom Nom" /></div>
          </div>
          <p className="muet">La personne reçoit un lien valable sept jours, où elle choisit son mot de passe. Elle ne verra que ce dossier.</p>
          <Bouton>Envoyer l’invitation</Bouton>
        </form>
        <form action={actionReferentPrestataire.bind(null, id)} className="formulaire">
          <div className="champ">
            <label htmlFor="referent">Référent</label>
            <select id="referent" name="referent" defaultValue={p.referentId ?? ''}>
              <option value="">Aucun : toute l’équipe est prévenue de ses dépôts</option>
              {equipe.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <Bouton variante="sobre" petit>Enregistrer le référent</Bouton>
        </form>
      </Section>

      <Section cote="Du prestataire" titre="Ce qu’il nous a transmis">
        {recus.length === 0 ? <p className="muet">Rien pour l’instant.</p> : (
          <div className="grille">{recus.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} />)}</div>
        )}
        <details>
          <summary>Déposer à sa place</summary>
          <Depot rattachement="prestataire" prestataireId={id} categories={choix(DU_PRESTATAIRE)} titreLibre />
        </details>
      </Section>

      <Section cote="Vers le prestataire" titre="Mis à sa disposition" alt>
        <div className="grille">
          {envoyes.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} />)}
          <div className="carte"><p className="etiquette">Ajouter un document pour ce prestataire</p><Depot rattachement="prestataire" prestataireId={id} categories={choix(VERS_PRESTATAIRE)} titreLibre /></div>
        </div>
      </Section>

      <Section cote="Supprimer" titre="Supprimer ce prestataire">
        <p className="lead">Les comptes de toutes les personnes du dossier, sa fiche et ses fichiers sont effacés, définitivement. Les devis, factures et contrats sont conservés dans l’archive, pour la trésorerie.</p>
        <form action={actionSupprimerPrestataire.bind(null, id)} className="formulaire">
          <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Je confirme la suppression de {p.structure}.</label>
          <Bouton variante="danger">Supprimer le prestataire</Bouton>
        </form>
      </Section>
    </Cadre>
  );
}
