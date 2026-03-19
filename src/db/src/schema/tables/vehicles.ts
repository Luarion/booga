import { sql } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, timestamp, createSchemas } from "../common";

export const fuelEnum = t.pgEnum("fuel", ["diesel", "gasoline", "other"]);
export const driveEnum = t.pgEnum("drive", ["fwd", "rwd", "awd"]);

const vehicles = table(
	"vehicles",
	{
		id: id(),
		plate: t.varchar({ length: 32 }).notNull().unique(),
		maker: t.varchar({ length: 32 }).notNull(),
		model: t.varchar({ length: 32 }),
		fuel: fuelEnum().notNull(),
		fuel_consumption: t.numeric({ precision: 4, scale: 2, mode: "string" }),
		drive: driveEnum().notNull(),
		displacement: t
			.numeric({ precision: 4, scale: 2, mode: "string" })
			.notNull(),
		registration_date: t.date().notNull(),
		timestamp: timestamp(),
	},
	(table) => [
		t.check("displacement_positive", sql`${table.displacement} > '0'`),
		t.check("fuel_consumption_positive", sql`${table.fuel_consumption} > '0'`),
	],
);

export default vehicles;

export const schemas = createSchemas(vehicles);
