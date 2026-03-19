import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, reference, timestamp, createSchemas } from "../common";
import vehicles from "./vehicles";

const microcontrollers = table("microcontrollers", {
	id: id(),
	mac: t.macaddr().notNull().unique(),
	vehicle_id: reference(() => vehicles.id),
	timestamp: timestamp(),
});

export default microcontrollers;

export const schemas = createSchemas(microcontrollers);
