ALTER TABLE "users"."app_setup" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users"."app_setup" CASCADE;--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "fuel_consumption" SET DATA TYPE numeric(6, 2);--> statement-breakpoint
ALTER TABLE "vehicles" ALTER COLUMN "displacement" SET DATA TYPE numeric(6, 2);