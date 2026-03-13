import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamp, reference } from "../common";
import controllers from "./microcontrollers";

export default table(
  "microcontrollers_connections",
  {
    controller_id: reference(() => controllers.id, { onDelete: "cascade" }),
    start: timestamp(),
    end: timestamp(),
  },
  (table) => [
    t.primaryKey({ columns: [table.controller_id, table.start, table.end] }),
  ],
);
