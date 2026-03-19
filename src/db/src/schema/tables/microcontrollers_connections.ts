import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp, createSchemas } from "../common";
import controllers from "./microcontrollers";

const microcontrollers_connections = table(
	"microcontrollers_connections",
	{
		controller_id: reference(() => controllers.id, { onDelete: "cascade" }),
		start: timestamp(),
		end: timestamp(),
	},
	(table) => [
		t.primaryKey({ columns: [table.controller_id, table.start, table.end] }),
	],
);

export default microcontrollers_connections;

export const schemas = createSchemas(microcontrollers_connections);
