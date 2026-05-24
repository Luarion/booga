CREATE SCHEMA "microcontrollers";
--> statement-breakpoint
CREATE SCHEMA "units";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TYPE "public"."drive" AS ENUM('fwd', 'rwd', 'awd');--> statement-breakpoint
CREATE TYPE "public"."fuel" AS ENUM('diesel', 'gasoline', 'other');--> statement-breakpoint
CREATE TABLE "microcontrollers"."actuators" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"controller_id" integer NOT NULL,
	"alias" varchar(32) NOT NULL,
	CONSTRAINT "actuators_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "microcontrollers"."actuators_readings" (
	"actuator_id" integer NOT NULL,
	"value" numeric NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "actuators_readings_actuator_id_timestamp_pk" PRIMARY KEY("actuator_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE "units"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "microcontrollers"."connections" (
	"controller_id" integer NOT NULL,
	"start" timestamp DEFAULT now() NOT NULL,
	"end" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "connections_controller_id_start_end_pk" PRIMARY KEY("controller_id","start","end")
);
--> statement-breakpoint
CREATE TABLE "units"."conversions" (
	"from" integer NOT NULL,
	"to" integer NOT NULL,
	"factor" numeric NOT NULL,
	CONSTRAINT "conversions_from_to_pk" PRIMARY KEY("from","to")
);
--> statement-breakpoint
CREATE TABLE "microcontrollers"."microcontrollers" (
	"id" serial PRIMARY KEY NOT NULL,
	"mac" "macaddr" NOT NULL,
	"vehicle_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "microcontrollers_mac_unique" UNIQUE("mac")
);
--> statement-breakpoint
CREATE TABLE "objects" (
	"id" serial PRIMARY KEY NOT NULL,
	"alias" varchar(32) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "objects_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "objects_to_actuators" (
	"object_id" integer NOT NULL,
	"actuator_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "objects_to_actuators_object_id_actuator_id_pk" PRIMARY KEY("object_id","actuator_id")
);
--> statement-breakpoint
CREATE TABLE "objects_to_sensors" (
	"object_id" integer NOT NULL,
	"sensor_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "objects_to_sensors_object_id_sensor_id_pk" PRIMARY KEY("object_id","sensor_id")
);
--> statement-breakpoint
CREATE TABLE "users"."roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "microcontrollers"."sensors" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"controller_id" integer NOT NULL,
	"alias" varchar(32) NOT NULL,
	CONSTRAINT "sensors_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "microcontrollers"."sensors_readings" (
	"sensor_id" integer NOT NULL,
	"value" numeric NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sensors_readings_sensor_id_timestamp_pk" PRIMARY KEY("sensor_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE "users"."sessions" (
	"user_id" integer NOT NULL,
	"start" timestamp DEFAULT now() NOT NULL,
	"end" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_user_id_pk" PRIMARY KEY("user_id")
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"vehicle_id" integer NOT NULL,
	"start" timestamp DEFAULT now() NOT NULL,
	"end" timestamp
);
--> statement-breakpoint
CREATE TABLE "units"."units" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"ucum" varchar(16) NOT NULL,
	CONSTRAINT "units_ucum_unique" UNIQUE("ucum")
);
--> statement-breakpoint
CREATE TABLE "users"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"phone" varchar(18) NOT NULL,
	"username" varchar(64) NOT NULL,
	"name" varchar(32) NOT NULL,
	"password_hash" varchar(128) NOT NULL,
	"pfp_reference" varchar(256),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "users"."users_to_roles" (
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_to_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" serial PRIMARY KEY NOT NULL,
	"plate" varchar(32) NOT NULL,
	"make" varchar(32) NOT NULL,
	"model" varchar(32),
	"fuel" "fuel" NOT NULL,
	"fuel_consumption" numeric(4, 2),
	"drive" "drive" NOT NULL,
	"displacement" numeric(4, 2) NOT NULL,
	"registration_date" date NOT NULL,
	"3dmodel" varchar(64),
	"owner_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate"),
	CONSTRAINT "displacement_positive" CHECK ("vehicles"."displacement" > '0'),
	CONSTRAINT "fuel_consumption_positive" CHECK ("vehicles"."fuel_consumption" > '0')
);
--> statement-breakpoint
ALTER TABLE "microcontrollers"."actuators" ADD CONSTRAINT "actuators_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "units"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."actuators" ADD CONSTRAINT "actuators_controller_id_microcontrollers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "microcontrollers"."microcontrollers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."actuators_readings" ADD CONSTRAINT "actuators_readings_actuator_id_actuators_id_fk" FOREIGN KEY ("actuator_id") REFERENCES "microcontrollers"."actuators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."connections" ADD CONSTRAINT "connections_controller_id_microcontrollers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "microcontrollers"."microcontrollers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units"."conversions" ADD CONSTRAINT "conversions_from_units_id_fk" FOREIGN KEY ("from") REFERENCES "units"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units"."conversions" ADD CONSTRAINT "conversions_to_units_id_fk" FOREIGN KEY ("to") REFERENCES "units"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."microcontrollers" ADD CONSTRAINT "microcontrollers_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objects_to_actuators" ADD CONSTRAINT "objects_to_actuators_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objects_to_actuators" ADD CONSTRAINT "objects_to_actuators_actuator_id_actuators_id_fk" FOREIGN KEY ("actuator_id") REFERENCES "microcontrollers"."actuators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objects_to_sensors" ADD CONSTRAINT "objects_to_sensors_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objects_to_sensors" ADD CONSTRAINT "objects_to_sensors_sensor_id_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "microcontrollers"."sensors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."sensors" ADD CONSTRAINT "sensors_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "units"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."sensors" ADD CONSTRAINT "sensors_controller_id_microcontrollers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "microcontrollers"."microcontrollers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "microcontrollers"."sensors_readings" ADD CONSTRAINT "sensors_readings_sensor_id_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "microcontrollers"."sensors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units"."units" ADD CONSTRAINT "units_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "units"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."users_to_roles" ADD CONSTRAINT "users_to_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."users_to_roles" ADD CONSTRAINT "users_to_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "users"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "users"."users"("id") ON DELETE cascade ON UPDATE no action;