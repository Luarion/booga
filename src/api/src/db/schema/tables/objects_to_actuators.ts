import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import actuators from "./actuators";
import objects from "./objects";
import { timestamp, reference } from "../common";

export default table(
  "objects_to_actuators",
  {
    object_id: reference(() => objects.id, { onDelete: "cascade" }),
    actuator_id: reference(() => actuators.id, { onDelete: "cascade" }),
    timestamp: timestamp(),
  },
  (table) => [t.primaryKey({ columns: [table.object_id, table.actuator_id] })],
);
