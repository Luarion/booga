import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import groups from "./groups";
import objects from "./objects";
import { timestamp, reference } from "../common";

export default table(
  "groups_to_objects",
  {
    group_id: reference(() => groups.id, { onDelete: "cascade" }),
    object_id: reference(() => objects.id, { onDelete: "cascade" }),
    timestamp: timestamp(),
  },
  (table) => [t.primaryKey({ columns: [table.group_id, table.object_id] })],
);
