import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./common";
import sensors from "./sensors";

const schema = table(
  "sensors_readings",
  {
    sensor_id: t
      .integer()
      .notNull()
      .references(() => sensors.id, { onDelete: "cascade" }),
    value: t.numeric().notNull(),
    timestamp: timestamp,
  },
  (table) => [t.primaryKey({ columns: [table.sensor_id, table.timestamp] })],
);

export default schema;
