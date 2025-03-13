CREATE TYPE "public"."account_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."credit_type" AS ENUM('lent', 'borrowed');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "account_type" NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"credit_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"date" timestamp NOT NULL,
	"transaction_id" integer,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "credits" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "credit_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"beneficiary" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"description" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "recurring_spends" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"frequency" varchar(50) NOT NULL,
	"description" varchar(255) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category" varchar(255),
	"description" varchar(255),
	"app_used" varchar(255),
	"time" timestamp NOT NULL,
	"transfer_id" integer,
	"recurring_spend_id" integer
);
--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_credit_id_credits_id_fk" FOREIGN KEY ("credit_id") REFERENCES "public"."credits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_recurring_spend_id_recurring_spends_id_fk" FOREIGN KEY ("recurring_spend_id") REFERENCES "public"."recurring_spends"("id") ON DELETE no action ON UPDATE no action;