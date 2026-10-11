-- Reprise des données avant le changement de types (espace recentré sur les
-- speakers, 2026-10-11). Les documents de pôle et de l'espace commun
-- disparaissent avec leurs versions et leurs retours (cascade) ; la fiche
-- technique et la vidéo de répétition sont retirées comme une suppression
-- ordinaire ; la photo portrait rejoint les photos haute qualité ; les
-- admins deviennent membres.
DELETE FROM "envoi" WHERE "rattachement" IN ('pole', 'commun') OR "categorie" IN ('fiche_technique', 'video_repetition');--> statement-breakpoint
DELETE FROM "document" WHERE "rattachement" IN ('pole', 'commun');--> statement-breakpoint
UPDATE "document" SET "supprime_le" = now() WHERE "categorie" IN ('fiche_technique', 'video_repetition') AND "supprime_le" IS NULL;--> statement-breakpoint
UPDATE "document" SET "categorie" = 'photo_hd', "titre" = 'Photos haute qualité' WHERE "categorie" = 'portrait';--> statement-breakpoint
UPDATE "envoi" SET "categorie" = 'photo_hd' WHERE "categorie" = 'portrait';--> statement-breakpoint
UPDATE "jalon" SET "categorie" = NULL WHERE "categorie" IN ('fiche_technique', 'video_repetition', 'portrait');--> statement-breakpoint
ALTER TABLE "membre_pole" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pole" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "totp" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "membre_pole" CASCADE;--> statement-breakpoint
DROP TABLE "pole" CASCADE;--> statement-breakpoint
DROP TABLE "totp" CASCADE;--> statement-breakpoint
ALTER TABLE "document" DROP CONSTRAINT IF EXISTS "document_pole_id_pole_id_fk";
--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "rattachement" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "envoi" ALTER COLUMN "rattachement" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."rattachement";--> statement-breakpoint
CREATE TYPE "public"."rattachement" AS ENUM('speaker', 'tous_speakers');--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "rattachement" SET DATA TYPE "public"."rattachement" USING "rattachement"::"public"."rattachement";--> statement-breakpoint
ALTER TABLE "envoi" ALTER COLUMN "rattachement" SET DATA TYPE "public"."rattachement" USING "rattachement"::"public"."rattachement";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
UPDATE "user" SET "role" = 'membre' WHERE "role" = 'admin';--> statement-breakpoint
UPDATE "invitation" SET "role" = 'membre' WHERE "role" = 'admin';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'membre'::text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('speaker', 'membre');--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'membre'::"public"."role";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "sens" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "envoi" ALTER COLUMN "sens" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."sens";--> statement-breakpoint
CREATE TYPE "public"."sens" AS ENUM('du_speaker', 'vers_speaker');--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "sens" SET DATA TYPE "public"."sens" USING "sens"::"public"."sens";--> statement-breakpoint
ALTER TABLE "envoi" ALTER COLUMN "sens" SET DATA TYPE "public"."sens" USING "sens"::"public"."sens";--> statement-breakpoint
DROP INDEX IF EXISTS "document_pole_idx";--> statement-breakpoint
ALTER TABLE "edition" ADD COLUMN "lien_photos" text;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "prenom" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "nom" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "email_contact" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "telephone" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "resume" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "lien_video" text;--> statement-breakpoint
ALTER TABLE "speaker" ADD COLUMN "supprime_le" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "version" ADD COLUMN "empreinte" text;--> statement-breakpoint
ALTER TABLE "document" DROP COLUMN "pole_id";--> statement-breakpoint
ALTER TABLE "envoi" DROP COLUMN "pole_id";--> statement-breakpoint
ALTER TABLE "invitation" DROP COLUMN "poles";--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN "totp_valide_le";