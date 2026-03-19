import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp, createSchemas } from "../common";
import objects from "./objects";
import sensors from "./sensors";

const objects_to_sensors = table(
	"objects_to_sensors",
	{
		object_id: reference(() => objects.id, { onDelete: "cascade" }),
		sensor_id: reference(() => sensors.id, { onDelete: "cascade" }),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.object_id, table.sensor_id] })],
);

export default objects_to_sensors;

export const schemas = createSchemas(objects_to_sensors);
