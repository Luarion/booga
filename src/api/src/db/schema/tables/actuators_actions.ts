import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp, reference } from "../common";
import actuators from "./actuators";

export default table(
  "actuators_actions",
  {
    id: id(),
    actuator_id: reference(() => actuators.id),
    value: t.numeric().notNull(),
    timestamp: timestamp(),
  },
  // (table) => [t.primaryKey({ columns: [table.actuator_id, table.timestamp] })],
);
