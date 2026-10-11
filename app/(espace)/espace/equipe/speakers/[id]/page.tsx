import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerRole } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { peutDeposer, peutLire, peutModifierFicheSpeaker } from '@/lib/droits';
import { Bouton } from '../../../../composants/Bouton';
import { Cadre, Message } from '../../../../composants/Cadre';
import { CarteDocument, choix } from '../../../../composants/Documents';
import { Depot } from '../../../../composants/Depot';
import { actionFiche } from '../../../documents/actions';

export const metadata: Metadata = { title: 'Dossier speaker' };

export default async function DossierSpeaker({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('membre', 'admin');
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  // Le dossier n'est ouvert qu'à qui peut en lire les documents.
  if (!peutLire(ctx, { rattachement: 'speaker', speakerId: id, poleId: null, sens: 'du_speaker', creeParId: null })) notFound();
  const b = await base();
  const [s] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, id), eq(schema.speaker.editionId, ctx.editionId)));
  if (!s) notFound();
  const retour = `/espace/equipe/speakers/${id}/`;
  const docs = await documents(ctx, { rattachement: 'speaker', speakerId: id });
  const duSpeaker = docs.filter((d) => d.sens === 'du_speaker');
  const versLui = docs.filter((d) => d.sens === 'vers_speaker');
  const modifiable = peutModifierFicheSpeaker(ctx, id);

  return (
    <Cadre acteur={a} actif="/espace/equipe/">
      <p className="cote"><Link href="/espace/equipe/">Équipe</Link> · Dossier speaker</p>
      <h1>{s.nomAffiche}</h1>
      <Message ok={ok} erreur={erreur} />
      {modifiable ? (
        <form action={actionFiche.bind(null, id, retour)} className="carte">
          <div className="champ"><label htmlFor="nomAffiche">Nom affiché</label><input id="nomAffiche" name="nomAffiche" type="text" defaultValue={s.nomAffiche} required /></div>
          <div className="champ"><label htmlFor="titreProvisoire">Titre provisoire</label><input id="titreProvisoire" name="titreProvisoire" type="text" defaultValue={s.titreProvisoire} /></div>
          <div className="champ"><label htmlFor="biographie">Biographie</label><textarea id="biographie" name="biographie" defaultValue={s.biographie} /></div>
          <Bouton>Enregistrer la fiche</Bouton>
        </form>
      ) : (
        <div className="carte">
          <p><strong>Titre provisoire :</strong> {s.titreProvisoire || 'à venir'}</p>
          <p style={{ whiteSpace: 'pre-line' }}>{s.biographie || 'Biographie à venir.'}</p>
        </div>
      )}

      <h2>Déposé par le speaker</h2>
      {duSpeaker.length === 0 ? <p className="muet">Rien pour l’instant.</p> : (
        <div className="grille">{duSpeaker.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} />)}</div>
      )}

      <h2>Mis à sa disposition</h2>
      <div className="grille">
        {versLui.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={retour} />)}
        {peutDeposer(ctx, { rattachement: 'speaker', speakerId: id, sens: 'vers_speaker' }) && (
          <div className="carte"><p className="cote">Ajouter un document pour ce speaker</p><Depot rattachement="speaker" speakerId={id} categories={choix(['billets', 'accueil', 'planning', 'autre'])} titreLibre /></div>
        )}
      </div>
    </Cadre>
  );
}
