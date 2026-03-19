import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { reference, createSchemas } from "../common";
import units from "./units";

const units_conversions = table(
	"units_conversions",
	{
		from: reference(() => units.id, { onDelete: "cascade" }),
		to: reference(() => units.id, { onDelete: "cascade" }),
		factor: t.numeric().notNull(),
	},
	(table) => [t.primaryKey({ columns: [table.from, table.to] })],
);

export default units_conversions;

export const schemas = createSchemas(units_conversions);
