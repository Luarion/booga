import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp } from "./common";

const schema = table("controllers", {
  id: id,
  mac: t.varchar({ length: 17 }).notNull().unique(),
  timestamp: timestamp(),
});

export default schema;
