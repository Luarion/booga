import { pgTable as table } from "drizzle-orm/pg-core";
import { alias, id, reference, createSchemas } from "../common";
import controllers from "./microcontrollers";
import units_categories from "./units_categories";

const sensors = table("sensors", {
	id: id(),
	category_id: reference(() => units_categories.id),
	controller_id: reference(() => controllers.id, { onDelete: "cascade" }),
	alias: alias().unique(),
});

export default sensors;

export const schemas = createSchemas(sensors);
