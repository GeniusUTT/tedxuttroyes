import { and, asc, eq, inArray, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerMembre } from '@/lib/acces';
import { categorie, CATEGORIES } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { etats, jalons } from '@/lib/suivi';
import { Cadre, Message, Section } from '../../composants/Cadre';
import { CarteDocument, choix } from '../../composants/Documents';
import { Depot } from '../../composants/Depot';
import { FormulaireInvitation } from '../../composants/Invitation';
import { Pastille } from '../../composants/Jalons';

export const metadata: Metadata = { title: 'Speakers' };

const RETOUR = '/espace/equipe/';
const REQUIS = CATEGORIES.filter((c) => c.requis).map((c) => c.slug);
const MODELES = CATEGORIES.filter((c) => c.estModele);

export default async function Equipe({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const b = await base();
  const speakers = await b.select().from(schema.speaker)
    .where(and(eq(schema.speaker.editionId, ctx.editionId), isNull(schema.speaker.supprimeLe)))
    .orderBy(asc(schema.speaker.nomAffiche));
  const lesJalons = await jalons(ctx.editionId);
  const lesEtats = await etats(speakers.map((s) => s.id));
  const etat = (s: string, j: string) => lesEtats.find((e) => e.speakerId === s && e.jalonId === j)?.etat ?? 'a_faire';
  const referents = new Map((await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user)).map((u) => [u.id, u.name]));
  const fournis = speakers.length
    ? await b.select({ s: schema.document.speakerId, c: schema.document.categorie }).from(schema.document)
      .where(and(inArray(schema.document.speakerId, speakers.map((s) => s.id)), inArray(schema.document.categorie, REQUIS), isNull(schema.document.supprimeLe)))
    : [];
  // Le dossier d'un speaker : trois rubriques de fiche, plus les pièces requises.
  const total = 3 + REQUIS.length;
  const avancement = (s: typeof speakers[number]) =>
    [[s.prenom, s.nom, s.emailContact, s.telephone].every((x) => x.trim()), !!s.resume.trim(), !!s.biographie.trim()].filter(Boolean).length
    + new Set(fournis.filter((f) => f.s === s.id).map((f) => f.c)).size;

  const pourTous = await documents(ctx, { rattachement: 'tous_speakers' });
  const autres = pourTous.filter((d) => !categorie(d.categorie)?.estModele);

  return (
    <Cadre
      acteur={a}
      actif={RETOUR}
      cote="Équipe"
      titre="Speakers"
      chapo="Le suivi de chaque speaker de l’édition : sa fiche, ses pièces, ses jalons. Un clic sur un nom ouvre son dossier."
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Avancement" titre={`${speakers.length} speaker${speakers.length > 1 ? 's' : ''}`}>
        {speakers.length === 0 ? <p className="muet">Aucun speaker invité pour l’instant.</p> : (
          <div className="tableau-defile"><table className="tableau">
            <thead><tr><th>Speaker</th><th>Talk</th><th>Référent</th><th>Dossier</th>{lesJalons.map((j) => <th key={j.id}>{j.libelle}</th>)}</tr></thead>
            <tbody>{speakers.map((s) => {
              const n = avancement(s);
              return (
                <tr key={s.id}>
                  <td>
                    <p><Link href={`/espace/equipe/speakers/${s.id}/`}>{s.nomAffiche}</Link></p>
                    {!s.userId && <span className="pastille">sans compte</span>}
                  </td>
                  <td>{s.titreProvisoire || <span className="muet">à venir</span>}</td>
                  <td>{s.referentId ? referents.get(s.referentId) : <span className="muet">toute l’équipe</span>}</td>
                  <td><span className={n === total ? 'pastille pastille--fait' : 'pastille'}>{n}/{total}</span></td>
                  {lesJalons.map((j) => <td key={j.id}><Pastille etat={etat(s.id, j.id)} echeance={j.echeance} /></td>)}
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </Section>

      <Section cote="Inviter" titre="Inviter un speaker" alt>
        <FormulaireInvitation chemin={RETOUR} role="speaker" />
      </Section>

      <Section cote="Modèles" titre="Les modèles à signer">
        <p className="lead">Déposez ici la Speaker Release et le droit à l’image vierges : chaque speaker les télécharge depuis son dossier. Le dépôt d’un fichier identique au modèle est refusé, le speaker est prévenu qu’il a oublié de signer.</p>
        <div className="grille">
          {MODELES.map((c) => {
            const d = pourTous.find((x) => x.categorie === c.slug);
            return d ? <CarteDocument key={c.slug} d={d} ctx={ctx} retour={RETOUR} signer /> : (
              <div key={c.slug} className="carte carte--signer">
                <p className="etiquette">{c.libelle}</p>
                <p className="muet">Pas encore de modèle : les speakers ne peuvent pas encore le signer.</p>
                <Depot rattachement="tous_speakers" categories={choix([c.slug])} libelleBouton="Déposer le modèle" />
              </div>
            );
          })}
        </div>
      </Section>

      <Section cote="Pour tous" titre="Pour tous les speakers" alt>
        <p className="lead">Dossier d’accueil, règles de contenu TEDx, planning du jour J : visibles par chaque speaker de l’édition.</p>
        <div className="grille">
          {autres.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} />)}
          <div className="carte">
            <p className="etiquette">Ajouter</p>
            <Depot rattachement="tous_speakers" categories={choix(['accueil', 'regles_tedx', 'planning', 'autre'])} titreLibre />
          </div>
        </div>
      </Section>
    </Cadre>
  );
}
