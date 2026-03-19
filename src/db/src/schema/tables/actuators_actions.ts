import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp, createSchemas } from "../common";
import actuators from "./actuators";

const actuators_actions = table(
	"actuators_actions",
	{
		// id: id(),
		actuator_id: reference(() => actuators.id),
		value: t.numeric().notNull(),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.actuator_id, table.timestamp] })],
);

export default actuators_actions;

export const schemas = createSchemas(actuators_actions);
