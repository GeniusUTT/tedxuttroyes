import { and, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { editionCourante, exigerRole } from '@/lib/acces';
import { categorie, CATEGORIES, JALON_FICHE } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte, documents, type DocumentAvecVersions } from '@/lib/documents';
import { etats, ficheComplete, jalons } from '@/lib/suivi';
import { Calendrier } from '../../composants/Calendrier';
import { Cadre, Message, Section } from '../../composants/Cadre';
import { CarteDocument, choix } from '../../composants/Documents';
import { Depot } from '../../composants/Depot';
import { FormulaireFiche } from '../../composants/Fiche';
import { echeance, Pastille } from '../../composants/Jalons';
import { actionFiche } from '../documents/actions';

export const metadata: Metadata = { title: 'Mon dossier' };

const RETOUR = '/espace/speaker/';
const A_SIGNER = ['release', 'droit_image'] as const;
const AUTRES = ['script', 'slides', 'transport'];

export default async function Speaker({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('speaker');
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const speakerId = ctx.speakers[0];
  if (!speakerId) notFound();
  const b = await base();
  const e = await editionCourante();
  const [s] = await b.select().from(schema.speaker).where(and(eq(schema.speaker.id, speakerId), isNull(schema.speaker.supprimeLe)));
  if (!s) notFound();
  const miens = await documents(ctx, { rattachement: 'speaker', speakerId });
  const pourTous = await documents(ctx, { rattachement: 'tous_speakers' });
  const deposes = miens.filter((d) => d.sens === 'du_speaker');
  const modeles = pourTous.filter((d) => categorie(d.categorie)?.estModele);
  const recus = [...miens.filter((d) => d.sens === 'vers_speaker'), ...pourTous.filter((d) => !categorie(d.categorie)?.estModele)];
  const lesJalons = await jalons(ctx.editionId);
  const mesEtats = await etats([speakerId]);
  const etatDe = (jalonId: string) => mesEtats.find((x) => x.jalonId === jalonId)?.etat ?? 'a_faire';
  const jalonDe = (cat: string) => lesJalons.find((j) => j.categorie === cat);
  const de = (cat: string) => deposes.filter((d) => d.categorie === cat);

  // Ce que le speaker doit fournir, dans l'ordre où il le fait.
  const coordonnees = [s.prenom, s.nom, s.emailContact, s.telephone].every((x) => x.trim());
  const pieces: { libelle: string; fait: boolean; ancre: string; jalon?: string }[] = [
    { libelle: 'Coordonnées : prénom, nom, e-mail, téléphone', fait: coordonnees, ancre: '#fiche', jalon: JALON_FICHE },
    { libelle: 'Résumé du talk', fait: !!s.resume.trim(), ancre: '#fiche', jalon: JALON_FICHE },
    { libelle: 'Biographie complète', fait: !!s.biographie.trim(), ancre: '#fiche', jalon: JALON_FICHE },
    ...CATEGORIES.filter((c) => c.requis).map((c) => ({ libelle: c.libelle, fait: de(c.slug).length > 0, ancre: c.modele ? '#signer' : '#photos', jalon: c.slug })),
  ];
  const restent = pieces.filter((p) => !p.fait).length;

  const entrees = [
    ...lesJalons.map((j) => ({ id: j.id, date: j.echeance, libelle: j.libelle, etat: <Pastille etat={etatDe(j.id)} echeance={j.echeance} /> })),
    ...(e.dateEvenement ? [{ id: 'soiree', date: e.dateEvenement, libelle: 'La soirée TEDxUTTroyes', detail: 'Centre de Congrès de l’Aube, Troyes', soiree: true }] : []),
  ];

  const aSigner = A_SIGNER.map((slug) => {
    const c = categorie(slug)!;
    return { slug, c, modele: modeles.find((d) => d.categorie === c.modele), signe: de(slug)[0] };
  });
  const signes = aSigner.map((x) => x.signe).filter((d): d is DocumentAvecVersions => !!d);

  return (
    <Cadre
      acteur={a}
      actif={RETOUR}
      cote="Mon dossier"
      titre={`Bonjour ${s.prenom || s.nomAffiche}`}
      chapo="Votre talk se prépare ici : les dates à retenir, ce qu’il reste à nous transmettre, et les documents que l’équipe met à votre disposition."
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="À fournir" titre={restent ? `${restent} pièce${restent > 1 ? 's' : ''} à nous transmettre` : 'Votre dossier est complet'} id="a-fournir">
        <ul className="a-fournir">
          {pieces.map((p) => {
            const j = p.jalon ? jalonDe(p.jalon) : undefined;
            return (
              <li key={p.libelle}>
                <a href={p.ancre}>{p.libelle}</a>
                <span className={p.fait ? 'pastille pastille--fait' : 'pastille pastille--rouge'}>{p.fait ? 'fourni' : 'à fournir'}</span>
                {!p.fait && j && <span className="muet">Avant le {echeance(j.echeance)}</span>}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section cote="Calendrier" titre="Les dates à retenir" alt>
        <Calendrier entrees={entrees} />
      </Section>

      <Section cote="Ma fiche" titre="Vous et votre talk" id="fiche">
        <p className="lead">
          Ces informations servent à l’équipe pour vous joindre, et à présenter votre talk sur le site et sur nos réseaux.
          {ficheComplete(s) ? ' Votre fiche est complète.' : ''}
        </p>
        <FormulaireFiche s={s} action={actionFiche.bind(null, speakerId, RETOUR)} />
      </Section>

      <Section cote="À signer" titre="Deux documents à signer" id="signer" alt>
        <p className="lead">Téléchargez le modèle, signez-le, puis déposez la version signée. Un fichier identique au modèle, renvoyé sans signature, est refusé.</p>
        <div className="grille">
          {aSigner.map(({ slug, c, modele, signe }) => (
            <div key={slug} className="carte carte--signer">
              <p className="etiquette">{c.libelle}</p>
              <h3>1. Télécharger le modèle</h3>
              {modele?.versions[0]
                ? <p><a className="btn btn--ghost btn--sm" href={`/espace/api/fichiers/${modele.versions[0].id}/`}>Télécharger le modèle</a></p>
                : <p className="muet">L’équipe n’a pas encore mis le modèle en ligne. Il apparaîtra ici.</p>}
              <h3>2. Déposer la version signée</h3>
              {signe && c.aide && <p className="muet">{c.aide}</p>}
              {signe
                ? <p><span className="pastille pastille--fait">déposé</span> <span className="muet">Le fichier et ses versions sont juste en dessous.</span></p>
                : <Depot rattachement="speaker" speakerId={speakerId} categories={choix([slug])} libelleBouton="Déposer la version signée" />}
            </div>
          ))}
        </div>
        {signes.length > 0 && (
          <div className="grille">
            {signes.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} signer />)}
          </div>
        )}
      </Section>

      <Section cote="Photos" titre="Photos haute qualité" id="photos">
        <p className="lead">{categorie('photo_hd')!.aide}</p>
        <div className="grille">
          {de('photo_hd').map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} />)}
          <div className="carte">
            <p className="etiquette">{de('photo_hd').length ? 'Ajouter une photo' : 'Première photo'}</p>
            <Depot rattachement="speaker" speakerId={speakerId} categories={choix(['photo_hd'])} titreLibre libelleBouton="Déposer la photo" />
          </div>
        </div>
      </Section>

      <Section cote="Votre talk" titre="Script, slides, transport" alt>
        <div className="grille">
          {AUTRES.map((slug) => {
            const c = categorie(slug)!;
            const docs = de(slug);
            return (
              <section key={slug} aria-label={c.libelle} className="pile">
                {docs.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} />)}
                {(!docs.length || !c.unique) && (
                  <div className="carte">
                    <p className="etiquette">{docs.length ? `Ajouter : ${c.libelle}` : c.libelle}</p>
                    {!docs.length && <p className="muet">Rien de déposé pour l’instant.</p>}
                    <Depot rattachement="speaker" speakerId={speakerId} categories={choix([slug])} titreLibre={!c.unique} />
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </Section>

      <Section cote="De l’équipe" titre="Mis à votre disposition">
        {recus.length === 0
          ? <p className="muet">L’équipe n’a encore rien mis à votre disposition : dossier d’accueil, règles de contenu TEDx, planning du jour J et billets arriveront ici.</p>
          : <div className="grille">{recus.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={RETOUR} nouvelleVersion={false} />)}</div>}
      </Section>

      {(s.lienVideo || e.lienPhotos) && (
        <Section cote="Après la soirée" titre="Votre talk en ligne" id="apres" alt>
          <div className="actions">
            {s.lienVideo && <a className="btn btn--primary" href={s.lienVideo} target="_blank" rel="noopener noreferrer">Voir mon talk sur YouTube</a>}
            {e.lienPhotos && <a className="btn btn--ghost" href={e.lienPhotos} target="_blank" rel="noopener noreferrer">Les photos de la soirée</a>}
          </div>
        </Section>
      )}
    </Cadre>
  );
}
