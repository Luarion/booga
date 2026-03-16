import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { id, reference } from "../common";
import units_categories from "./units_categories";

export default table("units", {
	id: id(),
	category_id: reference(() => units_categories.id, { onDelete: "cascade" }),
	ucum: t.varchar({ length: 16 }).notNull().unique(),
});
