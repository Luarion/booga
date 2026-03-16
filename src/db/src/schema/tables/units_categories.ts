import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id } from "../common";

export default table("units_categories", {
	id: id(),
	name: t.varchar({ length: 32 }).notNull().unique(),
});
