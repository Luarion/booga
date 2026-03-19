import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, timestamp, createSchemas } from "../common";

const users = table("users", {
	id: id(),
	email: t.varchar({ length: 254 }).notNull().unique(),
	phone: t.varchar({ length: 18 }).notNull().unique(),
	username: t.varchar({ length: 64 }).notNull().unique(),
	name: t.varchar({ length: 32 }).notNull(),
	password_hash: t.varchar({ length: 128 }).notNull(),
	pfp_hash: t.varchar({ length: 256 }),
	timestamp: timestamp().defaultNow().notNull(),
});

export default users;

export const schemas = createSchemas(users);
