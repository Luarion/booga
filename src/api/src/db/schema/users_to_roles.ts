import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { timestamp } from "./common";
import users from "./users";
import roles from "./roles";

const schema = table(
  "users_to_roles",
  {
    user_id: t
      .integer()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: t
      .integer()
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    timestamp: timestamp,
  },
  (table) => [t.primaryKey({ columns: [table.user_id, table.role_id] })],
);

export default schema;
