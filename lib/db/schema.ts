import { relations } from 'drizzle-orm';
import { bigint, boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Tables de Better Auth (user, session, account, verification, rateLimit),
// puis celles de l'espace. Les identifiants sont des UUID aléatoires : rien ne
// se devine en incrémentant.

const horodatage = () => timestamp({ withTimezone: true, mode: 'date' });
const creeLe = () => horodatage().notNull().defaultNow();

export const role = pgEnum('role', ['speaker', 'membre', 'admin']);

export const user = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  role: role().notNull().default('membre'),
  desactiveLe: horodatage(),
  derniereConnexion: horodatage(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
});

export const session = pgTable('session', {
  id: text().primaryKey(),
  expiresAt: horodatage().notNull(),
  token: text().notNull().unique(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
  ipAddress: text(),
  userAgent: text(),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  // Second facteur validé pour cette session (rôle admin uniquement).
  totpValideLe: horodatage(),
}, (t) => [index('session_user_idx').on(t.userId)]);

export const account = pgTable('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: horodatage(),
  refreshTokenExpiresAt: horodatage(),
  scope: text(),
  password: text(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
});

export const verification = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: horodatage().notNull(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
}, (t) => [index('verification_identifier_idx').on(t.identifier)]);

export const rateLimit = pgTable('rate_limit', {
  id: text().primaryKey(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint({ mode: 'number' }).notNull(),
});

export const edition = pgTable('edition', {
  id: text().primaryKey(),
  annee: integer().notNull().unique(),
  libelle: text().notNull(),
  courante: boolean().notNull().default(false),
  dateEvenement: horodatage(),
  createdAt: creeLe(),
});

export const pole = pgTable('pole', {
  id: text().primaryKey(),
  slug: text().notNull().unique(),
  nom: text().notNull(),
  ordre: integer().notNull().default(0),
});

export const membrePole = pgTable('membre_pole', {
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  poleId: text().notNull().references(() => pole.id, { onDelete: 'cascade' }),
  editionId: text().notNull().references(() => edition.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.userId, t.poleId, t.editionId] })]);

export const speaker = pgTable('speaker', {
  id: text().primaryKey(),
  userId: text().references(() => user.id, { onDelete: 'set null' }),
  editionId: text().notNull().references(() => edition.id),
  nomAffiche: text().notNull(),
  biographie: text().notNull().default(''),
  titreProvisoire: text().notNull().default(''),
  annonce: boolean().notNull().default(false),
  referentId: text().references(() => user.id, { onDelete: 'set null' }),
  createdAt: creeLe(),
  updatedAt: creeLe(),
}, (t) => [uniqueIndex('speaker_user_edition_idx').on(t.userId, t.editionId)]);

export const invitation = pgTable('invitation', {
  id: text().primaryKey(),
  email: text().notNull(),
  role: role().notNull(),
  editionId: text().notNull().references(() => edition.id),
  poles: jsonb().$type<string[]>().notNull().default([]),
  nomAffiche: text().notNull().default(''),
  derogationDomaine: boolean().notNull().default(false),
  jetonEmpreinte: text().notNull().unique(),
  inviteParId: text().references(() => user.id, { onDelete: 'set null' }),
  expireLe: horodatage().notNull(),
  accepteeLe: horodatage(),
  revoqueeLe: horodatage(),
  createdAt: creeLe(),
}, (t) => [index('invitation_email_idx').on(t.email)]);

export const totp = pgTable('totp', {
  userId: text().primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  secretChiffre: text().notNull(),
  confirmeLe: horodatage(),
  dernierPas: bigint({ mode: 'number' }),
  createdAt: creeLe(),
});

// Compteurs de débit par clé (adresse e-mail hachée, IP), en fenêtre fixe.
export const limite = pgTable('limite', {
  cle: text().primaryKey(),
  compte: integer().notNull(),
  fenetreDebut: horodatage().notNull(),
});

export const journal = pgTable('journal', {
  id: text().primaryKey(),
  le: creeLe(),
  acteurId: text().references(() => user.id, { onDelete: 'set null' }),
  action: text().notNull(),
  cibleType: text(),
  cibleId: text(),
  editionId: text(),
  details: jsonb().$type<Record<string, unknown>>().notNull().default({}),
}, (t) => [index('journal_le_idx').on(t.le), index('journal_cible_idx').on(t.cibleType, t.cibleId)]);

