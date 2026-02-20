import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp } from "./common";

const schema = table("roles", {
  id: id,
  name: t.varchar({ length: 64 }).notNull().unique(),
  timestamp: timestamp(),
});

export default schema;
