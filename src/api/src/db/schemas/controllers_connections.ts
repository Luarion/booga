import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./common";
import controllers from "./controllers";

const schema = table(
  "controllers_connections",
  {
    controller_id: t
      .integer()
      .notNull()
      .references(() => controllers.id, { onDelete: "cascade" }),
    start: timestamp(),
    end: timestamp(),
  },
  (table) => [
    t.primaryKey({ columns: [table.controller_id, table.start, table.end] }),
  ],
);

export default schema;
