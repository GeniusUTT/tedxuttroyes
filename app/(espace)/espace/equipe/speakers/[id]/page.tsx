import { and, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerMembre } from '@/lib/acces';
import { CATEGORIES, categorie } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { etats, jalons } from '@/lib/suivi';
import { Bouton } from '../../../../composants/Bouton';
import { Cadre, Message, Section } from '../../../../composants/Cadre';
import { CarteDocument, choix } from '../../../../composants/Documents';
import { Depot } from '../../../../composants/Depot';
import { FormulaireFiche } from '../../../../composants/Fiche';
import { echeance, Pastille } from '../../../../composants/Jalons';
import { actionFiche, actionLienVideo } from '../../../documents/actions';
import { actionJalon, actionReferent } from '../../../documents/suivi-actions';
import { actionSupprimerSpeaker } from '../../comptes/actions';

export const metadata: Metadata = { title: 'Dossier speaker' };

const DU_SPEAKER = CATEGORIES.filter((c) => c.sens === 'du_speaker').map((c) => c.slug);

export default async function DossierSpeaker({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const b = await base();
  const [s] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, id), eq(schema.speaker.editionId, ctx.editionId), isNull(schema.speaker.supprimeLe)));
  if (!s) notFound();
  const retour = `/espace/equipe/speakers/${id}/`;
  const docs = await documents(ctx, { rattachement: 'speaker', speakerId: id });
  const duSpeaker = docs.filter((d) => d.sens === 'du_speaker');
  const versLui = docs.filter((d) => d.sens === 'vers_speaker');
  const lesJalons = await jalons(ctx.editionId);
  const lesEtats = await etats([id]);
  const equipe = await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(and(eq(schema.user.role, 'membre'), isNull(schema.user.desactiveLe)));
  const [compte] = s.userId ? await b.select({ email: schema.user.email }).from(schema.user).where(eq(schema.user.id, s.userId)) : [];

  const lignes: [string, string][] = [
    ['Prénom et nom', `${s.prenom} ${s.nom}`.trim()],
    ['E-mail de contact', s.emailContact],
    ['Téléphone', s.telephone],
    ['Compte', compte?.email ?? 'sans compte'],
    ['Titre du talk', s.titreProvisoire],
    ['Résumé', s.resume],
    ['Biographie', s.biographie],
  ];

  return (
    <Cadre
      acteur={a}
      actif="/espace/equipe/"
      cote={<Link href="/espace/equipe/">Speakers</Link>}
      titre={s.nomAffiche}
      chapo={s.titreProvisoire || 'Titre du talk à venir.'}
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Fiche" titre="Coordonnées et talk" id="fiche">
        <dl className="fiche">
          {lignes.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v || <span className="muet">à venir</span>}</dd></div>
          ))}
        </dl>
        <details>
          <summary>Compléter ou corriger la fiche</summary>
          <FormulaireFiche s={s} action={actionFiche.bind(null, id, retour)} equipe />
        </details>
      </Section>

      <Section cote="Suivi" titre="Jalons et référent" alt>
        <div className="tableau-defile"><table className="tableau">
          <thead><tr><th>Jalon</th><th>Échéance</th><th>État</th><th>Changer</th></tr></thead>
          <tbody>{lesJalons.map((j) => {
            const e = lesEtats.find((x) => x.jalonId === j.id)?.etat ?? 'a_faire';
            return (
              <tr key={j.id}>
                <td>{j.libelle}</td><td>{echeance(j.echeance)}</td><td><Pastille etat={e} echeance={j.echeance} /></td>
                <td><form action={actionJalon.bind(null, id, j.id)} className="actions">
                  <label className="visually-hidden" htmlFor={`etat-${j.id}`}>État de « {j.libelle} »</label>
                  <select id={`etat-${j.id}`} name="etat" defaultValue={e} className="select-court"><option value="a_faire">à faire</option><option value="depose">déposé</option><option value="valide">validé</option></select>
                  <Bouton variante="sobre" petit>Enregistrer</Bouton>
                </form></td>
              </tr>
            );
          })}</tbody>
        </table></div>
        <form action={actionReferent.bind(null, id)} className="formulaire">
          <div className="champ">
            <label htmlFor="referent">Référent</label>
            <select id="referent" name="referent" defaultValue={s.referentId ?? ''}>
              <option value="">Aucun : toute l’équipe est prévenue de ses dépôts</option>
              {equipe.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <Bouton variante="sobre" petit>Enregistrer le référent</Bouton>
        </form>
      </Section>

      <Section cote="Du speaker" titre="Ce qu’il a déposé">
        {duSpeaker.length === 0 ? <p className="muet">Rien pour l’instant.</p> : (
          <div className="grille">{duSpeaker.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} signer={!!categorie(d.categorie)?.modele} />)}</div>
        )}
        <details>
          <summary>Déposer à sa place</summary>
          <Depot rattachement="speaker" speakerId={id} categories={choix(DU_SPEAKER)} titreLibre />
        </details>
      </Section>

      <Section cote="Vers le speaker" titre="Mis à sa disposition" alt>
        <div className="grille">
          {versLui.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} />)}
          <div className="carte"><p className="etiquette">Ajouter un document pour ce speaker</p><Depot rattachement="speaker" speakerId={id} categories={choix(['billets', 'accueil', 'planning', 'autre'])} titreLibre /></div>
        </div>
      </Section>

      <Section cote="Après la soirée" titre="Son talk en ligne" id="apres">
        <p className="lead">Le lien de la vidéo sur la chaîne TEDx, une fois publiée : le speaker le retrouve dans son dossier, avec l’album photo de l’édition.</p>
        <form action={actionLienVideo.bind(null, id, retour)} className="formulaire">
          <div className="champ"><label htmlFor="lien-video">Lien YouTube (https)</label><input id="lien-video" name="lien" type="url" defaultValue={s.lienVideo ?? ''} pattern="https://.*" placeholder="https://www.youtube.com/watch?v=" /></div>
          <Bouton variante="sobre">Enregistrer le lien</Bouton>
        </form>
      </Section>

      <Section cote="Supprimer" titre="Retirer ce speaker" alt>
        <p className="lead">Son compte, sa fiche et ses fichiers sont effacés, définitivement. La Speaker Release et le droit à l’image signés sont conservés dans l’archive : ils fondent le droit de diffuser la vidéo et les photos.</p>
        <form action={actionSupprimerSpeaker.bind(null, id)} className="formulaire">
          <label className="case"><input type="checkbox" name="confirmer" value="oui" required /> Je confirme la suppression de {s.nomAffiche}.</label>
          <Bouton variante="danger">Supprimer le speaker</Bouton>
        </form>
      </Section>
    </Cadre>
  );
}
