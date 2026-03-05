import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp } from "./common";

const schema = table("controllers", {
  id: id,
  mac: t.macaddr().notNull().unique(),
  timestamp: timestamp(),
});

export default schema;
