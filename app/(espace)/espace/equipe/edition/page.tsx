import type { Metadata } from 'next';
import Link from 'next/link';
import { editionCourante, exigerMembre } from '@/lib/acces';
import { CATEGORIES, JALON_FICHE } from '@/lib/categories';
import { jalons } from '@/lib/suivi';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message, Section } from '../../../composants/Cadre';
import { actionEdition, actionJalon, actionLienPhotos, actionNouvelleEdition, actionSupprimerJalon } from './actions';

export const metadata: Metadata = { title: 'Édition' };

const jour = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
const LIABLES = [{ slug: JALON_FICHE, libelle: 'Fiche complète (coordonnées, biographie, résumé)' }, ...CATEGORIES.filter((c) => c.sens === 'du_speaker')];

function ChampsJalon({ j, n }: { j?: { libelle: string; echeance: Date; categorie: string | null; ordre: number }; n: string }) {
  return (
    <div className="champs">
      <div className="champ"><label htmlFor={`libelle-${n}`}>Libellé</label><input id={`libelle-${n}`} name="libelle" type="text" defaultValue={j?.libelle} required /></div>
      <div className="champ"><label htmlFor={`echeance-${n}`}>Échéance</label><input id={`echeance-${n}`} name="echeance" type="date" defaultValue={jour(j?.echeance ?? null)} required /></div>
      <div className="champ">
        <label htmlFor={`categorie-${n}`}>Passe à « déposé » avec</label>
        <select id={`categorie-${n}`} name="categorie" defaultValue={j?.categorie ?? ''}>
          <option value="">Rien (suivi à la main)</option>
          {LIABLES.map((c) => <option key={c.slug} value={c.slug}>{c.libelle}</option>)}
        </select>
      </div>
      <div className="champ"><label htmlFor={`ordre-${n}`}>Ordre</label><input id={`ordre-${n}`} name="ordre" type="number" defaultValue={j?.ordre ?? 0} /></div>
    </div>
  );
}

export default async function Edition({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerMembre();
  const { ok, erreur } = await searchParams;
  const e = await editionCourante();
  const lesJalons = await jalons(e.id);
  return (
    <Cadre
      acteur={a}
      actif="/espace/equipe/edition/"
      cote={e.libelle}
      titre="Édition"
      chapo={<>La date de la soirée, les jalons que voient les speakers, l’album photo une fois la soirée passée. Voir aussi le <Link href="/espace/equipe/journal/">journal</Link> et l’<Link href="/espace/equipe/archive/">archive des documents signés</Link>.</>}
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Édition courante" titre="Nom et date">
        <form action={actionEdition} className="formulaire">
          <div className="champs">
            <div className="champ"><label htmlFor="ed-libelle">Libellé</label><input id="ed-libelle" name="libelle" type="text" defaultValue={e.libelle} required /></div>
            <div className="champ"><label htmlFor="ed-date">Date de la soirée</label><input id="ed-date" name="date" type="date" defaultValue={jour(e.dateEvenement)} required /></div>
          </div>
          <p className="muet">La date règle aussi les purges : justificatifs de transport trois mois après, comptes speakers douze mois après.</p>
          <Bouton variante="sobre">Enregistrer</Bouton>
        </form>
      </Section>

      <Section cote="Après la soirée" titre="L’album photo" alt>
        <p className="lead">Un seul lien pour toute l’édition : chaque speaker le retrouve dans son dossier. La vidéo YouTube de chaque talk se renseigne dans le dossier du speaker.</p>
        <form action={actionLienPhotos} className="formulaire">
          <div className="champ"><label htmlFor="lien-photos">Lien de l’album (https)</label><input id="lien-photos" name="lien" type="url" defaultValue={e.lienPhotos ?? ''} pattern="https://.*" placeholder="https://" /></div>
          <Bouton variante="sobre">Enregistrer le lien</Bouton>
        </form>
      </Section>

      <Section cote="Jalons" titre="Les étapes des speakers">
        <p className="lead">Un jalon lié passe tout seul à « déposé » quand le speaker dépose la pièce ; l’équipe le valide depuis le dossier du speaker.</p>
        {lesJalons.map((j) => (
          <div key={j.id} className="carte">
            <form action={actionJalon.bind(null, j.id)} className="formulaire">
              <ChampsJalon j={j} n={j.id} />
              <Bouton variante="sobre" petit>Enregistrer</Bouton>
            </form>
            <form action={actionSupprimerJalon.bind(null, j.id)}><Bouton variante="danger" petit>Supprimer ce jalon</Bouton></form>
          </div>
        ))}
        <div className="carte">
          <p className="etiquette">Nouveau jalon</p>
          <form action={actionJalon.bind(null, null)} className="formulaire">
            <ChampsJalon n="nouveau" />
            <Bouton petit>Ajouter le jalon</Bouton>
          </form>
        </div>
      </Section>

      <Section cote="Suite" titre="Ouvrir l’édition suivante" alt>
        <form action={actionNouvelleEdition} className="formulaire">
          <div className="champs">
            <div className="champ"><label htmlFor="annee">Année</label><input id="annee" name="annee" type="text" inputMode="numeric" defaultValue={e.annee + 1} required /></div>
            <div className="champ"><label htmlFor="ne-libelle">Libellé</label><input id="ne-libelle" name="libelle" type="text" defaultValue={`TEDxUTTroyes ${e.annee + 1}`} required /></div>
            <div className="champ"><label htmlFor="ne-date">Date de la soirée</label><input id="ne-date" name="date" type="date" required /></div>
          </div>
          <label className="case"><input type="checkbox" name="confirmer" value="oui" /> Je confirme : l’édition en cours sera archivée ; les speakers et les jalons repartent de zéro pour la nouvelle.</label>
          <Bouton variante="danger">Ouvrir la nouvelle édition</Bouton>
        </form>
      </Section>
    </Cadre>
  );
}
