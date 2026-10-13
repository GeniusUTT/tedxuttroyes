import { randomUUID } from 'node:crypto';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { base, schema } from './db';
import { RefusDocument } from './documents';
import { peutGererComptes, peutModifierFichePrestataire, peutVoirFichePrestataire, type Contexte } from './droits';
import { noter } from './journal';
import { emailValide, normaliserEmail, telephoneValide } from './regles';

// Les prestataires : une structure par dossier (régie, traiteur,
// imprimeur…), créée par l'équipe, puis une ou plusieurs personnes invitées
// dans ce dossier. Elles partagent ses documents et sa fiche. Les droits
// sont redemandés à chaque appel ; un dossier interdit et un dossier
// inexistant se répondent pareil.

type Ctx = Contexte & { editionId: string };

const NON_AUTORISE = 'Action non autorisée.';

export async function prestataires(editionId: string) {
  const b = await base();
  return b.select().from(schema.prestataire)
    .where(and(eq(schema.prestataire.editionId, editionId), isNull(schema.prestataire.supprimeLe)))
    .orderBy(asc(schema.prestataire.structure));
}

export async function prestataireLisible(ctx: Ctx, id: string) {
  if (!peutVoirFichePrestataire(ctx, id)) return null;
  const b = await base();
  const [p] = await b.select().from(schema.prestataire)
    .where(and(eq(schema.prestataire.id, id), eq(schema.prestataire.editionId, ctx.editionId), isNull(schema.prestataire.supprimeLe)));
  return p ?? null;
}

// Les personnes qui ont accès au dossier.
export async function comptesDuPrestataire(prestataireId: string) {
  const b = await base();
  return b.select({ id: schema.user.id, nom: schema.user.name, email: schema.user.email, desactiveLe: schema.user.desactiveLe, derniereConnexion: schema.user.derniereConnexion })
    .from(schema.prestataireCompte)
    .innerJoin(schema.user, eq(schema.user.id, schema.prestataireCompte.userId))
    .where(eq(schema.prestataireCompte.prestataireId, prestataireId))
    .orderBy(asc(schema.user.name));
}

export async function creerPrestataire(ctx: Ctx, structure: string, prestation: string): Promise<string> {
  if (!peutGererComptes(ctx)) throw new RefusDocument(NON_AUTORISE);
  const nom = structure.trim().slice(0, 120);
  if (!nom) throw new RefusDocument('Donnez le nom de la structure.');
  const b = await base();
  const id = randomUUID();
  await b.insert(schema.prestataire).values({ id, editionId: ctx.editionId, structure: nom, prestation: prestation.trim().slice(0, 200) });
  await noter('prestataire.cree', { acteurId: ctx.id, cibleType: 'prestataire', cibleId: id, editionId: ctx.editionId });
  return id;
}

export type FichePrestataire = {
  structure: string;
  prestation: string;
  contact: string;
  emailContact: string;
  telephone: string;
  adresse: string;
};

export async function modifierFichePrestataire(ctx: Ctx, id: string, f: FichePrestataire) {
  if (!peutModifierFichePrestataire(ctx, id) || !(await prestataireLisible(ctx, id))) throw new RefusDocument(NON_AUTORISE);
  const emailContact = normaliserEmail(f.emailContact);
  if (emailContact && !emailValide(emailContact)) throw new RefusDocument('L’adresse e-mail de contact est invalide.');
  if (!telephoneValide(f.telephone)) throw new RefusDocument('Le numéro de téléphone est invalide.');
  const structure = f.structure.trim().slice(0, 120);
  if (!structure) throw new RefusDocument('Le nom de la structure ne peut pas être vide.');
  const b = await base();
  await b.update(schema.prestataire).set({
    structure,
    prestation: f.prestation.trim().slice(0, 200),
    contact: f.contact.trim().slice(0, 120),
    emailContact,
    telephone: f.telephone.trim().slice(0, 40),
    adresse: f.adresse.trim().slice(0, 500),
    updatedAt: new Date(),
  }).where(eq(schema.prestataire.id, id));
  await noter('prestataire.modifie', { acteurId: ctx.id, cibleType: 'prestataire', cibleId: id, editionId: ctx.editionId });
}

export async function definirReferentPrestataire(ctx: Ctx, id: string, referentId: string | null) {
  if (!peutGererComptes(ctx) || !(await prestataireLisible(ctx, id))) throw new RefusDocument(NON_AUTORISE);
  const b = await base();
  if (referentId) {
    const [u] = await b.select().from(schema.user).where(eq(schema.user.id, referentId));
    if (!u || u.role !== 'membre' || u.desactiveLe) throw new RefusDocument('Référent invalide.');
  }
  await b.update(schema.prestataire).set({ referentId, updatedAt: new Date() }).where(eq(schema.prestataire.id, id));
  await noter('prestataire.modifie', { acteurId: ctx.id, cibleType: 'prestataire', cibleId: id, editionId: ctx.editionId, details: { referent: referentId } });
}
