CREATE TYPE "public"."role" AS ENUM('speaker', 'membre', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edition" (
	"id" text PRIMARY KEY NOT NULL,
	"annee" integer NOT NULL,
	"libelle" text NOT NULL,
	"courante" boolean DEFAULT false NOT NULL,
	"date_evenement" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "edition_annee_unique" UNIQUE("annee")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"edition_id" text NOT NULL,
	"poles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nom_affiche" text DEFAULT '' NOT NULL,
	"derogation_domaine" boolean DEFAULT false NOT NULL,
	"jeton_empreinte" text NOT NULL,
	"invite_par_id" text,
	"expire_le" timestamp with time zone NOT NULL,
	"acceptee_le" timestamp with time zone,
	"revoquee_le" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_jetonEmpreinte_unique" UNIQUE("jeton_empreinte")
);
--> statement-breakpoint
CREATE TABLE "journal" (
	"id" text PRIMARY KEY NOT NULL,
	"le" timestamp with time zone DEFAULT now() NOT NULL,
	"acteur_id" text,
	"action" text NOT NULL,
	"cible_type" text,
	"cible_id" text,
	"edition_id" text,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "limite" (
	"cle" text PRIMARY KEY NOT NULL,
	"compte" integer NOT NULL,
	"fenetre_debut" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membre_pole" (
	"user_id" text NOT NULL,
	"pole_id" text NOT NULL,
	"edition_id" text NOT NULL,
	CONSTRAINT "membre_pole_user_id_pole_id_edition_id_pk" PRIMARY KEY("user_id","pole_id","edition_id")
);
--> statement-breakpoint
CREATE TABLE "pole" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"nom" text NOT NULL,
	"ordre" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "pole_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" bigint NOT NULL,
	CONSTRAINT "rate_limit_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"totp_valide_le" timestamp with time zone,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "speaker" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"edition_id" text NOT NULL,
	"nom_affiche" text NOT NULL,
	"biographie" text DEFAULT '' NOT NULL,
	"titre_provisoire" text DEFAULT '' NOT NULL,
	"annonce" boolean DEFAULT false NOT NULL,
	"referent_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "totp" (
	"user_id" text PRIMARY KEY NOT NULL,
	"secret_chiffre" text NOT NULL,
	"confirme_le" timestamp with time zone,
	"dernier_pas" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "role" DEFAULT 'membre' NOT NULL,
	"desactive_le" timestamp with time zone,
	"derniere_connexion" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invite_par_id_user_id_fk" FOREIGN KEY ("invite_par_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal" ADD CONSTRAINT "journal_acteur_id_user_id_fk" FOREIGN KEY ("acteur_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membre_pole" ADD CONSTRAINT "membre_pole_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membre_pole" ADD CONSTRAINT "membre_pole_pole_id_pole_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."pole"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membre_pole" ADD CONSTRAINT "membre_pole_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaker" ADD CONSTRAINT "speaker_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaker" ADD CONSTRAINT "speaker_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speaker" ADD CONSTRAINT "speaker_referent_id_user_id_fk" FOREIGN KEY ("referent_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp" ADD CONSTRAINT "totp_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "journal_le_idx" ON "journal" USING btree ("le");--> statement-breakpoint
CREATE INDEX "journal_cible_idx" ON "journal" USING btree ("cible_type","cible_id");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "speaker_user_edition_idx" ON "speaker" USING btree ("user_id","edition_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");