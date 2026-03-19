import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, createSchemas } from "../common";

const units_categories = table("units_categories", {
	id: id(),
	name: t.varchar({ length: 32 }).notNull().unique(),
});

export default units_categories;

export const schemas = createSchemas(units_categories);
