import { and, desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerMembre } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { categorie } from '@/lib/categories';
import { Cadre, Section } from '../../../composants/Cadre';
import { quand } from '../../../composants/Documents';

export const metadata: Metadata = { title: 'Archive des documents signés' };

export default async function Archive() {
  const a = await exigerMembre();
  const b = await base();
  const lignes = await b.select({ v: schema.version, d: schema.document, s: schema.speaker, e: schema.edition }).from(schema.version)
    .innerJoin(schema.document, eq(schema.document.id, schema.version.documentId))
    .innerJoin(schema.edition, eq(schema.edition.id, schema.document.editionId))
    .leftJoin(schema.speaker, eq(schema.speaker.id, schema.document.speakerId))
    .where(and(eq(schema.document.archive, true)))
    .orderBy(desc(schema.edition.annee), desc(schema.version.numero));
  return (
    <Cadre
      acteur={a}
      actif="/espace/equipe/edition/"
      cote={<Link href="/espace/equipe/edition/">Édition</Link>}
      titre="Archive"
      chapo="La Speaker Release fonde le droit de diffuser la vidéo d’un talk, le droit à l’image celui d’utiliser les photos de la soirée : signés, ils survivent à la suppression du speaker, ici, sans limite de durée. TED peut demander la Release à tout moment."
    >
      <Section cote="Documents signés">
        {lignes.length === 0 ? <p className="muet">Aucun pour l’instant.</p> : (
          <div className="tableau-defile"><table className="tableau">
            <thead><tr><th>Édition</th><th>Speaker</th><th>Document</th><th>Fichier</th><th>Déposé le</th></tr></thead>
            <tbody>{lignes.map(({ v, d, s, e }) => (
              <tr key={v.id}><td>{e.annee}</td><td>{s?.nomAffiche ?? 'inconnu'}</td><td>{categorie(d.categorie)?.libelle ?? d.categorie}</td><td className="fichier"><a href={`/espace/api/fichiers/${v.id}/`}>{v.nomOrigine}</a> (v{v.numero})</td><td>{quand(v.deposeLe)}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </Section>
    </Cadre>
  );
}
