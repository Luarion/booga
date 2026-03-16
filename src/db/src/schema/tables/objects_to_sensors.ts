import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp } from "../common";
import objects from "./objects";
import sensors from "./sensors";

export default table(
	"objects_to_sensors",
	{
		object_id: reference(() => objects.id, { onDelete: "cascade" }),
		sensor_id: reference(() => sensors.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.object_id, table.sensor_id] })],
);
