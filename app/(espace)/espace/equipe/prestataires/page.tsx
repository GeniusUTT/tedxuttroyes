import { and, inArray, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerMembre } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { contexte } from '@/lib/documents';
import { prestataires } from '@/lib/prestataires';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message, Section } from '../../../composants/Cadre';
import { actionCreerPrestataire } from './actions';

export const metadata: Metadata = { title: 'Prestataires' };

const RETOUR = '/espace/equipe/prestataires/';

export default async function Prestataires({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const b = await base();
  const liste = await prestataires(ctx.editionId);
  const ids = liste.map((p) => p.id);
  const comptes = ids.length ? await b.select().from(schema.prestataireCompte).where(inArray(schema.prestataireCompte.prestataireId, ids)) : [];
  const docs = ids.length
    ? await b.select({ p: schema.document.prestataireId, sens: schema.document.sens }).from(schema.document)
      .where(and(inArray(schema.document.prestataireId, ids), isNull(schema.document.supprimeLe)))
    : [];
  const referents = new Map((await b.select({ id: schema.user.id, name: schema.user.name }).from(schema.user)).map((u) => [u.id, u.name]));
  const compter = (id: string, sens: string) => docs.filter((d) => d.p === id && d.sens === sens).length;

  return (
    <Cadre
      acteur={a}
      actif={RETOUR}
      cote="Équipe"
      titre="Prestataires"
      chapo="Régie, traiteur, imprimeur… Chaque structure a son dossier, où l’équipe et ses interlocuteurs s’échangent devis, factures, contrats et fiches techniques. Un clic sur un nom ouvre le dossier."
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Dossiers" titre={`${liste.length} prestataire${liste.length > 1 ? 's' : ''}`}>
        {liste.length === 0 ? <p className="muet">Aucun prestataire pour l’instant.</p> : (
          <div className="tableau-defile"><table className="tableau">
            <thead><tr><th>Structure</th><th>Prestation</th><th>Référent</th><th>Accès</th><th>Reçus</th><th>Envoyés</th></tr></thead>
            <tbody>{liste.map((p) => {
              const n = comptes.filter((c) => c.prestataireId === p.id).length;
              return (
                <tr key={p.id}>
                  <td><Link href={`${RETOUR}${p.id}/`}>{p.structure}</Link></td>
                  <td>{p.prestation || <span className="muet">à préciser</span>}</td>
                  <td>{p.referentId ? referents.get(p.referentId) : <span className="muet">toute l’équipe</span>}</td>
                  <td>{n ? `${n} personne${n > 1 ? 's' : ''}` : <span className="pastille">sans compte</span>}</td>
                  <td>{compter(p.id, 'du_prestataire')}</td>
                  <td>{compter(p.id, 'vers_prestataire')}</td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </Section>

      <Section cote="Ajouter" titre="Ajouter un prestataire" alt>
        <p className="lead">Créez d’abord le dossier de la structure, puis invitez-y une ou plusieurs personnes : elles partageront ses documents.</p>
        <form action={actionCreerPrestataire} className="formulaire">
          <div className="champs">
            <div className="champ"><label htmlFor="structure">Nom de la structure</label><input id="structure" name="structure" type="text" maxLength={120} required /></div>
            <div className="champ"><label htmlFor="prestation">Prestation</label><input id="prestation" name="prestation" type="text" maxLength={200} placeholder="Régie son et lumière, traiteur, impression…" /></div>
          </div>
          <Bouton>Créer le dossier</Bouton>
        </form>
      </Section>
    </Cadre>
  );
}
