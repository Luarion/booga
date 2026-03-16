import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp } from "../common";
import actuators from "./actuators";
import objects from "./objects";

export default table(
	"objects_to_actuators",
	{
		object_id: reference(() => objects.id, { onDelete: "cascade" }),
		actuator_id: reference(() => actuators.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.object_id, table.actuator_id] })],
);
