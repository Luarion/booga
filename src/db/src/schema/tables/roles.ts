import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, timestamp } from "../common";

export default table("roles", {
	id: id(),
	name: t.varchar({ length: 64 }).notNull().unique(),
	timestamp: timestamp(),
});
