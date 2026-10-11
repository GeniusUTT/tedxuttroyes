import { asc } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { editionCourante, exigerAdmin } from '@/lib/acces';
import { CATEGORIES } from '@/lib/categories';
import { base, schema } from '@/lib/db';
import { jalons } from '@/lib/suivi';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message } from '../../../composants/Cadre';
import { actionEdition, actionJalon, actionNouvelleEdition, actionPole, actionSupprimerJalon } from './actions';

export const metadata: Metadata = { title: 'Édition et jalons' };

const jour = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
const LIABLES = CATEGORIES.filter((c) => c.sens === 'du_speaker');

function ChampsJalon({ j }: { j?: { libelle: string; echeance: Date; categorie: string | null; ordre: number } }) {
  return (
    <>
      <input name="libelle" type="text" aria-label="Libellé" defaultValue={j?.libelle} required placeholder="Libellé" />
      <input name="echeance" type="date" aria-label="Échéance" defaultValue={jour(j?.echeance ?? null)} required style={{ width: 'auto' }} />
      <select name="categorie" aria-label="Catégorie liée" defaultValue={j?.categorie ?? ''} style={{ width: 'auto' }}>
        <option value="">Aucune catégorie liée</option>
        {LIABLES.map((c) => <option key={c.slug} value={c.slug}>{c.libelle}</option>)}
      </select>
      <input name="ordre" type="number" aria-label="Ordre" defaultValue={j?.ordre ?? 0} style={{ width: 80 }} />
    </>
  );
}

export default async function Edition({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerAdmin();
  const { ok, erreur } = await searchParams;
  const e = await editionCourante();
  const b = await base();
  const lesJalons = await jalons(e.id);
  const poles = await b.select().from(schema.pole).orderBy(asc(schema.pole.ordre));
  return (
    <Cadre acteur={a} actif="/espace/admin/">
      <p className="cote"><Link href="/espace/admin/">Administration</Link> · Édition</p>
      <h1>{e.libelle}</h1>
      <Message ok={ok} erreur={erreur} />

      <h2>Édition courante</h2>
      <form action={actionEdition} className="carte actions">
        <input name="libelle" type="text" aria-label="Libellé" defaultValue={e.libelle} required style={{ flex: 2 }} />
        <input name="date" type="date" aria-label="Date de l’événement" defaultValue={jour(e.dateEvenement)} required style={{ width: 'auto' }} />
        <Bouton variante="sobre" petit>Enregistrer</Bouton>
      </form>
      <p className="muet">La date de l’événement règle les purges : justificatifs de transport trois mois après, comptes speakers douze mois après.</p>

      <h2>Jalons</h2>
      {lesJalons.map((j) => (
        <div key={j.id} className="actions champ">
          <form action={actionJalon.bind(null, j.id)} className="actions" style={{ flex: 1 }}><ChampsJalon j={j} /><Bouton variante="sobre" petit>Enregistrer</Bouton></form>
          <form action={actionSupprimerJalon.bind(null, j.id)}><Bouton variante="danger" petit>Supprimer</Bouton></form>
        </div>
      ))}
      <form action={actionJalon.bind(null, null)} className="carte actions"><ChampsJalon /><Bouton petit>Ajouter le jalon</Bouton></form>

      <h2>Pôles</h2>
      {poles.map((p) => (
        <form key={p.id} action={actionPole.bind(null, p.id)} className="actions champ">
          <input name="nom" type="text" aria-label={`Nom du pôle ${p.nom}`} defaultValue={p.nom} required style={{ flex: 1 }} />
          <Bouton variante="sobre" petit>Renommer</Bouton>
        </form>
      ))}

      <h2>Ouvrir l’édition suivante</h2>
      <form action={actionNouvelleEdition} className="carte">
        <div className="grille">
          <div className="champ"><label htmlFor="annee">Année</label><input id="annee" name="annee" type="text" inputMode="numeric" defaultValue={e.annee + 1} required /></div>
          <div className="champ"><label htmlFor="ne-libelle">Libellé</label><input id="ne-libelle" name="libelle" type="text" defaultValue={`TEDxUTTroyes ${e.annee + 1}`} required /></div>
          <div className="champ"><label htmlFor="ne-date">Date de l’événement</label><input id="ne-date" name="date" type="date" required /></div>
        </div>
        <label className="case champ"><input type="checkbox" name="confirmer" value="oui" /> Je confirme : l’édition en cours sera archivée ; les affectations aux pôles, les speakers et les jalons repartent de zéro pour la nouvelle.</label>
        <Bouton variante="danger">Ouvrir la nouvelle édition</Bouton>
      </form>
    </Cadre>
  );
}
