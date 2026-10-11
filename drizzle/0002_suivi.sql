CREATE TYPE "public"."etat_jalon" AS ENUM('a_faire', 'depose', 'valide');--> statement-breakpoint
CREATE TABLE "commentaire" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"auteur_id" text,
	"texte" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"supprime_le" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "jalon" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"libelle" text NOT NULL,
	"echeance" timestamp with time zone NOT NULL,
	"categorie" text,
	"ordre" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jalon_speaker" (
	"speaker_id" text NOT NULL,
	"jalon_id" text NOT NULL,
	"etat" "etat_jalon" DEFAULT 'a_faire' NOT NULL,
	"valide_par_id" text,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jalon_speaker_speaker_id_jalon_id_pk" PRIMARY KEY("speaker_id","jalon_id")
);
--> statement-breakpoint
CREATE TABLE "preference" (
	"user_id" text PRIMARY KEY NOT NULL,
	"notif_depot" boolean DEFAULT true NOT NULL,
	"notif_commentaire" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_auteur_id_user_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalon" ADD CONSTRAINT "jalon_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalon_speaker" ADD CONSTRAINT "jalon_speaker_speaker_id_speaker_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speaker"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalon_speaker" ADD CONSTRAINT "jalon_speaker_jalon_id_jalon_id_fk" FOREIGN KEY ("jalon_id") REFERENCES "public"."jalon"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalon_speaker" ADD CONSTRAINT "jalon_speaker_valide_par_id_user_id_fk" FOREIGN KEY ("valide_par_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preference" ADD CONSTRAINT "preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commentaire_document_idx" ON "commentaire" USING btree ("document_id");