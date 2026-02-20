import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { alias, id } from "./common";
import controllers from "./controllers";

const schema = table("actuators", {
  id: id,
  controller_id: t
    .integer()
    .notNull()
    .references(() => controllers.id, { onDelete: "cascade" }),
  alias: alias().unique(),
});

export default schema;
