import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { exigerRole } from '@/lib/acces';
import { CATEGORIES } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { Bouton } from '../../composants/Bouton';
import { Cadre, Message } from '../../composants/Cadre';
import { CarteDocument, choix } from '../../composants/Documents';
import { Depot } from '../../composants/Depot';
import { actionFiche, actionLien } from '../documents/actions';
import { echeance, Pastille } from '../../composants/Jalons';
import { etats, jalons } from '@/lib/suivi';

export const metadata: Metadata = { title: 'Mon dossier' };

const RETOUR = '/espace/speaker/';

export default async function Speaker({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('speaker');
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const speakerId = ctx.speakers[0];
  if (!speakerId) notFound();
  const b = await base();
  const [fiche] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, speakerId), eq(schema.speaker.editionId, ctx.editionId)));
  const miens = await documents(ctx, { rattachement: 'speaker', speakerId });
  const pourTous = await documents(ctx, { rattachement: 'tous_speakers' });
  const deposes = miens.filter((d) => d.sens === 'du_speaker');
  const recus = [...miens.filter((d) => d.sens === 'vers_speaker'), ...pourTous];
  const lien = deposes.find((d) => d.categorie === 'video_repetition');
  const categoriesSpeaker = CATEGORIES.filter((c) => c.sens === 'du_speaker' && !c.lien);
  const lesJalons = await jalons(ctx.editionId);
  const mesEtats = await etats([speakerId]);

  return (
    <Cadre acteur={a} actif={RETOUR}>
      <p className="cote">Mon dossier</p>
      <h1>Bonjour {fiche?.nomAffiche ?? a.nom}</h1>
      <Message ok={ok} erreur={erreur} />

      <h2>Mes jalons</h2>
      <div className="tableau-defile"><table className="tableau">
        <thead><tr><th>Jalon</th><th>Échéance</th><th>État</th></tr></thead>
        <tbody>{lesJalons.map((j) => (
          <tr key={j.id}><td>{j.libelle}</td><td>{echeance(j.echeance)}</td><td><Pastille etat={mesEtats.find((e) => e.jalonId === j.id)?.etat ?? 'a_faire'} echeance={j.echeance} /></td></tr>
        ))}</tbody>
      </table></div>

      <h2>Ma fiche</h2>
      <form action={actionFiche.bind(null, speakerId, RETOUR)} className="carte">
        <div className="champ"><label htmlFor="nomAffiche">Nom affiché</label><input id="nomAffiche" name="nomAffiche" type="text" defaultValue={fiche?.nomAffiche} maxLength={120} required /></div>
        <div className="champ"><label htmlFor="titreProvisoire">Titre provisoire du talk</label><input id="titreProvisoire" name="titreProvisoire" type="text" defaultValue={fiche?.titreProvisoire} maxLength={200} /></div>
        <div className="champ"><label htmlFor="biographie">Biographie</label><textarea id="biographie" name="biographie" defaultValue={fiche?.biographie} maxLength={5000} /></div>
        <Bouton>Enregistrer la fiche</Bouton>
      </form>

      <h2>Mes documents</h2>
      <div className="grille">
        {categoriesSpeaker.map((c) => {
          const doc = deposes.find((d) => d.categorie === c.slug && (c.unique || true));
          const autres = deposes.filter((d) => d.categorie === c.slug && d !== doc);
          return (
            <section key={c.slug} aria-label={c.libelle}>
              {doc ? <CarteDocument d={doc} ctx={ctx} retour={RETOUR} /> : (
                <article className="carte">
                  <p className="cote">{c.libelle}</p>
                  <p className="muet">Rien de déposé pour l’instant.</p>
                  <Depot rattachement="speaker" speakerId={speakerId} categories={choix([c.slug])} />
                </article>
              )}
              {!c.unique && doc && (
                <details className="carte"><summary>Ajouter un autre fichier</summary><Depot rattachement="speaker" speakerId={speakerId} categories={choix([c.slug])} titreLibre /></details>
              )}
              {autres.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} />)}
            </section>
          );
        })}
        <article className="carte">
          <p className="cote">Vidéo de répétition</p>
          <p className="muet">Un lien vers la vidéo. La vidéo finale passe par le TED Media Uploader, pas par ici.</p>
          <form action={actionLien.bind(null, speakerId, RETOUR)}>
            <div className="champ"><label htmlFor="lien">Lien (https)</label><input id="lien" name="lien" type="url" defaultValue={lien?.lienExterne ?? ''} pattern="https://.*" required /></div>
            <Bouton petit>Enregistrer le lien</Bouton>
          </form>
        </article>
      </div>

      <h2>Documents de l’équipe</h2>
      {recus.length === 0 ? <p className="muet">L’équipe n’a encore rien mis à votre disposition.</p> : (
        <div className="grille">{recus.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} nouvelleVersion={false} />)}</div>
      )}
    </Cadre>
  );
}
