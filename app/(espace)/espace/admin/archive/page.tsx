import { and, desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerAdmin } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { Cadre } from '../../../composants/Cadre';
import { quand } from '../../../composants/Documents';

export const metadata: Metadata = { title: 'Archive des Speaker Releases' };

export default async function Archive() {
  const a = await exigerAdmin();
  const b = await base();
  const lignes = await b.select({ v: schema.version, d: schema.document, s: schema.speaker, e: schema.edition }).from(schema.version)
    .innerJoin(schema.document, eq(schema.document.id, schema.version.documentId))
    .innerJoin(schema.edition, eq(schema.edition.id, schema.document.editionId))
    .leftJoin(schema.speaker, eq(schema.speaker.id, schema.document.speakerId))
    .where(and(eq(schema.document.archive, true)))
    .orderBy(desc(schema.edition.annee), desc(schema.version.numero));
  return (
    <Cadre acteur={a} actif="/espace/admin/">
      <p className="cote"><Link href="/espace/admin/">Administration</Link> · Archive</p>
      <h1>Speaker Releases archivées</h1>
      <p className="chapo">La Release fonde le droit de diffuser la vidéo d’un talk : elle survit à la suppression du compte du speaker, ici, sans limite de durée. TED peut la demander à tout moment.</p>
      {lignes.length === 0 ? <p className="muet">Aucune pour l’instant.</p> : (
        <div className="tableau-defile"><table className="tableau">
          <thead><tr><th>Édition</th><th>Speaker</th><th>Fichier</th><th>Déposé le</th></tr></thead>
          <tbody>{lignes.map(({ v, s, e }) => (
            <tr key={v.id}><td>{e.annee}</td><td>{s?.nomAffiche ?? 'inconnu'}</td><td><a href={`/espace/api/fichiers/${v.id}/`}>{v.nomOrigine}</a> (v{v.numero})</td><td>{quand(v.deposeLe)}</td></tr>
          ))}</tbody>
        </table></div>
      )}
    </Cadre>
  );
}
