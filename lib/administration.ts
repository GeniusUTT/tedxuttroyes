import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { categorie } from './categories';
import { base, schema } from './db';
import { noter } from './journal';

// Éditions, jalons, pôles : réservé aux admins (la garde est dans les
// actions, exigerAdmin). Les données sont rattachées à une édition, pour
// que l'outil serve aux suivantes.

export class RefusAdministration extends Error {}

const date = (v: string) => {
  const d = new Date(`${v}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) throw new RefusAdministration('Date invalide.');
  return d;
};

export async function modifierEdition(id: string, libelle: string, jour: string, parId: string) {
  const b = await base();
  await b.update(schema.edition).set({ libelle: libelle.trim() || 'Édition', dateEvenement: date(jour) }).where(eq(schema.edition.id, id));
  await noter('edition.modifiee', { acteurId: parId, cibleType: 'edition', cibleId: id });
}

export async function nouvelleEdition(annee: number, libelle: string, jour: string, parId: string) {
  if (!Number.isInteger(annee) || annee < 2027 || annee > 2100) throw new RefusAdministration('Année invalide.');
  const b = await base();
  const [existe] = await b.select().from(schema.edition).where(eq(schema.edition.annee, annee));
  if (existe) throw new RefusAdministration('Cette édition existe déjà.');
  const id = randomUUID();
  await b.transaction(async (tx) => {
    await tx.update(schema.edition).set({ courante: false });
    await tx.insert(schema.edition).values({ id, annee, libelle: libelle.trim() || `TEDxUTTroyes ${annee}`, courante: true, dateEvenement: date(jour) });
  });
  await noter('edition.modifiee', { acteurId: parId, cibleType: 'edition', cibleId: id, details: { nouvelle: annee } });
  return id;
}

export async function enregistrerJalon(editionId: string, j: { id?: string; libelle: string; echeance: string; categorie: string; ordre: number }, parId: string) {
  const cat = j.categorie ? categorie(j.categorie) : null;
  if (j.categorie && (!cat || cat.sens !== 'du_speaker')) throw new RefusAdministration('Catégorie invalide.');
  const valeurs = { libelle: j.libelle.trim() || 'Jalon', echeance: date(j.echeance), categorie: cat?.slug ?? null, ordre: j.ordre };
  const b = await base();
  if (j.id) await b.update(schema.jalon).set(valeurs).where(and(eq(schema.jalon.id, j.id), eq(schema.jalon.editionId, editionId)));
  else await b.insert(schema.jalon).values({ id: randomUUID(), editionId, ...valeurs });
  await noter('jalon.modifie', { acteurId: parId, cibleType: 'jalon', cibleId: j.id, editionId });
}

export async function supprimerJalon(editionId: string, id: string, parId: string) {
  const b = await base();
  await b.delete(schema.jalon).where(and(eq(schema.jalon.id, id), eq(schema.jalon.editionId, editionId)));
  await noter('jalon.modifie', { acteurId: parId, cibleType: 'jalon', cibleId: id, editionId, details: { supprime: true } });
}

export async function renommerPole(id: string, nom: string, parId: string) {
  if (!nom.trim()) throw new RefusAdministration('Nom vide.');
  const b = await base();
  await b.update(schema.pole).set({ nom: nom.trim().slice(0, 80) }).where(eq(schema.pole.id, id));
  await noter('pole.modifie', { acteurId: parId, cibleType: 'pole', cibleId: id });
}