export const rattachement = pgEnum('rattachement', ['speaker', 'tous_speakers', 'pole', 'commun']);
export const sens = pgEnum('sens', ['du_speaker', 'vers_speaker', 'interne']);

// Un document porte ses versions : on n'écrase jamais, on ajoute. La
// suppression est logique (supprimeLe) ; le seau de production est
// versionné, une erreur se rattrape.
export const document = pgTable('document', {
  id: text().primaryKey(),
  editionId: text().notNull().references(() => edition.id),
  rattachement: rattachement().notNull(),
  speakerId: text().references(() => speaker.id),
  poleId: text().references(() => pole.id),
  categorie: text().notNull(),
  sens: sens().notNull(),
  titre: text().notNull(),
  lienExterne: text(),
  creeParId: text().references(() => user.id, { onDelete: 'set null' }),
  createdAt: creeLe(),
  modifieLe: creeLe(),
  supprimeLe: horodatage(),
  supprimeParId: text().references(() => user.id, { onDelete: 'set null' }),
}, (t) => [index('document_speaker_idx').on(t.speakerId), index('document_pole_idx').on(t.poleId), index('document_edition_idx').on(t.editionId, t.rattachement)]);

export const version = pgTable('version', {
  id: text().primaryKey(),
  documentId: text().notNull().references(() => document.id, { onDelete: 'cascade' }),
  numero: integer().notNull(),
  cleStockage: text().notNull().unique(),
  nomOrigine: text().notNull(),
  typeMime: text().notNull(),
  taille: integer().notNull(),
  deposeParId: text().references(() => user.id, { onDelete: 'set null' }),
  deposeLe: creeLe(),
  droitsAttestesLe: horodatage(),
}, (t) => [uniqueIndex('version_numero_idx').on(t.documentId, t.numero)]);

// Envoi en cours : la place est réservée avant que le navigateur envoie, la
// version n'existe qu'après confirmation. Les envois jamais confirmés sont
// purgés chaque nuit, fichier compris.
export const envoi = pgTable('envoi', {
  id: text().primaryKey(),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  documentId: text().references(() => document.id, { onDelete: 'cascade' }),
  editionId: text().notNull(),
  rattachement: rattachement().notNull(),
  speakerId: text(),
  poleId: text(),
  categorie: text().notNull(),
  sens: sens().notNull(),
  titre: text().notNull(),
  cle: text().notNull().unique(),
  nomOrigine: text().notNull(),
  typeMime: text().notNull(),
  tailleMax: integer().notNull(),
  expireLe: horodatage().notNull(),
  createdAt: creeLe(),
});

export const etatJalon = pgEnum('etat_jalon', ['a_faire', 'depose', 'valide']);

// Les jalons d'une édition (premier jet, répétition…) et leur état pour
// chaque speaker. Un dépôt dans la catégorie liée passe le jalon à
// « déposé » ; seule l'équipe le passe à « validé ».
export const jalon = pgTable('jalon', {
  id: text().primaryKey(),
  editionId: text().notNull().references(() => edition.id, { onDelete: 'cascade' }),
  libelle: text().notNull(),
  echeance: horodatage().notNull(),
  categorie: text(),
  ordre: integer().notNull().default(0),
});

export const jalonSpeaker = pgTable('jalon_speaker', {
  speakerId: text().notNull().references(() => speaker.id, { onDelete: 'cascade' }),
  jalonId: text().notNull().references(() => jalon.id, { onDelete: 'cascade' }),
  etat: etatJalon().notNull().default('a_faire'),
  valideParId: text().references(() => user.id, { onDelete: 'set null' }),
  majLe: creeLe(),
}, (t) => [primaryKey({ columns: [t.speakerId, t.jalonId] })]);

export const commentaire = pgTable('commentaire', {
  id: text().primaryKey(),
  documentId: text().notNull().references(() => document.id, { onDelete: 'cascade' }),
  auteurId: text().references(() => user.id, { onDelete: 'set null' }),
  texte: text().notNull(),
  createdAt: creeLe(),
  supprimeLe: horodatage(),
}, (t) => [index('commentaire_document_idx').on(t.documentId)]);

export const preference = pgTable('preference', {
  userId: text().primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  notifDepot: boolean().notNull().default(true),
  notifCommentaire: boolean().notNull().default(true),
});

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session), poles: many(membrePole) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
export const membrePoleRelations = relations(membrePole, ({ one }) => ({
  user: one(user, { fields: [membrePole.userId], references: [user.id] }),
  pole: one(pole, { fields: [membrePole.poleId], references: [pole.id] }),
}));
