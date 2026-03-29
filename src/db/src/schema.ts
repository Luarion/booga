import { relations, sql } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

import { alias, id, reference, timestamp } from "./common";

// SCHEMAS
const table = p.pgTable;
export const unitsSchema = p.pgSchema("units");
export const microcontrollersSchema = p.pgSchema("microcontrollers");
export const usersSchema = p.pgSchema("users");

// ENUMS
export const fuelEnum = p.pgEnum("fuel", ["diesel", "gasoline", "other"]);
export const driveEnum = p.pgEnum("drive", ["fwd", "rwd", "awd"]);

// TABLES
export const categories = unitsSchema.table("categories", {
	id: id(),
	name: p.varchar({ length: 32 }).notNull().unique(),
});

export const users = usersSchema.table("users", {
	id: id(),
	email: p.varchar({ length: 254 }).notNull().unique(),
	phone: p.varchar({ length: 18 }).notNull().unique(),
	username: p.varchar({ length: 64 }).notNull().unique(),
	name: p.varchar({ length: 32 }).notNull(),
	password_hash: p.varchar({ length: 128 }).notNull(),
	pfp_hash: p.varchar({ length: 256 }),
	timestamp: timestamp(),
});

export const roles = usersSchema.table("roles", {
	id: id(),
	name: p.varchar({ length: 64 }).notNull().unique(),
	timestamp: timestamp(),
});

export const objects = table("objects", {
	id: id(),
	alias: alias().unique(),
	timestamp: timestamp(),
});

export const vehicles = table(
	"vehicles",
	{
		id: id(),
		plate: p.varchar({ length: 32 }).notNull().unique(),
		maker: p.varchar({ length: 32 }).notNull(),
		model: p.varchar({ length: 32 }),
		fuel: fuelEnum().notNull(),
		fuel_consumption: p.numeric({ precision: 4, scale: 2, mode: "string" }),
		drive: driveEnum().notNull(),
		displacement: p
			.numeric({ precision: 4, scale: 2, mode: "string" })
			.notNull(),
		registration_date: p.date().notNull(),
		owner_id: reference(() => users.id, { onDelete: "cascade" }).notNull(),
		timestamp: timestamp(),
	},
	(current) => [
		p.check("displacement_positive", sql`${current.displacement} > '0'`),
		p.check(
			"fuel_consumption_positive",
			sql`${current.fuel_consumption} > '0'`,
		),
	],
);

export const microcontrollers = microcontrollersSchema.table(
	"microcontrollers",
	{
		id: id(),
		mac: p.macaddr().notNull().unique(),
		vehicle_id: reference(() => vehicles.id),
		timestamp: timestamp(),
	},
);

export const actuators = microcontrollersSchema.table("actuators", {
	id: id(),
	category_id: reference(() => categories.id),
	controller_id: reference(() => microcontrollers.id, { onDelete: "cascade" }),
	alias: alias().unique(),
});

export const actuators_readings = microcontrollersSchema.table(
	"actuators_readings",
	{
		actuator_id: reference(() => actuators.id),
		value: p.numeric().notNull(),
		timestamp: timestamp(),
	},
	(current) => [
		p.primaryKey({ columns: [current.actuator_id, current.timestamp] }),
	],
);

export const sensors = microcontrollersSchema.table("sensors", {
	id: id(),
	category_id: reference(() => categories.id),
	controller_id: reference(() => microcontrollers.id, { onDelete: "cascade" }),
	alias: alias().unique(),
});

export const sensors_readings = microcontrollersSchema.table(
	"sensors_readings",
	{
		sensor_id: reference(() => sensors.id),
		value: p.numeric().notNull(),
		timestamp: timestamp(),
	},
	(current) => [
		p.primaryKey({ columns: [current.sensor_id, current.timestamp] }),
	],
);

