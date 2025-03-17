CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "payment_apps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_apps_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_app_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_app_id_payment_apps_id_fk" FOREIGN KEY ("payment_app_id") REFERENCES "public"."payment_apps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "transactions" DROP COLUMN "app_used";--> statement-breakpoint
DROP TYPE "public"."app_used";--> statement-breakpoint
DROP TYPE "public"."category";