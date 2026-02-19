import { pgTable as table } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { id, timestamp } from "./common";

const schema = table("users", {
  id: id,
  email: t.varchar({ length: 254 }).notNull().unique(),
  phone: t.varchar({ length: 15 }).notNull().unique(),
  username: t.varchar({ length: 64 }).notNull().unique(),
  password_hash: t.varchar({ length: 128 }).notNull(),
  pfp_hash: t.varchar({ length: 2048 }).notNull(),
  timestamp: timestamp().defaultNow().notNull(),
});

export default schema;
