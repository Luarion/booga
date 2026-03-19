import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, timestamp, createSchemas } from "../common";
import sensors from "./sensors";

const sensors_readings = table(
	"sensors_readings",
	{
		// id: id(),
		sensor_id: reference(() => sensors.id),
		value: t.numeric().notNull(),
		timestamp: timestamp(),
	},
	(table) => [t.primaryKey({ columns: [table.sensor_id, table.timestamp] })],
);

export default sensors_readings;

export const schemas = createSchemas(sensors_readings);
