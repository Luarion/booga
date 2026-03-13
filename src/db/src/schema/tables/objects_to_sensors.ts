import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import objects from "./objects";
import sensors from "./sensors";
import { timestamp, reference } from "../common";

export default table(
  "objects_to_sensors",
  {
    object_id: reference(() => objects.id, { onDelete: "cascade" }),
    sensor_id: reference(() => sensors.id, { onDelete: "cascade" }),
    timestamp: timestamp(),
  },
  (table) => [t.primaryKey({ columns: [table.object_id, table.sensor_id] })],
);
