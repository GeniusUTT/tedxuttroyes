import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { exigerRole } from '@/lib/acces';
import { DU_PRESTATAIRE } from '@/lib/categories';
import { contexte, documents } from '@/lib/documents';
import { comptesDuPrestataire, prestataireLisible } from '@/lib/prestataires';
import { Cadre, Message, Section } from '../../composants/Cadre';
import { CarteDocument, choix } from '../../composants/Documents';
import { Depot } from '../../composants/Depot';
import { FormulaireFichePrestataire } from '../../composants/FichePrestataire';
import { actionFichePrestataire } from '../equipe/prestataires/actions';

export const metadata: Metadata = { title: 'Mon dossier' };

const RETOUR = '/espace/prestataire/';

// Le dossier d'une structure, vu par les personnes qui y ont accès : ce
// qu'elles nous transmettent, ce que l'équipe met à leur disposition, la
// fiche de la structure. Rien des speakers n'y apparaît.
export default async function Prestataire({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('prestataire');
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const id = ctx.prestataires[0];
  if (!id) notFound();
  const p = await prestataireLisible(ctx, id);
  if (!p) notFound();
  const docs = await documents(ctx, { rattachement: 'prestataire', prestataireId: id });
  const transmis = docs.filter((d) => d.sens === 'du_prestataire');
  const recus = docs.filter((d) => d.sens === 'vers_prestataire');
  const autres = (await comptesDuPrestataire(id)).filter((c) => c.id !== a.id);

  return (
    <Cadre
      acteur={a}
      actif={RETOUR}
      cote="Mon dossier"
      titre={p.structure}
      chapo="Votre prestation se prépare ici : déposez vos devis, factures et fiches techniques, et retrouvez les documents que l’équipe met à votre disposition. Chaque document garde ses versions et ses échanges."
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="À nous transmettre" titre="Vos documents" id="transmettre">
        <div className="grille">
          {transmis.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} />)}
          <div className="carte">
            <p className="etiquette">{transmis.length ? 'Ajouter un document' : 'Premier document'}</p>
            <Depot rattachement="prestataire" prestataireId={id} categories={choix(DU_PRESTATAIRE)} titreLibre />
          </div>
        </div>
      </Section>

      <Section cote="De l’équipe" titre="Mis à votre disposition" alt>
        {recus.length === 0
          ? <p className="muet">L’équipe n’a encore rien mis à votre disposition : contrat ou bon de commande, cahier des charges, planning et plan d’accès arriveront ici.</p>
          : <div className="grille">{recus.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} nouvelleVersion={false} />)}</div>}
      </Section>

      <Section cote="Ma structure" titre="Votre fiche" id="fiche">
        <p className="lead">Ces informations servent à l’équipe pour vous joindre et pour la facturation.</p>
        <FormulaireFichePrestataire p={p} action={actionFichePrestataire.bind(null, id, RETOUR)} />
      </Section>

      <Section cote="Accès" titre="Qui a accès au dossier" alt>
        {autres.length === 0
          ? <p className="muet">Vous êtes la seule personne à y avoir accès.</p>
          : <ul className="fil">{autres.map((c) => <li key={c.id}>{c.nom}</li>)}</ul>}
        <p className="muet">Pour donner accès à un collègue, ou le retirer, écrivez à l’équipe : elle lui enverra une invitation.</p>
      </Section>
    </Cadre>
  );
}
