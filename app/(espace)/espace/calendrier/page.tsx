import { and, eq, isNull } from 'drizzle-orm';
import type { Metadata } from 'next';
import { editionCourante, exigerRole } from '@/lib/acces';
import { categorie, JALON_FICHE } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { contexte } from '@/lib/documents';
import { etats, jalons } from '@/lib/suivi';
import { Calendrier, type Entree } from '../../composants/Calendrier';
import { Cadre, Section } from '../../composants/Cadre';
import { Pastille } from '../../composants/Jalons';

export const metadata: Metadata = { title: 'Calendrier' };

// Les jalons de l'édition et la soirée, pour tout le monde. Le speaker y lit
// l'état de chacun de ses jalons ; l'équipe, combien de speakers ont déposé
// et combien sont validés.
export default async function PageCalendrier() {
  // Les jalons sont ceux des speakers : un prestataire n'a rien à y voir.
  const a = await exigerRole('speaker', 'membre');
  const ctx = await contexte(a);
  const e = await editionCourante();
  const b = await base();
  const lesJalons = await jalons(e.id);
  const speakers = a.role === 'membre'
    ? (await b.select({ id: schema.speaker.id }).from(schema.speaker).where(and(eq(schema.speaker.editionId, e.id), isNull(schema.speaker.supprimeLe)))).map((s) => s.id)
    : ctx.speakers;
  const lesEtats = await etats(speakers);
  const quoi = (cat: string | null) => (cat === JALON_FICHE ? 'Fiche : coordonnées, biographie, résumé' : cat ? categorie(cat)?.libelle : undefined);

  const entrees: Entree[] = lesJalons.map((j) => {
    const ceux = lesEtats.filter((x) => x.jalonId === j.id);
    if (a.role === 'membre') {
      const deposes = ceux.filter((x) => x.etat !== 'a_faire').length, valides = ceux.filter((x) => x.etat === 'valide').length;
      return {
        id: j.id, date: j.echeance, libelle: j.libelle, detail: quoi(j.categorie),
        etat: <span className="pastille">{deposes}/{speakers.length} déposés · {valides} validés</span>,
      };
    }
    return { id: j.id, date: j.echeance, libelle: j.libelle, detail: quoi(j.categorie), etat: <Pastille etat={ceux[0]?.etat ?? 'a_faire'} echeance={j.echeance} /> };
  });
  if (e.dateEvenement) entrees.push({ id: 'soiree', date: e.dateEvenement, libelle: 'La soirée TEDxUTTroyes', detail: 'Centre de Congrès de l’Aube, Troyes', soiree: true });

  return (
    <Cadre
      acteur={a}
      actif="/espace/calendrier/"
      cote={e.libelle}
      titre="Calendrier"
      chapo={a.role === 'membre'
        ? 'Les jalons de l’édition, mois par mois, avec l’avancement des speakers. Les échéances se règlent dans la page Édition.'
        : 'Les étapes jusqu’à la soirée, mois par mois. Un jalon passe à « déposé » dès que la pièce correspondante est dans votre dossier, puis à « validé » quand l’équipe l’a relue.'}
    >
      <Section cote="Mois par mois">
        <Calendrier entrees={entrees} />
      </Section>
    </Cadre>
  );
}
