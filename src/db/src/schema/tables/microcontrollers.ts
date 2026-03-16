import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, reference, timestamp } from "../common";
import vehicles from "./vehicles";

export default table("microcontrollers", {
	id: id(),
	mac: t.macaddr().notNull().unique(),
	vehicle_id: reference(() => vehicles.id),
	timestamp: timestamp(),
});
