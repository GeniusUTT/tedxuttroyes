import { relations } from 'drizzle-orm';
import { bigint, boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Tables de Better Auth (user, session, account, verification, rateLimit),
// puis celles de l'espace. Les identifiants sont des UUID aléatoires : rien ne
// se devine en incrémentant.

const horodatage = () => timestamp({ withTimezone: true, mode: 'date' });
const creeLe = () => horodatage().notNull().defaultNow();

export const role = pgEnum('role', ['speaker', 'membre', 'prestataire']);

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
  // L'album photo de la soirée, renseigné après l'événement et visible par
  // tous les speakers de l'édition.
  lienPhotos: text(),
  createdAt: creeLe(),
});

export const speaker = pgTable('speaker', {
  id: text().primaryKey(),
  userId: text().references(() => user.id, { onDelete: 'set null' }),
  editionId: text().notNull().references(() => edition.id),
  nomAffiche: text().notNull(),
  // Coordonnées, remplies par le speaker. L'adresse de contact peut différer
  // de celle du compte.
  prenom: text().notNull().default(''),
  nom: text().notNull().default(''),
  emailContact: text().notNull().default(''),
  telephone: text().notNull().default(''),
  biographie: text().notNull().default(''),
  titreProvisoire: text().notNull().default(''),
  resume: text().notNull().default(''),
  // Le talk en ligne sur la chaîne TEDx, renseigné par l'équipe après
  // l'événement.
  lienVideo: text(),
  annonce: boolean().notNull().default(false),
  referentId: text().references(() => user.id, { onDelete: 'set null' }),
  // Speaker retiré par l'équipe ou compte supprimé : la ligne reste pour
  // nommer la Speaker Release archivée, tout le reste est effacé.
  supprimeLe: horodatage(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
}, (t) => [uniqueIndex('speaker_user_edition_idx').on(t.userId, t.editionId)]);

// Un prestataire est une structure (régie, traiteur, imprimeur…), pas une
// personne : l'équipe crée son dossier, puis y invite une ou plusieurs
// personnes, qui partagent ses documents. La ligne reste après suppression
// (supprimeLe) pour nommer les pièces comptables archivées.
export const prestataire = pgTable('prestataire', {
  id: text().primaryKey(),
  editionId: text().notNull().references(() => edition.id),
  structure: text().notNull(),
  prestation: text().notNull().default(''),
  contact: text().notNull().default(''),
  emailContact: text().notNull().default(''),
  telephone: text().notNull().default(''),
  adresse: text().notNull().default(''),
  referentId: text().references(() => user.id, { onDelete: 'set null' }),
  supprimeLe: horodatage(),
  createdAt: creeLe(),
  updatedAt: creeLe(),
}, (t) => [index('prestataire_edition_idx').on(t.editionId)]);

// Les personnes qui ont accès au dossier d'un prestataire.
export const prestataireCompte = pgTable('prestataire_compte', {
  prestataireId: text().notNull().references(() => prestataire.id, { onDelete: 'cascade' }),
  userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: creeLe(),
}, (t) => [primaryKey({ columns: [t.prestataireId, t.userId] }), index('prestataire_compte_user_idx').on(t.userId)]);

export const invitation = pgTable('invitation', {
  id: text().primaryKey(),
  email: text().notNull(),
  role: role().notNull(),
  editionId: text().notNull().references(() => edition.id),
  // Le dossier que rejoint un prestataire invité.
  prestataireId: text().references(() => prestataire.id, { onDelete: 'cascade' }),
  nomAffiche: text().notNull().default(''),
  derogationDomaine: boolean().notNull().default(false),
  jetonEmpreinte: text().notNull().unique(),
  inviteParId: text().references(() => user.id, { onDelete: 'set null' }),
  expireLe: horodatage().notNull(),
  accepteeLe: horodatage(),
  revoqueeLe: horodatage(),
  createdAt: creeLe(),
}, (t) => [index('invitation_email_idx').on(t.email)]);

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

export const rattachement = pgEnum('rattachement', ['speaker', 'tous_speakers', 'prestataire']);
export const sens = pgEnum('sens', ['du_speaker', 'vers_speaker', 'du_prestataire', 'vers_prestataire']);

// Un document porte ses versions : on n'écrase jamais, on ajoute. La
// suppression est logique (supprimeLe) ; le seau de production est
// versionné, une erreur se rattrape.
export const document = pgTable('document', {
  id: text().primaryKey(),
  editionId: text().notNull().references(() => edition.id),
  rattachement: rattachement().notNull(),
  speakerId: text().references(() => speaker.id),
  prestataireId: text().references(() => prestataire.id),
  categorie: text().notNull(),
  sens: sens().notNull(),
  titre: text().notNull(),
  lienExterne: text(),
  // Archivé : réservé à l'équipe (Speaker Release d'un speaker supprimé,
  // pièces comptables d'un prestataire supprimé).
  archive: boolean().notNull().default(false),
  creeParId: text().references(() => user.id, { onDelete: 'set null' }),
  createdAt: creeLe(),
  modifieLe: creeLe(),
  supprimeLe: horodatage(),
  supprimeParId: text().references(() => user.id, { onDelete: 'set null' }),
}, (t) => [index('document_speaker_idx').on(t.speakerId), index('document_prestataire_idx').on(t.prestataireId), index('document_edition_idx').on(t.editionId, t.rattachement)]);

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
  // SHA-256 du fichier, en hexadécimal : calculé pour les modèles à signer
  // et pour ce que les speakers renvoient signé, afin de refuser le modèle
  // renvoyé tel quel.
  empreinte: text(),
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
  prestataireId: text(),
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

// Les jalons d'une édition (premier jet, Release…) et leur état pour
// chaque speaker. Un dépôt dans la catégorie liée (ou une fiche complète,
// pour la catégorie « fiche ») passe le jalon à « déposé » ; seule
// l'équipe le passe à « validé ».
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

export const userRelations = relations(user, ({ many }) => ({ sessions: many(session) }));
export const sessionRelations = relations(session, ({ one }) => ({ user: one(user, { fields: [session.userId], references: [user.id] }) }));
