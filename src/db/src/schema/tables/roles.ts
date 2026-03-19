import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, timestamp, createSchemas } from "../common";

const roles = table("roles", {
	id: id(),
	name: t.varchar({ length: 64 }).notNull().unique(),
	timestamp: timestamp(),
});

export default roles;

export const schemas = createSchemas(roles);
