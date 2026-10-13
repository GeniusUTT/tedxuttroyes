-- Les prestataires (2026-10-12) : un troisième rôle, une structure par
-- dossier, une ou plusieurs personnes par structure, et leurs documents dans
-- les deux sens.
ALTER TYPE "public"."rattachement" ADD VALUE 'prestataire';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'prestataire';--> statement-breakpoint
ALTER TYPE "public"."sens" ADD VALUE 'du_prestataire';--> statement-breakpoint
ALTER TYPE "public"."sens" ADD VALUE 'vers_prestataire';--> statement-breakpoint
CREATE TABLE "prestataire" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"structure" text NOT NULL,
	"prestation" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"email_contact" text DEFAULT '' NOT NULL,
	"telephone" text DEFAULT '' NOT NULL,
	"adresse" text DEFAULT '' NOT NULL,
	"referent_id" text,
	"supprime_le" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prestataire_compte" (
	"prestataire_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prestataire_compte_prestataire_id_user_id_pk" PRIMARY KEY("prestataire_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "prestataire_id" text;--> statement-breakpoint
ALTER TABLE "envoi" ADD COLUMN "prestataire_id" text;--> statement-breakpoint
ALTER TABLE "invitation" ADD COLUMN "prestataire_id" text;--> statement-breakpoint
ALTER TABLE "prestataire" ADD CONSTRAINT "prestataire_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestataire" ADD CONSTRAINT "prestataire_referent_id_user_id_fk" FOREIGN KEY ("referent_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestataire_compte" ADD CONSTRAINT "prestataire_compte_prestataire_id_prestataire_id_fk" FOREIGN KEY ("prestataire_id") REFERENCES "public"."prestataire"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prestataire_compte" ADD CONSTRAINT "prestataire_compte_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "prestataire_edition_idx" ON "prestataire" USING btree ("edition_id");--> statement-breakpoint
CREATE INDEX "prestataire_compte_user_idx" ON "prestataire_compte" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_prestataire_id_prestataire_id_fk" FOREIGN KEY ("prestataire_id") REFERENCES "public"."prestataire"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_prestataire_id_prestataire_id_fk" FOREIGN KEY ("prestataire_id") REFERENCES "public"."prestataire"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_prestataire_idx" ON "document" USING btree ("prestataire_id");