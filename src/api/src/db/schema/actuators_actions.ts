import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./common";
import actuators from "./actuators";

const schema = table(
  "actuators_actions",
  {
    actuator_id: t
      .integer()
      .notNull()
      .references(() => actuators.id, { onDelete: "cascade" }),
    value: t.numeric().notNull(),
    timestamp: timestamp(),
  },
  (table) => [t.primaryKey({ columns: [table.actuator_id, table.timestamp] })],
);

export default schema;
