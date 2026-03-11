import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp, reference } from "../common";
import sensors from "./sensors";

export default table(
  "sensors_readings",
  {
    id: id(),
    sensor_id: reference(() => sensors.id),
    value: t.numeric().notNull(),
    timestamp: timestamp(),
  },
  // (table) => [t.primaryKey({ columns: [table.sensor_id, table.timestamp] })],
);