export const objects_to_actuators = table(
	"objects_to_actuators",
	{
		object_id: reference(() => objects.id, { onDelete: "cascade" }),
		actuator_id: reference(() => actuators.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(current) => [
		p.primaryKey({ columns: [current.object_id, current.actuator_id] }),
	],
);

export const objects_to_sensors = table(
	"objects_to_sensors",
	{
		object_id: reference(() => objects.id, { onDelete: "cascade" }),
		sensor_id: reference(() => sensors.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(current) => [
		p.primaryKey({ columns: [current.object_id, current.sensor_id] }),
	],
);

export const trips = table("trips", {
	id: id(),
	vehicle_id: reference(() => vehicles.id, { onDelete: "cascade" }),
	starting_date: timestamp(),
	ending_date: p.timestamp(),
});

export const units = unitsSchema.table("units", {
	id: id(),
	category_id: reference(() => categories.id, { onDelete: "cascade" }),
	ucum: p.varchar({ length: 16 }).notNull().unique(),
});

export const conversions = unitsSchema.table(
	"conversions",
	{
		from: reference(() => units.id, { onDelete: "cascade" }),
		to: reference(() => units.id, { onDelete: "cascade" }),
		factor: p.numeric().notNull(),
	},
	(current) => [p.primaryKey({ columns: [current.from, current.to] })],
);

export const users_to_roles = usersSchema.table(
	"users_to_roles",
	{
		user_id: reference(() => users.id, { onDelete: "cascade" }),
		role_id: reference(() => roles.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(current) => [p.primaryKey({ columns: [current.user_id, current.role_id] })],
);

export const connections = microcontrollersSchema.table(
	"connections",
	{
		controller_id: reference(() => microcontrollers.id, {
			onDelete: "cascade",
		}),
		start: timestamp(),
		end: timestamp(),
	},
	(current) => [
		p.primaryKey({
			columns: [current.controller_id, current.start, current.end],
		}),
	],
);

export const units_categories_relations = relations(categories, ({ many }) => ({
	units: many(units),
	sensors: many(sensors),
	actuators: many(actuators),
}));

export const users_relations = relations(users, ({ many }) => ({
	vehicles: many(vehicles),
	users_to_roles: many(users_to_roles),
}));

export const roles_relations = relations(roles, ({ many }) => ({
	users_to_roles: many(users_to_roles),
}));

export const objects_relations = relations(objects, ({ many }) => ({
	objects_to_actuators: many(objects_to_actuators),
	objects_to_sensors: many(objects_to_sensors),
}));

export const vehicles_relations = relations(vehicles, ({ one, many }) => ({
	owner: one(users, {
		fields: [vehicles.owner_id],
		references: [users.id],
	}),
	microcontrollers: many(microcontrollers),
	trips: many(trips),
}));

export const microcontrollers_relations = relations(
	microcontrollers,
	({ one, many }) => ({
		vehicle: one(vehicles, {
			fields: [microcontrollers.vehicle_id],
			references: [vehicles.id],
		}),
		actuators: many(actuators),
		sensors: many(sensors),
		microcontrollers_connections: many(connections),
	}),
);

export const actuators_relations = relations(actuators, ({ one, many }) => ({
	category: one(categories, {
		fields: [actuators.category_id],
		references: [categories.id],
	}),
	controller: one(microcontrollers, {
		fields: [actuators.controller_id],
		references: [microcontrollers.id],
	}),
	actions: many(actuators_readings),
	objects_to_actuators: many(objects_to_actuators),
}));

export const actuators_actions_relations = relations(
	actuators_readings,
	({ one }) => ({
		actuator: one(actuators, {
			fields: [actuators_readings.actuator_id],
			references: [actuators.id],
		}),
	}),
);

export const sensors_relations = relations(sensors, ({ one, many }) => ({
	category: one(categories, {
		fields: [sensors.category_id],
		references: [categories.id],
	}),
	controller: one(microcontrollers, {
		fields: [sensors.controller_id],
		references: [microcontrollers.id],
	}),
	readings: many(sensors_readings),
	objects_to_sensors: many(objects_to_sensors),
}));

export const sensors_readings_relations = relations(
	sensors_readings,
	({ one }) => ({
		sensor: one(sensors, {
			fields: [sensors_readings.sensor_id],
			references: [sensors.id],
		}),
	}),
);

export const objects_to_actuators_relations = relations(
	objects_to_actuators,
	({ one }) => ({
		object: one(objects, {
			fields: [objects_to_actuators.object_id],
			references: [objects.id],
		}),
		actuator: one(actuators, {
			fields: [objects_to_actuators.actuator_id],
			references: [actuators.id],
		}),
	}),
);

export const objects_to_sensors_relations = relations(
	objects_to_sensors,
	({ one }) => ({
		object: one(objects, {
			fields: [objects_to_sensors.object_id],
			references: [objects.id],
		}),
		sensor: one(sensors, {
			fields: [objects_to_sensors.sensor_id],
			references: [sensors.id],
		}),
	}),
);

export const trips_relations = relations(trips, ({ one }) => ({
	vehicle: one(vehicles, {
		fields: [trips.vehicle_id],
		references: [vehicles.id],
	}),
}));

export const units_relations = relations(units, ({ one, many }) => ({
	category: one(categories, {
		fields: [units.category_id],
		references: [categories.id],
	}),
	from_conversions: many(conversions, {
		relationName: "units_conversions_from",
	}),
	to_conversions: many(conversions, {
		relationName: "units_conversions_to",
	}),
}));

export const units_conversions_relations = relations(
	conversions,
	({ one }) => ({
		from_unit: one(units, {
			fields: [conversions.from],
			references: [units.id],
			relationName: "units_conversions_from",
		}),
		to_unit: one(units, {
			fields: [conversions.to],
			references: [units.id],
			relationName: "units_conversions_to",
		}),
	}),
);

export const users_to_roles_relations = relations(
	users_to_roles,
	({ one }) => ({
		user: one(users, {
			fields: [users_to_roles.user_id],
			references: [users.id],
		}),
		role: one(roles, {
			fields: [users_to_roles.role_id],
			references: [roles.id],
		}),
	}),
);

export const microcontrollers_connections_relations = relations(
	connections,
	({ one }) => ({
		controller: one(microcontrollers, {
			fields: [connections.controller_id],
			references: [microcontrollers.id],
		}),
	}),
);
