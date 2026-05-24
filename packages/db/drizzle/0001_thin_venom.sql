CREATE TABLE "users"."app_setup" (
	"id" serial PRIMARY KEY NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
