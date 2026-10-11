import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerRole } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { peutDeposer } from '@/lib/droits';
import { Cadre, Message } from '../../composants/Cadre';
import { CarteDocument, choix } from '../../composants/Documents';
import { Depot } from '../../composants/Depot';
import { Pastille } from '../../composants/Jalons';
import { etats, jalons } from '@/lib/suivi';

export const metadata: Metadata = { title: 'Équipe' };


export default async function Equipe({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('membre', 'admin');
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const b = await base();
  const speakers = await b.select().from(schema.speaker).where(eq(schema.speaker.editionId, ctx.editionId)).orderBy(asc(schema.speaker.nomAffiche));
  const lesJalons = await jalons(ctx.editionId);
  const lesEtats = await etats(speakers.map((s) => s.id));
  const etat = (s: string, j: string) => lesEtats.find((e) => e.speakerId === s && e.jalonId === j)?.etat ?? 'a_faire';
  const referents = new Map((await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user)).map((u) => [u.id, u.name]));
  const tousPoles = await b.select().from(schema.pole).orderBy(asc(schema.pole.ordre));
  const mesPoles = a.role === 'admin' ? tousPoles : tousPoles.filter((p) => ctx.poles.some((x) => x.id === p.id));
  const pourTous = await documents(ctx, { rattachement: 'tous_speakers' });
  const deposerPourTous = peutDeposer(ctx, { rattachement: 'tous_speakers', sens: 'vers_speaker' });
  const dossiersOuverts = a.role === 'admin' || ctx.poles.length > 0;

  return (
    <Cadre acteur={a} actif="/espace/equipe/">
      <p className="cote">Équipe</p>
      <h1>Bonjour {a.nom}</h1>
      <Message ok={ok} erreur={erreur} />
      <p className="actions">
        {mesPoles.map((p) => <Link key={p.id} className="btn btn--sobre btn--petit" href={`/espace/equipe/poles/${p.slug}/`}>{p.nom}</Link>)}
        <Link className="btn btn--sobre btn--petit" href="/espace/equipe/commun/">Espace commun</Link>
      </p>
      {!dossiersOuverts && <p className="muet">Aucun pôle ne vous est encore attribué : vous voyez le tableau et l’espace commun, pas les dossiers.</p>}

      <h2>Speakers</h2>
      {speakers.length === 0 ? <p className="muet">Aucun speaker invité pour l’instant.</p> : (
        <div className="tableau-defile"><table className="tableau">
          <thead><tr><th>Speaker</th><th>Titre provisoire</th><th>Référent</th>{lesJalons.map((j) => <th key={j.id}>{j.libelle}</th>)}</tr></thead>
          <tbody>{speakers.map((s) => (
            <tr key={s.id}>
              <td>{dossiersOuverts ? <Link href={`/espace/equipe/speakers/${s.id}/`}>{s.nomAffiche}</Link> : s.nomAffiche}{!s.userId && <> <span className="pastille">sans compte</span></>}</td>
              <td>{s.titreProvisoire || <span className="muet">à venir</span>}</td>
              <td>{s.referentId ? referents.get(s.referentId) : <span className="muet">pôle</span>}</td>
              {lesJalons.map((j) => <td key={j.id}><Pastille etat={etat(s.id, j.id)} echeance={j.echeance} /></td>)}
            </tr>
          ))}</tbody>
        </table></div>
      )}

      {dossiersOuverts && (
        <>
          <h2>Pour tous les speakers</h2>
          <p className="muet">Dossier d’accueil, règles de contenu TEDx, planning du jour J : visibles par chaque speaker de l’édition.</p>
          <div className="grille">
            {pourTous.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour="/espace/equipe/" />)}
            {deposerPourTous && <div className="carte"><p className="cote">Ajouter</p><Depot rattachement="tous_speakers" categories={choix(['accueil', 'regles_tedx', 'planning', 'autre'])} titreLibre /></div>}
          </div>
        </>
      )}
    </Cadre>
  );
}
