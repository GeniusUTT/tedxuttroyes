CREATE TYPE "public"."rattachement" AS ENUM('speaker', 'tous_speakers', 'pole', 'commun');--> statement-breakpoint
CREATE TYPE "public"."sens" AS ENUM('du_speaker', 'vers_speaker', 'interne');--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"edition_id" text NOT NULL,
	"rattachement" "rattachement" NOT NULL,
	"speaker_id" text,
	"pole_id" text,
	"categorie" text NOT NULL,
	"sens" "sens" NOT NULL,
	"titre" text NOT NULL,
	"lien_externe" text,
	"cree_par_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL,
	"supprime_le" timestamp with time zone,
	"supprime_par_id" text
);
--> statement-breakpoint
CREATE TABLE "envoi" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"document_id" text,
	"edition_id" text NOT NULL,
	"rattachement" "rattachement" NOT NULL,
	"speaker_id" text,
	"pole_id" text,
	"categorie" text NOT NULL,
	"sens" "sens" NOT NULL,
	"titre" text NOT NULL,
	"cle" text NOT NULL,
	"nom_origine" text NOT NULL,
	"type_mime" text NOT NULL,
	"taille_max" integer NOT NULL,
	"expire_le" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "envoi_cle_unique" UNIQUE("cle")
);
--> statement-breakpoint
CREATE TABLE "version" (
	"id" text PRIMARY KEY NOT NULL,
	"document_id" text NOT NULL,
	"numero" integer NOT NULL,
	"cle_stockage" text NOT NULL,
	"nom_origine" text NOT NULL,
	"type_mime" text NOT NULL,
	"taille" integer NOT NULL,
	"depose_par_id" text,
	"depose_le" timestamp with time zone DEFAULT now() NOT NULL,
	"droits_attestes_le" timestamp with time zone,
	CONSTRAINT "version_cleStockage_unique" UNIQUE("cle_stockage")
);
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_edition_id_edition_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."edition"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_speaker_id_speaker_id_fk" FOREIGN KEY ("speaker_id") REFERENCES "public"."speaker"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_pole_id_pole_id_fk" FOREIGN KEY ("pole_id") REFERENCES "public"."pole"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_cree_par_id_user_id_fk" FOREIGN KEY ("cree_par_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_supprime_par_id_user_id_fk" FOREIGN KEY ("supprime_par_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envoi" ADD CONSTRAINT "envoi_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envoi" ADD CONSTRAINT "envoi_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version" ADD CONSTRAINT "version_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "version" ADD CONSTRAINT "version_depose_par_id_user_id_fk" FOREIGN KEY ("depose_par_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_speaker_idx" ON "document" USING btree ("speaker_id");--> statement-breakpoint
CREATE INDEX "document_pole_idx" ON "document" USING btree ("pole_id");--> statement-breakpoint
CREATE INDEX "document_edition_idx" ON "document" USING btree ("edition_id","rattachement");--> statement-breakpoint
CREATE UNIQUE INDEX "version_numero_idx" ON "version" USING btree ("document_id","numero");