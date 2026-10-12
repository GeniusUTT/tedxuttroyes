import { inArray } from 'drizzle-orm';
import Link from 'next/link';
import { categorie, CATEGORIES } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import type { DocumentAvecVersions } from '@/lib/documents';
import { peutDeposer, peutSupprimer, type Contexte } from '@/lib/droits';
import { actionSupprimer } from '../espace/documents/actions';
import { Bouton } from './Bouton';
import { Depot } from './Depot';

export const taille = (o: number) => (o < 1024 * 1024 ? `${Math.max(1, Math.round(o / 1024))} ko` : `${(o / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`);
export const quand = (d: Date) => d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' });

export function choix(slugs: string[]) {
  return CATEGORIES.filter((c) => slugs.includes(c.slug)).map(({ slug, libelle, formats, maxMo, attestation, aide }) => ({ slug, libelle, formats, maxMo, attestation, aide }));
}

export async function noms(ids: (string | null)[]) {
  const uniques = [...new Set(ids.filter((x): x is string => !!x))];
  if (!uniques.length) return new Map<string, string>();
  const b = await base();
  const r = await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user).where(inArray(schema.user.id, uniques));
  return new Map(r.map((u) => [u.id, u.name]));
}

// Un document, ses versions (la plus récente en tête), ses actions.
export async function CarteDocument({ d, ctx, retour, nouvelleVersion = true, signer = false }: {
  d: DocumentAvecVersions;
  ctx: Contexte;
  retour: string;
  nouvelleVersion?: boolean;
  signer?: boolean;
}) {
  const qui = await noms([d.creeParId, ...d.versions.map((v) => v.deposeParId)]);
  const cat = categorie(d.categorie);
  const [derniere, ...anciennes] = d.versions;
  return (
    <article className={signer ? 'carte carte--signer' : 'carte'}>
      <p className="etiquette">{cat?.libelle ?? d.categorie}</p>
      <h3><Link href={`/espace/documents/${d.id}/`}>{d.titre}</Link></h3>
      {derniere && (
        <p className="fichier">
          <a href={`/espace/api/fichiers/${derniere.id}/`}>{derniere.nomOrigine}</a>{' '}
          <span className="muet">v{derniere.numero} · {taille(derniere.taille)} · {qui.get(derniere.deposeParId ?? '') ?? 'compte supprimé'} · {quand(derniere.deposeLe)}</span>
          {derniere.droitsAttestesLe && <> <span className="pastille">droits attestés</span></>}
        </p>
      )}
      {anciennes.length > 0 && (
        <details>
          <summary>{anciennes.length} version{anciennes.length > 1 ? 's' : ''} précédente{anciennes.length > 1 ? 's' : ''}</summary>
          <ul className="fil">
            {anciennes.map((v) => (
              <li key={v.id} className="fichier"><a href={`/espace/api/fichiers/${v.id}/`}>v{v.numero} · {v.nomOrigine}</a> <span className="muet">{taille(v.taille)} · {quand(v.deposeLe)}</span></li>
            ))}
          </ul>
        </details>
      )}
      <div className="actions">
        <Link className="btn btn--ghost btn--sm" href={`/espace/documents/${d.id}/`}>Retours et historique</Link>
        {peutSupprimer(ctx, d) && (
          <form action={actionSupprimer.bind(null, d.id, retour)}><Bouton variante="danger" petit>Supprimer</Bouton></form>
        )}
      </div>
      {nouvelleVersion && cat && peutDeposer(ctx, d) && (
        <details>
          <summary>Déposer une nouvelle version</summary>
          <Depot rattachement={d.rattachement} speakerId={d.speakerId ?? undefined} prestataireId={d.prestataireId ?? undefined} documentId={d.id} categories={choix([d.categorie])} libelleBouton="Déposer la nouvelle version" />
        </details>
      )}
    </article>
  );
}
