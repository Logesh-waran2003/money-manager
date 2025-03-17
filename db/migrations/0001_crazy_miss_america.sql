CREATE TYPE "public"."app_used" AS ENUM('Gpay', 'Paytm', 'HDFC_App', 'PayZaap', 'Super', 'other');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('food', 'travel', 'shopping', 'travel', 'other');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "category" SET DATA TYPE category;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "app_used" SET DATA TYPE app_used;